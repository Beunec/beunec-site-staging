// src/pages/Workspace.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Share2, MessageSquare, Shield } from 'lucide-react'
import { Button } from './ui/button'
import { ChatSpace } from './workspace/ChatSpace/ChatSpace'
import { Governance } from './workspace/Governance'
import { CreditsBalanceTracker } from './workspace/CreditsBalanceTracker'
import { useWorkspaceStore } from '@/store/aselius/workspaceStore'
import toast from 'react-hot-toast'
import { searchService, SearchResult } from './lib/searchService'
import { useCredits } from '@/hooks/useCredits'
import { useWorkspaceBootstrap } from '@/components/aselius-workspace/hooks/useWorkspaceBootstrap'
import { useAseliusRouteSync } from '@/components/aselius-workspace/hooks/useAseliusRouteSync'
import { AseliusWorkspaceShell } from '@/components/aselius-workspace/AseliusWorkspaceShell'
import WorkspaceSkeleton from '@/components/aselius-workspace/WorkspaceSkeleton'
import WorkspaceBootstrapError from '@/components/aselius-workspace/WorkspaceBootstrapError'
import { buildAseliusPath, rememberAseliusPath } from '@/lib/aseliusRoutes'
import { canShareWorkspace, canEditGovernance } from '@/components/aselius-workspace/lib/workspacePermissions'

type WorkspaceProps = {
  initialTab?: 'chat' | 'governance'
}

// Governance calls `/api/aselius/governance/workspaces/{id}/configuration`, proxied
// (src/app/api/aselius/[...path]/route.ts) to the Python backend's real
// `/api/governance/...` router — confirmed mounted (main.py) and DB-backed
// (models/governance_models.py, Postgres `governance_configurations` table).
// The stale claim that used to live here (router not mounted, always 404s) was
// wrong — kept gated behind this flag purely as a rollout switch, not because
// anything is broken.
const GOVERNANCE_ENABLED = process.env.NEXT_PUBLIC_ASELIUS_GOVERNANCE_ENABLED === 'true'

