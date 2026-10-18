// store/workspaceStore.ts - Refactored to use Backend API for ALL data operations

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { useAuthStore } from './authStore';
import { extractCodeTitle } from '../../components/aselius-workspace/lib/codeUtils';
import { defaultTaskspaceName } from '@/lib/taskspaceLabels';

// Define the types based on your backend's API responses/Pydantic models
interface Workspace {
  id: string;
  name: string;
  description: string | null;
  // Owner's cloudhandle — never their bcid, which is backend/DB-authorization-only
  // and must never be exposed to anyone but the account owner.
  owner_cloudhandle: string;
  created_at: string; // Expect ISO string from API
  updated_at?: string; // For sorting by recency
  user_role?: string; // Added to distinguish delete vs leave
}

interface ChatSpace {
  id: string;
  workspace_id: string;
  title: string;
  created_at: string; // Expect ISO string from API
  updated_at?: string; // For sorting by recency
}

export interface MessageSource {
  id: string | number;
  title: string;
  url?: string;
  snippet?: string;
  description?: string;
  type?: 'web' | 'file' | 'database' | 'api' | 'knowledge';
}

// Matches ChatMessage model in chat.py state
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | string;
  content: any;
  created_at: string;

  // New fields for UI features
  canvasContent?: string;
  canvasTitle?: string;
  codeContent?: string;
  codeTitle?: string;
  imageUrl?: string;
  imagePrompt?: string;
  isEdit?: boolean;
  isCodeEdit?: boolean;
  emailData?: any;
  eventData?: any;
  deliverableAssetId?: string;
  deliverableFilename?: string;
  // Multi-deliverable turns (Rivine Research: markdown + formatted HTML).
  // When present, rendered instead of the single deliverableAssetId card.
  deliverables?: { assetId: string; filename?: string; kind?: string }[];
  // Accountability chips: which engine executed and which mediator mode routed
  targetEngine?: string;
  mediatorMode?: string;
  /** Mediator-optimized intent routed to the Rivine engine (persisted). */
  optimizedIntent?: string;
  // Rivine Code: commands the agent ran this turn (execute tool only — see
  // public_stream.py's §5.4 exception), rendered as a collapsible "Steps"
  // section. Keyed by tool_call_id so start/done events merge into one entry.
  codeSteps?: CodeStepEntry[];
  // TaskForce MCP: slim artifact refs (snapshots via deliverables).
  mcpArtifacts?: McpArtifact[];
  /**
   * What the engine did this turn, in order, as it happened.
   *
   * Every engine already streams its progress — `thought` titles, `stage`
   * labels, tool names — and the UI put each one into a single status line
   * that the next event overwrote. So the work was technically "shown" and
   * effectively invisible: one line at a time, no history, and nothing left
   * once the turn finished. On a long Code or Research turn that is minutes
   * of work the user never sees.
   *
   * Accumulated here instead, and kept with the message, so the thread shows
   * the engine working live and still says what it did afterwards.
   *
   * Labels only. `thought` content is stripped server-side by
   * `public_stream.sanitize_event` and must stay that way — this renders what
   * the sanitizer already deemed public, and never reaches for more.
   */
  activity?: ActivityEntry[];
}

export interface ActivityEntry {
  /** Stable key. A tool_call_id where there is one, else a sequence. */
  id: string;
  label: string;
  kind: 'thought' | 'stage' | 'tool';
  status: 'active' | 'done';
}

export interface McpArtifact {
  connector_id?: string;
  connector_label?: string;
  tool_name?: string;
  kind?: string;
  summary?: string;
  is_error?: boolean;
  checkpoint_id?: string;
  embed_url?: string;
  ui_resource_uri?: string;
  images?: { src: string; mime?: string }[];
  resource_uris?: string[];
  elements?: unknown[];
  skeleton?: unknown[];
  focus?: {
    targetIds: string[];
    fitToViewport?: boolean;
    animate?: boolean;
  } | null;
  asset_id?: string;
  filename?: string;
}

export interface CodeStepEntry {
  id: string;
  command: string;
  output?: string;
  status: 'running' | 'done';
}

// Matches ChatHistoryResponse in chat.py state
interface ChatHistoryResponse {
  messages: ChatMessage[];
  total_count: number;
  chat_space_id: string;
  workspace_id: string;
}

interface WorkspaceState {
  // State
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  chatSpaces: ChatSpace[];
  // Per-workspace taskspace cache (session-only, not persisted) — lets
  // switching back to an already-visited workspace show its taskspace list
  // instantly instead of blanking to [] + "Loading…" on every click.
  chatSpacesCache: Record<string, ChatSpace[]>;
  /**
   * Last-known messages per taskspace id, for instant re-entry.
   *
   * Switching taskspaces used to blank the thread and await a round trip, so
   * every click cost a network wait — and roughly one in six of those requests
   * lands on a cold Lambda container and takes seconds. Re-entering a taskspace
   * you were just in now renders from here immediately while a refresh runs in
   * the background.
   *
   * Deliberately NOT persisted to localStorage (see `partialize`): message
   * bodies are unbounded and would blow the ~5MB quota, which fails silently
   * and takes the rest of the persisted shell down with it. In-memory is
   * exactly the scope that matters — switching within a session.
   */
  messagesCache: Record<string, ChatMessage[]>;
  currentChatSpace: ChatSpace | null;
  messages: ChatMessage[];
  pendingInvitations: any[]; // Using any to avoid complex type export circular deps, ideally import SharedWorkspace
  persistentCanvasContent: Record<string, { title: string; content: string; assetId?: string }>;
  persistentCodeContent: Record<string, { title: string; content: string; assetId?: string }>;
  loading: boolean; // General loading state
  error: string | null;
  sharePanelRequestId: number;

  // Actions (All now use fetch to backend API)
  /** One round trip that loads — and for a new user creates — the app shell. */
  bootstrapWorkspace: () => Promise<boolean>;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace | null>; // Return created workspace
  selectWorkspace: (workspace: Workspace, preferChatSpaceId?: string) => Promise<void>; // Primarily state management + triggers fetch
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  renameWorkspace: (workspaceId: string, name: string) => Promise<void>;
  leaveWorkspace: (workspaceId: string) => Promise<void>;

  fetchChatSpaces: (workspaceId: string, options?: { background?: boolean }) => Promise<void>;
  /** Warm the taskspace cache for workspaces the user has not opened yet. */
  prefetchChatSpaces: (workspaceIds: string[]) => Promise<void>;
  createChatSpace: (
    workspaceId: string,
    title: string,
    options?: { silent?: boolean },
  ) => Promise<ChatSpace | null>;
  selectChatSpace: (chatSpace: ChatSpace) => Promise<void>; // Primarily state management + triggers fetch
  deleteChatSpace: (chatSpaceId: string) => Promise<void>;
  renameChatSpace: (chatSpaceId: string, title: string) => Promise<void>;
  deleteTurn: (aiMessageId: string) => Promise<void>;

