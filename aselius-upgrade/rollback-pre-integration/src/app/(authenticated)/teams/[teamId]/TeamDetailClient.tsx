'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Crown, Loader2, MessageSquare, Trash2, UserPlus, Users, AlertTriangle, X, Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavbar } from '@/contexts/NavbarContext';
import { useStore } from '@/lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visibleCloudHandle } from '@/lib/displayHandle';
import {
  addTeamMember, deleteTeam, getTeam, removeTeamMember, transferTeamOwnership, updateTeam,
  updateTeamMemberRole,
} from '@/utils/teamsAPI';
import { teamsNotify as toast } from '@/lib/platformToasts';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { teamsSurfaces, TeamRoleBadge, TeamOrgIcon } from '../teamsUi';

type ConfirmAction =
  | { type: 'remove' | 'transfer'; handle: string; name: string }
  | { type: 'deleteTeam' }
  | null;

interface TeamDetailClientProps {
  teamId: string;
  variant?: 'page' | 'panel';
  onClose?: () => void;
  onDeleted?: () => void;
}

export default function TeamDetailClient({
  teamId,
  variant = 'page',
  onClose,
  onDeleted,
}: TeamDetailClientProps) {
  const isPanel = variant === 'panel';
  const router = useRouter();
  const darkMode = useStore((s) => s.darkMode);
  const { setConfig } = useNavbar();
  const queryClient = useQueryClient();
  const [inviteHandle, setInviteHandle] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [editDesc, setEditDesc] = useState('');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => getTeam(teamId),
    enabled: !!teamId,
  });

  useEffect(() => {
    if (team) {
      if (!isPanel) {
        setConfig({ title: team.name, subtitle: 'Team members & settings' });
      }
      setEditDesc(team.description || '');
    }
  }, [team, setConfig, isPanel]);

  const canAdmin = team?.my_role === 'owner' || team?.my_role === 'admin';
  const isOwner = team?.my_role === 'owner';

  const inviteMutation = useMutation({
    mutationFn: () => addTeamMember(teamId, inviteHandle.trim(), inviteRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      setInviteHandle('');
      toast({ title: 'Member added' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ handle, role }: { handle: string; role: 'admin' | 'member' }) =>
      updateTeamMemberRole(teamId, handle, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', teamId] }),
  });

  const removeMutation = useMutation({
    mutationFn: (handle: string) => removeTeamMember(teamId, handle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      setConfirmAction(null);
      toast({ title: 'Member removed' });
    },
  });

  const transferMutation = useMutation({
    mutationFn: (handle: string) => transferTeamOwnership(teamId, handle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      setConfirmAction(null);
      toast({ title: 'Ownership transferred' });
    },
  });

  const saveDescMutation = useMutation({
    mutationFn: () => updateTeam(teamId, { description: editDesc }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      toast({ title: 'Description saved' });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: () => deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setConfirmAction(null);
      toast({ title: 'Team deleted', description: 'This organization was permanently removed.' });
      if (isPanel) {
        onDeleted?.();
      } else {
        router.push('/teams');
      }
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'remove') removeMutation.mutate(confirmAction.handle);
    else if (confirmAction.type === 'transfer') transferMutation.mutate(confirmAction.handle);
    else deleteTeamMutation.mutate();
  };

  if (isLoading || !team) {
    const loader = (
      <div className={`${isPanel ? 'p-4' : 'p-5 sm:p-6'} space-y-4`} aria-busy="true" aria-label="Loading team">
        <div className={`${teamsSurfaces.card} ${isPanel ? 'p-4' : 'p-5'} space-y-3`}>
          <div className="flex items-center gap-3">
            <div className={`${isPanel ? 'w-11 h-11' : 'w-14 h-14'} rounded-2xl animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className="flex-1 space-y-2">
              <div className={`h-5 w-40 max-w-full rounded animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className={`h-3 w-24 rounded animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
            </div>
          </div>
        </div>
        <div className={`${teamsSurfaces.card} ${isPanel ? 'p-4' : 'p-5'} space-y-3`}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className={`h-4 flex-1 rounded animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>
          ))}
        </div>
      </div>
    );
    if (isPanel) return loader;
    return (
      <div className={`flex flex-1 min-h-0 h-full overflow-y-auto ${teamsSurfaces.page}`} data-teams-surface>
        {loader}
      </div>
    );
  }

  const detailSections = (
    <>
        {/* Team hero */}
        <div className={`${teamsSurfaces.card} ${isPanel ? 'p-4' : 'p-5 sm:p-6'}`}>
          <div className={isPanel ? "flex flex-col gap-3.5" : "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
            <div className="flex items-center gap-3 min-w-0">
              <div className={`${isPanel ? 'w-11 h-11' : 'w-14 h-14'} rounded-2xl flex items-center justify-center flex-shrink-0 ${teamsSurfaces.iconTile}`}>
                <TeamOrgIcon className={isPanel ? 'w-6 h-6' : 'w-8 h-8'} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className={`${isPanel ? 'text-base' : 'text-xl sm:text-2xl'} font-bold truncate ${teamsSurfaces.heading}`}>{team.name}</h1>
                  <TeamRoleBadge role={team.my_role} />
                </div>
                <p className={`text-xs sm:text-sm mt-0.5 ${teamsSurfaces.muted}`}>
                  {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <Card className={teamsSurfaces.card}>
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className={teamsSurfaces.iconTile}>
                <TeamOrgIcon className="w-4 h-4" />
              </div>
              <h2 className={`font-semibold ${teamsSurfaces.heading}`}>About</h2>
            </div>
            {canAdmin ? (
              <>
                <textarea
                  className={teamsSurfaces.textarea}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Describe what this team does..."
                  rows={4}
                />
                <Button
                  size="sm"
                  className={teamsSurfaces.primaryBtn}
                  onClick={() => saveDescMutation.mutate()}
                  disabled={saveDescMutation.isPending}
                >
                  {saveDescMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save description'}
                </Button>
              </>
            ) : (
              <p className={`text-sm ${teamsSurfaces.muted}`}>{team.description || 'No description yet.'}</p>
            )}
          </CardContent>
        </Card>

        {/* Add member */}
        {canAdmin && (
          <Card className={teamsSurfaces.card}>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className={teamsSurfaces.iconTile}>
                  <UserPlus className="w-4 h-4 text-[#00477d]" />
                </div>
                <h2 className={`font-semibold ${teamsSurfaces.heading}`}>Add member</h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 min-w-0">
                  <Label className={`text-xs ${teamsSurfaces.muted}`}>Cloudhandle</Label>
                  <Input
                    placeholder="cloudhandle@beunec.cloud"
                    value={inviteHandle}
                    onChange={(e) => setInviteHandle(e.target.value)}
                    className={`mt-1 ${teamsSurfaces.input}`}
                    onKeyDown={(e) => e.key === 'Enter' && inviteHandle.trim() && inviteMutation.mutate()}
                  />
                </div>
                <div className="w-full sm:w-36">
                  <Label className={`text-xs ${teamsSurfaces.muted}`}>Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'member' | 'admin')}>
                    <SelectTrigger className={`mt-1 ${teamsSurfaces.input} h-10`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className={`w-full sm:w-auto ${teamsSurfaces.primaryBtn}`}
                  onClick={() => inviteMutation.mutate()}
                  disabled={!inviteHandle.trim() || inviteMutation.isPending}
                >
                  {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Members list */}
        <Card className={teamsSurfaces.card}>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={teamsSurfaces.iconTile}>
                <Users className="w-4 h-4 text-[#00477d]" />
              </div>
              <h2 className={`font-semibold ${teamsSurfaces.heading}`}>Members</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:!bg-slate-700 ${teamsSurfaces.muted}`}>
                {team.members.length}
              </span>
            </div>
            <ul className="space-y-3">
              {team.members.map((m) => (
                <li
                  key={m.cloudhandle}
                  className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border ${teamsSurfaces.divider} ${
                    darkMode ? 'bg-slate-800/40' : '!bg-canvas'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 border-2 border-[#00477d]/15 dark:!border-slate-700 flex-shrink-0">
                      <AvatarImage src={m.avatar} alt="" />
                      <AvatarFallback className="bg-[#00477d] text-white text-xs">
                        {(m.name || m.cloudhandle).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className={`font-medium text-sm truncate ${teamsSurfaces.heading}`}>
                        {m.name || m.cloudhandle}
                      </p>
                      <p className={`text-xs truncate ${teamsSurfaces.muted}`}>{visibleCloudHandle(m)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <TeamRoleBadge role={m.role} />

                    {canAdmin && m.role !== 'owner' && (
                      <>
                        <Select
                          value={m.role}
                          onValueChange={(v) =>
                            roleMutation.mutate({ handle: m.cloudhandle, role: v as 'admin' | 'member' })
                          }
                        >
                          <SelectTrigger className={`w-full sm:w-28 h-9 text-xs ${teamsSurfaces.input}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                type: 'transfer',
                                handle: m.cloudhandle,
                                name: m.name || m.cloudhandle,
                              })
                            }
                            className={`p-2 rounded-lg ${teamsSurfaces.secondaryBtn}`}
                            title="Transfer ownership"
                            aria-label={`Transfer ownership to ${m.name || m.cloudhandle}`}
                          >
                            <Crown className="w-4 h-4 text-amber-600 dark:!text-amber-400" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              type: 'remove',
                              handle: m.cloudhandle,
                              name: m.name || m.cloudhandle,
                            })
                          }
                          className="p-2 rounded-lg bg-red-50 dark:!bg-red-950/30 text-red-600 dark:!text-red-400 hover:bg-red-100 dark:hover:!bg-red-950/50 transition-colors"
                          aria-label={`Remove ${m.name || m.cloudhandle}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {isOwner && (
          <Card className={`${teamsSurfaces.card} border-red-200 dark:!border-red-900/40`}>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl flex-shrink-0 ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}>
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className={`font-semibold ${teamsSurfaces.heading}`}>Delete organization</h2>
                  <p className={`text-sm mt-1 ${teamsSurfaces.muted}`}>
                    Permanently delete this team, its members, and linked group chat. Only the owner can do this.
                  </p>
                  <Button
                    variant="outline"
                    className={`mt-4 ${teamsSurfaces.dangerBtn}`}
                    onClick={() => setConfirmAction({ type: 'deleteTeam' })}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete organization permanently
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </>
  );

  const confirmDialog = (
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              className={`relative z-10 w-full max-w-md rounded-2xl shadow-2xl p-6 ${teamsSurfaces.modal}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 ${
                    confirmAction.type === 'remove' || confirmAction.type === 'deleteTeam'
                      ? darkMode
                        ? 'bg-red-900/30 text-red-400'
                        : 'bg-red-50 text-red-600'
                      : darkMode
                        ? 'bg-amber-900/25 text-amber-300'
                        : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {confirmAction.type === 'remove' || confirmAction.type === 'deleteTeam' ? (
                    <Trash2 className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-semibold ${teamsSurfaces.heading}`}>
                    {confirmAction.type === 'remove'
                      ? 'Remove member?'
                      : confirmAction.type === 'deleteTeam'
                        ? 'Delete organization?'
                        : 'Transfer ownership?'}
                  </h3>
                  <p className={`text-sm mt-2 ${teamsSurfaces.muted}`}>
                    {confirmAction.type === 'remove'
                      ? `Remove ${confirmAction.name} from this team? They will lose access to team channels.`
                      : confirmAction.type === 'deleteTeam'
                        ? `${team.name} will be permanently deleted, including its team chat and channels. This cannot be undone.`
                        : `Transfer ownership to ${confirmAction.name}? You will become an admin.`}
                  </p>
                  <div className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
                    <Button
                      variant="outline"
                      className={`flex-1 ${teamsSurfaces.secondaryBtn}`}
                      onClick={() => setConfirmAction(null)}
                      disabled={removeMutation.isPending || transferMutation.isPending || deleteTeamMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      className={`flex-1 ${
                        confirmAction.type === 'remove' || confirmAction.type === 'deleteTeam'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : teamsSurfaces.primaryBtn
                      }`}
                      onClick={handleConfirm}
                      disabled={removeMutation.isPending || transferMutation.isPending || deleteTeamMutation.isPending}
                    >
                      {(removeMutation.isPending || transferMutation.isPending || deleteTeamMutation.isPending) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : confirmAction.type === 'remove' ? (
                        'Remove'
                      ) : confirmAction.type === 'deleteTeam' ? (
                        'Delete permanently'
                      ) : (
                        'Transfer'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  );

  if (isPanel) {
    return (
      <>
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden !bg-canvas dark:!bg-slate-900" data-teams-panel>
          <div className="h-13 min-h-[52px] flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 m-0 truncate pr-2">
              <div className="p-1.5 rounded-lg bg-[#00477d]/10 dark:bg-[#00477d]/20 text-[#00477d] dark:text-blue-400">
                <Settings className="w-4 h-4 shrink-0" />
              </div>
              <span className="truncate">{team.name}</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Close team settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-4 space-y-4 settings-panel-scroll">
            {detailSections}
          </div>
        </div>
        {confirmDialog}
      </>
    );
  }

  return (
    <div className={`flex flex-1 min-h-0 h-full overflow-y-auto overscroll-contain ${teamsSurfaces.page}`} data-teams-surface>
      <main className="w-full px-4 sm:px-6 py-4 sm:py-5 pb-8 max-w-3xl mx-auto space-y-4 sm:space-y-5">
        <button
          type="button"
          onClick={() => router.push('/teams')}
          className={`inline-flex items-center gap-1.5 text-sm font-medium ${teamsSurfaces.muted} hover:text-[#00477d] dark:hover:!text-blue-300 transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to teams
        </button>
        {detailSections}
      </main>
      {confirmDialog}
    </div>
  );
}
