import JSZip from 'jszip'
import * as sandboxApi from './sandboxApi'
import * as assetProjectApi from './assetProjectApi'

/**
 * Unified data layer for the Rivine Code file-system panel. It hides whether
 * the project is backed by a live E2B sandbox or by the durable code_project
 * asset in the DB, so the panel UI is identical in both modes.
 *
 * Model:
 *  - The **asset** is the durable store (survives sandbox reap / reload / logout).
 *  - The **sandbox** is the live mirror used for execution/preview while it exists.
 *  - Reads: from the asset when opened explicitly from an asset/snapshot
 *    (`fromAsset`); otherwise from the sandbox when live, else the asset.
 *  - Writes/deletes: to the asset (durability) AND to the sandbox (live preview)
 *    whenever each is available — this is the "update sandbox AND assets DB"
 *    requirement.
 */
export interface ProjectSourceConfig {
  workspaceId: string
  chatSpaceId: string
  /** Durable code_project asset id, when known (deliverable / opened asset). */
  assetId: string | null
  /** True while an E2B sandbox is live for this chat. */
  hasLiveSandbox: boolean
  /** True when the panel was opened explicitly from an asset/snapshot. */
  fromAsset: boolean
  /**
   * Called when the sandbox turns out to be gone (409). Lets the panel stop
   * treating it as live and re-read from the durable asset instead of showing
   * an empty tree for a project that still exists.
   */
  onSandboxExpired?: () => void
}

/**
 * True when an error means "this sandbox no longer exists".
 *
 * The sandbox API rejects with `Error("HTTP 409: …")`, so the status has to be
 * read back out of the message. A 409 here is not a failure to handle — it is
 * the expected end of a sandbox's life, and the correct response is to fall
 * back to the persisted project rather than surface an error.
 */
function isSandboxGone(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? '')
  return message.includes('409') || /sandbox (is )?(gone|expired|not found)/i.test(message)
}

export interface ProjectFileEntry {
  path: string
  size: number
}

/**
 * In-flight dedupe + micro-cache for the project manifest.
 *
 * getProjectFiles() downloads the ENTIRE project manifest, and list()/read()/
 * readAll() each called it independently — so opening a file, rendering the
 * preview, and listing the tree each triggered a separate full download. A
 * single panel open issued 5+ identical GETs (one measured at 13.6s).
 *
 * Deliberate constraints, because a stale file view is worse than a slow one:
 *  - Memory only. Never localStorage/sessionStorage, so nothing survives a
 *    reload or leaks into another account's session.
 *  - Very short TTL. Long enough to collapse one render/mount burst, far too
 *    short to show a user content that has moved on.
 *  - Explicitly invalidated by every mutation (write/remove/move) before the
 *    next read, so a user never sees a pre-edit version of their own change.
 */
const MANIFEST_TTL_MS = 1500

type ManifestEntry = { at: number; promise: Promise<Record<string, string>> }
const manifestCache = new Map<string, ManifestEntry>()

const manifestKey = (workspaceId: string, assetId: string) => `${workspaceId}::${assetId}`

function fetchManifest(workspaceId: string, assetId: string): Promise<Record<string, string>> {
  const key = manifestKey(workspaceId, assetId)
  const hit = manifestCache.get(key)
  if (hit && Date.now() - hit.at < MANIFEST_TTL_MS) return hit.promise

  const promise = assetProjectApi.getProjectFiles(workspaceId, assetId).catch((err) => {
    // Never cache a failure — a transient 5xx must not be replayed to every
    // caller for the rest of the TTL window.
    manifestCache.delete(key)
    throw err
  })
  manifestCache.set(key, { at: Date.now(), promise })
  return promise
}

function invalidateManifest(workspaceId: string, assetId: string | null): void {
  if (!assetId) return
  manifestCache.delete(manifestKey(workspaceId, assetId))
}

export class ProjectSource {
  constructor(private cfg: ProjectSourceConfig) {}

  get canWrite(): boolean {
    return !!this.cfg.assetId || this.cfg.hasLiveSandbox
  }

  /** Where reads come from. Asset when opened-from-asset or no live sandbox. */
  private get readsFromAsset(): boolean {
    return (this.cfg.fromAsset || !this.cfg.hasLiveSandbox) && !!this.cfg.assetId
  }

  async list(): Promise<ProjectFileEntry[]> {
    if (this.readsFromAsset) {
      const files = await fetchManifest(this.cfg.workspaceId, this.cfg.assetId!)
      return Object.entries(files).map(([path, content]) => ({ path, size: (content ?? '').length }))
    }
    try {
      const { files } = await sandboxApi.listSandboxFiles(this.cfg.workspaceId, this.cfg.chatSpaceId)
      // The sandbox reports its own working directory as ".". It is not a file,
      // and inserting it put a phantom entry at the root of the user's tree.
      return files.filter((f) => f.path && f.path !== '.' && f.path !== './')
    } catch (err) {
      // 409 means the sandbox is gone — expired, or killed when the build
      // finished. Falling through with the error left the panel blank even
      // though the project had been persisted as a durable asset, so users who
      // watched files being written saw an empty tree seconds later and
      // concluded the work had been lost.
      if (isSandboxGone(err) && this.cfg.assetId) {
        this.cfg.onSandboxExpired?.()
        const files = await fetchManifest(this.cfg.workspaceId, this.cfg.assetId)
        return Object.entries(files).map(([path, content]) => ({
          path,
          size: (content ?? '').length,
        }))
      }
      throw err
    }
  }

