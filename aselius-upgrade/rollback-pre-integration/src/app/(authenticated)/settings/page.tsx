'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Settings, Bell, Monitor, Camera, QrCode, Wallet, Sun, Moon, Smartphone, Globe, Database, MessageCircle, Activity,
  Users, RefreshCw, HelpCircle, LogOut, Trash2, Plus, Eye, EyeOff, Edit3, X, Save, Briefcase, MapPin, Calendar, Link2, ExternalLink, Building,
  Loader2, ChevronDown, AlertTriangle, ShieldAlert, Clock
} from 'lucide-react';
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaYoutube, FaGlobe } from 'react-icons/fa';
import { useNavbar } from '@/contexts/NavbarContext';
import { useStore } from '@/lib/store';
import { getCurrentUserProfile, updateUserProfile, updateDisplayHandle, updateNotificationPreferences, getNotificationPreferences, uploadAvatar, getMinimalUserProfile } from '@/utils/settingAPI';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { useCloudHandle, useCloudHandleContext } from '@/contexts/CloudHandleContext';
// import { useToast } from '@/hooks/use-toast';

import toast from 'react-hot-toast';
import { useLoadingStore } from '@/lib/loadingStore';
import { paymentAPI } from '@/utils/paymentAPI';
import { StatusSelector } from '@/components/StatusComponents';
import MonthYearPicker, { formatMonthYear } from '@/components/settings/MonthYearPicker';
import DatePicker from '@/components/ui/DatePicker';
import ThemeToggle from '@/components/ui/ThemeToggle';
import {
  minProfileQueryKey,
  patchListedDisplayHandle,
  patchUserProfileDisplayHandle,
} from '@/lib/displayHandle';

function SocialPlatformIcon({ platform, className = 'h-4 w-4' }: { platform: string; className?: string }) {
  const key = (platform || '').toLowerCase();
  if (key.includes('linkedin')) return <FaLinkedin className={`${className} text-[#0A66C2]`} />;
  if (key.includes('github')) return <FaGithub className={`${className} text-slate-200`} />;
  if (key.includes('twitter') || key === 'x' || key.includes('x /')) return <FaTwitter className={`${className} text-sky-400`} />;
  if (key.includes('instagram')) return <FaInstagram className={`${className} text-pink-400`} />;
  if (key.includes('youtube')) return <FaYoutube className={`${className} text-red-500`} />;
  return <FaGlobe className={`${className} text-primaryBlue`} />;
}
const SOCIAL_PLATFORMS = [
  { id: 'LinkedIn', label: 'LinkedIn', hint: 'linkedin.com/in/…' },
  { id: 'GitHub', label: 'GitHub', hint: 'github.com/…' },
  { id: 'X / Twitter', label: 'X', hint: 'x.com/…' },
  { id: 'Instagram', label: 'Instagram', hint: 'instagram.com/…' },
  { id: 'YouTube', label: 'YouTube', hint: 'youtube.com/…' },
  { id: 'Website', label: 'Website', hint: 'https://…' },
  { id: 'Other', label: 'Other', hint: 'https://…' },
] as const;

const EXPERIENCE_LIMITS = {
  jobTitleWords: 4,
  companyWords: 5,
  locationWords: 5,
  skillWords: 3,
  maxSkills: 8,
  descriptionWords: 100,
} as const;

const DISPLAY_HANDLE_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

function countWords(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function clampToWordLimit(value: string, maxWords: number): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value.replace(/\s+$/, value.endsWith(' ') ? ' ' : '');
  return words.slice(0, maxWords).join(' ');
}

function resolveDisplayHandle(profile: any): string | null {
  return profile?.display_handle || profile?.displayHandle || null;
}

function resolveDisplayHandleChangedAt(profile: any): string | null {
  return profile?.display_handle_changed_at || profile?.displayHandleChangedAt || null;
}

function cooldownEndsAt(changedAt?: string | null): Date | null {
  if (!changedAt) return null;
  const t = new Date(changedAt).getTime();
  if (!Number.isFinite(t)) return null;
  return new Date(t + DISPLAY_HANDLE_COOLDOWN_MS);
}

function isDisplayHandleCoolingDown(changedAt?: string | null): boolean {
  const ends = cooldownEndsAt(changedAt);
  return !!ends && ends.getTime() > Date.now();
}

const tabs = [
  { id: 'Profile', label: 'Profile', icon: User },
  { id: 'Preferences', label: 'Preferences', icon: Settings },
  { id: 'Notifications', label: 'Notifications', icon: Bell },
  { id: 'System', label: 'System', icon: Monitor },
  { id: 'Billing', label: 'Billing', icon: Wallet } // Added Billing tab
];