  fetchMessages: (workspaceId: string, chatSpaceId: string) => Promise<void>;

  // Actions for optimistic UI updates with messages
  addMessage: (message: ChatMessage) => void;
  removeMessage: (messageId: string) => void;
  updateMessageId: (tempId: string, finalId: string) => void;

  // NEW: Updates content of a message in real-time (for streaming)
  updateMessageContent: (messageId: string, content: string) => void;
  // NEW: Updates metadata of a message (for UI triggers)
  updateMessageMetadata: (messageId: string, metadata: Partial<ChatMessage>) => void;

  // Sharing & Invitations
  fetchPendingInvitations: () => Promise<void>;
  acceptInvitation: (workspaceId: string) => Promise<void>;
  declineInvitation: (workspaceId: string) => Promise<void>;

  // Canvas & Code Persistence
  setCanvasContent: (messageId: string, title: string, content: string, assetId?: string) => void;
  setCodeContent: (messageId: string, title: string, content: string, assetId?: string) => void;
  getCanvasContent: (messageId: string) => { title: string; content: string; assetId?: string } | undefined;
  getCodeContent: (messageId: string) => { title: string; content: string; assetId?: string } | undefined;

  clearAllWorkspaces: () => void;
  requestSharePanel: () => void;
}

// Base URL for your FastAPI backend
// Base URL for your FastAPI backend
const ASELIUS_BASE_URL = '/api/aselius'; // Proxies to /api/ on backend

const getAuthHeaders = (): Record<string, string> => {
  const { token } = useAuthStore.getState(); // Get token from auth store

  if (!token) {
    console.warn("No auth token found in authStore. Request will likely fail 401.");
    return { 'Content-Type': 'application/json' };
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // <-- Set the header
  };
};

/**
 * In-flight request dedupe.
 *
 * These endpoints have several independent callers on a single page load —
 * the Sidebar and the Workspace both mount the provisioner hook, the route
 * sync re-arms when the workspace list lands, and the sidebar re-selects a
 * workspace when its row expands. None of them knew about the others, so the
 * same GET went out 2+ times per load.
 *
 * This coalesces *concurrent* callers onto one request. It is NOT a response
 * cache: the promise is dropped as soon as it settles, so the next call after
 * completion always hits the network again. That keeps the "never show a user
 * stale data" property while removing the duplicate traffic.
 */
const inFlightWorkspaces = { promise: null as Promise<void> | null };
const inFlightChatSpaces = new Map<string, Promise<void>>();
/**
 * Same coalescing for a thread's messages, and for a sharper reason.
 *
 * Opening a taskspace fetched it twice: `selectChatSpace` fetches, and
 * ChatSpace's own "chat space changed" effect fetches again 50ms later. Two
 * identical GETs for the same thread, racing, on every single open — the
 * second one arriving late and re-rendering a list that was already correct.
 * On a long thread that is the difference between a click that lands and one
 * that visibly hitches.
 *
 * Both callers are legitimate — the store owns the data, the component owns
 * `messagesFetched` — so neither is removed. They join one request instead.
 */
