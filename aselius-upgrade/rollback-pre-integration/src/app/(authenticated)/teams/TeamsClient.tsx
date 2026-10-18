'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, MessageSquare, Loader2, ChevronRight, Search, X, Sparkles, Trash2, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useNavbar } from '@/contexts/NavbarContext';
import { useStore } from '@/lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createTeam, deleteTeam, getTeams, type TeamSummary } from '@/utils/teamsAPI';
import { getUserProfile } from '@/utils/platformAPI';
import { useMessagesDesktopPanel } from '@/hooks/use-messages-desktop-panel';
import ProfileModal from './ViewProfile';
import { teamsSurfaces, TeamRoleBadge, TeamOrgIcon } from './teamsUi';
import { teamsNotify, teamsNotify as toast } from '@/lib/platformToasts';
import { Label } from '@/components/ui/label';
import PersonalConnectionsSection from './PersonalConnectionsSection';
import TeamDetailClient from './[teamId]/TeamDetailClient';

interface TeamsClientProps {
  initialSelectedTeamId?: string | null;
}

const minTeamPanelWidth = 380;
const maxTeamPanelWidth = 720;
const defaultTeamPanelWidth = 440;

export default function TeamsClient({ initialSelectedTeamId = null }: TeamsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const darkMode = useStore((s) => s.darkMode);
  const { setConfig } = useNavbar();
  const queryClient = useQueryClient();
  const isDesktopPanel = useMessagesDesktopPanel();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<TeamSummary | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(initialSelectedTeamId);
  const [teamPanelWidth, setTeamPanelWidth] = useState(defaultTeamPanelWidth);
  const [teamPanelDragging, setTeamPanelDragging] = useState(false);
  const teamPanelRef = useRef<HTMLElement | null>(null);
  const [form, setForm] = useState({ name: '', description: '', allow_member_invites: false });

  useEffect(() => {
    setSelectedTeamId(initialSelectedTeamId);
  }, [initialSelectedTeamId]);

  useEffect(() => {
    const profileHandle = searchParams?.get('profile');
    if (profileHandle && isDesktopPanel) {
      setSelectedProfile(profileHandle);
      setSelectedTeamId(null);
    }
  }, [searchParams, isDesktopPanel]);

  useEffect(() => {
    const saved = localStorage.getItem('teamsPanelWidth');
    if (!saved) return;
    const parsed = Number(saved);
    if (!Number.isNaN(parsed)) {
      setTeamPanelWidth(Math.min(maxTeamPanelWidth, Math.max(minTeamPanelWidth, parsed)));
    }
  }, []);

  useEffect(() => {
    if (!teamPanelDragging) {
      localStorage.setItem('teamsPanelWidth', String(teamPanelWidth));
    }
  }, [teamPanelWidth, teamPanelDragging]);

  useEffect(() => {
    if (!teamPanelDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const panelRight = teamPanelRef.current?.getBoundingClientRect().right ?? window.innerWidth;
      const nextWidth = Math.min(
        maxTeamPanelWidth,
        Math.max(minTeamPanelWidth, panelRight - clientX)
      );
      setTeamPanelWidth(nextWidth);
    };
    const handleUp = () => setTeamPanelDragging(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [teamPanelDragging]);

  useEffect(() => {
    setConfig({ title: 'Manage Teams', subtitle: 'Organizations, members, and team messaging' });
  }, [setConfig]);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: () => createTeam(form),
    onSuccess: (team) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setShowCreate(false);
      setForm({ name: '', description: '', allow_member_invites: false });
      toast({ title: 'Team created', description: `${team.name} is ready.` });
      if (isDesktopPanel) {
        setSelectedProfile(null);
        setSelectedTeamId(team.id);
        router.push(`/teams/${team.id}`);
      } else {
        router.push(`/teams/${team.id}`);
      }
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (teamId: string) => deleteTeam(teamId),
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setTeamToDelete(null);
      if (selectedTeamId === deletedId) {
        setSelectedTeamId(null);
        router.push('/teams');
      }
      toast({ title: 'Team deleted', description: 'This organization was permanently removed.' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const filtered = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const profileOpen = !!selectedProfile;
  const teamPanelOpen = isDesktopPanel && !!selectedTeamId;

  const openTeamSettings = (teamId: string) => {
    setSelectedProfile(null);
    setSelectedTeamId(teamId);
    router.push(`/teams/${teamId}`);
  };

  const closeTeamPanel = () => {
    setSelectedTeamId(null);
    router.push('/teams');
  };

  const handleOpenProfile = (cloudhandle: string) => {
    setSelectedTeamId(null);
    setSelectedProfile(cloudhandle);
    if (isDesktopPanel) {
      router.replace(`/teams?profile=${encodeURIComponent(cloudhandle)}`);
    }
  };

  const handleCloseProfile = () => {
    setSelectedProfile(null);
    if (isDesktopPanel) {
      router.replace('/teams');
    }
  };

  const handleTeamDeleted = () => {
    setSelectedTeamId(null);
    router.push('/teams');
  };

  const { data: selectedProfileData, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ['profile', selectedProfile],
    queryFn: () => (selectedProfile ? getUserProfile(selectedProfile) : Promise.resolve(null)),
    enabled: !!selectedProfile,
  });

  return (
    <div className={`flex flex-1 min-h-0 min-w-0 h-full ${teamsSurfaces.page}`} data-teams-surface>
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
        <main className="flex-1 min-w-0 overflow-y-auto w-full px-4 sm:px-6 lg:pl-8 lg:pr-5 xl:pl-10 xl:pr-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
        {/* Hero header */}
        <div className={`${teamsSurfaces.card} p-5 sm:p-6`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className={`${teamsSurfaces.iconTile} flex-shrink-0 flex items-center justify-center`}>
                <TeamOrgIcon className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <h1 className={`text-xl sm:text-2xl font-bold ${teamsSurfaces.heading}`}>Manage Teams</h1>
                <p className={`text-sm mt-1 ${teamsSurfaces.muted}`}>
                  Create organizations, invite by cloudhandle, and open team channels in Messages.
                </p>
              </div>
            </div>
            <Button
              icon={Plus}
              onClick={() => setShowCreate(true)}
              className={`w-full sm:w-auto ${teamsSurfaces.primaryBtn}`}
            >
              Create Team
            </Button>
          </div>

          <div className="relative mt-5 max-w-lg">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
            <Input
              className={`${teamsSurfaces.input} pl-10 pr-10`}
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[#00477d]/10 dark:hover:!bg-slate-700"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Teams grid */}
        <section aria-label="Your teams">
          {isLoading ? (
            <div
              className={`grid gap-3 sm:gap-4 ${
                teamPanelOpen
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
              aria-busy="true"
              aria-label="Loading teams"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`${teamsSurfaces.card} p-4 sm:p-5 space-y-3`}>
                  <div className={`h-5 w-2/3 rounded animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  <div className={`h-3 w-full rounded animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
                  <div className={`h-9 w-full rounded-lg animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className={`${teamsSurfaces.card} border-dashed`}>
              <CardContent className="py-16 sm:py-20 text-center px-4">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl ${teamsSurfaces.iconTile} flex items-center justify-center`}>
                  <Sparkles className="w-7 h-7 text-[#00477d]" />
                </div>
                <h3 className={`text-lg font-semibold ${teamsSurfaces.heading}`}>No teams yet</h3>
                <p className={`text-sm mt-2 max-w-md mx-auto ${teamsSurfaces.muted}`}>
                  Organizations get a messaging group and #General channel automatically.
                </p>
                <Button icon={Plus} className={`mt-6 ${teamsSurfaces.primaryBtn}`} onClick={() => setShowCreate(true)}>
                  Create your first team
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={`grid gap-3 sm:gap-4 ${
              teamPanelOpen
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {filtered.map((team) => (
                <motion.div
                  key={team.id}
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 32 }}
                  className="min-w-0"
                >
                  <Card
                    className={`${teamsSurfaces.card} ${teamsSurfaces.cardHover} cursor-pointer h-full ${
                      selectedTeamId === team.id ? 'ring-2 ring-[#00477d]/40 border-[#00477d]/40' : ''
                    }`}
                    onClick={() => openTeamSettings(team.id)}
                  >
                    <CardContent className="p-4 sm:p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-semibold truncate ${teamsSurfaces.heading}`}>{team.name}</h3>
                          <p className={`text-xs mt-1 line-clamp-2 ${teamsSurfaces.muted}`}>
                            {team.description || 'No description yet'}
                          </p>
                        </div>
                        <TeamRoleBadge role={team.my_role} />
                      </div>
                      <div className={`mt-auto pt-3 sm:pt-4 border-t ${teamsSurfaces.divider} flex items-center gap-2`}>
                        {team.my_role === 'owner' && (
                          <button
                            type="button"
                            className={`p-2 rounded-lg ${teamsSurfaces.dangerBtn}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTeamToDelete(team);
                            }}
                            aria-label={`Delete ${team.name}`}
                            title="Delete organization"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          className={`px-3 py-2 rounded-lg ${teamsSurfaces.secondaryBtn}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openTeamSettings(team.id);
                          }}
                          aria-label="Open team settings"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <PersonalConnectionsSection
          selectedProfile={selectedProfile}
          onOpenProfile={handleOpenProfile}
        />
        </main>

        {teamPanelOpen && (
          <aside
            ref={teamPanelRef}
            className={`${teamsSurfaces.panelAsideBase} relative`}
            style={{ width: teamPanelWidth, transition: teamPanelDragging ? 'none' : undefined }}
            data-teams-panel
          >
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize team settings panel"
              className={`absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize z-50 group ${teamPanelDragging ? 'bg-blue-500/40' : 'hover:bg-blue-500/30'}`}
              onMouseDown={() => setTeamPanelDragging(true)}
              onTouchStart={() => setTeamPanelDragging(true)}
            >
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-full ${teamPanelDragging ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-blue-400'}`} />
            </div>
            <TeamDetailClient
              teamId={selectedTeamId!}
              variant="panel"
              onClose={closeTeamPanel}
              onDeleted={handleTeamDeleted}
            />
          </aside>
        )}

        {isDesktopPanel && profileOpen && !teamPanelOpen && (
          <aside className={teamsSurfaces.panelAside} data-teams-panel>
            <ProfileModal
              variant="panel"
              isOpen={profileOpen}
              onClose={handleCloseProfile}
              profile={selectedProfileData}
              loading={isProfileLoading}
              error={isProfileError}
              cloudhandle={selectedProfile || ''}
              notify={teamsNotify}
            />
          </aside>
        )}
      </div>

      {!isDesktopPanel && profileOpen && (
        <ProfileModal
          variant="dialog"
          isOpen={profileOpen}
          onClose={handleCloseProfile}
          profile={selectedProfileData}
          loading={isProfileLoading}
          error={isProfileError}
          cloudhandle={selectedProfile || ''}
          notify={teamsNotify}
        />
      )}

      {/* Create modal — file-management style overlay */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-team-title"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !createMutation.isPending && setShowCreate(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
              className={`relative z-10 w-full max-w-md rounded-2xl shadow-2xl p-6 ${teamsSurfaces.modal}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className={`absolute right-4 top-4 p-2 rounded-lg transition-colors hover:bg-[#00477d]/10 text-slate-500 dark:!text-slate-400`}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center mb-6">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 ${teamsSurfaces.iconTile}`}>
                  <TeamOrgIcon className="w-6 h-6" />
                </div>
                <h2 id="create-team-title" className={`text-xl font-bold ${teamsSurfaces.heading}`}>
                  Create Organization
                </h2>
                <p className={`text-sm mt-1 max-w-xs ${teamsSurfaces.muted}`}>
                  A messaging group with a #General channel is created automatically.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className={teamsSurfaces.muted}>Team name</Label>
                  <Input
                    className={`mt-1.5 ${teamsSurfaces.input}`}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Acme Engineering"
                  />
                </div>
                <div>
                  <Label className={teamsSurfaces.muted}>Description</Label>
                  <textarea
                    className={`mt-1.5 ${teamsSurfaces.textarea}`}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What does this team work on?"
                    rows={3}
                  />
                </div>
                <label
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${
                    darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 !bg-canvas'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-slate-300"
                    checked={form.allow_member_invites}
                    onChange={(e) => setForm({ ...form, allow_member_invites: e.target.checked })}
                  />
                  <span className={`text-sm text-left ${teamsSurfaces.muted}`}>
                    Allow any member to invite others by cloudhandle
                  </span>
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
                <Button
                  variant="outline"
                  className={`flex-1 ${teamsSurfaces.secondaryBtn}`}
                  onClick={() => setShowCreate(false)}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 ${teamsSurfaces.primaryBtn}`}
                  onClick={() => createMutation.mutate()}
                  disabled={!form.name.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Create team'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {teamToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-team-title"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !deleteMutation.isPending && setTeamToDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              className={`relative z-10 w-full max-w-md rounded-2xl shadow-2xl p-6 ${teamsSurfaces.modal}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${darkMode ? 'bg-red-900/30 text-red-400' : '!bg-canvas border border-red-200 text-red-600'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 id="delete-team-title" className={`text-lg font-semibold ${teamsSurfaces.heading}`}>
                    Delete organization?
                  </h2>
                  <p className={`text-sm mt-2 ${teamsSurfaces.muted}`}>
                    <span className="font-medium text-slate-800 dark:!text-slate-200">{teamToDelete.name}</span>{' '}
                    will be permanently deleted, including its team chat and channels. This cannot be undone.
                  </p>
                  <p className={`text-xs mt-2 ${teamsSurfaces.muted}`}>
                    Only owners can delete an organization. Admins and members cannot.
                  </p>
                  <div className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
                    <Button
                      variant="outline"
                      className={`flex-1 ${teamsSurfaces.secondaryBtn}`}
                      onClick={() => setTeamToDelete(null)}
                      disabled={deleteMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => deleteMutation.mutate(teamToDelete.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Delete permanently'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
