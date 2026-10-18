import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Folder, Calendar, ArrowRight, Crown, Settings, Users, Eye, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useRouter } from 'next/navigation'
import { useWorkspaceStore } from '@/store/aselius/workspaceStore'
import { buildAseliusPath, rememberAseliusPath } from '@/lib/aseliusRoutes'
import { defaultTaskspaceName } from '@/lib/taskspaceLabels'
import toast from 'react-hot-toast'
import { ConfirmationModal } from './ui/ConfirmationModal'
import { useStore } from '@/lib/store'
import { useWebSocket } from '@/contexts/WebSocketProvider'
import { Bone } from './WorkspaceSkeleton'

type Permission = 'owner' | 'operator' | 'member' | 'guest'

interface SharedWorkspace {
  id: string
  name: string
  owner_email: string
  permission: Permission
  shared_at: string
  last_accessed: string | null
  chat_spaces_count: number
  status: 'active' | 'pending'
}

// Each entry carries BOTH themes. These were light-only (`bg-yellow-100`,
// `text-yellow-600`, …) with no `dark:` counterpart, so in dark mode the role
// chips rendered as bright pastel blocks on a gray-800 card — the most visible
// light/dark break on this page. Dark values use the /15 tint + 300-weight text
// pattern the rest of the workspace already uses for status chips.
const PERMISSION_CONFIG = {
  owner: {
    label: 'Owner',
    icon: Crown,
    color: 'text-yellow-600 dark:text-yellow-300',
    bgColor: 'bg-yellow-100 dark:bg-yellow-400/15'
  },
  operator: {
    label: 'Operator',
    icon: Settings,
    color: 'text-blue-600 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-400/15'
  },
  member: {
    label: 'Member',
    icon: Users,
    color: 'text-green-600 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-400/15'
  },
  guest: {
    label: 'Guest',
    icon: Eye,
    color: 'text-gray-600 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-400/15'
  }
}

