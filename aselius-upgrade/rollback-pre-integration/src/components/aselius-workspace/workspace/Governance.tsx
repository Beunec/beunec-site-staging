// src/components/workspace/Governance.tsx (Updated Aselius Version)

import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import { motion } from 'framer-motion';
import {
  Settings,
  Shield,
  Save,
} from 'lucide-react';
import WorkspaceSkeleton from '@/components/aselius-workspace/WorkspaceSkeleton';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/aselius/authStore';
import {
  governanceAPI, // Import the API functions
  type SystemInstructions,
  type ContentRestrictions,
  type GovernanceConfiguration
} from '../api/governance'; // Assuming this is the correct path to your API wrapper

interface GovernanceProps {
  workspaceId: string;
  readOnly?: boolean;
}

export const Governance: React.FC<GovernanceProps> = ({ workspaceId, readOnly = false }) => {
  // Use your existing Zustand auth store
  const { user, token, loading: authLoading } = useAuthStore();
  const userId = user?.bcid || null;

  // State remains the same as your new Governance.tsx
  const [systemInstructions, setSystemInstructions] = useState<SystemInstructions>({
    primary_role: '',
    specified_industry: '',
    behavioral_guidelines: '',
    response_format: ''
  });

  const [contentRestrictions, setContentRestrictions] = useState<ContentRestrictions>({
    prohibited_topics: '',
    content_filters: ''
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true); // Start loading true
  // Stores WHICH workspace's config was loaded, not just whether one was.
  // As a plain boolean this latched true after the first load and never reset,
  // so switching to another workspace kept showing the previous workspace's
  // governance config.
  const loadedWorkspaceRef = useRef<string | null>(null);

  // --- IMPLEMENTATION FROM Governance2.tsx ---
  const loadGovernanceConfiguration = useCallback(async () => {
    // Check moved inside useEffect trigger, but keep guard here too
    if (!userId || !workspaceId) {
      setLoading(false); // Stop loading if prerequisites aren't met
      return;
    }

    setLoading(true); // Start loading specifically for this fetch
    try {
      const config = await governanceAPI.getGovernanceConfiguration(workspaceId, token || undefined);

      // Check if fetched data is valid before setting state
      if (config && config.system_instructions && config.content_restrictions) {
        setSystemInstructions(config.system_instructions);
        setContentRestrictions(config.content_restrictions);
        if (config.id) {
          toast.success('Governance configuration loaded');
        }
        // Note: If no config.id, we don't show toast here - let the error handler show it if needed
      } else {
        // Handle case where API returns unexpected data but no error
        console.warn('LoadConfig: Received null or incomplete config from API', config);
        // Reset state to default empty values (no toast here, will show in catch if needed)
        setSystemInstructions({ primary_role: '', specified_industry: '', behavioral_guidelines: '', response_format: '' });
        setContentRestrictions({ prohibited_topics: '', content_filters: '' });
      }

    } catch (error) {
      console.error('LoadConfig: Failed:', error);
      if (error instanceof Error) {
        // Specific error messages
        if (error.message.includes('403') || error.message.toLowerCase().includes('access denied')) {
          toast.error('Access denied to this workspace\'s governance.');
        } else if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
          toast('No governance configuration found. Ready for setup.', { icon: 'ℹ️' });
          // Reset state to default empty values
          setSystemInstructions({ primary_role: '', specified_industry: '', behavioral_guidelines: '', response_format: '' });
          setContentRestrictions({ prohibited_topics: '', content_filters: '' });
        } else if (error.message.includes('500')) {
          // Database/server error - don't show "ready for setup" message
          toast.error('Server error loading governance configuration. Please contact support.');
        } else {
          toast.error(`Failed to load configuration: ${error.message}`);
        }
      } else {
        toast.error('An unknown error occurred while loading governance configuration.');
      }
      // Reset state on error to avoid showing stale data potentially
      setSystemInstructions({ primary_role: '', specified_industry: '', behavioral_guidelines: '', response_format: '' });
      setContentRestrictions({ prohibited_topics: '', content_filters: '' });
    } finally {
      setLoading(false); // Stop loading after attempt
    }
  }, [userId, workspaceId, token]); // Dependency array for useCallback

  // --- IMPLEMENTATION FROM Governance2.tsx ---
  const saveGovernanceConfiguration = async () => {
    if (readOnly) {
      toast.error('You have view-only access to governance settings.');
      return;
    }
    if (!userId || !workspaceId) {
      toast.error('Cannot save: User not authenticated or workspace missing.');
      return;
    }

    setSaving(true);
    try {
      const config: GovernanceConfiguration = {
        workspace_id: workspaceId,
        system_instructions: systemInstructions,
        content_restrictions: contentRestrictions
      };

      // Ensure data is not just empty strings before saving (optional validation)
      const hasInstructions = Object.values(config.system_instructions).some(val => val.trim() !== '');
      const hasRestrictions = Object.values(config.content_restrictions).some(val => val.trim() !== '');
      if (!hasInstructions && !hasRestrictions) {
        toast.error("Please fill in at least one governance field before saving.");
        setSaving(false);
        return;
      }


      const savedConfig = await governanceAPI.saveGovernanceConfiguration(workspaceId, config, token || undefined);
      toast.success('Governance configuration saved successfully!');
      // Optionally update state with saved config (if backend returns updated data)
      if (savedConfig.system_instructions && savedConfig.content_restrictions) {
        setSystemInstructions(savedConfig.system_instructions);
        setContentRestrictions(savedConfig.content_restrictions);
      }
    } catch (error) {
      console.error('SaveConfig: Failed:', error);
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.toLowerCase().includes('access denied')) {
          toast.error('Access denied: You may not have permission to save governance for this workspace.');
        } else if (error.message.toLowerCase().includes('invalid configuration')) {
          toast.error('Invalid data. Please check your inputs.');
        } else {
          toast.error(`Failed to save configuration: ${error.message}`);
        }
      } else {
        toast.error('An unknown error occurred while saving governance configuration.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Load config effect (structure kept from new Governance.tsx, calls the implemented function)
  useEffect(() => {
    // Only attempt load if auth is finished, user exists, workspaceId is provided, and hasn't loaded yet
    if (!authLoading && userId && workspaceId && loadedWorkspaceRef.current !== workspaceId) {
      loadedWorkspaceRef.current = workspaceId; // Mark THIS workspace as loaded
      loadGovernanceConfiguration();
    } else if (!authLoading && !userId) {
      // Auth finished with no user — stop loading so the auth-error state shows.
      setLoading(false);
    }
  }, [userId, workspaceId, authLoading]); // loadedWorkspaceRef guards duplicate calls per workspace

  // --- Conditional Rendering Logic (kept from new Governance.tsx) ---

  // Show loading while waiting for auth
  if (authLoading) {
    return <WorkspaceSkeleton variant="form" />;
  }

  // Show error if no user (after auth check)
  if (!userId) {
    return (
      <div className="h-full flex items-center justify-center !bg-canvas dark:!bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:!text-white mb-2 transition-colors duration-300">Authentication Required</h2>
          <p className="text-gray-600 dark:!text-gray-400 transition-colors duration-300">Please sign in to access governance settings.</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching config (after auth check)
  if (loading) {
    return <WorkspaceSkeleton variant="form" />;
  }

  // --- UI Rendering
  return (
    <div className="h-full flex flex-col !bg-canvas dark:!bg-gray-900 overflow-hidden transition-colors duration-300">
      {/* Fixed Header */}
      {/* dark:!bg-gray-900 to match the page body below. It was gray-800, which
          made the header a lighter band in dark mode while being identical to
          the body in light mode — the header/body relationship inverted
          between themes. */}
      <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 dark:!border-gray-700 !bg-canvas dark:!bg-gray-900 transition-colors duration-300">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:!text-white transition-colors duration-300">Workspace Governance</h2>
            <p className="text-sm text-gray-500 dark:!text-gray-400 mt-1 transition-colors duration-300">
              Configure AI behavior for: {workspaceId.slice(0, 8)}...
            </p>
          </div>
          {!readOnly && (
            <Button
              onClick={saveGovernanceConfiguration}
              loading={saving}
              icon={Save}
              disabled={loading}
              className="self-start whitespace-nowrap"
            >
              Save Configuration
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto !bg-canvas dark:!bg-gray-900 transition-colors duration-300">
        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* System Instructions */}
            <motion.div
              className="!bg-canvas dark:!bg-gray-800 border border-gray-200 dark:!border-gray-700 rounded-xl p-6 shadow-sm transition-colors duration-200"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:!bg-blue-900/30 rounded-lg flex items-center justify-center mr-4 transition-colors duration-300">
                  <Settings className="w-5 h-5 text-blue-600 dark:!text-blue-400 transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:!text-white transition-colors duration-300">System Instructions</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:!text-gray-300 transition-colors duration-300">
                      Primary Role Definition
                    </label>
                    <span className={`text-xs ${systemInstructions.primary_role.length > 2000 ? 'text-red-600 dark:!text-red-400 font-semibold' :
                      systemInstructions.primary_role.length > 1800 ? 'text-yellow-600 dark:!text-yellow-400' :
                        'text-gray-500 dark:!text-gray-400'
                      }`}>
                      {systemInstructions.primary_role.length}/2000
                    </span>
                  </div>
                  <textarea
                    readOnly={readOnly}
                    value={systemInstructions.primary_role}
                    onChange={(e) => setSystemInstructions(prev => ({ ...prev, primary_role: e.target.value }))}
                    placeholder="Define the AI's primary role and expertise areas (e.g., 'helpful assistant for software development')..."
                    maxLength={2000}
                    className="w-full px-3 py-2 !bg-canvas dark:!bg-gray-900 border border-gray-300 dark:!border-gray-600 rounded-lg text-gray-900 dark:!text-white placeholder-gray-400 dark:!placeholder-gray-500 focus:ring-2 focus:ring-[#00477d]/50 dark:focus:ring-[#00477d] focus:border-[#00477d] resize-none shadow-sm transition-all duration-300"
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:!text-gray-300 transition-colors duration-300">
                      Specified Industry
                    </label>
                    <span className={`text-xs ${systemInstructions.specified_industry.length > 500 ? 'text-red-600 dark:!text-red-400 font-semibold' :
                      systemInstructions.specified_industry.length > 450 ? 'text-yellow-600 dark:!text-yellow-400' :
                        'text-gray-500 dark:!text-gray-400'
                      }`}>
                      {systemInstructions.specified_industry.length}/500
                    </span>
                  </div>
                  <textarea
                    readOnly={readOnly}
                    value={systemInstructions.specified_industry}
                    onChange={(e) => setSystemInstructions(prev => ({ ...prev, specified_industry: e.target.value }))}
                    placeholder="Describe specific industries or domains this AI should focus on (e.g., 'healthcare technology', 'financial services')..."
                    maxLength={500}
                    className="w-full px-3 py-2 !bg-canvas dark:!bg-gray-900 border border-gray-300 dark:!border-gray-600 rounded-lg text-gray-900 dark:!text-white placeholder-gray-400 dark:!placeholder-gray-500 focus:ring-2 focus:ring-[#00477d]/50 dark:focus:ring-[#00477d] focus:border-[#00477d] resize-none shadow-sm transition-all duration-300"
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:!text-gray-300 transition-colors duration-300">
                      Behavioral Guidelines
                    </label>
                    <span className={`text-xs ${systemInstructions.behavioral_guidelines.length > 2000 ? 'text-red-600 dark:!text-red-400 font-semibold' :
                      systemInstructions.behavioral_guidelines.length > 1800 ? 'text-yellow-600 dark:!text-yellow-400' :
                        'text-gray-500 dark:!text-gray-400'
                      }`}>
                      {systemInstructions.behavioral_guidelines.length}/2000
                    </span>
                  </div>
                  <textarea
                    readOnly={readOnly}
                    value={systemInstructions.behavioral_guidelines}
                    onChange={(e) => setSystemInstructions(prev => ({ ...prev, behavioral_guidelines: e.target.value }))}
                    placeholder="Specify desired tone, communication style, level of formality, and interaction patterns (e.g., 'Be concise and professional', 'Ask clarifying questions')..."
                    maxLength={2000}
                    className="w-full px-3 py-2 !bg-canvas dark:!bg-gray-900 border border-gray-300 dark:!border-gray-600 rounded-lg text-gray-900 dark:!text-white placeholder-gray-400 dark:!placeholder-gray-500 focus:ring-2 focus:ring-[#00477d]/50 dark:focus:ring-[#00477d] focus:border-[#00477d] resize-none shadow-sm transition-all duration-300"
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:!text-gray-300 transition-colors duration-300">
                      Response Format Requirements
                    </label>
                    <span className={`text-xs ${systemInstructions.response_format.length > 500 ? 'text-red-600 dark:!text-red-400 font-semibold' :
                      systemInstructions.response_format.length > 450 ? 'text-yellow-600 dark:!text-yellow-400' :
                        'text-gray-500 dark:!text-gray-400'
                      }`}>
                      {systemInstructions.response_format.length}/500
                    </span>
                  </div>
                  <textarea
                    readOnly={readOnly}
                    value={systemInstructions.response_format}
                    onChange={(e) => setSystemInstructions(prev => ({ ...prev, response_format: e.target.value }))}
                    placeholder="Define required output structure, formatting, or presentation (e.g., 'Always provide code examples in markdown blocks', 'Summarize key points in bullets')..."
                    maxLength={500}
                    className="w-full px-3 py-2 !bg-canvas dark:!bg-gray-900 border border-gray-300 dark:!border-gray-600 rounded-lg text-gray-900 dark:!text-white placeholder-gray-400 dark:!placeholder-gray-500 focus:ring-2 focus:ring-[#00477d]/50 dark:focus:ring-[#00477d] focus:border-[#00477d] resize-none shadow-sm transition-all duration-300"
                    rows={3}
                  />
                </div>
              </div>
            </motion.div>

            {/* Content Restrictions */}
            <motion.div
              transition={{ delay: 0.1 }}
              className="!bg-canvas dark:!bg-gray-800 border border-gray-200 dark:!border-gray-700 rounded-xl p-6 shadow-sm transition-colors duration-200"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-100 dark:!bg-red-900/30 rounded-lg flex items-center justify-center mr-4 transition-colors duration-300">
                  <Shield className="w-5 h-5 text-red-600 dark:!text-red-400 transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:!text-white transition-colors duration-300">Content Restrictions</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:!text-gray-300 transition-colors duration-300">
                      Prohibited Topics (Keywords/Phrases)
                    </label>
                    <span className={`text-xs ${contentRestrictions.prohibited_topics.length > 1000 ? 'text-red-600 dark:!text-red-400 font-semibold' :
                      contentRestrictions.prohibited_topics.length > 900 ? 'text-yellow-600 dark:!text-yellow-400' :
                        'text-gray-500 dark:!text-gray-400'
                      }`}>
                      {contentRestrictions.prohibited_topics.length}/1000
                    </span>
                  </div>
                  <textarea
                    readOnly={readOnly}
                    value={contentRestrictions.prohibited_topics}
                    onChange={(e) => setContentRestrictions(prev => ({ ...prev, prohibited_topics: e.target.value }))}
                    placeholder="List topics, keywords, or themes the AI should avoid discussing, one per line (e.g., 'politics', 'personal opinions', 'specific competitors')..."
                    maxLength={1000}
                    className="w-full px-3 py-2 !bg-canvas dark:!bg-gray-900 border border-gray-300 dark:!border-gray-600 rounded-lg text-gray-900 dark:!text-white placeholder-gray-400 dark:!placeholder-gray-500 focus:ring-2 focus:ring-[#00477d]/50 dark:focus:ring-[#00477d] focus:border-[#00477d] resize-none shadow-sm transition-all duration-300"
                    rows={4}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:!text-gray-300 transition-colors duration-300">
                      Content Filters / Rules
                    </label>
                    <span className={`text-xs ${contentRestrictions.content_filters.length > 500 ? 'text-red-600 dark:!text-red-400 font-semibold' :
                      contentRestrictions.content_filters.length > 450 ? 'text-yellow-600 dark:!text-yellow-400' :
                        'text-gray-500 dark:!text-gray-400'
                      }`}>
                      {contentRestrictions.content_filters.length}/500
                    </span>
                  </div>
                  <textarea
                    readOnly={readOnly}
                    value={contentRestrictions.content_filters}
                    onChange={(e) => setContentRestrictions(prev => ({ ...prev, content_filters: e.target.value }))}
                    placeholder="Describe specific filtering rules (e.g., 'Do not generate harmful or unethical content', 'Avoid making financial recommendations', 'Do not disclose internal project names')..."
                    maxLength={500}
                    className="w-full px-3 py-2 !bg-canvas dark:!bg-gray-900 border border-gray-300 dark:!border-gray-600 rounded-lg text-gray-900 dark:!text-white placeholder-gray-400 dark:!placeholder-gray-500 focus:ring-2 focus:ring-[#00477d]/50 dark:focus:ring-[#00477d] focus:border-[#00477d] resize-none shadow-sm transition-all duration-300"
                    rows={4}
                  />
                </div>
              </div>
            </motion.div>

            {/* Spacer */}
            <div className="h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Removed default export if not needed
// export default Governance;