  async read(path: string): Promise<string> {
    if (this.readsFromAsset) {
      const files = await fetchManifest(this.cfg.workspaceId, this.cfg.assetId!)
      return files[path] ?? ''
    }
    try {
      return await sandboxApi.readSandboxFile(this.cfg.workspaceId, this.cfg.chatSpaceId, path)
    } catch (err) {
      // Same fallback as list(): a dead sandbox must not make a persisted file
      // unreadable. Without this the tree could render from the asset while
      // clicking any file in it still failed.
      if (isSandboxGone(err) && this.cfg.assetId) {
        this.cfg.onSandboxExpired?.()
        const files = await fetchManifest(this.cfg.workspaceId, this.cfg.assetId)
        return files[path] ?? ''
      }
      throw err
    }
  }

  /** Create or update a file. Persists to the asset AND mirrors to the sandbox. */
  async write(path: string, content: string): Promise<void> {
    const jobs: Promise<unknown>[] = []
    if (this.cfg.hasLiveSandbox) {
      jobs.push(sandboxApi.writeSandboxFile(this.cfg.workspaceId, this.cfg.chatSpaceId, path, content))
    }
    if (this.cfg.assetId) {
      jobs.push(assetProjectApi.putProjectFile(this.cfg.workspaceId, this.cfg.assetId, path, content))
    }
    if (jobs.length === 0) throw new Error('No writable target (no sandbox, no asset)')
    // Both must succeed for durability; surface the first failure.
    await Promise.all(jobs)
    // Drop the cached manifest so the next read reflects this write.
    invalidateManifest(this.cfg.workspaceId, this.cfg.assetId)
  }

  /** Delete a file/folder. Removes from the asset (durable) AND the sandbox. */
  async remove(path: string): Promise<void> {
    const jobs: Promise<unknown>[] = []
    if (this.cfg.hasLiveSandbox) {
      jobs.push(sandboxApi.deleteSandboxFile(this.cfg.workspaceId, this.cfg.chatSpaceId, path))
    }
    if (this.cfg.assetId) {
      jobs.push(assetProjectApi.deleteProjectFile(this.cfg.workspaceId, this.cfg.assetId, path))
    }
    if (jobs.length === 0) throw new Error('Nothing to delete from (no sandbox, no asset)')
    await Promise.all(jobs)
    // Drop the cached manifest so the next read reflects this delete.
    invalidateManifest(this.cfg.workspaceId, this.cfg.assetId)
  }

  /**
   * Move a file or folder into a target directory (drag-and-drop), preserving
   * the basename. For a folder, every descendant path is remapped. Implemented
   * as read-write-delete on the existing dual-target primitives, so it lands in
   * both the sandbox and the durable asset. Returns the path remaps applied so
   * the caller can update open buffers/active file.
   */
  async move(fromPath: string, toDir: string): Promise<{ from: string; to: string }[]> {
    const base = fromPath.split('/').pop() as string
    const cleanDir = toDir.replace(/\/+$/, '')
    const newTop = cleanDir ? `${cleanDir}/${base}` : base
    if (newTop === fromPath) return []

    const files = await this.readAll()
    const isFolder = Object.keys(files).some((p) => p.startsWith(fromPath + '/'))
    const remaps: { from: string; to: string }[] = []

    if (isFolder) {
      const prefix = fromPath + '/'
      for (const p of Object.keys(files)) {
        if (p === fromPath || p.startsWith(prefix)) {
          const rest = p.slice(fromPath.length) // includes leading '/' for descendants
          remaps.push({ from: p, to: newTop + rest })
        }
      }
    } else if (files[fromPath] !== undefined) {
      remaps.push({ from: fromPath, to: newTop })
    } else {
      return []
    }

    // Write all destinations first (so a mid-move failure never loses content),
    // then delete the sources.
    for (const { from, to } of remaps) {
      await this.write(to, files[from] ?? '')
    }
    // Delete the original top-level entry once (folder rm is recursive server-side).
    await this.remove(fromPath)
    return remaps
  }

  /** Fetch every file (from whichever source) as a {path: content} map. */
  async readAll(): Promise<Record<string, string>> {
    if (this.readsFromAsset) {
      return fetchManifest(this.cfg.workspaceId, this.cfg.assetId!)
    }
    const { files } = await sandboxApi.listSandboxFiles(this.cfg.workspaceId, this.cfg.chatSpaceId)
    const out: Record<string, string> = {}
    await Promise.all(
      files.map(async (f) => {
        try {
          out[f.path] = await sandboxApi.readSandboxFile(this.cfg.workspaceId, this.cfg.chatSpaceId, f.path)
        } catch {
          /* skip unreadable/binary */
        }
      }),
    )
    return out
  }

  /** Build a zip preserving exact relative paths and trigger a browser download. */
  async download(zipName = 'project.zip'): Promise<void> {
    const files = await this.readAll()
    const zip = new JSZip()
    for (const [path, content] of Object.entries(files)) {
      zip.file(path, content ?? '')
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = zipName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(href)
  }
}