const Workspace: React.FC<WorkspaceProps> = ({ initialTab = 'chat' }) => {
  const router = useRouter()
  // ── UI state
  const [activeTab, setActiveTab] = useState<'chat' | 'governance'>(
    initialTab === 'governance' && !GOVERNANCE_ENABLED ? 'chat' : initialTab,
  )
  const [newSpaceName, setNewSpaceName] = useState('')
  const [showNewSpaceForm, setShowNewSpaceForm] = useState(false)

  const {
    user,
    token,
    workspaces,
    currentWorkspace,
    currentChatSpace,
    isInitialLoading,
    isResolvingWorkspace,
    isResolvingChatSpace,
    isProvisioning,
    bootstrapFailed,
    retryBootstrap,
  } = useWorkspaceBootstrap()
  const { workspaceId, chatSpaceId } = useAseliusRouteSync()

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const handleTabChange = useCallback(
    (tab: 'chat' | 'governance') => {
      if (!workspaceId || !chatSpaceId) {
        setActiveTab(tab)
        return
      }

      const target = buildAseliusPath(
        workspaceId,
        chatSpaceId,
        tab === 'governance' ? 'governance' : 'chat'
      )
      rememberAseliusPath(target)
      router.push(target)
    },
    [router, workspaceId, chatSpaceId]
  )

  // ── Workspace store actions
  const {
    chatSpaces,
    createChatSpace,
  } = useWorkspaceStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // ── Credits balance (workspace header)
  const { balance: creditsBalance, refresh: refreshCredits, loading: creditsLoading } = useCredits()

  // ── Listen for "create new chat space" events dispatched by other components
  useEffect(() => {
    const handleCreateNewSpace = () => setShowNewSpaceForm(true)
    window.addEventListener('createNewSpace', handleCreateNewSpace)
    return () => window.removeEventListener('createNewSpace', handleCreateNewSpace)
  }, [])

  // ── Search logic
  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([])
        setShowSearchResults(false)
        return
      }
      setIsSearching(true)
      setShowSearchResults(true)
      try {
        const results = await searchService.search(query, {
          workspaceId: currentWorkspace?.id,
          includeMessages: true,
          includeChatSpaces: true,
          includeAssets: true,
          includeWorkspaces: true,
          limit: 20,
        })
        setSearchResults(results)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [currentWorkspace?.id],
  )

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => performSearch(searchQuery), 300)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery, performSearch])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value)

  const handleSearchResultClick = (result: SearchResult) => {
    setShowSearchResults(false)
    setSearchQuery('')
    if (searchInputRef.current) searchInputRef.current.blur()
  }

  const handleSearchFocus = () => {
    if (searchResults.length > 0) setShowSearchResults(true)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Share handler
  const handleShare = useCallback(() => {
    if (activeTab !== 'chat') {
      handleTabChange('chat')
    }
    useWorkspaceStore.getState().requestSharePanel()
  }, [activeTab, handleTabChange])

  // ── Create new chat space
  const handleCreateNewSpace = useCallback(async () => {
    if (!currentWorkspace || !newSpaceName.trim()) return
    try {
      await createChatSpace(currentWorkspace.id, newSpaceName.trim())
      setNewSpaceName('')
      setShowNewSpaceForm(false)
    } catch {
      toast.error('Failed to create taskspace')
    }
  }, [currentWorkspace, newSpaceName, createChatSpace])

  // ── Tab content (memoised)
  const tabContent = useMemo(() => {
    try {
      switch (activeTab) {
        case 'chat':
          return <ChatSpace creditsBalance={creditsBalance} refreshCredits={refreshCredits} creditsLoading={creditsLoading} />
        case 'governance':
          if (!GOVERNANCE_ENABLED) {
            return <ChatSpace creditsBalance={creditsBalance} refreshCredits={refreshCredits} creditsLoading={creditsLoading} />
          }
          return (
            <Governance
              workspaceId={currentWorkspace?.id || ''}
              readOnly={!canEditGovernance(currentWorkspace?.user_role)}
            />
          )
        default:
          return <ChatSpace creditsBalance={creditsBalance} refreshCredits={refreshCredits} creditsLoading={creditsLoading} />
      }
    } catch {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:!text-white mb-2">
              Error Loading Content
            </h3>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </div>
      )
    }
  }, [activeTab, currentWorkspace?.id, currentWorkspace?.user_role, creditsBalance, refreshCredits, creditsLoading])

  // ─────────────────────────────────────────────────────────────
  // Guard: still loading auth or waiting for the initial workspace
  //        fetch to complete.
  // ─────────────────────────────────────────────────────────────
  const bootstrapSkeleton =
    activeTab === 'governance' && GOVERNANCE_ENABLED ? 'form' : 'chat'

  if (
    isInitialLoading ||
    isProvisioning ||
    isResolvingChatSpace ||
    (user && token && workspaces.length === 0 && !currentWorkspace)
  ) {
    return <WorkspaceSkeleton variant={bootstrapSkeleton} />
  }

  if (bootstrapFailed && !currentWorkspace) {
    return <WorkspaceBootstrapError onRetry={retryBootstrap} />
  }

  if (!currentWorkspace || isResolvingWorkspace) {
    return <WorkspaceSkeleton variant={bootstrapSkeleton} />
  }

  // ─────────────────────────────────────────────────────────────
  // Main render — identical UI to the original, zero visual diff.
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="h-full min-h-0 !bg-canvas dark:!bg-gray-900 flex flex-col overflow-hidden transition-colors duration-300">

      {process.env.NEXT_PUBLIC_ASELIUS_DEV_BYPASS === 'true' && (
        <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-xs text-amber-900 dark:text-amber-200">
          <strong>Dev bypass active</strong> — workspace data is mocked locally. Set{' '}
          <code className="font-mono">NEXT_PUBLIC_ASELIUS_DEV_BYPASS=false</code> to use GCP again.
        </div>
      )}

      <AseliusWorkspaceShell>
        <div className="flex-1 flex flex-col overflow-hidden !bg-canvas dark:!bg-gray-900 transition-colors duration-300 min-h-0">

          {/* Tabs & Controls Header */}
          <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 !bg-canvas dark:!bg-gray-900 transition-colors duration-300">
            <div className="flex items-center justify-between px-3 sm:px-4 min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex border-r border-gray-100 dark:border-gray-800 pr-2 mr-2">
                  <button
                    onClick={() => handleTabChange('chat')}
                    title="Taskspace"
                    className={`px-3 md:px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center justify-center ${
                      activeTab === 'chat'
                        ? 'border-[#00477d] text-[#00477d] dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    <span className="hidden md:inline">Taskspace</span>
                    <MessageSquare className="w-5 h-5 md:hidden" />
                  </button>
                  <button
                    onClick={() => handleTabChange('governance')}
                    title="Governance"
                    className={`px-3 md:px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center justify-center ${
                      !GOVERNANCE_ENABLED ? 'hidden' :
                      activeTab === 'governance'
                        ? 'border-[#00477d] text-[#00477d] dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    <span className="hidden md:inline">Governance</span>
                    <Shield className="w-5 h-5 md:hidden" />
                  </button>
                </div>

                {canShareWorkspace(currentWorkspace.user_role) && (
                <button
                  onClick={handleShare}
                  className="p-1.5 md:px-2 hover:!bg-canvas dark:hover:!bg-gray-800 rounded-lg transition-all text-[#00477d] dark:text-blue-400 flex items-center gap-1.5"
                  title="Share Workspace"
                >
                  <Share2 className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="hidden md:inline text-xs font-medium">Share Workspace</span>
                </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="py-1">
                  <CreditsBalanceTracker balance={creditsBalance} />
                </div>
              </div>
            </div>
          </div>

          {/* Plain div, deliberately: this used to be a motion.div with
              key={activeTab} + initial/animate, which replayed a ~0.3-0.5s
              slide-in on every taskspace open AND forced a full remount of the
              tab content on each switch. Opening a taskspace should be
              instant — the animation read as lag, not polish. */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {tabContent}
          </div>
        </div>
      </AseliusWorkspaceShell>

    </div>
  )
}

export default Workspace