export const SharedWithMe: React.FC = () => {
  const socket = useWebSocket()
  const [searchQuery, setSearchQuery] = useState('')
  const [permissionFilter, setPermissionFilter] = useState<Permission | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [sharedWorkspaces, setSharedWorkspaces] = useState<SharedWorkspace[]>([])
  const [acceptingInvitation, setAcceptingInvitation] = useState<string | null>(null)
  const [openingWorkspaceId, setOpeningWorkspaceId] = useState<string | null>(null)
  const [declineTarget, setDeclineTarget] = useState<{ workspaceId: string; workspaceName: string } | null>(null)
  const [declineLoading, setDeclineLoading] = useState(false)

  const router = useRouter()
  const {
    workspaces,
    fetchWorkspaces,
    selectWorkspace,
    selectChatSpace,
    fetchChatSpaces,
    createChatSpace,
    pendingInvitations,
    fetchPendingInvitations,
    acceptInvitation,
    declineInvitation
  } = useWorkspaceStore()
  const darkMode = useStore((state) => state.darkMode)

  const updateCombinedList = useCallback(() => {
    const formattedPending: SharedWorkspace[] = pendingInvitations.map(inv => ({
      id: inv.id,
      name: inv.name,
      owner_email: inv.owner_email,
      permission: (inv.permission as Permission) || 'guest',
      shared_at: inv.shared_at,
      last_accessed: null,
      chat_spaces_count: 0,
      status: 'pending'
    }))

    const activeShared: SharedWorkspace[] = workspaces
      .filter(w => w.user_role && w.user_role !== 'owner')
      .map(w => ({
        id: w.id,
        name: w.name,
        owner_email: w.owner_cloudhandle || 'Unknown',
        permission: (w.user_role as Permission) || 'member',
        shared_at: w.created_at,
        last_accessed: w.updated_at || null,
        chat_spaces_count: 0,
        status: 'active' as const
      }))

    setSharedWorkspaces([...formattedPending, ...activeShared])
  }, [workspaces, pendingInvitations])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchWorkspaces()
      await fetchPendingInvitations()
      setLoading(false)
    }
    void loadData()
    // No interval poll — the socket push below replaces it (see the
    // workspace-share-updated effect); polling here would spend a request
    // every N seconds on a list that changes a handful of times a day.
  }, [fetchWorkspaces, fetchPendingInvitations])

  // Live share sync: an invite, permission change, or revocation performed by
  // someone else lands here immediately instead of on next page visit. The
  // revoke case is the important one — without it this list keeps showing a
  // workspace the server will now refuse to open.
  useEffect(() => {
    if (!socket) return

    let timer: ReturnType<typeof setTimeout> | null = null
    const handleShareUpdated = () => {
      // Coalesce: inviting several people, or a bulk revoke, emits one event
      // per collaborator and each would otherwise cost two list fetches.
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        void fetchWorkspaces()
        void fetchPendingInvitations()
      }, 400)
    }

    socket.on('workspace-share-updated', handleShareUpdated)
    return () => {
      if (timer) clearTimeout(timer)
      socket.off('workspace-share-updated', handleShareUpdated)
    }
  }, [socket, fetchWorkspaces, fetchPendingInvitations])

  useEffect(() => {
    if (!loading) {
      updateCombinedList()
    }
  }, [loading, updateCombinedList])

  const filteredWorkspaces = sharedWorkspaces.filter(workspace => {
    const matchesSearch = workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.owner_email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPermission = permissionFilter === 'all' || workspace.permission === permissionFilter
    return matchesSearch && matchesPermission
  })

  const handleOpenWorkspace = async (workspace: SharedWorkspace) => {
    try {
      setOpeningWorkspaceId(workspace.id)
      const ws = workspaces.find((w) => w.id === workspace.id)
      if (!ws) {
        toast.error('Workspace not found')
        return
      }

      await selectWorkspace(ws)
      await fetchChatSpaces(ws.id)

      let spaces = useWorkspaceStore
        .getState()
        .chatSpaces.filter((cs) => cs.workspace_id === ws.id)

      // A share can be accepted before the owner has created any taskspace.
      // The recipient already has Member+ access (creates taskspaces), so
      // provision a default one instead of blocking them from ever entering
      // a workspace someone just shared with them.
      if (spaces.length === 0) {
        const created = await createChatSpace(ws.id, defaultTaskspaceName(1))
        if (!created) {
          toast.error('Failed to set up this workspace — try again in a moment.')
          return
        }
        spaces = [created]
      }

      const chatSpace = spaces[0]
      await selectChatSpace(chatSpace)

      const target = buildAseliusPath(ws.id, chatSpace.id, 'chat')
      rememberAseliusPath(target)
      router.push(target)
      toast.success(`Opened "${workspace.name}"`)
    } catch {
      toast.error('Failed to open workspace')
    } finally {
      setOpeningWorkspaceId(null)
    }
  }

  const handleAcceptInvitation = async (workspaceId: string, workspaceName: string) => {
    try {
      setAcceptingInvitation(workspaceId)
      await acceptInvitation(workspaceId)
      toast.success(`Accepted invitation to "${workspaceName}"`)
      await fetchWorkspaces()
      updateCombinedList()
    } catch {
      // Toast handled in store
    } finally {
      setAcceptingInvitation(null)
    }
  }

  const handleDeclineInvitation = (workspaceId: string, workspaceName: string) => {
    setDeclineTarget({ workspaceId, workspaceName })
  }

  const handleConfirmDecline = async () => {
    if (!declineTarget) return
    setDeclineLoading(true)
    try {
      await declineInvitation(declineTarget.workspaceId)
      toast.success(`Declined invitation to "${declineTarget.workspaceName}"`)
      setDeclineTarget(null)
      updateCombinedList()
    } catch {
      // Toast handled in store
    } finally {
      setDeclineLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="h-full min-h-0 flex flex-col !bg-canvas dark:!bg-gray-900 overflow-hidden">
      <div className="flex-shrink-0 px-6 py-6 border-b border-gray-200 dark:border-gray-700">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shared with Me</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredWorkspaces.length} workspace{filteredWorkspaces.length !== 1 ? 's' : ''} shared with you
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                // dark variant needs `!` too, else !bg-canvas wins — see card below
                className="pl-10 w-full sm:w-64 !bg-canvas dark:!bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <select
              value={permissionFilter}
              onChange={(e) => setPermissionFilter(e.target.value as Permission | 'all')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#00477d]/50 focus:border-[#00477d] text-sm !bg-canvas dark:!bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Permissions</option>
              {Object.entries(PERMISSION_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading shared workspaces">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                // border matches the real card below (dark:border-gray-700);
                // it was gray-800 here, so cards visibly shifted border colour
                // the moment loading finished.
                className="rounded-xl border border-gray-200 dark:border-gray-700 !bg-canvas dark:!bg-gray-800 p-5 space-y-3"
              >
                <Bone className="h-5 w-3/4" darkMode={darkMode} />
                <Bone className="h-3 w-1/2" darkMode={darkMode} />
                <Bone className="h-9 w-full rounded-lg" darkMode={darkMode} />
              </div>
            ))}
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || permissionFilter !== 'all' ? 'No workspaces found' : 'No shared workspaces'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || permissionFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'When others share workspaces with you, they will appear here'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.map((workspace, index) => {
              let config = PERMISSION_CONFIG[workspace.permission]
              if (!config) {
                config = PERMISSION_CONFIG.guest
              }
              const Icon = config.icon

              return (
                /*
                 * Dark-mode fix: the previous `!bg-canvas dark:bg-gray-800` could
                 * never go dark — `!bg-canvas` compiles to `!important`, which
                 * outranks the non-important dark variant regardless of cascade
                 * order, so the card rendered light-on-dark. Both sides now carry
                 * `!`. (The page wrapper above already worked for this reason.)
                 *
                 * Entrance stagger removed: a per-card delay made a long list
                 * ripple in on every render. Colour-only transitions remain.
                 */
                <div
                  key={workspace.id}
                  className="!bg-canvas dark:!bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#00477d]/40 dark:hover:border-blue-500/40 hover:shadow-sm transition-colors duration-150 group flex flex-col"
                >
                  <div className="p-5 flex flex-col h-full">
                    {/* Header: identity + status, with the badge pinned right */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-11 h-11 bg-[#00477d]/10 dark:bg-blue-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Folder className="w-5 h-5 text-[#00477d] dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#00477d] dark:group-hover:text-blue-400 transition-colors">
                          {workspace.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          by {workspace.owner_email}
                        </p>
                      </div>
                      {workspace.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-400/15 dark:text-yellow-300 flex-shrink-0">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Permission — a single inline row instead of a stacked block,
                        so the card stays compact and scannable. */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-7 h-7 flex-shrink-0 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${config.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{config.label}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">· view taskspaces</span>
                    </div>

                    {/* Metadata pinned above the actions; mt-auto keeps every card's
                        button row aligned even when one has no last-accessed date. */}
                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/60 space-y-1.5 mb-4">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3 mr-1.5 flex-shrink-0" />
                        Shared {formatDate(workspace.shared_at)}
                      </div>
                      {workspace.last_accessed && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <ExternalLink className="w-3 h-3 mr-1.5 flex-shrink-0" />
                          Last accessed {formatDate(workspace.last_accessed)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {workspace.status === 'pending' ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAcceptInvitation(workspace.id, workspace.name)}
                            disabled={acceptingInvitation !== null}
                          >
                            {acceptingInvitation === workspace.id ? 'Accepting...' : 'Accept'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDeclineInvitation(workspace.id, workspace.name)}
                            disabled={acceptingInvitation !== null}
                          >
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={ArrowRight}
                          onClick={() => handleOpenWorkspace(workspace)}
                          disabled={openingWorkspaceId !== null}
                          className="w-full group-hover:bg-[#00477d] group-hover:text-white transition-colors"
                        >
                          {openingWorkspaceId === workspace.id ? 'Opening...' : 'Open Workspace'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!declineTarget}
        onClose={() => !declineLoading && setDeclineTarget(null)}
        onConfirm={handleConfirmDecline}
        loading={declineLoading}
        title="Decline invitation"
        message="You will not be able to access this workspace unless invited again."
        itemName={declineTarget?.workspaceName}
        confirmText="Decline"
        cancelText="Cancel"
        variant="warning"
        irreversibleNote={false}
      />
    </div>
  )
}
