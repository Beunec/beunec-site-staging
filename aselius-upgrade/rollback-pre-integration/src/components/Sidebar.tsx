'use client';

import React, {
  memo,
  useState,
  useEffect,
  useTransition,
  useCallback,
  useRef,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Download,
  Monitor,
  Chromium,
  Search,
  X,
  Sun,
  Moon,
  Bell,
  LogOut,
  Settings,
  MessageSquare,
  Share2,
  Plus,
  Trash2,
  Edit3,
  DoorOpen,
  DoorClosed,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { useStore } from '@/lib/store';
import { useCloudHandle } from '@/contexts/CloudHandleContext';
// If the external navbarConfig module is not present in some environments,
// provide a lightweight local fallback to avoid compile-time errors.
// This keeps the existing call sites working; replace with the real module
// implementation when available.
const getNavbarConfig = (path?: string): any => {
  // Minimal structure expected by setNavbarConfig — expand as needed.
  return {};
};
import { getMinimalUserProfile } from '@/utils/settingAPI';
import { minProfileQueryKey, visibleCloudHandle } from '@/lib/displayHandle';
import PricingModal from '../app/(authenticated)/subscription/PricingModal';
import { clearAccessTokenCache } from '@/utils/authTokenCache';
import { clearCloudHandleCache } from '@/utils/platformAPI';
import { clearUserScopedStorage } from '@/lib/sessionScopedStorage';
import Image from 'next/image';
import { BRAND_ICON_SRC } from '@/lib/brand';
import { useWorkspaceStore } from '@/store/aselius/workspaceStore';
import { useWorkspaceProvisioner } from '@/components/aselius-workspace/hooks/useWorkspaceBootstrap';
import {
  buildAseliusPath,
  parseAseliusPath,
  resolveAseliusNavPath,
  rememberAseliusPath,
  ASELIUS_SHARED_WITH_ME_PATH,
  isExplicitAseliusPath,
  isAseliusWorkspacePath,
} from '@/lib/aseliusRoutes';
import { ConfirmationModal } from './aselius-workspace/ui/ConfirmationModal';
import { formatTaskspaceTitle, defaultTaskspaceName, TASKSPACE_SINGULAR, TASKSPACE_PLURAL, taskspaceIconTone } from '@/lib/taskspaceLabels';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  darkMode: boolean;
  user?: any;
}

// ─────────────────────────────────────────────────────────────
// SidebarToggleIcon — a door, open when hovered/expanded, closed otherwise
// (replaces the old panel-with-arrow glyph).
// ─────────────────────────────────────────────────────────────
const SidebarToggleIcon = memo(({ open, size = 20 }: { open: boolean; size?: number }) =>
  open ? (
    <DoorOpen size={size} strokeWidth={1.75} style={{ transition: 'all 0.25s ease' }} />
  ) : (
    <DoorClosed size={size} strokeWidth={1.75} style={{ transition: 'all 0.25s ease' }} />
  ),
);
SidebarToggleIcon.displayName = 'SidebarToggleIcon';

// ─────────────────────────────────────────────────────────────
// Download Rivine Browse — replaces the old storage bar.
// ─────────────────────────────────────────────────────────────
const RIVINE_BROWSE_DOWNLOADS = [
  { label: 'Mac', href: 'https://browse.aselius.beunec.com/download/mac', icon: Monitor },
  { label: 'Windows', href: 'https://browse.aselius.beunec.com/download/windows', icon: Monitor },
  { label: 'Chrome Extension', href: 'https://chromewebstore.google.com/detail/rivine-browse/kadbbppafmjcnkoalempcfjfeghimfgj', icon: Chromium },
] as const;