const inFlightMessages = new Map<string, Promise<void>>();

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      // Initial state
      workspaces: [],
      currentWorkspace: null,
      chatSpaces: [],
      chatSpacesCache: {},
      messagesCache: {},
      currentChatSpace: null,
      messages: [],
      pendingInvitations: [],
      persistentCanvasContent: {},
      persistentCodeContent: {},
      loading: false,
      error: null,
      sharePanelRequestId: 0,

      // --- Workspace Operations (using Backend API) ---

      /**
       * Load the whole app shell in ONE request, creating defaults if needed.
       *
       * Opening the app used to be a sequential chain — list workspaces, create
       * one, select it, list its taskspaces, create one — with each step
       * awaited before the next began. Five round trips, and a first-time user
       * waited for all five before anything rendered. Every one of them can
       * land on a cold Lambda container independently, so the person seeing the
       * product for the very first time got the worst possible latency.
       *
       * Returns false (rather than throwing) if the endpoint is unavailable, so
       * the caller can fall back to the old multi-step path. That fallback is
       * what makes this safe to ship before the backend is deployed everywhere.
       */
      bootstrapWorkspace: async () => {
        try {
          const response = await fetch(`${ASELIUS_BASE_URL}/workspaces/bootstrap`, {
            method: 'GET',
            headers: getAuthHeaders(),
          });
          // 404 => older backend without this route: use the legacy path.
          if (!response.ok) return false;

          const data = await response.json();
          const workspaces: Workspace[] = data?.workspaces || [];
          if (workspaces.length === 0) return false;

          const activeWorkspace =
            workspaces.find((w) => w.id === data?.active_workspace_id) || workspaces[0];
          const chatSpaces: ChatSpace[] = data?.chat_spaces || [];
          const activeChatSpace =
            chatSpaces.find((c) => c.id === data?.active_chat_space_id) ||
            chatSpaces[0] ||
            null;

          set({
            workspaces,
            currentWorkspace: activeWorkspace,
            chatSpaces,
            currentChatSpace: activeChatSpace,
            loading: false,
            error: null,
          });
          return true;
        } catch {
          // Network/parse failure is not fatal — the legacy path still works.
          return false;
        }
      },

      fetchWorkspaces: async () => {
        // Join an already-running fetch instead of issuing a duplicate.
        if (inFlightWorkspaces.promise) return inFlightWorkspaces.promise;

        const run = (async () => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(`${ASELIUS_BASE_URL}/workspaces/`, {
            method: 'GET',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) throw new Error("Not authenticated");
            throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch workspaces`);
          }

          const data = await response.json();

          // Preserve local updated_at timestamps (from user activity) when merging with API data
          const existingWorkspaces = get().workspaces;
          const mergedWorkspaces = (data || []).map((workspace: Workspace) => {
            const existing = existingWorkspaces.find(w => w.id === workspace.id);
            // Keep the local updated_at if it's newer than what came from the API
            if (existing?.updated_at) {
              const localTime = new Date(existing.updated_at).getTime();
              const apiTime = workspace.updated_at ? new Date(workspace.updated_at).getTime() : 0;
              if (localTime > apiTime) {
                return { ...workspace, updated_at: existing.updated_at };
              }
            }
            return workspace;
          });

          // Sort by most recently updated (or created if updated_at doesn't exist)
          const sortedWorkspaces = mergedWorkspaces.sort((a: Workspace, b: Workspace) => {
            const aTime = new Date(a.updated_at || a.created_at).getTime();
            const bTime = new Date(b.updated_at || b.created_at).getTime();
            return bTime - aTime; // Descending order (most recent first)
          });
          set({ workspaces: sortedWorkspaces, loading: false });

          // Warm the taskspace lists in the background. Un-awaited on purpose:
          // the workspace list is already on screen and must not wait on this.
          // Scheduled at idle so it competes with nothing the user is waiting
          // for, with a timeout so it still runs on a busy tab.
          const warm = () => {
            void get().prefetchChatSpaces(
              sortedWorkspaces.map((w: Workspace) => w.id),
            );
          };
          if (typeof window !== 'undefined') {
            const idle = (window as any).requestIdleCallback;
            if (typeof idle === 'function') idle(warm, { timeout: 2000 });
            else window.setTimeout(warm, 300);
          }

        } catch (error: any) {
          // Do NOT clear `workspaces` here — a transient failure (network
          // blip, or an auth token not fully settled right after a fresh
          // login) must never wipe out workspaces the user already had
          // loaded. Leaving the prior list in place is always safe; forcing
          // it to [] made a temporary fetch failure look identical to "you
          // have zero workspaces."
          set({ loading: false, error: error.message });
          toast.error(`Failed to load workspaces: ${error.message}`);
        }
        })();

        inFlightWorkspaces.promise = run;
        try {
          await run;
        } finally {
          // Cleared on settle — this dedupes concurrent callers only, it does
          // not cache the result.
          inFlightWorkspaces.promise = null;
        }
      },

      createWorkspace: async (name: string) => {
        if (!name.trim()) {
          toast.error('Workspace name cannot be empty.');
          throw new Error('Name is empty');
        }

        set({ loading: true, error: null });
        try {
          const body = JSON.stringify({ name: name.trim() });

          const response = await fetch(`${ASELIUS_BASE_URL}/workspaces/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: body,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) throw new Error("Not authenticated");
            throw new Error(errorData.detail || `HTTP ${response.status}: Failed to create workspace`);
          }

          const newWorkspace: Workspace = await response.json();

          set(state => ({
            workspaces: [newWorkspace, ...state.workspaces],
            loading: false,
          }));
          toast.success('Workspace created successfully!');

          await get().selectWorkspace(newWorkspace);
          const spacesForWorkspace = get().chatSpaces.filter(
            (cs) => cs.workspace_id === newWorkspace.id,
          );
          if (spacesForWorkspace.length === 0) {
            await get().createChatSpace(newWorkspace.id, defaultTaskspaceName(1), { silent: true });
          } else if (!get().currentChatSpace) {
            await get().selectChatSpace(spacesForWorkspace[0]);
          }

          return newWorkspace;

        } catch (error: any) {
          set({ loading: false, error: error.message });
          toast.error(`Failed to create workspace: ${error.message}`);
          throw error;
        }
      },

      selectWorkspace: async (workspace: Workspace, preferChatSpaceId?: string) => {
        if (get().currentWorkspace?.id === workspace.id) return;
        const cached = get().chatSpacesCache[workspace.id];
        // The most recently updated taskspace — the one that should open.
        // `fetchChatSpaces` sorts by updated_at desc and caches in that order,
        // so [0] is it.
        //
        // Picked HERE rather than after the fetch, which is the whole point.
        // Clearing `currentChatSpace` and waiting for the network meant
        // ChatSpace's `if (!currentChatSpace)` branch rendered "No Taskspace
        // Selected" — a genuine empty state, with a Create button — for the
        // length of a round trip, on every single workspace click. The
        // taskspace cache did not help, because the cache was consulted for
        // the *list* and never for the selection: a warm workspace showed its
        // sidebar entries instantly and still sat on the empty state until the
        // server answered. That is why the click felt slow while switching
        // tabs inside a taskspace felt instant — tabs never clear this field.
        // `preferChatSpaceId` is the caller saying "the user clicked THIS one,
        // not the most recent" — a taskspace clicked in the sidebar under a
        // workspace that is not the current one. Without it that click would
        // paint the most recent taskspace first and then swap, which is a
        // visible flash of the wrong thread.
        const recent =
          (preferChatSpaceId && cached?.find((cs) => cs.id === preferChatSpaceId)) ||
          (cached && cached.length > 0 ? cached[0] : null);
        set((state) => ({
          currentWorkspace: workspace,
          currentChatSpace: recent,
          // Paint the cached thread too, when there is one. `selectChatSpace`
          // below revalidates it underneath.
          messages: recent ? (state.messagesCache[recent.id] ?? []) : [],
          // Show cached taskspaces instantly (no blank flash / spinner) when
          // this workspace was already visited this session; empty-array +
          // loading only for a genuinely first-time fetch.
          chatSpaces: cached ?? [],
          loading: !cached,
          error: null,
        }));
        // Not awaited: the thread is already on screen. This refreshes it.
        if (recent) {
          void get().fetchMessages(workspace.id, recent.id).catch(() => {
            /* a failed background refresh must not blank what is showing */
          });
        }
        // Revalidate in the background even on a cache hit, so the list stays
        // fresh — `background: true` keeps it silent (no re-blank, no spinner).
        await get().fetchChatSpaces(workspace.id, { background: !!cached });
      },

      deleteWorkspace: async (workspaceId: string) => {
        try {
          const response = await fetch(`${ASELIUS_BASE_URL}/workspaces/${workspaceId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) throw new Error("Not authenticated");
            if (response.status === 404) throw new Error("Workspace not found.");
            if (response.status === 403) throw new Error("Permission denied to delete this workspace.");
            throw new Error(errorData.detail || `HTTP ${response.status}: Failed to delete workspace`);
          }

          set(state => {
            const newWorkspaces = state.workspaces.filter(w => w.id !== workspaceId);
            const shouldClearRelated = state.currentWorkspace?.id === workspaceId;
            return {
              workspaces: newWorkspaces,
              currentWorkspace: shouldClearRelated ? null : state.currentWorkspace,
              chatSpaces: shouldClearRelated ? [] : state.chatSpaces,
              currentChatSpace: shouldClearRelated ? null : state.currentChatSpace,
              messages: shouldClearRelated ? [] : state.messages,
              error: null,
              loading: false,
            };
          });
          toast.success('Workspace deleted successfully!');

        } catch (error: any) {
          set({ loading: false, error: error.message });
          toast.error(`Failed to delete workspace: ${error.message}`);
          throw error;
        }
      },

      renameWorkspace: async (workspaceId: string, name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        // Optimistic update — snapshot so we can revert on failure.
        const previous = get().workspaces;
        set(state => ({
          workspaces: state.workspaces.map(w =>
            w.id === workspaceId ? { ...w, name: trimmed } : w
          ),
          currentWorkspace: state.currentWorkspace?.id === workspaceId
            ? { ...state.currentWorkspace, name: trimmed }
            : state.currentWorkspace,
        }));

        try {
          const response = await fetch(`${ASELIUS_BASE_URL}/workspaces/${workspaceId}`, {
            method: 'PATCH',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: trimmed }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) throw new Error("Not authenticated");
            if (response.status === 404) throw new Error("Workspace not found.");
            if (response.status === 403) throw new Error("Permission denied to rename this workspace.");
            throw new Error(errorData.detail || `HTTP ${response.status}: Failed to rename workspace`);
          }

          const updated: Workspace = await response.json();
          set(state => ({
            workspaces: state.workspaces.map(w => (w.id === workspaceId ? { ...w, ...updated } : w)),
            currentWorkspace: state.currentWorkspace?.id === workspaceId
              ? { ...state.currentWorkspace, ...updated }
              : state.currentWorkspace,
          }));
        } catch (error: any) {
          // Revert the optimistic update.
          set(state => ({
            workspaces: previous,
            currentWorkspace: state.currentWorkspace?.id === workspaceId
              ? previous.find(w => w.id === workspaceId) ?? state.currentWorkspace
              : state.currentWorkspace,
          }));
          toast.error(`Failed to rename workspace: ${error.message}`);
          throw error;
        }
      },

      leaveWorkspace: async (workspaceId: string) => {
        try {
          const response = await fetch(`${ASELIUS_BASE_URL}/workspaces/${workspaceId}/leave`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) throw new Error("Not authenticated");
            if (response.status === 404) throw new Error("Workspace not found.");
            throw new Error(errorData.detail || `HTTP ${response.status}: Failed to leave workspace`);
          }

          set(state => {
            const newWorkspaces = state.workspaces.filter(w => w.id !== workspaceId);
            const shouldClearRelated = state.currentWorkspace?.id === workspaceId;
            return {
              workspaces: newWorkspaces,
              currentWorkspace: shouldClearRelated ? null : state.currentWorkspace,
              chatSpaces: shouldClearRelated ? [] : state.chatSpaces,
              currentChatSpace: shouldClearRelated ? null : state.currentChatSpace,
              messages: shouldClearRelated ? [] : state.messages,
              error: null,
              loading: false,
            };
          });
          toast.success('Successfully left the workspace.');

        } catch (error: any) {
          set({ loading: false, error: error.message });
          toast.error(`Failed to leave workspace: ${error.message}`);
          throw error;
        }
      },

      // --- Chat Space Operations (using Backend API) ---
      prefetchChatSpaces: async (workspaceIds: string[]) => {
        // Why this exists: `selectWorkspace` already renders instantly from
        // `chatSpacesCache`, so switching to a workspace visited earlier in the
        // session is free. The 1-2s people notice is the FIRST visit, where
        // there is nothing cached and the taskspace list is a round trip.
        //
        // Prefetching turns that first visit into a cache hit too. It is
        // deliberately NOT `fetchChatSpaces`: that function writes
        // `chatSpaces`, `loading` and `currentChatSpace`, and it bails early
        // when the workspace is not the current one — both correct for the
        // workspace being viewed, and both wrong for one being warmed in the
        // background. This writes the cache and nothing else, so it can never
        // disturb what is on screen.
        const targets = workspaceIds.filter((id) => {
          if (!id) return false;
          if (get().chatSpacesCache[id] !== undefined) return false; // already warm
          if (inFlightChatSpaces.has(id)) return false;              // already coming
          return true;
        });
        if (targets.length === 0) return;

        // Two at a time. A user with a dozen workspaces should not open a
        // dozen sockets on load and slow down the request they are actually
        // waiting for.
        const CONCURRENCY = 2;

        const warmOne = async (workspaceId: string) => {
          try {
            const response = await fetch(
              `${ASELIUS_BASE_URL}/workspaces/${workspaceId}/chat-spaces`,
              { method: 'GET', headers: getAuthHeaders() },
            );
            if (!response.ok) return; // a prefetch never surfaces an error
            const fetched: ChatSpace[] = await response.json();
            const sorted = (fetched || []).sort((a: ChatSpace, b: ChatSpace) => {
              const aTime = new Date(a.updated_at || a.created_at).getTime();
              const bTime = new Date(b.updated_at || b.created_at).getTime();
              return bTime - aTime;
            });
            // Do not clobber a real fetch that landed while this was in the
            // air: the foreground result is the fresher of the two.
            set((state) =>
              state.chatSpacesCache[workspaceId] !== undefined
                ? state
                : {
                    chatSpacesCache: {
                      ...state.chatSpacesCache,
                      [workspaceId]: sorted,
                    },
                  },
            );
          } catch {
            // Offline, aborted, a 500 — all fine. The real fetch on click
            // still runs and still reports properly.
          }
        };

        const queue = [...targets];
        const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
          for (let id = queue.shift(); id; id = queue.shift()) {
            await warmOne(id);
          }
        });
        await Promise.all(workers);
      },

      fetchChatSpaces: async (workspaceId: string, options?: { background?: boolean }) => {
        // Join an in-flight fetch for THIS workspace rather than duplicating it.
        // Keyed per workspaceId so switching workspaces still fetches.
        const existing = inFlightChatSpaces.get(workspaceId);
        if (existing) return existing;

        const run = (async () => {
        // Background revalidation (cache hit already showing) must not blank
        // the list or flip the loading spinner back on — that's the exact
        // flash/lag this cache exists to remove.
        if (!options?.background) {
          set({ loading: true, error: null, chatSpaces: [] });
        }
        try {
          const response = await fetch(`${ASELIUS_BASE_URL}/workspaces/${workspaceId}/chat-spaces`, {
            method: 'GET',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) throw new Error("Not authenticated");
            if (response.status === 403) throw new Error("Permission denied");
            throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch taskspaces`);
          }

          const fetchedChatSpaces: ChatSpace[] = await response.json();
          // Staleness guard: if the user switched to a DIFFERENT workspace while
          // this request was in flight (A→B→A fast switch), drop the stale
          // response instead of overwriting the now-current workspace's list —
          // otherwise its taskspaces get blanked to "No taskspaces yet". Same
          // soft-recover pattern used in selectChatSpace. (currentWorkspace is
          // set to the target before fetch in selectWorkspace, so a mismatch
          // here means a newer switch superseded this one.)
          const stillCurrent = get().currentWorkspace?.id;
          if (stillCurrent && stillCurrent !== workspaceId) {
            return; // a newer fetch owns the list now
          }
          // Sort by most recently updated (or created if updated_at doesn't exist)
          const sortedChatSpaces = (fetchedChatSpaces || []).sort((a: ChatSpace, b: ChatSpace) => {
            const aTime = new Date(a.updated_at || a.created_at).getTime();
            const bTime = new Date(b.updated_at || b.created_at).getTime();
            return bTime - aTime; // Descending order (most recent first)
          });
          set((state) => ({
            chatSpaces: sortedChatSpaces,
            loading: false,
            chatSpacesCache: { ...state.chatSpacesCache, [workspaceId]: sortedChatSpaces },
          }));

          const activeWorkspaceId = get().currentWorkspace?.id;
          const open = get().currentChatSpace;
          // `selectWorkspace` may have opened a taskspace optimistically from
          // cache. Correct it only if the server says that taskspace is gone —
          // re-pointing merely because the sort order changed would yank the
          // thread out from under someone who is already reading it.
          const optimisticIsStale =
            !!open &&
            activeWorkspaceId === workspaceId &&
            sortedChatSpaces.length > 0 &&
            !sortedChatSpaces.some((cs) => cs.id === open.id);

          if (
            sortedChatSpaces.length > 0 &&
            activeWorkspaceId === workspaceId &&
            (!open || optimisticIsStale)
          ) {
            await get().selectChatSpace(sortedChatSpaces[0]);
          } else if (sortedChatSpaces.length === 0) {
            set({ currentChatSpace: null, messages: [], loading: false });
          }

        } catch (error: any) {
          if (options?.background) {
            // A cache hit is already showing correct data — a failed silent
            // revalidation shouldn't blank it out from under the user.
            return;
          }
          // Mirrors the identical fix already applied to fetchWorkspaces: a
          // transient failure (a network blip, or — the exact bug this
          // guards against — an auth token that hadn't finished syncing yet
          // on a page that isn't /workspace/*, see WorkspaceAuthSync.tsx)
          // must never look identical to "this workspace genuinely has zero
          // taskspaces." Restore from this workspace's cache if we have one
          // instead of wiping to `[]` — only a workspace with no prior data
          // at all renders as truly empty. Also leave currentChatSpace/
          // messages alone here: selectWorkspace already clears them
          // synchronously before this fetch starts, so forcing them again on
          // a failure path only reintroduces the same "looks erased" symptom
          // for callers that didn't already clear them themselves.
          const cachedForThisWorkspace = get().chatSpacesCache[workspaceId];
          set({
            loading: false,
            error: error.message,
            chatSpaces: cachedForThisWorkspace ?? [],
          });
          toast.error(`Failed to load taskspaces: ${error.message}`);
        }
        })();

        inFlightChatSpaces.set(workspaceId, run);
        try {
          await run;
        } finally {
          inFlightChatSpaces.delete(workspaceId);
        }
      },

      createChatSpace: async (
        workspaceId: string,
        title: string,
        options?: { silent?: boolean },
      ) => {
        if (!title.trim()) {
          toast.error('Taskspace title cannot be empty.');
          throw new Error('Title is empty');
        }

        set({ loading: true, error: null });
        try {
          const response = await fetch(`${ASELIUS_BASE_URL}/workspaces/${workspaceId}/chat-spaces`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ title: title.trim() }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) throw new Error("Not authenticated");
            if (response.status === 403) throw new Error("Permission denied");
            throw new Error(errorData.detail || `HTTP ${response.status}: Failed to create taskspace`);
          }

          const newChatSpace: ChatSpace = await response.json();

          set(state => {
            const chatSpaces = [newChatSpace, ...state.chatSpaces];
            return {
              chatSpaces,
              loading: false,
              chatSpacesCache: { ...state.chatSpacesCache, [workspaceId]: chatSpaces },
            };
          });
          if (!options?.silent) {
            toast.success('Taskspace created successfully!');
          }

          await get().selectChatSpace(newChatSpace);
          return newChatSpace;

        } catch (error: any) {
          set({ loading: false, error: error.message });
          toast.error(`Failed to create taskspace: ${error.message}`);
          throw error;
        }
      },

      selectChatSpace: async (chatSpace: ChatSpace) => {
        let currentWorkspaceId = get().currentWorkspace?.id;

        if (!currentWorkspaceId) {
          const workspace = get().workspaces.find((ws) => ws.id === chatSpace.workspace_id);
          if (workspace) {
            set({ currentWorkspace: workspace });
            currentWorkspaceId = workspace.id;
          } else {
            console.error('Cannot select chat space: No workspace selected.');
            toast.error('Internal error: No workspace selected.');
            return;
          }
        }

        if (currentWorkspaceId !== chatSpace.workspace_id) {
          // Soft-recover (mirrors the null-workspace branch above): a stale
          // route-sync run racing a programmatic workspace switch (e.g. right
          // after createWorkspace) can land here with a chat space belonging
          // to a workspace we know about — switch to it instead of erroring.
          const workspace = get().workspaces.find((ws) => ws.id === chatSpace.workspace_id);
          if (workspace) {
            console.warn('selectChatSpace: workspace mismatch — recovering by switching to', workspace.id);
            set({ currentWorkspace: workspace });
            currentWorkspaceId = workspace.id;
          } else {
            console.error('Cannot select chat space: Workspace mismatch.');
            toast.error('Internal error: Workspace mismatch.');
            return;
          }
        }
        // Only fetch if selecting a *different* chat space or if messages are empty/loading failed previously
        if (get().currentChatSpace?.id === chatSpace.id && get().messages.length > 0 && !get().error) {
          return;
        }

        // Stale-while-revalidate. If this taskspace has been open before in
        // this session, paint its thread immediately and refresh underneath;
        // the click feels instant instead of blanking for a round trip that
        // may hit a cold container.
        const cachedMessages = get().messagesCache[chatSpace.id];

        if (cachedMessages && cachedMessages.length > 0) {
          set({
            currentChatSpace: chatSpace,
            messages: cachedMessages,
            loading: false,
            error: null,
          });
          // Not awaited: the user is already looking at the thread.
          void get()
            .fetchMessages(currentWorkspaceId, chatSpace.id)
            .catch((error: any) => {
              // A failed background refresh must not blank what is on screen.
              console.error('Background message refresh failed:', error);
            });
          return;
        }

        set({ currentChatSpace: chatSpace, messages: [], loading: true, error: null });
        try {
          await get().fetchMessages(currentWorkspaceId, chatSpace.id);
        } catch (error: any) {
          console.error("Failed to fetch messages for selected chat space:", error);
        }
      },

      deleteChatSpace: async (chatSpaceId: string) => {
        const { currentWorkspace } = get();
        if (!currentWorkspace?.id) {
          toast.error('No workspace selected.');
          throw new Error('No workspace selected');
        }

        try {
          const response = await fetch(`${ASELIUS_BASE_URL}/workspaces/${currentWorkspace.id}/chat-spaces/${chatSpaceId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) throw new Error("Not authenticated");
            if (response.status === 404) throw new Error("Taskspace not found.");
            if (response.status === 403) throw new Error("Permission denied to delete this taskspace.");
            throw new Error(errorData.detail || `HTTP ${response.status}: Failed to delete taskspace`);
          }

          set(state => {
            const newChatSpaces = state.chatSpaces.filter(cs => cs.id !== chatSpaceId);
            const wasCurrentSpace = state.currentChatSpace?.id === chatSpaceId;
            const newCurrentChatSpace = wasCurrentSpace ? null : state.currentChatSpace;
            const wsId = state.currentWorkspace?.id;
            return {
              chatSpaces: newChatSpaces,
              currentChatSpace: newCurrentChatSpace,
              messages: wasCurrentSpace ? [] : state.messages,
              error: null,
              loading: false,
              chatSpacesCache: wsId
                ? { ...state.chatSpacesCache, [wsId]: newChatSpaces }
                : state.chatSpacesCache,
            };
          });
          toast.success('Taskspace deleted successfully!');

          if (get().currentChatSpace === null && get().chatSpaces.length > 0) {
            await get().selectChatSpace(get().chatSpaces[0]);
          } else if (get().chatSpaces.length === 0) {
            set({ currentChatSpace: null, messages: [] });
          }

        } catch (error: any) {
          set({ loading: false, error: error.message });
          toast.error(`Failed to delete taskspace: ${error.message}`);
          throw error;
        }
      },

      renameChatSpace: async (chatSpaceId: string, title: string) => {
        const trimmed = title.trim();
        if (!trimmed) return;

        const { currentWorkspace } = get();
        if (!currentWorkspace?.id) {
          toast.error('No workspace selected.');
          throw new Error('No workspace selected');
        }

        // Optimistic update — snapshot so we can revert on failure.
        const previousChatSpaces = get().chatSpaces;
        const previousCache = get().chatSpacesCache;
        const applyTitle = (list: ChatSpace[]) =>
          list.map(cs => (cs.id === chatSpaceId ? { ...cs, title: trimmed } : cs));
        set(state => ({
          chatSpaces: applyTitle(state.chatSpaces),
          currentChatSpace: state.currentChatSpace?.id === chatSpaceId
            ? { ...state.currentChatSpace, title: trimmed }
            : state.currentChatSpace,
          chatSpacesCache: currentWorkspace.id in state.chatSpacesCache
            ? { ...state.chatSpacesCache, [currentWorkspace.id]: applyTitle(state.chatSpacesCache[currentWorkspace.id]) }
            : state.chatSpacesCache,
        }));

        try {
          const response = await fetch(`${ASELIUS_BASE_URL}/workspaces/${currentWorkspace.id}/chat-spaces/${chatSpaceId}`, {
            method: 'PATCH',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: trimmed }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) throw new Error("Not authenticated");
            if (response.status === 404) throw new Error("Taskspace not found.");
            if (response.status === 403) throw new Error("Permission denied to rename this taskspace.");
            throw new Error(errorData.detail || `HTTP ${response.status}: Failed to rename taskspace`);
          }

          const updated: ChatSpace = await response.json();
          set(state => ({
            chatSpaces: state.chatSpaces.map(cs => (cs.id === chatSpaceId ? { ...cs, ...updated } : cs)),
            currentChatSpace: state.currentChatSpace?.id === chatSpaceId
              ? { ...state.currentChatSpace, ...updated }
              : state.currentChatSpace,
            chatSpacesCache: currentWorkspace.id in state.chatSpacesCache
              ? {
                  ...state.chatSpacesCache,
                  [currentWorkspace.id]: state.chatSpacesCache[currentWorkspace.id].map(cs =>
                    cs.id === chatSpaceId ? { ...cs, ...updated } : cs
                  ),
                }
              : state.chatSpacesCache,
          }));
        } catch (error: any) {
          // Revert the optimistic update.
          set(state => ({
            chatSpaces: previousChatSpaces,
            currentChatSpace: state.currentChatSpace?.id === chatSpaceId
              ? previousChatSpaces.find(cs => cs.id === chatSpaceId) ?? state.currentChatSpace
              : state.currentChatSpace,
            chatSpacesCache: previousCache,
          }));
          toast.error(`Failed to rename taskspace: ${error.message}`);
          throw error;
        }
      },

      // --- Message Operations (using Backend API) ---
      fetchMessages: async (workspaceId: string, chatSpaceId: string) => {
        const inFlight = inFlightMessages.get(chatSpaceId);
        if (inFlight) return inFlight;

        const run = (async () => {
        // Only clear the thread when there is nothing cached to show. A
        // background revalidation of a taskspace the user is currently reading
        // must not wipe it to an empty list and flash a spinner.
        const hasCached = (get().messagesCache[chatSpaceId] || []).length > 0;
        set(
          hasCached
            ? { error: null }
            : { loading: true, error: null, messages: [] },
        );
        try {
          const response = await fetch(`${ASELIUS_BASE_URL}/workspaces/${workspaceId}/chats/${chatSpaceId}/messages`, {
            method: 'GET',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Unknown error fetching messages" }));
            if (response.status === 401) throw new Error("Not authenticated");
            if (response.status === 403) throw new Error("Permission denied to view messages.");
            throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch messages`);
          }

          const data: ChatHistoryResponse = await response.json();

          // Hydrate metadata from content (since backend doesn't store UI metadata)
          const enrichedMessages = (data.messages || []).map(msg => {
            let enriched = msg;

            if (typeof msg.content === 'string') {
              // Heuristic: If message has code block, restore Code Preview
              // Regex now allows optional language and loose whitespace/newlines
              const codeMatch = msg.content.match(/```(\w*)\s*([\s\S]*?)```/);
              if (codeMatch) {
                const code = codeMatch[2];
                enriched = {
                  ...enriched,
                  codeContent: code,
                  codeTitle: extractCodeTitle(code),
                  isCodeEdit: false
                };
              }
            }

            // Restore the clickable deliverable card for rivine_chat/research/cicero
            // asset-backed answers. The live SSE path sets this from the
            // open_canvas/open_html ui_action event as it streams in; history
            // loaded from GET .../messages carries the same info in each
            // message's `fragment` field instead, which this type doesn't
            // declare (backend-only shape) but does send — read it off the
            // raw response rather than dropping it silently.
            const fragment = (msg as any).fragment;
            const primarySnap =
              fragment?.fragment_snapshot?.asset_id
                ? fragment.fragment_snapshot
                : fragment?.research_fragment_snapshot?.asset_id
                  ? fragment.research_fragment_snapshot
                  : null;
            if (primarySnap?.asset_id) {
              enriched = {
                ...enriched,
                deliverableAssetId: String(primarySnap.asset_id),
                deliverableFilename: primarySnap.filename,
              };
            }

            // Multi-deliverable turns (Research/Cicero/TaskForce MCP).
            //
            // A turn can carry its outputs in THREE places, and they are
            // additive, not alternatives:
            //   fragment.deliverables[]        canonical list
            //   fragment.fragment_snapshot     the primary artifact
            //   fragment.research_fragment_snapshot  Research's markdown companion
            //
            // Reading them as either/or (primarySnap picks one, and the
            // fallback emitted a single card) is why a turn that produced
            // several files collapsed to ONE card after reload, while every
            // file was still sitting in the Assets panel — users had to leave
            // the thread to reach their own deliverables. Union + dedupe by
            // assetId so each artifact keeps its own clickable snapshot.
            const toCard = (raw: any) => {
              if (!raw) return null;
              const snap =
                raw?.fragment_snapshot && typeof raw.fragment_snapshot === 'object'
                  ? raw.fragment_snapshot
                  : raw;
              const id = snap?.asset_id || raw?.asset_id;
              if (!id) return null;
              return {
                assetId: String(id),
                filename: snap?.filename || raw?.filename,
                kind: snap?.fragment_type || raw?.fragment_type,
              };
            };

            const fragDeliverables: { assetId: string; filename?: string; kind?: string }[] = [];
            const seenAssetIds = new Set<string>();
            for (const raw of [
              ...(Array.isArray(fragment?.deliverables) ? fragment.deliverables : []),
              fragment?.fragment_snapshot,
              fragment?.research_fragment_snapshot,
            ]) {
              const card = toCard(raw);
              if (card && !seenAssetIds.has(card.assetId)) {
                seenAssetIds.add(card.assetId);
                fragDeliverables.push(card);
              }
            }
            if (fragDeliverables.length > 0) {
              enriched = { ...enriched, deliverables: fragDeliverables };
            }

            // Engine/mediator accountability chips from persisted metadata
            const meta = (msg as any).metadata;
            if (meta?.target_engine || meta?.mediator_mode) {
              enriched = {
                ...enriched,
                targetEngine: meta.target_engine ?? undefined,
                mediatorMode: meta.mediator_mode ?? undefined,
              };
            }

            if (typeof meta?.mediator_optimized_intent === 'string' && meta.mediator_optimized_intent.trim()) {
              enriched = {
                ...enriched,
                optimizedIntent: meta.mediator_optimized_intent.trim(),
              };
            }

            // A saved step trail (Rivine Browse runs store theirs with the message),
            // shown with the same "N steps" component as a live turn.
            if (Array.isArray(meta?.activity) && meta.activity.length > 0) {
              enriched = {
                ...enriched,
                activity: meta.activity
                  .filter((a: any) => a && typeof a.label === 'string' && a.label.trim())
                  .slice(-150)
                  .map((a: any, i: number) => ({
                    id: String(a.id ?? i),
                    label: String(a.label).slice(0, 300),
                    kind: a.kind === 'thought' || a.kind === 'stage' ? a.kind : 'tool',
                    status: 'done' as const,
                  })),
              };
            }

            // Slim TaskForce artifact refs (optional); snapshots come from deliverables.
            if (Array.isArray(meta?.mcp_artifacts) && meta.mcp_artifacts.length > 0) {
              enriched = {
                ...enriched,
                mcpArtifacts: meta.mcp_artifacts.filter(
                  (a: any) => a && typeof a === 'object',
                ),
              };
            }

            return enriched;
          });

          set((state) => ({
            // Only adopt the result into the visible thread if the user is
            // still on this taskspace. A slow response for a taskspace they
            // already navigated away from must not overwrite what they are
            // reading now — the classic out-of-order-response bug.
            messages:
              state.currentChatSpace?.id === chatSpaceId
                ? enrichedMessages
                : state.messages,
            loading: false,
            messagesCache: { ...state.messagesCache, [chatSpaceId]: enrichedMessages },
          }));

        } catch (error: any) {
          // Keep whatever is on screen if we had a cached thread — a failed
          // refresh is not a reason to empty the view the user is reading.
          const keep = (get().messagesCache[chatSpaceId] || []).length > 0;
          set(
            keep
              ? { loading: false, error: error.message }
              : { loading: false, error: error.message, messages: [] },
          );
          if (!keep) toast.error('Failed to load messages: ' + error.message);
          throw error;
        }
        })();

        // Dropped as soon as it settles: this coalesces concurrent callers,
        // it is not a response cache. `messagesCache` is what serves a repeat
        // open instantly, and it is revalidated every time.
        inFlightMessages.set(chatSpaceId, run);
        try {
          await run;
        } finally {
          if (inFlightMessages.get(chatSpaceId) === run) {
            inFlightMessages.delete(chatSpaceId);
          }
        }
      },

      deleteTurn: async (aiMessageId: string) => {
        const { currentWorkspace, currentChatSpace, messages } = get();
        if (!currentWorkspace?.id || !currentChatSpace?.id) {
          toast.error('No taskspace selected.');
          throw new Error('No taskspace selected');
        }

        // Same pairing rule the backend uses: the nearest preceding 'user'
        // message in this thread is the intent that belongs to this turn.
        const aiIndex = messages.findIndex((m) => m.id === aiMessageId);
        let pairedUserId: string | null = null;
        if (aiIndex > -1) {
          for (let i = aiIndex - 1; i >= 0; i--) {
            if (messages[i].role === 'user') { pairedUserId = messages[i].id; break; }
          }
        }

        const previousMessages = messages;
        set({ messages: previousMessages.filter((m) => m.id !== aiMessageId && m.id !== pairedUserId) });

        try {
          const response = await fetch(
            `${ASELIUS_BASE_URL}/workspaces/${currentWorkspace.id}/chats/${currentChatSpace.id}/turns/${aiMessageId}`,
            { method: 'DELETE', headers: getAuthHeaders() }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) throw new Error("Not authenticated");
            if (response.status === 404) throw new Error("Message thread not found.");
            if (response.status === 403) throw new Error("Permission denied to delete this message.");
            throw new Error(errorData.detail || `HTTP ${response.status}: Failed to delete message thread`);
          }

          toast.success('Message thread deleted.');
        } catch (error: any) {
          // Revert the optimistic removal.
          set({ messages: previousMessages });
          toast.error(`Failed to delete message thread: ${error.message}`);
          throw error;
        }
      },

      addMessage: (message) => {
        set((state) => {
          // Update the updated_at timestamp of the current chat space and move it to top
          const currentChatSpaceId = state.currentChatSpace?.id;
          let updatedChatSpaces = state.chatSpaces;

          if (currentChatSpaceId) {
            const now = new Date().toISOString();
            updatedChatSpaces = state.chatSpaces.map(space =>
              space.id === currentChatSpaceId
                ? { ...space, updated_at: now }
                : space
            );
            // Re-sort to move the updated chat to the top
            updatedChatSpaces.sort((a, b) => {
              const aTime = new Date(a.updated_at || a.created_at).getTime();
              const bTime = new Date(b.updated_at || b.created_at).getTime();
              return bTime - aTime;
            });
          }

          // Update the current workspace's updated_at and re-sort
          const currentWorkspaceId = state.currentWorkspace?.id;
          let updatedWorkspaces = state.workspaces;

          if (currentWorkspaceId) {
            const now = new Date().toISOString();
            updatedWorkspaces = state.workspaces.map(workspace =>
              workspace.id === currentWorkspaceId
                ? { ...workspace, updated_at: now }
                : workspace
            );
            // Re-sort to move the updated workspace to the top
            updatedWorkspaces.sort((a, b) => {
              const aTime = new Date(a.updated_at || a.created_at).getTime();
              const bTime = new Date(b.updated_at || b.created_at).getTime();
              return bTime - aTime;
            });
          }

          return {
            messages: [...state.messages, message],
            chatSpaces: updatedChatSpaces,
            workspaces: updatedWorkspaces,
          };
        });
      },

      removeMessage: (messageId) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== messageId),
        }));
      },

      updateMessageId: (tempId, finalId) => {
        set((state) => {
          const canvas = state.persistentCanvasContent[tempId];
          const code = state.persistentCodeContent[tempId];

          const newPersistentCanvas = { ...state.persistentCanvasContent };
          const newPersistentCode = { ...state.persistentCodeContent };

          if (canvas) {
            newPersistentCanvas[finalId] = canvas;
            delete newPersistentCanvas[tempId];
          }

          if (code) {
            newPersistentCode[finalId] = code;
            delete newPersistentCode[tempId];
          }

          return {
            messages: state.messages.map((msg) =>
              msg.id === tempId ? { ...msg, id: finalId } : msg
            ),
            persistentCanvasContent: newPersistentCanvas,
            persistentCodeContent: newPersistentCode
          };
        });
      },

      // --- NEW: Action for Streaming Updates ---
      updateMessageContent: (messageId: string, newContent: string) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, content: newContent } : msg
          ),
        }));
      },

      updateMessageMetadata: (messageId: string, metadata: Partial<ChatMessage>) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, ...metadata } : msg
          ),
        }));
      },

      // --- Sharing & Invitations ---
      fetchPendingInvitations: async () => {
        try {
          const { fetchPendingWorkspaceInvitations } = await import(
            '../../components/aselius-workspace/lib/workspaceShareApi'
          );
          const { notifyWorkspaceSharedToMe } = await import('../../lib/workspaceNotificationHelpers');
          const data = await fetchPendingWorkspaceInvitations();

          const notifiedKey = 'workspace_invites_notified_v1';
          let notifiedIds: string[] = [];
          try {
            notifiedIds = JSON.parse(sessionStorage.getItem(notifiedKey) || '[]');
          } catch {
            notifiedIds = [];
          }
          const notifiedSet = new Set(notifiedIds);

          for (const inv of data) {
            const inviteKey = inv.workspace_id || inv.id;
            if (!inviteKey || notifiedSet.has(inviteKey)) continue;
            notifyWorkspaceSharedToMe(inv.name, inv.owner_email, inviteKey);
            notifiedSet.add(inviteKey);
          }

          if (typeof window !== 'undefined') {
            sessionStorage.setItem(notifiedKey, JSON.stringify([...notifiedSet]));
          }

          set({ pendingInvitations: data });
        } catch (e) {
          console.error(e);
          set({ pendingInvitations: [] });
        }
      },

      acceptInvitation: async (workspaceId: string) => {
        try {
          const response = await fetch(`${ASELIUS_BASE_URL}/workspaces/invitations/${workspaceId}/accept`, {
            method: 'POST',
            headers: getAuthHeaders()
          });
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error((data as { detail?: string }).detail || 'Accept failed');
          }
          const { notifyWorkspaceInviteAccepted } = await import('../../lib/workspaceNotificationHelpers');
          const ws = get().workspaces.find((w) => w.id === workspaceId);
          notifyWorkspaceInviteAccepted(ws?.name || 'Workspace');
          get().fetchWorkspaces();
          get().fetchPendingInvitations();
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : 'Failed to accept');
          throw e;
        }
      },

      declineInvitation: async (workspaceId: string) => {
        try {
          await fetch(`${ASELIUS_BASE_URL}/workspaces/invitations/${workspaceId}/decline`, {
            method: 'POST',
            headers: getAuthHeaders()
          });
          get().fetchPendingInvitations();
        } catch (e: any) { toast.error("Failed to decline"); }
      },

      // Canvas & Code Persistence
      setCanvasContent: (messageId: string, title: string, content: string, assetId?: string) => {
        set(state => ({
          persistentCanvasContent: {
            ...state.persistentCanvasContent,
            [messageId]: { title, content, assetId }
          }
        }));
      },

      setCodeContent: (messageId: string, title: string, content: string, assetId?: string) => {
        set(state => ({
          persistentCodeContent: {
            ...state.persistentCodeContent,
            [messageId]: { title, content, assetId }
          }
        }));
      },

      getCanvasContent: (messageId: string) => {
        return get().persistentCanvasContent[messageId];
      },

      getCodeContent: (messageId: string) => {
        return get().persistentCodeContent[messageId];
      },

      clearAllWorkspaces: () => {
        set({
          workspaces: [],
          currentWorkspace: null,
          chatSpaces: [],
          currentChatSpace: null,
          messages: [],
          persistentCanvasContent: {},
          persistentCodeContent: {},
          loading: false,
          error: null,
          sharePanelRequestId: 0,
        });
      },

      requestSharePanel: () => {
        set((state) => ({ sharePanelRequestId: state.sharePanelRequestId + 1 }));
      },
    }), // End of state creator
    {
      name: 'aselius-workspace-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        persistentCanvasContent: state.persistentCanvasContent,
        persistentCodeContent: state.persistentCodeContent,
        // Stale-while-revalidate: show last session's workspace shell instantly
        // while Lambda cold-starts, then refresh in the background.
        workspaces: state.workspaces,
        currentWorkspace: state.currentWorkspace,
        currentChatSpace: state.currentChatSpace,
        chatSpacesCache: state.chatSpacesCache,
      }),
    }
  )
); // End of create