function useSettingsProfileQuery(scope: string) {
  const cloudHandle = useCloudHandle();
  const { loading: cloudHandleLoading } = useCloudHandleContext();

  return useQuery({
    queryKey: ['userProfile', scope, cloudHandle ?? 'current'],
    queryFn: () => getCurrentUserProfile(cloudHandle),
    enabled: !cloudHandleLoading,
    // Each settings tab is its own component and calls this with a different
    // `scope`, so switching tabs is a fresh mount of a query with a NEW key
    // every time — `staleTime: 0` + `refetchOnMount: 'always'` then forced a
    // real network round trip and a loading flash on every single tab click,
    // even clicking straight back to a tab you were just on. Same bug, same
    // fix, as the sidebar profile query (see Sidebar.tsx) — 2 minutes is long
    // enough that a quick back-and-forth between tabs paints from cache, short
    // enough that an edit made elsewhere in the same session still shows up
    // on the next real visit.
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
}

export default function SettingsPage() {
  const { darkMode } = useStore();
  const { setConfig } = useNavbar();
  const [activeTab, setActiveTab] = useState('Profile');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const setLoading = useLoadingStore((state) => state.setLoading);

  useEffect(() => {
    setConfig({
      title: 'Settings',
      subtitle: 'Manage your Beunec Cloud account and preferences',
      showNavbar: true
    });
    setLoading(false);
  }, [setLoading, setConfig]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Profile':
        return <ProfileTab />;
      case 'Preferences':
        return <PreferencesTab />;
      case 'Notifications':
        return <NotificationsTab />;
      case 'System':
        return <SystemTab />;
      case 'Billing':
        return <BillingTab />;
      default:
        return null;
    }
  };
  return (
    <main className={`flex-1 p-3 sm:p-6 h-screen overflow-y-auto overflow-x-hidden pb-[max(1rem,env(safe-area-inset-bottom))] transition-all duration-300 ${darkMode ? 'bg-gray-800' : '!bg-canvas'}`}>
      <div className="max-w-6xl mx-auto">



        <div className={`${darkMode ? 'bg-gray-800' : '!bg-canvas surface-canvas'} rounded-2xl shadow-xl overflow-hidden`} data-settings-surface>
          {/* Horizontal Tab Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${darkMode ? 'border-b border-gray-800 bg-gray-800' : 'border-b border-gray-200 !bg-canvas'}`}
          >
            <div className="md:hidden relative p-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${darkMode
                  ? 'bg-gray-800 text-white hover:bg-gray-800'
                  : '!bg-canvas text-gray-900 hover:!bg-canvas'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  {React.createElement(tabs.find(t => t.id === activeTab)?.icon || User, { size: 18 })}
                  <span>{activeTab}</span>
                </div>
                <ChevronDown size={18} className={`transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute left-2 right-2 top-full mt-2 rounded-xl shadow-lg z-20 overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : '!bg-canvas surface-canvas border border-gray-200'}`}
                  >
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${isActive
                            ? 'bg-primaryBlue/10 text-primaryBlue font-medium'
                            : darkMode
                              ? 'text-gray-300 hover:bg-gray-800'
                              : 'text-gray-600 hover:!bg-canvas'
                            }`}
                        >
                          <Icon size={18} />
                          <span>{tab.label}</span>
                          {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primaryBlue" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <nav className="hidden md:flex space-x-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center space-x-2 px-3 py-2 md:px-6 md:py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                      ? 'bg-primaryBlue text-white shadow-lg'
                      : `${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    layout
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-primaryBlue rounded-xl -z-10"
                        transition={{ type: "spring", bounce: 0.05, duration: 0.4 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>
          </motion.div>

          {/* Content */}
          <div className={`p-4 sm:p-6 md:p-8 rounded-2xl min-h-[500px] ${darkMode ? 'bg-gray-900' : '!bg-canvas'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}



function ProfileTab() {
  const cloudHandle = useCloudHandle();
  const { darkMode } = useStore();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCloudId, setShowCloudId] = useState(false);
  const [showBcidConfirm, setShowBcidConfirm] = useState(false);
  const { data: profile, isLoading, error, refetch } = useSettingsProfileQuery('profile');
  const { data: liveMinProfile } = useQuery({
    // Same cache entry the sidebar keeps warm at a 2-minute staleTime
    // (minProfileQueryKey). This observer's own `staleTime: 0` overrode that
    // for this component and forced a refetch of the shared entry every time
    // the Profile tab mounted — matching the sidebar's staleTime keeps them
    // from fighting over the same cached data.
    queryKey: minProfileQueryKey(cloudHandle),
    queryFn: getMinimalUserProfile,
    enabled: !!cloudHandle,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [domainInput, setDomainInput] = useState('');
  const [savingDomain, setSavingDomain] = useState(false);
  const [skillDraft, setSkillDraft] = useState('');
  const { data: planData } = useQuery({
    queryKey: ['planLimits', cloudHandle ?? 'current'],
    queryFn: () => paymentAPI.getPlanLimits(),
    enabled: !!cloudHandle,
  });
  const isEssential = planData?.plan === 'essential';

  function isProfileChanged() {
    return JSON.stringify(localProfile) !== JSON.stringify(originalProfile);
  }

  useEffect(() => {
    if (profile) {
      const alias = resolveDisplayHandle(liveMinProfile) ?? resolveDisplayHandle(profile);
      const changed =
        resolveDisplayHandleChangedAt(liveMinProfile) ?? resolveDisplayHandleChangedAt(profile);
      const normalized = {
        ...profile,
        display_handle: alias,
        display_handle_changed_at: changed,
        experiences: Array.isArray((profile as any).experiences) ? (profile as any).experiences : [],
        socialLinks: Array.isArray((profile as any).socialLinks) ? (profile as any).socialLinks : [],
      };
      setLocalProfile(normalized);
      setOriginalProfile(normalized);
      setDomainInput(alias?.includes('@') ? `@${alias.split('@')[1]}` : '');
    }
  }, [profile, liveMinProfile]);

  const realUsername = (localProfile?.cloudhandle || '').split('@')[0];
  const currentAlias: string | null =
    resolveDisplayHandle(liveMinProfile) ?? resolveDisplayHandle(localProfile);
  const changedAt =
    resolveDisplayHandleChangedAt(liveMinProfile) ?? resolveDisplayHandleChangedAt(localProfile);
  const coolingDown = isDisplayHandleCoolingDown(changedAt);
  const cooldownEnd = cooldownEndsAt(changedAt);

  const syncAliasEverywhere = async (update: {
    cloudhandle: string;
    display_handle: string | null;
    display_handle_changed_at?: string | null;
  }) => {
    patchUserProfileDisplayHandle(queryClient, update);
    patchListedDisplayHandle(queryClient, update);
    // Confirm from DB so sidebar/settings cannot diverge on stale caches.
    const confirmed = await queryClient.fetchQuery({
      queryKey: minProfileQueryKey(cloudHandle),
      queryFn: getMinimalUserProfile,
    });
    const confirmedAlias = resolveDisplayHandle(confirmed);
    const confirmedAt = resolveDisplayHandleChangedAt(confirmed);
    patchUserProfileDisplayHandle(queryClient, {
      cloudhandle: update.cloudhandle,
      display_handle: confirmedAlias,
      display_handle_changed_at: confirmedAt,
    });
    void queryClient.invalidateQueries({ queryKey: ['connections'] });
    void queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
    void queryClient.invalidateQueries({ queryKey: ['team'] });
    return { display_handle: confirmedAlias, display_handle_changed_at: confirmedAt };
  };

  const handleSaveDomain = async () => {
    const domain = domainInput.trim();
    if (!domain) {
      toast.error('Enter a domain, e.g. @openai.com');
      return;
    }
    if (coolingDown) {
      toast.error('You can only customize your cloudhandle once every 3 days.');
      return;
    }
    const normalizedDomain = domain.startsWith('@') ? domain : `@${domain}`;
    const newHandle = `${realUsername}${normalizedDomain}`;
    setSavingDomain(true);
    try {
      const result = await updateDisplayHandle(cloudHandle!, newHandle);
      const confirmed = await syncAliasEverywhere({
        cloudhandle: cloudHandle!,
        display_handle: result.display_handle,
        display_handle_changed_at: result.display_handle_changed_at || new Date().toISOString(),
      });
      setLocalProfile((prev: any) => ({
        ...prev,
        display_handle: confirmed.display_handle,
        display_handle_changed_at: confirmed.display_handle_changed_at,
      }));
      setOriginalProfile((prev: any) => ({
        ...prev,
        display_handle: confirmed.display_handle,
        display_handle_changed_at: confirmed.display_handle_changed_at,
      }));
      setDomainInput(
        confirmed.display_handle?.includes('@')
          ? `@${confirmed.display_handle.split('@')[1]}`
          : ''
      );
      toast.success(`Your cloudhandle is now shown as ${confirmed.display_handle}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update your cloudhandle domain');
    } finally {
      setSavingDomain(false);
    }
  };

  const handleRevertDomain = async () => {
    setSavingDomain(true);
    try {
      const result = await updateDisplayHandle(cloudHandle!, null);
      const confirmed = await syncAliasEverywhere({
        cloudhandle: cloudHandle!,
        display_handle: null,
        display_handle_changed_at:
          result.display_handle_changed_at ?? resolveDisplayHandleChangedAt(localProfile),
      });
      setLocalProfile((prev: any) => ({
        ...prev,
        display_handle: null,
        display_handle_changed_at: confirmed.display_handle_changed_at,
      }));
      setOriginalProfile((prev: any) => ({
        ...prev,
        display_handle: null,
        display_handle_changed_at: confirmed.display_handle_changed_at,
      }));
      setDomainInput('');
      toast.success('Reverted to your original cloudhandle');
    } catch (err: any) {
      toast.error(err.message || 'Failed to revert your cloudhandle');
    } finally {
      setSavingDomain(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadAvatar(file);
      setLocalProfile((prev: any) => ({ ...prev, avatar: url }));
      toast.success('Avatar uploaded! Make sure to save your profile to keep it.');
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Experience state
  const [editingExperience, setEditingExperience] = useState<number | null>(null);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [experienceForm, setExperienceForm] = useState({
    jobTitle: '',
    employmentType: 'Full-time',
    company: '',
    startDate: '',
    endDate: '',
    location: '',
    workplaceType: 'On-site',
    description: '',
    skills: ''
  });

  // Social links state
  const [editingSocialLink, setEditingSocialLink] = useState<number | null>(null);
  const [showSocialForm, setShowSocialForm] = useState(false);
  const [socialForm, setSocialForm] = useState({
    platform: '',
    url: ''
  });

  const normalizeProfileForSave = (source: any) => ({
    ...source,
    firstName: source.firstName?.trim(),
    lastName: source.lastName?.trim(),
    tagline: source.tagline?.trim(),
    location: source.location?.trim(),
    company: source.company?.trim(),
    bio: source.bio?.trim(),
    age: source.age?.toString().trim(),
    dob: source.dob || null,
    experiences: Array.isArray(source.experiences)
      ? source.experiences.map((exp: any) => ({
          ...exp,
          jobTitle: (exp.jobTitle || '').trim(),
          company: (exp.company || '').trim(),
          location: (exp.location || '').trim(),
          description: (exp.description || '').trim(),
          employmentType: exp.employmentType || 'Full-time',
          workplaceType: exp.workplaceType || 'On-site',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          skills: Array.isArray(exp.skills)
            ? exp.skills.map((s: string) => String(s).trim()).filter(Boolean)
            : String(exp.skills || '')
                .split(',')
                .map((s: string) => s.trim())
                .filter(Boolean),
        }))
      : [],
    socialLinks: Array.isArray(source.socialLinks)
      ? source.socialLinks.map((link: any) => ({
          platform: (link.platform || '').trim(),
          url: (link.url || '').trim(),
        }))
      : [],
  });

  const persistProfileSlice = async (nextProfile: any, successMessage?: string) => {
    const handle = nextProfile.cloudhandle || localProfile?.cloudhandle || cloudHandle;
    if (!handle) throw new Error('Cloud handle not found');
    const payload = normalizeProfileForSave(nextProfile);
    const saved = await updateUserProfile(handle, payload);
    const alias = resolveDisplayHandle(saved) ?? resolveDisplayHandle(nextProfile);
    const normalized = {
      ...saved,
      display_handle: alias,
      display_handle_changed_at:
        resolveDisplayHandleChangedAt(saved) ?? resolveDisplayHandleChangedAt(nextProfile),
      experiences: Array.isArray(saved.experiences) ? saved.experiences : payload.experiences,
      socialLinks: Array.isArray(saved.socialLinks) ? saved.socialLinks : payload.socialLinks,
    };
    setLocalProfile(normalized);
    setOriginalProfile(normalized);
    if (successMessage) toast.success(successMessage);
    return normalized;
  };

  const parseSkillsInput = (skills: string | string[]) => {
    if (Array.isArray(skills)) return skills.map((s) => String(s).trim()).filter(Boolean);
    return String(skills || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const buildExperiencePayload = () => ({
    jobTitle: clampToWordLimit(experienceForm.jobTitle.trim(), EXPERIENCE_LIMITS.jobTitleWords),
    employmentType: experienceForm.employmentType,
    company: clampToWordLimit(experienceForm.company.trim(), EXPERIENCE_LIMITS.companyWords),
    startDate: experienceForm.startDate,
    endDate: experienceForm.endDate,
    location: clampToWordLimit(experienceForm.location.trim(), EXPERIENCE_LIMITS.locationWords),
    workplaceType: experienceForm.workplaceType,
    description: clampToWordLimit(experienceForm.description.trim(), EXPERIENCE_LIMITS.descriptionWords),
    skills: parseSkillsInput(experienceForm.skills).slice(0, EXPERIENCE_LIMITS.maxSkills),
  });

  // Experience handlers
  const handleAddExperience = async () => {
    const newExperience = buildExperiencePayload();
    if (!newExperience.jobTitle || !newExperience.company) {
      toast.error('Job title and company are required');
      return;
    }
    if (countWords(newExperience.jobTitle) > EXPERIENCE_LIMITS.jobTitleWords) {
      toast.error(`Job title is limited to ${EXPERIENCE_LIMITS.jobTitleWords} words`);
      return;
    }
    if (countWords(newExperience.description) > EXPERIENCE_LIMITS.descriptionWords) {
      toast.error(`Description is limited to ${EXPERIENCE_LIMITS.descriptionWords} words`);
      return;
    }
    if (!newExperience.startDate) {
      toast.error('Start date is required');
      return;
    }
    const next = {
      ...localProfile,
      experiences: [...(localProfile.experiences || []), newExperience],
    };
    setLocalProfile(next);
    resetExperienceForm();
    try {
      await persistProfileSlice(next, 'Experience saved');
    } catch {
      toast.error('Failed to save experience');
      setLocalProfile(localProfile);
    }
  };

  const handleEditExperience = (exp: any, idx: number) => {
    setExperienceForm({
      jobTitle: exp.jobTitle || '',
      employmentType: exp.employmentType || 'Full-time',
      company: exp.company || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      location: exp.location || '',
      workplaceType: exp.workplaceType || 'On-site',
      description: exp.description || '',
      skills: Array.isArray(exp.skills) ? exp.skills.join(', ') : String(exp.skills || ''),
    });
    setSkillDraft('');
    setEditingExperience(idx);
    setShowExperienceForm(true);
  };

  const handleUpdateExperience = async () => {
    const updated = buildExperiencePayload();
    if (!updated.jobTitle || !updated.company) {
      toast.error('Job title and company are required');
      return;
    }
    if (!updated.startDate) {
      toast.error('Start date is required');
      return;
    }
    const next = {
      ...localProfile,
      experiences: (localProfile.experiences || []).map((exp: any, idx: number) =>
        idx === editingExperience ? updated : exp
      ),
    };
    setLocalProfile(next);
    resetExperienceForm();
    try {
      await persistProfileSlice(next, 'Experience updated');
    } catch {
      toast.error('Failed to update experience');
      setLocalProfile(localProfile);
    }
  };

  const handleDeleteExperience = async (idx: number) => {
    const previous = localProfile;
    const next = {
      ...localProfile,
      experiences: (localProfile.experiences || []).filter((_: any, i: number) => i !== idx),
    };
    setLocalProfile(next);
    try {
      await persistProfileSlice(next, 'Experience removed');
    } catch {
      toast.error('Failed to remove experience');
      setLocalProfile(previous);
    }
  };

  const resetExperienceForm = () => {
    setExperienceForm({
      jobTitle: '',
      employmentType: 'Full-time',
      company: '',
      startDate: '',
      endDate: '',
      location: '',
      workplaceType: 'On-site',
      description: '',
      skills: ''
    });
    setSkillDraft('');
    setEditingExperience(null);
    setShowExperienceForm(false);
  };

  const experienceSkills = parseSkillsInput(experienceForm.skills);

  const addSkillChip = (raw: string) => {
    const skill = clampToWordLimit(raw.trim().replace(/,/g, ''), EXPERIENCE_LIMITS.skillWords);
    if (!skill) return;
    if (countWords(skill) > EXPERIENCE_LIMITS.skillWords) {
      toast.error(`Each skill is limited to ${EXPERIENCE_LIMITS.skillWords} words`);
      setSkillDraft('');
      return;
    }
    if (experienceSkills.length >= EXPERIENCE_LIMITS.maxSkills) {
      toast.error(`You can add up to ${EXPERIENCE_LIMITS.maxSkills} skills`);
      setSkillDraft('');
      return;
    }
    if (experienceSkills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setSkillDraft('');
      return;
    }
    const next = [...experienceSkills, skill];
    setExperienceForm({ ...experienceForm, skills: next.join(', ') });
    setSkillDraft('');
  };

  const removeSkillChip = (skill: string) => {
    const next = experienceSkills.filter((s) => s !== skill);
    setExperienceForm({ ...experienceForm, skills: next.join(', ') });
  };

  // Social link handlers
  const handleAddSocialLink = async () => {
    const urlPattern = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
    const trimmedPlatform = socialForm.platform.trim();
    const trimmedUrl = socialForm.url.trim();
    if (!trimmedPlatform || trimmedPlatform === 'Other') {
      toast.error('Choose a platform');
      return;
    }
    if (!urlPattern.test(trimmedUrl)) {
      toast.error('Enter a valid URL starting with http:// or https://');
      return;
    }
    if ((localProfile.socialLinks || []).some((link: any) =>
      link.platform?.toLowerCase() === trimmedPlatform.toLowerCase() || link.url === trimmedUrl
    )) {
      toast.error('This social link already exists');
      return;
    }
    const next = {
      ...localProfile,
      socialLinks: [...(localProfile.socialLinks || []), { platform: trimmedPlatform, url: trimmedUrl }],
    };
    setLocalProfile(next);
    resetSocialForm();
    try {
      await persistProfileSlice(next, 'Social link saved');
    } catch {
      toast.error('Failed to save social link');
      setLocalProfile(localProfile);
    }
  };

  const handleEditSocialLink = (link: any, idx: number) => {
    setSocialForm({ platform: link.platform || '', url: link.url || '' });
    setEditingSocialLink(idx);
    setShowSocialForm(true);
  };

  const handleUpdateSocialLink = async () => {
    const urlPattern = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
    const trimmedPlatform = socialForm.platform.trim();
    const trimmedUrl = socialForm.url.trim();
    if (!trimmedPlatform || trimmedPlatform === 'Other') {
      toast.error('Choose a platform');
      return;
    }
    if (!urlPattern.test(trimmedUrl)) {
      toast.error('Enter a valid URL starting with http:// or https://');
      return;
    }
    const next = {
      ...localProfile,
      socialLinks: (localProfile.socialLinks || []).map((link: any, idx: number) =>
        idx === editingSocialLink ? { platform: trimmedPlatform, url: trimmedUrl } : link
      ),
    };
    setLocalProfile(next);
    resetSocialForm();
    try {
      await persistProfileSlice(next, 'Social link updated');
    } catch {
      toast.error('Failed to update social link');
      setLocalProfile(localProfile);
    }
  };

  const handleDeleteSocialLink = async (idx: number) => {
    const previous = localProfile;
    const next = {
      ...localProfile,
      socialLinks: (localProfile.socialLinks || []).filter((_: any, i: number) => i !== idx),
    };
    setLocalProfile(next);
    try {
      await persistProfileSlice(next, 'Social link removed');
    } catch {
      toast.error('Failed to remove social link');
      setLocalProfile(previous);
    }
  };

  const resetSocialForm = () => {
    setSocialForm({ platform: '', url: '' });
    setEditingSocialLink(null);
    setShowSocialForm(false);
  };

  // Save profile to backend
  const mutation = useMutation({
    mutationFn: (updatedProfile: any) => {
      const handle = updatedProfile.cloudhandle || localProfile?.cloudhandle || cloudHandle;
      if (!handle) throw new Error('Cloud handle not found');
      return updateUserProfile(handle, normalizeProfileForSave(updatedProfile));
    },
    onSuccess: (savedProfile) => {
      toast.success('Saved successfully!');
      const alias = resolveDisplayHandle(savedProfile) ?? resolveDisplayHandle(localProfile);
      const normalized = {
        ...savedProfile,
        display_handle: alias,
        display_handle_changed_at:
          resolveDisplayHandleChangedAt(savedProfile) ?? resolveDisplayHandleChangedAt(localProfile),
      };
      setLocalProfile(normalized);
      setOriginalProfile(normalized);
      if (cloudHandle) {
        patchUserProfileDisplayHandle(queryClient, {
          cloudhandle: cloudHandle,
          display_handle: alias,
          display_handle_changed_at: resolveDisplayHandleChangedAt(normalized),
        });
      }
      refetch();
    },
    onError: () => {
      toast.error('Failed to save profile');
    }
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await mutation.mutateAsync(localProfile);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div className="text-red-500">Failed to load profile</div>;
  if (isLoading || !localProfile) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading profile">
        <div className="space-y-2">
          <div className={`h-8 w-48 rounded animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-4 w-64 max-w-full rounded animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
        </div>
        <div className="flex items-center gap-6">
          <div className={`h-24 w-24 rounded-full animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className="space-y-2">
            <div className={`h-4 w-28 rounded animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className={`h-3 w-40 rounded animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
          </div>
        </div>
        <div className={`h-40 rounded-xl animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
        <div className={`h-40 rounded-xl animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile Settings</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Update your personal information and professional details</p>
      </div>


      {/* Profile Picture */}
      <motion.div className="flex items-center space-x-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-primaryBlue/70 to-primaryBlue rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent">
            {localProfile?.avatar ? (
              <img src={localProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-white" />
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
          <motion.button
            className={`absolute -bottom-2 -right-2 ${darkMode ? 'bg-gray-800 border-gray-700' : '!bg-canvas surface-canvas border-gray-200'} rounded-full p-2 shadow-lg border ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={!isUploading ? { scale: 1.1 } : {}}
            whileTap={!isUploading ? { scale: 0.9 } : {}}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="w-4 h-4 rounded-full border-2 border-primaryBlue border-t-transparent animate-spin" />
            ) : (
              <Camera size={16} className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            )}
          </motion.button>
        </div>
        <div>
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile Photo</h3>
          <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Upload a new profile picture</p>
        </div>
      </motion.div>

      {/* Status Section */}
      <motion.div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : '!bg-canvas border-gray-200/80'
          }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div>
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Current Status</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your online presence</p>
        </div>
        <StatusSelector variant="profile" />
      </motion.div>

      {/* Basic Info Form */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>First Name</label>
          <input
            type="text"
            autoComplete="given-name"
            name="given-name"
            value={localProfile.firstName || ''}
            onChange={e => setLocalProfile({ ...localProfile, firstName: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'} transition-all duration-200`}
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last Name</label>
          <input
            type="text"
            autoComplete="family-name"
            name="family-name"
            value={localProfile.lastName || ''}
            onChange={e => setLocalProfile({ ...localProfile, lastName: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'} transition-all duration-200`}
            placeholder="Enter your last name"
          />
        </div>
        <div>
          <div className="flex items-center mb-2">
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Beunec Cloud ID
            </label>
            <button
              type="button"
              className="ml-2 text-primaryBlue hover:text-primaryBlue focus:outline-none"
              onClick={() => {
                // Hiding is always free — only revealing requires the warning.
                if (showCloudId) setShowCloudId(false);
                else setShowBcidConfirm(true);
              }}
              tabIndex={-1}
              aria-label={showCloudId ? "Hide Cloud ID" : "Show Cloud ID"}
            >
              {showCloudId ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <input
            type={showCloudId ? 'text' : 'password'}
            value={localProfile.bcid || ''}
            readOnly
            className={`w-full px-4 py-3 rounded-lg border
      ${darkMode
                ? 'bg-gray-700 border-gray-600 text-gray-400 placeholder-gray-500'
                : 'bg-gray-200 text-gray-500'
              }`}
            placeholder="Your unique Cloud ID"
            style={{ letterSpacing: '0.1em' }}
          />
          <p className={`mt-1.5 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            This is your private authorization ID. Only your cloudhandle is ever shown to others.
          </p>
        </div>

        {/* Reveal-BCID Confirmation Modal */}
        <AnimatePresence>
          {showBcidConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
              onClick={() => setShowBcidConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                data-settings-surface
                className={`max-w-md w-full rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-900 border border-gray-800' : '!bg-canvas surface-canvas'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`p-6 border-b ${darkMode ? 'border-gray-800 bg-red-950/50' : 'border-red-100 bg-red-50'}`}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-600 rounded-lg">
                      <ShieldAlert size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-red-300' : 'text-red-900'}`}>View your BCID?</h3>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Are you sure you want to view your BCID?
                  </p>
                  <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${darkMode ? 'bg-red-900/30 text-red-300 border border-red-800/50' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>
                      Please be aware that sharing your BCID doesn&apos;t just compromise your own data — it can put your
                      connections and the entire Aselius platform at risk from hackers or malicious developers. Never share it
                      with anyone. Only your cloudhandle should ever be shared.
                    </span>
                  </div>
                </div>
                <div className={`flex items-center justify-end gap-3 p-6 border-t ${darkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                  <button
                    onClick={() => setShowBcidConfirm(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setShowCloudId(true); setShowBcidConfirm(false); }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Yes, show my BCID
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Beunec Cloud Handle</label>
          <input
            type="text"
            value={localProfile.cloudhandle || ''}
            disabled
            className={`w-full px-4 py-3 rounded-lg border 
      ${darkMode
                ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed placeholder-gray-500'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            placeholder="Your unique ID"
          />
        </div>

        {/* Custom Cloudhandle Domain — Essential plan feature. Your real
            cloudhandle above never changes; this is a display alias shown
            to others across the platform (sharing, teams, messages). */}
        <div className={`md:col-span-2 rounded-xl p-4 sm:p-5 border ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-1">
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Custom Cloudhandle Domain
            </label>
            {!isEssential && (
              <span className="self-start text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap">
                Essential plan required
              </span>
            )}
          </div>
          <p className={`text-xs mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Keep your username, swap the domain — e.g. <span className="font-mono">{realUsername || 'you'}@openai.com</span>.
            Shown wherever your cloudhandle appears to others. You can customize once every 3 days. Reverts automatically if you leave Essential.
          </p>
          {!isEssential ? (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Upgrade to Essential in Billing to customize your cloudhandle domain. Base and Pro plans do not include this feature.
              {currentAlias && (
                <span className="block mt-1 text-amber-600 dark:text-amber-400">
                  Your alias ({currentAlias}) was cleared when your plan changed.
                </span>
              )}
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-stretch gap-2 min-w-0">
                <div className={`flex items-center px-3 py-2 rounded-lg border text-sm font-mono flex-shrink-0 max-w-[40%] truncate ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-400' : '!bg-canvas border-gray-300 text-gray-500'}`}>
                  {realUsername || 'you'}
                </div>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="@openai.com"
                  disabled={savingDomain || coolingDown}
                  className={`flex-1 min-w-0 px-4 py-2 rounded-lg border text-sm font-mono ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : '!bg-canvas border-gray-300 text-black placeholder-gray-400'} disabled:opacity-60`}
                />
              </div>
              <div className="flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={handleSaveDomain}
                  disabled={savingDomain || coolingDown}
                  className="px-4 py-2 text-sm font-medium text-white bg-primaryBlue rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {savingDomain ? 'Saving…' : 'Save'}
                </button>
                {currentAlias && (
                  <button
                    type="button"
                    onClick={handleRevertDomain}
                    disabled={savingDomain}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    Revert
                  </button>
                )}
              </div>
              {coolingDown && cooldownEnd && (
                <p className={`text-xs flex items-center gap-1.5 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                  <Clock size={12} />
                  Cooldown active — you can customize again on{' '}
                  {cooldownEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}.
                </p>
              )}
            </div>
          )}
          {currentAlias && (
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Currently shown as: <span className="font-mono font-medium">{currentAlias}</span>
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tagline</label>
          <input
            type="text"
            value={localProfile.tagline || ''}
            onChange={e => setLocalProfile({ ...localProfile, tagline: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'} transition-all duration-200`}
            placeholder="Your professional tagline"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
          <input
            type="email"
            value={localProfile.email || ''}
            disabled
            className={`w-full px-4 py-3 rounded-lg border 
      ${darkMode
                ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed placeholder-gray-500'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Professional Level</label>
          <select
            value={localProfile.professionalLevel || ''}
            onChange={e => setLocalProfile({ ...localProfile, professionalLevel: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="">Select</option>
            <option>Entry Level</option>
            <option>Mid Level</option>
            <option>Senior Level</option>
            <option>Student</option>
            <option>Freelancer</option>
            <option>Consultant</option>
            <option>Doctor</option>
            <option>Investor</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
          <input
            type="text"
            value={localProfile.location || ''}
            onChange={e => setLocalProfile({ ...localProfile, location: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'} transition-all duration-200`}
            placeholder="City, Country"
          />
        </div>
        <div>
          <DatePicker
            label="Date of Birth"
            value={localProfile.dob || ''}
            onChange={(v) => setLocalProfile({ ...localProfile, dob: v })}
            placeholder="Select date of birth"
            darkMode={darkMode}
            max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
          />
        </div>
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Company/Organization</label>
          <input
            type="text"
            value={localProfile.company || ''}
            onChange={e => setLocalProfile({ ...localProfile, company: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'} transition-all duration-200`}
            placeholder="Where you work"
          />
        </div>
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
          <textarea
            rows={4}
            value={localProfile.bio || ''}
            onChange={e => setLocalProfile({ ...localProfile, bio: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'} transition-all duration-200 resize-none`}
            placeholder="Tell us about yourself..."
          />
        </div>
      </motion.div>

      {/* Experience Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Briefcase size={20} />
              <span>Experience</span>
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Add roles others can see on your profile. Changes save immediately.
            </p>
          </div>
          <motion.button
            onClick={() => setShowExperienceForm(true)}
            className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap bg-primaryBlue text-white rounded-lg font-medium"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={14} />
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add Experience</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {showExperienceForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`${darkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-gray-50 border border-gray-200'} rounded-xl p-6 space-y-4`}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingExperience !== null ? 'Edit Experience' : 'Add New Experience'}
                </h4>
                <button onClick={resetExperienceForm} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`block text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Job title</label>
                    <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {countWords(experienceForm.jobTitle)}/{EXPERIENCE_LIMITS.jobTitleWords} words
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={experienceForm.jobTitle}
                    onChange={(e) => setExperienceForm({
                      ...experienceForm,
                      jobTitle: clampToWordLimit(e.target.value, EXPERIENCE_LIMITS.jobTitleWords),
                    })}
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : '!bg-canvas border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Employment type</label>
                  <select value={experienceForm.employmentType} onChange={e => setExperienceForm({ ...experienceForm, employmentType: e.target.value })} className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : '!bg-canvas border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Freelance</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Work setting</label>
                  <select value={experienceForm.workplaceType} onChange={e => setExperienceForm({ ...experienceForm, workplaceType: e.target.value })} className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : '!bg-canvas border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}>
                    <option>On-site</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`block text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Company</label>
                    <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {countWords(experienceForm.company)}/{EXPERIENCE_LIMITS.companyWords} words
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Company name"
                    value={experienceForm.company}
                    onChange={(e) => setExperienceForm({
                      ...experienceForm,
                      company: clampToWordLimit(e.target.value, EXPERIENCE_LIMITS.companyWords),
                    })}
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : '!bg-canvas border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`block text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location</label>
                    <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {countWords(experienceForm.location)}/{EXPERIENCE_LIMITS.locationWords} words
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="City, Country"
                    value={experienceForm.location}
                    onChange={(e) => setExperienceForm({
                      ...experienceForm,
                      location: clampToWordLimit(e.target.value, EXPERIENCE_LIMITS.locationWords),
                    })}
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : '!bg-canvas border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <MonthYearPicker
                  label="Start date"
                  value={experienceForm.startDate}
                  onChange={(v) => setExperienceForm({ ...experienceForm, startDate: v })}
                  placeholder="Select start month"
                  darkMode={darkMode}
                  allowClear={false}
                />
                <div className="space-y-2">
                  <MonthYearPicker
                    label="End date"
                    value={experienceForm.endDate}
                    onChange={(v) => setExperienceForm({ ...experienceForm, endDate: v })}
                    placeholder="Present / select end month"
                    darkMode={darkMode}
                    allowClear
                  />
                  <label className={`inline-flex items-center gap-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <input
                      type="checkbox"
                      checked={!experienceForm.endDate}
                      onChange={(e) => setExperienceForm({
                        ...experienceForm,
                        endDate: e.target.checked ? '' : (experienceForm.endDate || experienceForm.startDate),
                      })}
                      className="rounded border-gray-400"
                    />
                    I currently work here
                  </label>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`block text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Skills</label>
                    <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {experienceSkills.length}/{EXPERIENCE_LIMITS.maxSkills} · {EXPERIENCE_LIMITS.skillWords} words each
                    </span>
                  </div>
                  <div className={`rounded-lg border px-3 py-2 min-h-[48px] ${darkMode ? 'bg-gray-900 border-gray-700' : '!bg-canvas border-gray-300'}`}>
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {experienceSkills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-primaryBlue/15 text-primaryBlue">
                          {skill}
                          <button type="button" onClick={() => removeSkillChip(skill)} className="hover:opacity-70" aria-label={`Remove ${skill}`}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={skillDraft}
                      onChange={(e) => setSkillDraft(clampToWordLimit(e.target.value, EXPERIENCE_LIMITS.skillWords))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          addSkillChip(skillDraft);
                        } else if (e.key === 'Backspace' && !skillDraft && experienceSkills.length) {
                          removeSkillChip(experienceSkills[experienceSkills.length - 1]);
                        }
                      }}
                      onBlur={() => addSkillChip(skillDraft)}
                      placeholder={experienceSkills.length ? 'Add another skill' : 'Type a skill and press Enter'}
                      className={`w-full bg-transparent outline-none text-sm py-1 ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description</label>
                  <span className={`text-[10px] ${countWords(experienceForm.description) >= EXPERIENCE_LIMITS.descriptionWords ? 'text-amber-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {countWords(experienceForm.description)}/{EXPERIENCE_LIMITS.descriptionWords} words
                  </span>
                </div>
                <textarea
                  placeholder="What did you work on?"
                  value={experienceForm.description}
                  onChange={(e) => setExperienceForm({
                    ...experienceForm,
                    description: clampToWordLimit(e.target.value, EXPERIENCE_LIMITS.descriptionWords),
                  })}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : '!bg-canvas border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                />
              </div>
              <div className="flex space-x-3">
                <motion.button
                  onClick={editingExperience !== null ? handleUpdateExperience : handleAddExperience}
                  className="flex items-center space-x-2 px-4 py-2 bg-primaryBlue text-white rounded-lg font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save size={16} />
                  <span>{editingExperience !== null ? 'Update & save' : 'Save experience'}</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {(localProfile.experiences || []).length === 0 && (
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No experience added yet.</p>
          )}
          {(localProfile.experiences || []).map((exp: any, idx: number) => (
            <motion.div key={`${exp.jobTitle}-${exp.company}-${idx}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className={`${darkMode ? 'bg-gray-800 border-gray-700' : '!bg-canvas border-gray-200'} border rounded-xl p-6 space-y-3`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex space-x-4 min-w-0">
                  <div className="p-2 bg-primaryBlue/10 rounded-lg shrink-0">
                    <Building size={20} className="text-primaryBlue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{exp.jobTitle}</h4>
                    <p className="text-primaryBlue font-medium">{exp.company}</p>
                    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      <span className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>
                          {formatMonthYear(exp.startDate) || exp.startDate || '—'}
                          {' – '}
                          {exp.endDate ? (formatMonthYear(exp.endDate) || exp.endDate) : 'Present'}
                        </span>
                      </span>
                      {exp.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{exp.location}</span>
                        </span>
                      )}
                      {exp.workplaceType && (
                        <span className={`px-2 py-1 ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100'} rounded text-xs`}>{exp.workplaceType}</span>
                      )}
                      {exp.employmentType && (
                        <span className={`px-2 py-1 ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100'} rounded text-xs`}>{exp.employmentType}</span>
                      )}
                    </div>
                    {exp.description && (
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2 whitespace-pre-wrap`}>{exp.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(exp.skills || []).map((skill: string, i: number) => (
                        <span key={`${skill}-${i}`} className="px-2 py-1 bg-primaryBlue/10 text-primaryBlue rounded-md text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <motion.button onClick={() => handleEditExperience(exp, idx)} className="p-2 text-gray-400 hover:text-primaryBlue" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Edit3 size={16} />
                  </motion.button>
                  <motion.button onClick={() => handleDeleteExperience(idx)} className="p-2 text-gray-400 hover:text-red-600" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Social Links Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Link2 size={20} />
              <span>Social Links</span>
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Add profiles others can open from your public card. Changes save immediately.
            </p>
          </div>
          <motion.button
            onClick={() => setShowSocialForm(true)}
            className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap bg-primaryBlue text-white rounded-lg font-medium"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={14} />
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add Link</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {showSocialForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`${darkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-gray-50 border border-gray-200'} rounded-xl p-6 space-y-4`}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingSocialLink !== null ? 'Edit Social Link' : 'Add New Social Link'}
                </h4>
                <button onClick={resetSocialForm} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Choose a platform
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {SOCIAL_PLATFORMS.map((p) => {
                      const selected =
                        socialForm.platform === p.id ||
                        (p.id === 'Other' &&
                          !!socialForm.platform &&
                          !SOCIAL_PLATFORMS.some((sp) => sp.id === socialForm.platform));
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSocialForm({ ...socialForm, platform: p.id })}
                          className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-all ${
                            selected
                              ? 'border-primaryBlue bg-primaryBlue/15 ring-1 ring-primaryBlue/40'
                              : darkMode
                                ? 'border-gray-700 bg-gray-900 hover:border-gray-500'
                                : 'border-gray-200 !bg-canvas hover:border-gray-300'
                          }`}
                        >
                          <SocialPlatformIcon platform={p.id} className="h-5 w-5" />
                          <span className={`text-[10px] font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {p.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {(socialForm.platform === 'Other' ||
                  (!!socialForm.platform && !SOCIAL_PLATFORMS.some((p) => p.id === socialForm.platform))) && (
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Custom platform name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Behance"
                      value={socialForm.platform === 'Other' ? '' : socialForm.platform}
                      onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value || 'Other' })}
                      className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : '!bg-canvas border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                )}
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>URL</label>
                  <input
                    type="url"
                    placeholder={
                      SOCIAL_PLATFORMS.find((p) => p.id === socialForm.platform)?.hint || 'https://'
                    }
                    value={socialForm.url}
                    onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : '!bg-canvas border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <motion.button
                  onClick={editingSocialLink !== null ? handleUpdateSocialLink : handleAddSocialLink}
                  className="flex items-center space-x-2 px-4 py-2 bg-primaryBlue text-white rounded-lg font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save size={16} />
                  <span>{editingSocialLink !== null ? 'Update & save' : 'Save link'}</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(localProfile.socialLinks || []).length === 0 && (
            <p className={`text-sm md:col-span-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No social links added yet.</p>
          )}
          {(localProfile.socialLinks || []).map((link: any, idx: number) => (
            <motion.div key={`${link.platform}-${idx}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className={`${darkMode ? 'bg-gray-800 border-gray-700' : '!bg-canvas border-gray-200'} border rounded-xl p-4 flex items-center justify-between gap-3`}>
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`p-2.5 rounded-xl shrink-0 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <SocialPlatformIcon platform={link.platform} className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{link.platform}</p>
                  <a href={link.url} target="_blank" rel="noreferrer" className={`text-sm truncate block max-w-[220px] hover:underline ${darkMode ? 'text-blue-300' : 'text-primaryBlue'}`}>
                    {link.url}
                  </a>
                </div>
              </div>
              <div className="flex space-x-2 shrink-0">
                <motion.button onClick={() => handleEditSocialLink(link, idx)} className="p-2 text-gray-400 hover:text-primaryBlue" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Edit3 size={14} />
                </motion.button>
                <motion.button onClick={() => handleDeleteSocialLink(idx)} className="p-2 text-gray-400 hover:text-red-600" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Privacy Settings Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-6">
        <div>
          <h3 className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Settings size={20} />
            <span>Privacy Settings</span>
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Control who can see your profile</p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-4 sm:p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <User size={20} className="text-green-600" />
              </div>
              <div className="min-w-0">
                <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Make profile public</h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>When enabled, other users can find and view your profile</p>
              </div>
            </div>
            <ThemeToggle
              enabled={!!localProfile.isPublic}
              onChange={() => setLocalProfile({ ...localProfile, isPublic: !localProfile.isPublic })}
              label="Make profile public"
            />
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div className={`flex flex-wrap gap-4 pt-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <motion.button
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primaryBlue to-[#003366] text-white rounded-lg font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Wallet size={20} />
          <span>Add to Wallet</span>
        </motion.button>
        <motion.button
          className={`flex items-center space-x-2 px-6 py-3 ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'} rounded-lg font-medium`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <QrCode size={20} />
          <span>Show QR Code</span>
        </motion.button>
        <motion.button
          onClick={handleSaveProfile}
          disabled={saving || !isProfileChanged()}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium
    ${saving || !isProfileChanged()
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-primaryBlue text-white'}
  `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Save size={20} />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

function PreferencesTab() {
  const cloudHandle = useCloudHandle();
  const { darkMode, toggleDarkMode, showAIChatButton, toggleAIChatButton } = useStore();
  const [saving, setSaving] = useState(false);

  const { data: profile, isLoading, error, refetch } = useSettingsProfileQuery('preferences');
  // Local preferences state
  const [language, setLanguage] = useState('English');
  const [aiDataRetention, setAiDataRetention] = useState(true);
  const [originalPreferences, setOriginalPreferences] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setLanguage(profile.preferences?.language || 'English');
      setAiDataRetention(profile.preferences?.aiDataRetention ?? true);
      setOriginalPreferences({
        darkMode,
        language: profile.preferences?.language || 'English',
        aiDataRetention: profile.preferences?.aiDataRetention ?? true,
        showAIChatButton,
      });
    }
  }, [profile, darkMode]);

  function isPreferencesChanged() {
    if (!originalPreferences) return false;
    return (
      darkMode !== originalPreferences.darkMode ||
      language !== originalPreferences.language ||
      aiDataRetention !== originalPreferences.aiDataRetention
    );
  }

  const mutation = useMutation({
    mutationFn: (prefs: any) => {
      const handle = profile?.cloudhandle || cloudHandle;
      if (!handle) throw new Error('Cloud handle not found');
      return updateUserProfile(handle, { preferences: prefs });
    },
    onSuccess: () => {
      toast.success('Saved successfully!');
      refetch();
    },
    onError: () => {
      toast.error('Failed to save preferences');
    }
  });

  const handleSave = async () => {
    await mutation.mutateAsync({
      darkMode,
      language,
      aiDataRetention,
    });
  };



  if (error) return <div className="text-red-500">{error.message}</div>;
  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading preferences">
        <div className="space-y-2">
          <div className={`h-8 w-48 rounded animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-4 w-64 max-w-full rounded animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
        </div>
        <div className={`h-32 rounded-xl animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
        <div className={`h-32 rounded-xl animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Preferences</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customize your Beunec Cloud experience</p>
      </div>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Appearance */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-6`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primaryBlue/10 rounded-lg">
              {darkMode ? <Moon size={20} className="text-primaryBlue" /> : <Sun size={20} className="text-primaryBlue" />}
            </div>
            <div>
              <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Appearance</h3>
              <p className="text-sm text-gray-500">Choose your preferred theme</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['Light', 'Dark'].map((theme) => (
              <motion.button
                key={theme}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${(theme === 'Dark' && darkMode)
                  ? 'border-primaryBlue bg-[#001133] text-blue-200'
                  : (theme === 'Light' && !darkMode)
                    ? 'border-primaryBlue bg-primaryBlue/5 text-primaryBlue'
                    : `${darkMode ? 'border-gray-700 bg-gray-800 text-gray-200 hover:border-gray-500' : 'border-gray-200 !bg-canvas text-gray-700 hover:border-gray-300'}`
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (theme === 'Dark') toggleDarkMode(true);
                  if (theme === 'Light') toggleDarkMode(false);
                  // System theme can be handled as needed
                }}
              >
                {theme}
              </motion.button>
            ))}
          </div>
        </div>
        {/* Language */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-6`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Language</h3>
              <p className="text-sm text-gray-500">Select your preferred language</p>
            </div>
          </div>
          <select
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
            <option>Japanese</option>
          </select>
        </div>

        {/* AI Data Retention */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2 bg-primaryBlue/10 rounded-lg flex-shrink-0">
                <Database size={20} className="text-primaryBlue" />
              </div>
              <div className="min-w-0">
                <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Data Retention</h3>
                <p className="text-sm text-gray-500">Allow AI to learn from your interactions</p>
              </div>
            </div>
            <ThemeToggle
              enabled={!!aiDataRetention}
              onChange={() => setAiDataRetention(!aiDataRetention)}
              label="AI Data Retention"
            />
          </div>
        </div>

        {/* AI Chat Assistant Button */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <MessageCircle size={20} className="text-purple-600" />
              </div>
              <div className="min-w-0">
                <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Chat Assistant</h3>
                <p className="text-sm text-gray-500">Show 'Ask Beunec Cloud' button on screen</p>
              </div>
            </div>
            <ThemeToggle
              enabled={!!showAIChatButton}
              onChange={() => toggleAIChatButton()}
              label="AI Chat Assistant"
            />
          </div>
        </div>
        <div>
          <motion.button
            onClick={handleSave}
            disabled={saving || !isPreferencesChanged()}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium
            ${saving || !isPreferencesChanged()
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-primaryBlue text-white'}
          `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save size={20} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function NotificationsTab() {
  const { darkMode } = useStore();
  const [saving, setSaving] = useState(false);
  const { loading: cloudHandleLoading } = useCloudHandleContext();

  type NotificationKey = 'updates' | 'messages' | 'marketing';

  const { data: notificationPrefs, isLoading: prefsLoading, error: prefsError, refetch: refetchPrefs } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: () => getNotificationPreferences(),
    enabled: !cloudHandleLoading,
    staleTime: 1000 * 60 * 5,
  });

  const { data: profile, isLoading, error, refetch } = useSettingsProfileQuery('notifications');

  // Local state for editing
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    updates: true,
    messages: true,
    marketing: false,
  });
  const [originalNotifications, setOriginalNotifications] = useState<Record<NotificationKey, boolean> | null>(null);

  useEffect(() => {
    if (profile && notificationPrefs) {
      const loadedNotifications = {
        updates: profile.notifications?.updates ?? true,
        messages: notificationPrefs.emailNotificationsEnabled ?? true, // From NotificationPreferences API
        marketing: profile.notifications?.marketing ?? false,
      };
      setNotifications(loadedNotifications);
      setOriginalNotifications(loadedNotifications);
    }
  }, [profile, notificationPrefs]);

  function isNotificationsChanged() {
    if (!originalNotifications) return false;
    return Object.keys(notifications).some(
      key => notifications[key as NotificationKey] !== originalNotifications[key as NotificationKey]
    );
  }
  const toggleNotification = (key: NotificationKey) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const mutation = useMutation({
    mutationFn: async (notifs: Record<NotificationKey, boolean>) => {
      // Save emailNotificationsEnabled to backend notifications API
      return await updateNotificationPreferences(notifs.messages);
    },
    onSuccess: () => {
      toast.success('Saved successfully!');
      setOriginalNotifications({ ...notifications });
      refetch();
      refetchPrefs(); // Refetch notification preferences
    },
    onError: () => {
      toast.error('Failed to save notification settings');
    }
  });

  const handleSave = async () => {
    await mutation.mutateAsync(notifications);
  };




  const notificationTypes: { key: NotificationKey; label: string; desc: string; icon: any }[] = [
    { key: 'updates', label: 'Product Updates', desc: 'New features and improvements', icon: RefreshCw },
    { key: 'marketing', label: 'Marketing', desc: 'Newsletter and promotional content', icon: Smartphone }
  ];

  if (error || prefsError) return <div className="text-red-500">{(error || prefsError)?.message || 'Failed to load notifications'}</div>;
  if (isLoading || prefsLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading notifications">
        <div className="space-y-2">
          <div className={`h-8 w-48 rounded animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-4 w-64 max-w-full rounded animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
        </div>
        <div className={`h-16 rounded-xl animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
        <div className={`h-16 rounded-xl animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
        <div className={`h-16 rounded-xl animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage how you receive notifications</p>
      </div>
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {notificationTypes.map((type, index) => {
          const Icon = type.icon;
          return (
            <motion.div
              key={type.key}
              className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-6`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{type.label}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{type.desc}</p>
                  </div>
                </div>
                <ThemeToggle
                  enabled={!!notifications[type.key]}
                  onChange={() => toggleNotification(type.key)}
                  label={type.label}
                />
              </div>
            </motion.div>
          );
        })}
        <div>
          <button
            onClick={handleSave}
            disabled={mutation.isPending || !isNotificationsChanged()}
            className={`px-6 py-3 rounded-lg font-medium
              ${mutation.isPending || !isNotificationsChanged()
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white'}
             `}
          >
            {mutation.isPending ? 'Saving...' : 'Save Notification Settings'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function SystemTab() {
  const cloudHandle = useCloudHandle();
  const { darkMode } = useStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showFarewell, setShowFarewell] = useState(false);
  const [farewellCountdown, setFarewellCountdown] = useState(15);

  const { data: profile, isLoading, error } = useSettingsProfileQuery('system');
  const accountCloudHandle = profile?.cloudhandle || cloudHandle;

  const handleSignOut = () => {
    window.location.href = '/auth/logout';
  };

  // Delete account handler — calls the Next.js proxy route
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== accountCloudHandle) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const accessToken = await getAccessToken();
      const res = await fetch('/api/user-profiles/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok || res.status === 207) {
        // Show farewell overlay instead of a tiny toast
        setShowDeleteModal(false);
        setShowFarewell(true);
        localStorage.clear();
        sessionStorage.clear();
        // Clear onboarding cookie so re-signup goes through onboarding
        document.cookie = 'onboarding_complete=; Max-Age=0; path=/;';
        document.cookie = 'onboarding_complete=; Max-Age=0; path=/; secure;';

        // Countdown timer
        let count = 15;
        setFarewellCountdown(count);
        const interval = setInterval(() => {
          count--;
          setFarewellCountdown(count);
          if (count <= 0) {
            clearInterval(interval);
            window.location.href = '/auth/logout';
          }
        }, 1000);
      } else {
        setDeleteError(data.error || 'Failed to delete account. Please try again.');
        setIsDeleting(false);
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Network error. Please try again.');
      setIsDeleting(false);
    }
  };

  if (error) return <div className="text-red-500">Failed to load system info</div>;
  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading system">
        <div className="space-y-2">
          <div className={`h-8 w-48 rounded animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-4 w-64 max-w-full rounded animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
        </div>
        <div className={`h-32 rounded-xl animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
        <div className={`h-32 rounded-xl animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>System</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Account management and system options</p>
      </div>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Support */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-6`}>
          <motion.button
            className="flex items-center space-x-3 text-blue-600 font-medium"
            whileHover={{ x: 5 }}
            onClick={() => window.open('mailto:support@beunec.com')}
          >
            <HelpCircle size={20} />
            <span>Contact Support</span>
          </motion.button>
        </div>

        {/* Account Info */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-6`}>
          <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Information</h3>
          <div className={`${darkMode ? 'bg-gray-800 border-gray-800' : '!bg-canvas border-gray-200'} rounded-lg p-4 border`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You are signed in as:</p>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profile?.email || 'Unknown'}</p>
          </div>
        </div>

        {/* Sign Out Options */}
        <div className="space-y-3">
          <motion.button
            className={`w-full flex items-center justify-between p-4 rounded-xl font-medium transition-colors ${darkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-800' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            whileHover={{ x: 5 }}
            onClick={handleSignOut}
          >
            <div className="flex items-center space-x-3">
              <LogOut size={20} />
              <span>Sign Out</span>
            </div>
          </motion.button>
        </div>

        {/* Danger Zone */}
        <div className={`border-2 rounded-xl p-6 ${darkMode ? 'border-red-900 bg-red-950' : 'border-red-200 bg-red-50'}`}>
          <h3 className={`font-semibold mb-2 ${darkMode ? 'text-red-300' : 'text-red-900'}`}>Danger Zone</h3>
          <p className={`text-sm mb-4 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <motion.button
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium"
            whileHover={{ scale: 1.02, backgroundColor: '#dc2626' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(null); }}
          >
            <Trash2 size={16} />
            <span>Delete Account</span>
          </motion.button>
        </div>

        {/* Delete Account Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
              onClick={() => !isDeleting && setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                data-settings-surface
                className={`max-w-md w-full rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-900 border border-gray-800' : '!bg-canvas surface-canvas'}`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className={`p-6 border-b ${darkMode ? 'border-gray-800 bg-red-950/50' : 'border-red-100 bg-red-50'}`}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-600 rounded-lg">
                      <Trash2 size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-red-300' : 'text-red-900'}`}>Delete Account</h3>
                      <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>This action is permanent</p>
                    </div>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    This will permanently delete:
                  </p>
                  <ul className={`text-sm space-y-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li className="flex items-center space-x-2"><span>•</span><span>Your profile and account data</span></li>
                    <li className="flex items-center space-x-2"><span>•</span><span>All messages and conversations</span></li>
                    <li className="flex items-center space-x-2"><span>•</span><span>Documents, files, and shared items</span></li>
                    <li className="flex items-center space-x-2"><span>•</span><span>Network connections</span></li>
                    <li className="flex items-center space-x-2"><span>•</span><span>Stripe subscription and billing data</span></li>
                    <li className="flex items-center space-x-2"><span>•</span><span>All notifications and preferences</span></li>
                  </ul>

                  {deleteError && (
                    <div className={`p-3 rounded-lg text-sm ${darkMode ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                      {deleteError}
                    </div>
                  )}

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Type <span className="font-bold text-red-500">{accountCloudHandle}</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Enter your cloudhandle"
                      disabled={isDeleting}
                      className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${darkMode
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                        : '!bg-canvas surface-canvas border-gray-300 text-black placeholder-gray-400'
                        } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className={`flex items-center justify-end gap-3 p-6 border-t ${darkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== accountCloudHandle || isDeleting}
                    className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${deleteConfirmText === accountCloudHandle && !isDeleting
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      }`}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete My Account'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* ── Farewell Banner ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showFarewell && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[420px] max-w-[90vw] rounded-xl shadow-2xl border px-5 py-4 ${darkMode
              ? 'bg-gray-900/95 border-gray-700/50 backdrop-blur-md'
              : '!bg-canvas/95 surface-canvas border-gray-200 backdrop-blur-md'
              }`}
          >
            {/* X Close */}
            <button
              onClick={() => { window.location.href = '/auth/logout'; }}
              className={`absolute top-3 right-3 p-1 rounded-full transition-all hover:scale-110 ${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-800'
                }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="flex items-start gap-3">
              {/* Checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 240, damping: 30 }}
                className="mt-0.5 w-9 h-9 min-w-[36px] rounded-full flex items-center justify-center bg-emerald-500"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>

              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Account deleted successfully
                </h3>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your data has been permanently removed.{' '}
                  <a href="mailto:support@beunec.com" className="underline hover:text-emerald-500 transition-colors">
                    Feedback?
                  </a>
                </p>
                <p className={`text-[11px] mt-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  Redirecting in {farewellCountdown}s...
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className={`mt-3 h-[3px] rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <motion.div
                className="h-full rounded-full bg-emerald-500"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 15, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BillingTab() {
  const cloudHandle = useCloudHandle();
  const { darkMode } = useStore();
  const [saving, setSaving] = useState(false);

  const { data: profile, isLoading, error, refetch } = useSettingsProfileQuery('billing');

  // Local billing state
  const [plan, setPlan] = useState('Free');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [originalBilling, setOriginalBilling] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setPlan(profile.billing?.plan || 'Free');
      setCardNumber(profile.billing?.cardNumber || '');
      setExpiry(profile.billing?.expiry || '');
      setBillingAddress(profile.billing?.billingAddress || '');
      setInvoiceEmail(profile.billing?.invoiceEmail || '');
      setOriginalBilling({
        plan: profile.billing?.plan || 'Free',
        cardNumber: profile.billing?.cardNumber || '',
        expiry: profile.billing?.expiry || '',
        billingAddress: profile.billing?.billingAddress || '',
        invoiceEmail: profile.billing?.invoiceEmail || '',
      });
    }
  }, [profile]);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleManageBilling = async () => {
    setLoadingPortal(true);
    try {
      const { url } = await paymentAPI.createCustomerPortalSession();
      window.location.href = url;
    } catch (err) {
      toast.error('Could not open billing portal');
    } finally {
      setLoadingPortal(false);
    }
  };

  function isBillingChanged() {
    if (!originalBilling) return false;
    return (
      plan !== originalBilling.plan ||
      cardNumber !== originalBilling.cardNumber ||
      expiry !== originalBilling.expiry ||
      billingAddress !== originalBilling.billingAddress ||
      invoiceEmail !== originalBilling.invoiceEmail
    );
  }


  // Save billing info mutation
  const mutation = useMutation({
    mutationFn: async () => {
      const handle = profile?.cloudhandle || cloudHandle;
      if (!handle) throw new Error('Cloud handle not found');
      await updateUserProfile(handle, {
        billing: { plan, cardNumber, expiry, billingAddress, invoiceEmail }
      });
    },
    onSuccess: () => {
      setOriginalBilling({ plan, cardNumber, expiry, billingAddress, invoiceEmail });
      toast.success('Saved successfully!');
      refetch();
    },
    onError: () => {
      toast.error('Failed to update billing info');
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Trim and validate fields
    const trimmedCard = cardNumber.replace(/\s+/g, '');
    const trimmedEmail = invoiceEmail.trim();
    const trimmedAddress = billingAddress.trim();

    if (!/^\d{16}$/.test(trimmedCard)) {
      toast.error('Card number must be 16 digits');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      toast.error('Expiry must be in MM/YY format');
      return;
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error('Invalid email address');
      return;
    }

    setCardNumber(trimmedCard);
    setInvoiceEmail(trimmedEmail);
    setBillingAddress(trimmedAddress);

    mutation.mutate();
  };


  if (error) return <div className="text-red-500">Failed to load billing info</div>;
  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading billing">
        <div className="space-y-2">
          <div className={`h-8 w-48 rounded animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-4 w-64 max-w-full rounded animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
        </div>
        <div className={`h-12 w-64 rounded-lg animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        <div className={`h-40 rounded-xl animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Billing & Subscription</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage your subscription and billing information</p>
      </div>
      <button
        onClick={handleManageBilling}
        disabled={loadingPortal}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primaryBlue to-[#003366] text-white rounded-lg font-semibold shadow hover:from-primaryBlue/90 hover:to-[#002244] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primaryBlue focus:ring-offset-2 disabled:opacity-60"
        aria-busy={loadingPortal}
        aria-label="Navigate to Stripe Billing Portal"
      >
        {loadingPortal ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Wallet size={20} />
        )}
        {loadingPortal ? 'Redirecting...' : 'Manage Billing & Subscription'}
      </button>
      {/* <form className="space-y-6 max-w-xl" onSubmit={handleSave}>
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Subscription Plan</label>
          <select disabled
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            value={plan}
            onChange={e => setPlan(e.target.value)}
          >
            <option value="Free">Free</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Card Number</label>
          <input
            type="text"
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={e => setCardNumber(e.target.value)}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Expiry Date</label>
          <input
            type="text"
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="MM/YY"
            value={expiry}
            onChange={e => setExpiry(e.target.value)}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Billing Address</label>
          <input
            type="text"
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Address"
            value={billingAddress}
            onChange={e => setBillingAddress(e.target.value)}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Invoice Email</label>
          <input
            type="email"
            className={`w-full px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="email@example.com"
            value={invoiceEmail}
            onChange={e => setInvoiceEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending || !isBillingChanged()}
          className={`px-6 py-3 rounded-lg font-medium
            ${mutation.isPending || !isBillingChanged()
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white'}
          `}
        >
          {mutation.isPending ? 'Saving...' : 'Update Billing'}
        </button>
      </form> */}
    </div>
  );
}