const DownloadRivineBrowse = memo(({ collapsed }: { collapsed: boolean }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Download Rivine Browse"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-[#00477d]/6 dark:hover:bg-gray-700 transition-colors ${collapsed ? 'p-2' : 'w-full px-2 py-1.5'}`}
      >
        <Download className="h-4 w-4 text-[#00477d] dark:text-blue-300 flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">Download Rivine Browse</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute z-50 bottom-full mb-1 min-w-[200px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1 ${collapsed ? 'left-0' : 'left-0 right-0'}`}
        >
          {RIVINE_BROWSE_DOWNLOADS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              role="menuitem"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Icon className="h-3.5 w-3.5 text-gray-400" />
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
});
DownloadRivineBrowse.displayName = 'DownloadRivineBrowse';

// ─────────────────────────────────────────────────────────────
// TaskspaceSkeletonRows — placeholder rows shown while a workspace's
// taskspace list is loading, instead of a spinner/refresh icon or ambiguous
// "Loading…" text that can be mistaken for a genuinely empty workspace.
// ─────────────────────────────────────────────────────────────
const TaskspaceSkeletonRows = memo(() => (
  <div className="space-y-1 py-0.5" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <div key={i} className="flex items-center gap-2 px-2 py-1.5">
        <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
        <div
          className="h-2.5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{ width: `${70 - i * 15}%` }}
        />
      </div>
    ))}
  </div>
));
TaskspaceSkeletonRows.displayName = 'TaskspaceSkeletonRows';

// ─────────────────────────────────────────────────────────────
// ActionButton — unchanged
// ─────────────────────────────────────────────────────────────
const ActionButton = memo(({
  onClick,
  title,
  children,
  variant = 'default',
  active = false,
}: {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`
      p-1 rounded transition-all duration-150
      ${active
        ? variant === 'danger'
          ? 'text-red-500 dark:text-white hover:bg-red-50 dark:hover:bg-white/20'
          : 'text-gray-700 dark:text-white hover:bg-[#00477d]/6 dark:hover:bg-white/20'
        : variant === 'danger'
        ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
        : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
      }
    `}
  >
    {children}
  </button>
));
ActionButton.displayName = 'ActionButton';

// ─────────────────────────────────────────────────────────────
// ChatSpaceItem — unchanged
// ─────────────────────────────────────────────────────────────
const ChatSpaceItem = memo(({
  cs,
  ws,
  isActive,
  darkMode,
  onSelect,
  onDelete,
  onRename,
}: {
  cs: any;
  ws: any;
  isActive: boolean;
  darkMode: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onRename: (e: React.MouseEvent) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
  }, []);

  return (
    <div
      onClick={!editing ? onSelect : undefined}
      className={`
        group/cs flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer
        transition-all duration-150 text-xs
        ${isActive
          ? 'bg-[#00477d]/10 ring-1 ring-[#00477d]/15 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
          : darkMode
          ? 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
          : 'text-gray-500 hover:bg-[#00477d]/6 hover:text-gray-800'
        }
      `}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <MessageSquare className={`w-3 h-3 flex-shrink-0 ${taskspaceIconTone(cs.id)} ${isActive ? 'opacity-90' : 'opacity-70'}`} />
        {editing ? (
          <input
            ref={inputRef}
            defaultValue={cs.title}
            className="bg-transparent border-b border-current outline-none text-xs w-full"
            onBlur={(e) => { onRename(e as any); setEditing(false); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { onRename(e as any); setEditing(false); }
              if (e.key === 'Escape') setEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate">{formatTaskspaceTitle(cs.title)}</span>
        )}
      </div>
      {!editing && (
        <div className={`
          flex items-center gap-0.5 flex-shrink-0 ml-1 transition-opacity duration-150
          ${isActive ? 'opacity-100' : 'opacity-0 group-hover/cs:opacity-100'}
        `}>
          <ActionButton onClick={startEdit} title="Rename" active={isActive}>
            <Edit3 size={10} />
          </ActionButton>
          <ActionButton onClick={onDelete} title="Delete" variant="danger" active={isActive}>
            <Trash2 size={10} />
          </ActionButton>
        </div>
      )}
    </div>
  );
});
ChatSpaceItem.displayName = 'ChatSpaceItem';

// ─────────────────────────────────────────────────────────────
// WorkspaceAccordion — reads chatSpacesCache for non-active workspaces and
// self-fetches on expand (see cachedForWs/neverFetched below) so an expand
// via ANY path (click or Sidebar's path-based auto-expand effect) reliably
// shows real taskspaces instead of a false "No taskspaces yet".
// ─────────────────────────────────────────────────────────────
const WorkspaceAccordion = memo(({
  ws,
  darkMode,
  isExpanded,
  isActive,
  chatSpaces,
  loading,
  activeChatSpaceId,
  onToggle,
  onSelectChatSpace,
  onDeleteWorkspace,
  onDeleteChatSpace,
  onCreateChatSpace,
  onRenameChatSpace,
  onRenameWorkspace,
}: {
  ws: any;
  darkMode: boolean;
  isExpanded: boolean;
  isActive: boolean;
  chatSpaces: any[];
  loading?: boolean;
  activeChatSpaceId?: string;
  onToggle: () => void;
  onSelectChatSpace: (cs: any) => void;
  onDeleteWorkspace: (e: React.MouseEvent) => void;
  onDeleteChatSpace: (cs: any, e: React.MouseEvent) => void;
  onCreateChatSpace: (e: React.MouseEvent) => void;
  onRenameChatSpace: (cs: any, newName: string) => void;
  onRenameWorkspace: (newName: string) => void;
}) => {
  const [editingWs, setEditingWs] = useState(false);
  const wsInputRef = useRef<HTMLInputElement>(null);

  // The store holds only the ACTIVE workspace's taskspaces in the flat
  // `chatSpaces` array — for any other expanded-but-not-active workspace
  // (e.g. expanded by Sidebar's path-based auto-expand effect, which never
  // calls selectWorkspace), that filter is always empty even when real,
  // previously-fetched taskspaces already sit in chatSpacesCache. This was
  // the root cause of "No taskspaces yet" showing for workspaces that
  // genuinely have taskspaces — read from the cache whenever this workspace
  // isn't the active one, and only fall back to the live flat array (the
  // in-flight/just-fetched source of truth) for the active workspace.
  const cachedForWs = useWorkspaceStore((s) => s.chatSpacesCache[ws.id]);
  const wsChatSpaces = isActive
    ? chatSpaces.filter((cs) => cs.workspace_id === ws.id)
    : cachedForWs ?? [];
  const neverFetched = !isActive && cachedForWs === undefined;
  const showLoading = isExpanded && wsChatSpaces.length === 0 && ((isActive && !!loading) || neverFetched);

  // Any expand path must trigger the real fetch. Clicking the accordion
  // already does this via handleWorkspaceToggle -> selectWorkspace, but
  // Sidebar's path-based auto-expand effect only flips `isExpanded` and
  // never fetches — closing that gap here makes every expand path
  // self-sufficient instead of silently rendering "empty" for data that was
  // simply never loaded.
  useEffect(() => {
    if (isExpanded && neverFetched) {
      void useWorkspaceStore.getState().selectWorkspace(ws);
    }
  }, [isExpanded, neverFetched, ws]);

  const startEditWs = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWs(true);
    setTimeout(() => {
      wsInputRef.current?.focus();
      wsInputRef.current?.select();
    }, 50);
  }, []);

  return (
    <div className="space-y-0.5">
      {/* Workspace header */}
      <div
        onClick={!editingWs ? onToggle : undefined}
        className={`
          group/ws flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
          transition-all duration-150
          ${isActive
            ? darkMode
              ? 'bg-gray-700 text-white ring-1 ring-gray-600'
              : 'bg-[#00477d]/10 text-gray-900 ring-1 ring-[#00477d]/15'
            : darkMode
            ? 'text-gray-300 hover:bg-gray-700/60'
            : 'text-gray-700 hover:bg-[#00477d]/6'
          }
        `}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <ChevronDown
            size={13}
            className={`
              flex-shrink-0 transition-transform duration-200
              ${isExpanded ? 'rotate-0' : '-rotate-90'}
              ${isActive ? 'text-gray-500 dark:text-gray-300' : 'text-gray-400'}
            `}
          />
          {editingWs ? (
            <input
              ref={wsInputRef}
              defaultValue={ws.name}
              className="bg-transparent border-b border-current outline-none text-sm w-full"
              onBlur={(e) => { onRenameWorkspace(e.target.value); setEditingWs(false); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { onRenameWorkspace((e.target as HTMLInputElement).value); setEditingWs(false); }
                if (e.key === 'Escape') setEditingWs(false);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`text-sm truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {ws.name}
            </span>
          )}
        </div>
        <div className={`
          flex items-center gap-0.5 flex-shrink-0 ml-1 transition-opacity duration-150
          ${isActive ? 'opacity-100' : 'opacity-0 group-hover/ws:opacity-100'}
        `}>
          <ActionButton onClick={startEditWs} title="Rename workspace" active={isActive}>
            <Edit3 size={11} />
          </ActionButton>
          <ActionButton onClick={onCreateChatSpace} title={`New ${TASKSPACE_SINGULAR.toLowerCase()}`} active={isActive}>
            <Plus size={11} />
          </ActionButton>
          <ActionButton onClick={onDeleteWorkspace} title="Delete workspace" variant="danger" active={isActive}>
            <Trash2 size={11} />
          </ActionButton>
        </div>
      </div>

      {/* ChatSpace list */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-6 py-1 space-y-0.5">
              {wsChatSpaces.length === 0 ? (
                // Only claim "empty" once we actually know this workspace's
                // fetch has settled (see showLoading above) — otherwise show a
                // skeleton instead of the misleading empty message.
                showLoading ? (
                  <TaskspaceSkeletonRows />
                ) : (
                <p className="text-[10px] text-gray-400 dark:text-gray-600 italic py-1 px-2">
                  No taskspaces yet. Click + to create one.
                </p>
                )
              ) : (
                wsChatSpaces.map((cs) => (
                  <ChatSpaceItem
                    key={cs.id}
                    cs={cs}
                    ws={ws}
                    isActive={activeChatSpaceId === cs.id}
                    darkMode={darkMode}
                    onSelect={() => onSelectChatSpace(cs)}
                    onDelete={(e) => onDeleteChatSpace(cs, e)}
                    onRename={(e: any) => {
                      const val = (e.target as HTMLInputElement).value?.trim();
                      if (val) onRenameChatSpace(cs, val);
                    }}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
WorkspaceAccordion.displayName = 'WorkspaceAccordion';

// ─────────────────────────────────────────────────────────────
// Main Sidebar
// ─────────────────────────────────────────────────────────────
const Sidebar: React.FC<SidebarProps> = ({ collapsed: collapsedProp, toggleSidebar, darkMode, user }) => {
  const { isInitialLoading: workspaceBootstrapLoading } = useWorkspaceProvisioner();

  const router = useRouter();
  const pathname = usePathname();

  const {
    sidebarItems,
    setActivePath,
    toggleDarkMode,
    notifications,
    toggleNotifications,
  } = useStore();

  const {
    workspaces,
    currentWorkspace,
    chatSpaces,
    currentChatSpace,
    loading: workspaceLoading,
    createChatSpace,
    selectChatSpace,
    deleteChatSpace,
    renameChatSpace,
    selectWorkspace,
    createWorkspace,
    deleteWorkspace,
    renameWorkspace,
  } = useWorkspaceStore();

  const [isMobile, setIsMobile] = useState(false);

  // ── Hover-to-peek (desktop only)
  //
  // Pointing at the collapsed rail opens it for as long as the pointer stays;
  // leaving closes it again. It never writes the persisted `collapsedProp` —
  // a peek is a look, not a decision, and the parent owns that state.
  //
  // Because the parent renders this sidebar `fixed` and drives the content
  // margin from its OWN collapsed state, widening here overlays the content
  // instead of reflowing the page. That is the whole reason peek is safe to
  // do on hover: nothing under the pointer moves.
  const [isPeeking, setIsPeeking] = useState(false);
  const peekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPeekTimer = useCallback(() => {
    if (peekTimerRef.current) {
      clearTimeout(peekTimerRef.current);
      peekTimerRef.current = null;
    }
  }, []);

  const handlePeekEnter = useCallback(() => {
    if (isMobile || !collapsedProp) return;
    clearPeekTimer();
    // Small delay so sweeping the pointer diagonally past the rail on the way
    // somewhere else does not flash the panel open.
    peekTimerRef.current = setTimeout(() => setIsPeeking(true), 90);
  }, [isMobile, collapsedProp, clearPeekTimer]);

  const handlePeekLeave = useCallback(() => {
    clearPeekTimer();
    // Short grace period: the pointer briefly crosses the panel edge when
    // travelling to a nested item, and closing on that would be unusable.
    peekTimerRef.current = setTimeout(() => setIsPeeking(false), 140);
  }, [clearPeekTimer]);

  // A peek must not survive a real state change, a viewport change, or unmount
  // — otherwise the panel can be left open with no pointer anywhere near it.
  useEffect(() => {
    if (!collapsedProp || isMobile) {
      clearPeekTimer();
      setIsPeeking(false);
    }
  }, [collapsedProp, isMobile, clearPeekTimer]);

  useEffect(() => () => clearPeekTimer(), [clearPeekTimer]);

  /** What the sidebar RENDERS as. `collapsedProp` remains the persisted truth. */
  const collapsed = collapsedProp && !isPeeking;
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
  const [expandedNavItems, setExpandedNavItems] = useState<Set<string>>(new Set());
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPricing, setShowPricing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hoveringToggle, setHoveringToggle] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    spaceId?: string;
    spaceName?: string;
    workspaceId?: string;
    workspaceName?: string;
    isWorkspace?: boolean;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cloudHandle = useCloudHandle();

  // Overlay drawer on phones and small tablets (< 768px); the collapsed rail
  // would steal a full column there, so the floating glass control is used
  // instead. From 768px the 72px rail is used, as on desktop — keep in step
  // with app/(authenticated)/layout.tsx.
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Targeted prefetch.
  //
  // This used to prefetch EVERY top-level nav target on mount. These are
  // buttons, not <Link>s, so there is no built-in hover prefetch — but warming
  // all seven routes meant seven RSC requests to the Worker on every single
  // mount, for destinations most users never click. On Cloudflare each of those
  // is a billed invocation, and it was a measurable share of idle traffic.
  //
  // Instead: rely on hover/focus prefetch below — which still covers keyboard
  // nav via focus.

  /**
   * Warm a route on hover/focus so the click resolves from the RSC cache.
   */
  const prefetchOnIntent = useCallback(
    (path?: string) => {
      if (!path) return;
      router.prefetch(path);
    },
    [router]
  );

  // ── Active path sync — unchanged
  useEffect(() => {
    if (pathname) setActivePath(pathname);
  }, [pathname, setActivePath]);

  // ── Expand workspace accordion from path-based Aselius routes
  useEffect(() => {
    const parsed = parseAseliusPath(pathname || '');
    if (parsed?.workspaceId) {
      setExpandedWorkspaces(new Set([parsed.workspaceId]));
      return;
    }

    const ws = currentWorkspace || workspaces[0];
    if (ws) {
      setExpandedWorkspaces(new Set([ws.id]));
    }
  }, [pathname, currentWorkspace?.id, workspaces.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Profile query — shared key with SessionProvider / settings sync
  //
  // This component is mounted on EVERY authenticated route, so the previous
  // `staleTime: 0` + `refetchOnMount: 'always'` meant a /min-profile request on
  // every single navigation — and, because staleTime:0 also defeats React
  // Query's dedup, it dragged the 4+ other components sharing this key along
  // with it. That was a workaround for keeping the sidebar fresh after a
  // profile edit, but it is not needed: the settings save path actively writes
  // the new value into this exact cache key (queryClient.fetchQuery +
  // patchUserProfileDisplayHandle in settings/page.tsx), so consumers update
  // immediately without any polling. Window-focus refetch still covers the
  // "edited in another tab" case.
  const { data: profile } = useQuery({
    queryKey: minProfileQueryKey(cloudHandle),
    queryFn: getMinimalUserProfile,
    enabled: !!cloudHandle,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  // ─────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────
  const handleNavigation = useCallback(
    (path?: string) => {
      if (!path) return;

      let targetPath = path;

      if (isAseliusWorkspacePath(path)) {
        if (isExplicitAseliusPath(path)) {
          targetPath = path;
        } else {
          const { currentWorkspace: ws, currentChatSpace: cs } = useWorkspaceStore.getState();
          targetPath = resolveAseliusNavPath(path, ws?.id, cs?.id);
        }
      }

      if (pathname === targetPath) return;

      setActivePath(targetPath);
      useStore.getState().setNavbarConfig(getNavbarConfig(targetPath));

      useStore.getState().setPageLoading(true, targetPath);

      startTransition(() => router.push(targetPath));
      setIsSearchMode(false);
      setSearchQuery('');
      if (isMobile && !collapsed) toggleSidebar();
    },
    [pathname, isMobile, collapsed, toggleSidebar, router],
  );

  // ── CHANGE: Use router.replace instead of router.push so navigating between
  //    chat spaces doesn't pollute the browser history stack.
  const handleSelectChatSpace = useCallback(
    (ws: any, cs: any) => {
      const target = buildAseliusPath(ws.id, cs.id, 'chat');
      if (pathname === target) return;

      rememberAseliusPath(target);
      setActivePath(target);
      useStore.getState().setNavbarConfig(getNavbarConfig(target));

      // Only blank the whole page for a WORKSPACE change. Switching taskspaces
      // inside the same workspace keeps the identical shell (sidebar, header,
      // tabs) — swapping it for a full-page skeleton made every taskspace
      // click flash the entire UI, which read as slowness even though only the
      // message list actually changed. ChatSpace already renders its own
      // message-area loading state for that case.
      const switchingWorkspace =
        useWorkspaceStore.getState().currentWorkspace?.id !== ws.id;
      if (switchingWorkspace) {
        useStore.getState().setPageLoading(true, target);
      }

      startTransition(() => {
        router.push(target);
      });

      void (async () => {
        const initial = useWorkspaceStore.getState();
        if (initial.currentWorkspace?.id !== ws.id) {
          // Name the taskspace being opened, so the workspace switch paints
          // this thread rather than the most recent one and then swapping.
          await selectWorkspace(ws, cs.id);
        }
        if (useWorkspaceStore.getState().currentChatSpace?.id !== cs.id) {
          await selectChatSpace(cs);
        }
      })();

      if (isMobile && !collapsed) toggleSidebar();
    },
    [pathname, isMobile, collapsed, toggleSidebar, selectWorkspace, selectChatSpace, router, setActivePath],
  );

  // Expanding a workspace always REPLACES expandedWorkspaces with a
  // single-element Set — so opening one workspace's accordion always closes
  // any other that was open. Collapsing only removes this workspace's id.
  const handleWorkspaceToggle = useCallback(
    (ws: any) => {
      const isCurrentlyExpanded = expandedWorkspaces.has(ws.id);
      if (isCurrentlyExpanded) {
        setExpandedWorkspaces((prev) => {
          const next = new Set(prev);
          next.delete(ws.id);
          return next;
        });
      } else {
        setExpandedWorkspaces(new Set([ws.id]));
        selectWorkspace(ws);
      }
    },
    [expandedWorkspaces, selectWorkspace],
  );

  const toggleNavItem = useCallback((name: string) => {
    setExpandedNavItems((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }, []);

  const handleCreateWorkspace = useCallback(async () => {
    if (workspaces.length >= 10) {
      toast.error('You can create up to 10 workspaces.');
      return;
    }
    try {
      const created = await createWorkspace(`Workspace #${workspaces.length + 1}`);
      if (!created) return;

      const chatSpace = useWorkspaceStore.getState().currentChatSpace;
      if (chatSpace?.workspace_id === created.id) {
        setExpandedWorkspaces(new Set([created.id]));
        const target = buildAseliusPath(created.id, chatSpace.id, 'chat');
        router.push(target);
      }
    } catch {
      // Store shows error toast
    }
  }, [workspaces.length, createWorkspace, router]);

  const handleCreateChatSpace = useCallback(
    async (wsId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const count = chatSpaces.filter((cs) => cs.workspace_id === wsId).length;
      if (count >= 10) {
        toast.error(`You can create up to 10 ${TASKSPACE_PLURAL.toLowerCase()} per workspace.`);
        return;
      }
      const created = await createChatSpace(wsId, defaultTaskspaceName(count + 1));
      if (!created) return;
      const ws = workspaces.find((w) => w.id === wsId);
      if (ws) handleSelectChatSpace(ws, created);
    },
    [chatSpaces, createChatSpace, workspaces, handleSelectChatSpace],
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      if (deleteModal.isWorkspace && deleteModal.workspaceId) {
        await deleteWorkspace(deleteModal.workspaceId);
      } else if (deleteModal.spaceId) {
        await deleteChatSpace(deleteModal.spaceId);
      }
      setDeleteModal(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteModal, deleteWorkspace, deleteChatSpace]);

  const focusSearch = useCallback(() => {
    if (collapsed) {
      toggleSidebar();
      setTimeout(() => { setIsSearchMode(true); searchInputRef.current?.focus(); }, 360);
    } else {
      setIsSearchMode(true);
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [collapsed, toggleSidebar]);

  const matchesSearch = useCallback(
    (text: string) =>
      !isSearchMode || !searchQuery.trim() || text.toLowerCase().includes(searchQuery.toLowerCase()),
    [isSearchMode, searchQuery],
  );

  // ── Mobile / tablet: fully hide the rail when collapsed (no 0px ghost panel).
  const showSidebarPanel = !isMobile || !collapsedProp;
  const sidebarWidth = isMobile ? '300px' : collapsed ? '72px' : '300px';

  const PlanBadge = () => {
    const plan = profile?.plan;
    const label =
      plan === 'pro' ? 'Pro Plan Active'
      : plan === 'payg' ? 'PAYG Plan Active'
      : plan === 'essential' ? 'Essential Plan Active'
      : null;
    return label ? (
      <button
        onClick={() => router.push('/subscription')}
        className="w-full py-1.5 bg-[#00477d] hover:bg-[#003366] text-white rounded-lg text-xs font-medium transition-colors"
      >
        {label}
      </button>
    ) : (
      <button
        onClick={() => setShowPricing(true)}
        className="w-full py-1.5 bg-[#00477d] hover:bg-[#003366] text-white rounded-lg text-xs font-medium transition-colors"
      >
        Upgrade Plan
      </button>
    );
  };

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Sidebar shell
          CHANGE #1: lg:mr-3 adds a physical 12px gap between the sidebar and
          the content area on desktop without touching the content component. */}
      {showSidebarPanel && (
      <div
        data-app-sidebar
        data-sidebar-peeking={isPeeking ? 'true' : undefined}
        onMouseEnter={handlePeekEnter}
        onMouseLeave={handlePeekLeave}
        className={`
          fixed inset-y-0 left-0 z-40 lg:relative flex flex-col min-h-screen overflow-hidden
          border-r border-gray-200 dark:border-gray-700
          !bg-canvas dark:!bg-gray-800
          lg:mr-3
          ${isPeeking ? 'shadow-2xl shadow-black/25 dark:shadow-black/50' : ''}
        `}
        style={{ width: sidebarWidth, transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)' }}
      >
        {/* ── Header */}
        <div className="h-[60px] flex items-center justify-between px-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {collapsed ? (
            <button
              onClick={toggleSidebar}
              onMouseEnter={() => setHoveringToggle(true)}
              onMouseLeave={() => setHoveringToggle(false)}
              aria-label="Open sidebar"
              className="mx-auto p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-[#00477d]/6 dark:hover:bg-gray-700 transition-colors"
            >
              <SidebarToggleIcon open={hoveringToggle} size={20} />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 flex-shrink-0">
                  <Image
                    src={BRAND_ICON_SRC}
                    alt="Aselius"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                    priority
                    unoptimized
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  Aselius Platform
                </span>
              </div>
              <button
                onClick={toggleSidebar}
                aria-label={isPeeking ? 'Keep sidebar open' : 'Close sidebar'}
                title={isPeeking ? 'Keep sidebar open' : 'Close sidebar'}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-[#00477d]/6 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                {isMobile ? <X size={18} /> : <SidebarToggleIcon open={false} size={18} />}
              </button>
            </>
          )}
        </div>

        {/* ── Scrollable nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 min-h-0">
          <nav className="px-2 space-y-0.5" role="menu">
            {sidebarItems.map((item, idx) => {
              const displayName = item.name === 'Aselius Workspace' ? 'Workspaces' : item.name;
              const isWorkspaceSection = item.name === 'Aselius Workspace';

              // ── Search Space
              if (item.name === 'Search Space') {
                return (
                  <div key={idx}>
                    {!collapsed && isSearchMode ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg !bg-canvas dark:bg-gray-700 ring-1 ring-[#00477d]/10 dark:ring-0">
                        <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') { setIsSearchMode(false); setSearchQuery(''); }
                          }}
                          className="flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder-gray-400"
                          aria-label="Search navigation"
                        />
                        <button
                          onClick={() => { setIsSearchMode(false); setSearchQuery(''); }}
                          className="p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={focusSearch}
                        role="menuitem"
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                          text-gray-600 dark:text-gray-400 hover:bg-[#00477d]/6 dark:hover:bg-gray-700
                          transition-colors ${collapsed ? 'justify-center' : ''}
                        `}
                      >
                        <Search className="h-4 w-4 flex-shrink-0" style={{ color: item.color }} />
                        {!collapsed && <span className="truncate font-medium">Search</span>}
                      </button>
                    )}
                  </div>
                );
              }

              // ── Search filter
              if (isSearchMode && searchQuery.trim()) {
                const nameMatch = displayName.toLowerCase().includes(searchQuery.toLowerCase());
                const childMatch = isWorkspaceSection
                  ? workspaces.some((w) => w.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    chatSpaces.some((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  : item.subItems?.some((s: any) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
                if (!nameMatch && !childMatch) return null;
              }

              const isNavActive = item.active;

              // ── Workspaces section
              if (isWorkspaceSection) {
                return (
                  <div key={idx}>
                    {/* Label-only header row */}
                    {!collapsed && (
                      <div className="flex items-center justify-between px-3 py-2 select-none">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon className="h-4 w-4 flex-shrink-0" style={{ color: item.color }} />
                          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 tracking-wider uppercase truncate">
                            {displayName}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium flex-shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {/* Share + Create buttons */}
                        <div className="flex items-center gap-2">
                          {/* CHANGE #3: Dispatch custom event so Workspace.tsx renders
                              SharedWithMe inline instead of navigating away. */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigation(ASELIUS_SHARED_WITH_ME_PATH);
                            }}
                            aria-label="Shared with me"
                            title="Shared with me"
                            className={`p-1 rounded transition-colors flex-shrink-0 ${
                              pathname?.includes('shared-with-me')
                                ? 'bg-[#00477d]/10 dark:bg-gray-700 text-gray-900 dark:text-gray-200 ring-1 ring-[#00477d]/12 dark:ring-0'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-[#00477d]/6 dark:hover:bg-gray-700'
                            }`}
                          >
                            <Share2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleCreateWorkspace();
                            }}
                            aria-label="New workspace"
                            className="p-1 rounded hover:bg-[#00477d]/6 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Collapsed view: same hit-target + centering as other nav icons */}
                    {collapsed && (
                      <button
                        type="button"
                        onClick={() => handleNavigation(item.path)}
                        title={displayName}
                        aria-label={displayName}
                        className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-[#00477d]/6 dark:hover:bg-gray-700 transition-colors"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" style={{ color: item.color }} />
                      </button>
                    )}

                    {/* Workspace list — always visible */}
                    {!collapsed && (
                      <div className="mt-0.5 space-y-0.5 px-1">
                        {workspaces.length === 0 ? (
                          // Same class of bug as the taskspace one: never claim
                          // "no workspaces" while a fetch is genuinely still in
                          // flight (e.g. right after a fresh login) — that's a
                          // legitimate loading window, not an empty account.
                          workspaceLoading || workspaceBootstrapLoading ? (
                            <div className="space-y-1 py-1 px-1" aria-hidden="true">
                              {[0, 1].map((i) => (
                                <div key={i} className="flex items-center gap-2 px-2 py-2">
                                  <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                                  <div
                                    className="h-2.5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"
                                    style={{ width: `${60 - i * 15}%` }}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-gray-400 dark:text-gray-600 italic py-2 px-3">
                              No workspaces yet — Create your first workspace
                            </p>
                          )
                        ) : (
                          workspaces
                            .filter(
                              (ws) =>
                                matchesSearch(ws.name) ||
                                chatSpaces.some((cs) => cs.workspace_id === ws.id && matchesSearch(cs.title)),
                            )
                            .map((ws) => (
                              <WorkspaceAccordion
                                key={ws.id}
                                ws={ws}
                                darkMode={darkMode}
                                isExpanded={expandedWorkspaces.has(ws.id)}
                                isActive={currentWorkspace?.id === ws.id}
                                chatSpaces={chatSpaces}
                                loading={workspaceLoading}
                                activeChatSpaceId={currentChatSpace?.id}
                                onToggle={() => handleWorkspaceToggle(ws)}
                                onSelectChatSpace={(cs) => handleSelectChatSpace(ws, cs)}
                                onDeleteWorkspace={(e) => {
                                  e.stopPropagation();
                                  setDeleteModal({ isOpen: true, workspaceId: ws.id, workspaceName: ws.name, isWorkspace: true });
                                }}
                                onDeleteChatSpace={(cs, e) => {
                                  e.stopPropagation();
                                  setDeleteModal({ isOpen: true, spaceId: cs.id, spaceName: cs.title, isWorkspace: false });
                                }}
                                onCreateChatSpace={(e) => handleCreateChatSpace(ws.id, e)}
                                onRenameChatSpace={(cs, name) => {
                                  if (name.trim() && name.trim() !== cs.title) {
                                    void renameChatSpace(cs.id, name.trim());
                                  }
                                }}
                                onRenameWorkspace={(name) => {
                                  if (name.trim() && name.trim() !== ws.name) {
                                    void renameWorkspace(ws.id, name.trim());
                                  }
                                }}
                              />
                            ))
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              // ── Standard nav items
              const isExpanded = expandedNavItems.has(displayName);

              return (
                <div key={idx}>
                  <div
                    role="menuitem"
                    onClick={() => {
                      if (item.subItems) {
                        toggleNavItem(item.name);
                      } else {
                        handleNavigation(item.path);
                      }
                    }}
                    // Hover AND focus: focus covers keyboard navigation, which was
                    // the stated reason for the old prefetch-everything-on-mount
                    // effect. Covering it here keeps that benefit while only
                    // warming routes the user is actually heading toward.
                    onMouseEnter={() => prefetchOnIntent(item.subItems ? undefined : item.path)}
                    onFocus={() => prefetchOnIntent(item.subItems ? undefined : item.path)}
                    className={`
                      flex items-center px-3 py-2 rounded-lg cursor-pointer
                      transition-colors duration-150 group
                      ${isNavActive
                        ? 'bg-[#00477d]/10 dark:bg-gray-700 text-gray-900 dark:text-white ring-1 ring-[#00477d]/12 dark:ring-0'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-[#00477d]/6 dark:hover:bg-gray-700'
                      }
                      ${collapsed ? 'justify-center' : 'justify-between'}
                    `}
                    aria-expanded={!collapsed && item.subItems ? isExpanded : undefined}
                    aria-current={isNavActive ? 'page' : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <item.icon className="h-4 w-4 flex-shrink-0" style={{ color: item.color }} />
                      {!collapsed && <span className="text-sm font-medium truncate">{displayName}</span>}
                      {!collapsed && item.badge && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {!collapsed && item.subItems && (
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                      />
                    )}
                  </div>

                  {/* Standard sub-items */}
                  {!collapsed && item.subItems && (
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="children"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 pl-3 mt-1 mb-1 space-y-0.5">
                            {item.subItems
                              .filter((s: any) => matchesSearch(s.name))
                              .map((subItem: any) => (
                                <button
                                  key={subItem.name}
                                  onClick={() => handleNavigation(subItem.path)}
                                  onMouseEnter={() => subItem.path && router.prefetch(subItem.path)}
                                  className={`
                                    w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm
                                    transition-colors duration-150
                                    ${subItem.active
                                      ? 'bg-[#00477d]/10 dark:bg-gray-700 text-gray-900 dark:text-white font-medium ring-1 ring-[#00477d]/12 dark:ring-0'
                                      : 'text-gray-600 dark:text-gray-400 hover:bg-[#00477d]/5 dark:hover:bg-gray-700'
                                    }
                                  `}
                                  aria-current={subItem.active ? 'page' : undefined}
                                >
                                  <span>{subItem.name}</span>
                                  {subItem.badge && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </button>
                              ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ── Download Rivine Browse + plan */}
        <div className={`border-t border-gray-200 dark:border-gray-700 flex-shrink-0 ${collapsed ? 'py-3 flex justify-center' : 'p-4'}`}>
          {collapsed ? (
            <DownloadRivineBrowse collapsed />
          ) : (
            <div className="space-y-3">
              <DownloadRivineBrowse collapsed={false} />
              <PlanBadge />
            </div>
          )}
        </div>

        {/* ── Action bar */}
        {collapsed ? (
          <div className="flex flex-col items-center gap-1 py-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              onClick={toggleNotifications}
              title="Notifications"
              className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-[#00477d]/6 dark:hover:bg-gray-700 transition-colors"
            >
              <Bell size={16} />
              {notifications.some((n) => n.unread) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900" />
              )}
            </button>
            <button
              onClick={() => toggleDarkMode()}
              title="Toggle theme"
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-[#00477d]/6 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex gap-1">
              <button
                onClick={() => toggleDarkMode()}
                title="Toggle theme"
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-[#00477d]/6 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={toggleNotifications}
                title="Notifications"
                className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-[#00477d]/6 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell size={16} />
                {notifications.some((n: any) => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900" />
                )}
              </button>
            </div>
            <button
              onClick={() => router.push('/settings')}
              title="Settings"
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-[#00477d]/6 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings size={16} />
            </button>
          </div>
        )}

        {/* ── User profile */}
        <div className={`border-t border-gray-200 dark:border-gray-700 flex-shrink-0 ${collapsed ? 'p-2 flex justify-center' : 'p-3'}`}>
          {collapsed ? (
            <button
              onClick={() => router.push('/settings')}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00477d] to-[#003366] flex items-center justify-center overflow-hidden"
            >
              {profile?.avatar || user?.picture ? (
                <img src={profile?.avatar || user?.picture} alt="Avatar" className="w-full h-full object-cover rounded-full" loading="lazy" />
              ) : (
                <span className="text-white text-sm font-semibold uppercase">
                  {(profile?.firstName || user?.name || '?').charAt(0)}
                </span>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00477d] to-[#003366] flex items-center justify-center overflow-hidden flex-shrink-0">
                {profile?.avatar || user?.picture ? (
                  <img src={profile?.avatar || user?.picture} alt="Avatar" className="w-full h-full object-cover rounded-full" loading="lazy" />
                ) : (
                  <span className="text-white text-sm font-semibold uppercase">
                    {(profile?.firstName || user?.name || '?').charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {profile?.firstName
                    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
                    : user?.name || 'User'}
                </p>
                {visibleCloudHandle(profile) && (
                  <button
                    onClick={() => navigator.clipboard.writeText(visibleCloudHandle(profile))}
                    className="text-xs text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors truncate max-w-full text-left"
                    title="Copy handle"
                  >
                    {visibleCloudHandle(profile)}
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  clearAccessTokenCache();
                  clearCloudHandleCache();
                  // Also wipe persisted per-user browser state. Clearing only
                  // the in-memory caches left drafts, notifications and
                  // last-visited paths in localStorage for whoever signs in
                  // next on this browser.
                  clearUserScopedStorage();
                  router.push('/auth/logout');
                }}
                title="Sign out"
                aria-label="Sign out"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
              >
                <LogOut size={15} strokeWidth={1.75} />
                <span className="text-xs font-medium">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      {/* ── Mobile / tablet reopen control — small glass chip, does not steal clicks */}
      <AnimatePresence>
        {isMobile && collapsed && (
          <motion.button
            key="mobile-toggle"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.18 }}
            onClick={toggleSidebar}
            aria-label="Open sidebar"
            data-sidebar-glass
            className="fixed top-3 left-2.5 z-50 flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/25 dark:border-white/10 text-gray-800 dark:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10 transition-colors lg:hidden"
          >
            <SidebarToggleIcon open={false} size={15} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Mobile overlay */}
      <AnimatePresence>
        {isMobile && !collapsed && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/25 backdrop-blur-sm z-30 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* ── Pricing modal — unchanged */}
      <PricingModal
        open={showPricing}
        onClose={() => setShowPricing(false)}
      />

      {/* ── Delete confirmation modal — unchanged */}
      <ConfirmationModal
        isOpen={deleteModal?.isOpen || false}
        onClose={() => !isDeleting && setDeleteModal(null)}
        onConfirm={confirmDelete}
        title={deleteModal?.isWorkspace ? 'Delete Workspace' : `Delete ${TASKSPACE_SINGULAR}`}
        message={
          deleteModal?.isWorkspace
            ? `Are you sure you want to delete this workspace? All ${TASKSPACE_PLURAL.toLowerCase()} and messages within will be permanently deleted.`
            : `Are you sure you want to delete this taskspace? All messages and conversations will be permanently deleted.`
        }
        confirmText={deleteModal?.isWorkspace ? 'Delete Workspace' : `Delete ${TASKSPACE_SINGULAR}`}
        cancelText="Cancel"
        variant="danger"
        itemName={deleteModal?.isWorkspace ? deleteModal.workspaceName : deleteModal?.spaceName}
        loading={isDeleting}
      />
    </>
  );
};

const areEqual = (prev: SidebarProps, next: SidebarProps) =>
  prev.collapsed === next.collapsed &&
  prev.darkMode === next.darkMode &&
  prev.user?.email === next.user?.email &&
  prev.toggleSidebar === next.toggleSidebar;

export default React.memo(Sidebar, areEqual);