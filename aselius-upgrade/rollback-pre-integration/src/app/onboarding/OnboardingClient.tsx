'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  User,
  Hash,
  Calendar,
  Sparkles,
  Rocket,
  Shield,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { blockedUsernames } from './constants';
import { useRouter } from 'next/navigation';
import { markAuthUserOnboarded, createUserProfile, checkCloudHandleAvailability } from '@/utils/settingAPI';
import { syncUserToCloudflare } from '@/utils/syncUserToCloudflare';
import { useQueryClient } from '@tanstack/react-query';
import { BRAND_ICON_SRC } from '@/lib/brand';


interface OnboardingPageProps {
  auth0Id: string;
  email: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  domain: string;
}

interface ValidationState {
  isValidating: boolean;
  message: string;
}

interface UsernameValidation {
  isValid: boolean;
  error: string;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ auth0Id, email }) => {

  useEffect(() => {
  }, [auth0Id, email]);


  const queryClient = useQueryClient();

  // State management
  const [currentCard, setCurrentCard] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    username: '',
    domain: '@beunec.cloud'
  });

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({
    isValidating: false,
    message: ''
  });
  const [usernameValidation, setUsernameValidation] = useState<UsernameValidation>({
    isValid: true,
    error: ''
  });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const router = useRouter();

  // Username validation function
  const validateUsername = (username: string): UsernameValidation => {
    if (!username) {
      return { isValid: true, error: '' };
    }

    // Check minimum length
    if (username.length < 3) {
      return { isValid: false, error: 'Username must be at least 3 characters long' };
    }

    // Check alphanumeric only
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(username)) {
      return { isValid: false, error: 'Username can only contain letters and numbers' };
    }

    // Check against blocked usernames (case insensitive)
    if (blockedUsernames.includes(username.toLowerCase())) {
      return { isValid: false, error: 'This username is not available. Please choose a different one' };
    }

    return { isValid: true, error: '' };
  };

  // Debounce cloud handle validation
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Consolidated validation effect
  useEffect(() => {
    const { username, domain } = formData;

    // 1. Basic syntax validation
    const syntaxValidation = validateUsername(username);
    setUsernameValidation(syntaxValidation);

    if (!username) {
      setValidation({ isValidating: false, message: '' });
      return;
    }

    if (!syntaxValidation.isValid) {
      setValidation({ isValidating: false, message: '' });
      return;
    }

    // 2. Debounced API check
    setValidation({ isValidating: true, message: '' });

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const fullCloudHandle = `${username}${domain}`;
        const isAvailable = await checkCloudHandleAvailability(fullCloudHandle);

        setValidation({
          isValidating: false,
          message: isAvailable ? 'Cloud Handle available' : 'Cloud Handle taken'
        });
      } catch (error) {
        setValidation({
          isValidating: false,
          message: 'Error checking availability'
        });
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };

  }, [formData.username, formData.domain]);

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = (): void => {
    if (currentCard < 2) {
      setCurrentCard(prev => prev + 1);
    }
  };

  const handleBack = (): void => {
    if (currentCard > 0) {
      setCurrentCard(prev => prev - 1);
    }
  };

  // Helper: check if form is valid
  const isFormValid = (): boolean => {
    return (
      !!formData.firstName &&
      !!formData.lastName &&
      !!formData.username &&
      usernameValidation.isValid &&
      !validation.message.includes('taken')
    );
  };

  const handleAccessPortal = async () => {
    setIsOnboarding(true);
    const cloudhandle = `${formData.username}${formData.domain}`;

    try {
      // 1. Create UserProfile (POST)
      let profileRes;
      try {
        profileRes = await createUserProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          cloudhandle,
          email,
        });
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        if (errorMessage.includes('Email already exists')) {
          setErrorModal({ isOpen: true, message: 'This email is already registered.' });
        } else if (errorMessage.includes('Cloudhandle already exists')) {
          setErrorModal({ isOpen: true, message: 'This Cloudhandle is already registered.' });
        } else {
          setErrorModal({ isOpen: true, message: 'Error creating user profile.' });
        }
        return;
      }

      // 2. Sync User to Cloudflare
      try { await syncUserToCloudflare({ cloudhandle, auth0Id }); } catch (err) { }

      // 3. Mark onboarding complete - this is critical, don't silently ignore failures
      let onboardingMarked = false;
      try {
        await markAuthUserOnboarded(auth0Id, cloudhandle, profileRes._id);
        onboardingMarked = true;
      } catch (err) {
        // Retry once after a short delay
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await markAuthUserOnboarded(auth0Id, cloudhandle, profileRes._id);
          onboardingMarked = true;
        } catch (retryErr) {
          console.error('Failed to mark onboarding complete after retry:', retryErr);
        }
      }

      if (!onboardingMarked) {
        // Show error - don't send user to workspace with incomplete onboarding state
        setErrorModal({ isOpen: true, message: 'Could not finalize your account setup. Please try again.' });
        setIsOnboarding(false);
        return;
      }

      // Force a full hard reload of the application to completely wipe React Query,
      // CloudHandleContext state, and in-memory singletons, guaranteeing the frontend
      // boots up cleanly with the real cloudhandle instead of the __PENDING__ one.
      queryClient.clear();
      window.location.href = '/workspace';

    } catch (err: any) {
      setErrorModal({ isOpen: true, message: 'An unexpected error occurred.' });
    } finally {
      setIsOnboarding(false);
    }
  };

  // Variants for main panel transition
  const panelVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  // Left Sidebar Steps (Static Visuals)
  const steps = [
    { id: 0, label: 'Welcome' },
    { id: 1, label: 'Profile' },
    { id: 2, label: 'Success' },
  ];

  // Deterministic per-row motion so SSR HTML matches the client (Math.random() hydrated differently).
  const watermarkRows = useMemo(() => {
    const watermarkText = "Aselius Platform  •  Agentic Infrastructure  •  Rivine  •  Workspaces  •  Sovereign Sandboxes  •  ";
    const unit = (n: number) => {
      const x = Math.sin(n * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    return Array.from({ length: 60 }, (_, i) => ({
      key: i,
      duration: 200 + unit(i + 1) * 100,
      direction: (i % 2 === 0 ? 'normal' : 'reverse') as 'normal' | 'reverse',
      offset: unit(i + 97) * -200,
      text: watermarkText,
    }));
  }, []);

  return (
    <div className="relative min-h-[100dvh] w-full bg-gradient-to-br from-[#00477d] via-[#003366] to-[#002244] flex items-start md:items-center justify-center p-3 sm:p-4 overflow-x-hidden overflow-y-auto">
      {/* Sliding Watermark Background */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.08] pointer-events-none">
        <div className="flex flex-col gap-8">
          {watermarkRows.map((row) => (
            <div
              key={row.key}
              className="flex whitespace-nowrap text-white text-3xl font-bold"
              style={{
                animation: `slide ${row.duration}s linear infinite ${row.direction}`,
                marginLeft: `${row.offset}px`
              }}
            >
              {Array(20).fill(row.text).map((repeatText, j) => (
                <span key={j}>{repeatText}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Error Modal */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
          <div className="!bg-canvas rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Error</h2>
            <p className="text-slate-600 mb-4">{errorModal.message}</p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                onClick={() => setErrorModal({ isOpen: false, message: '' })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <motion.div
        className="relative w-full max-w-6xl !bg-canvas rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-0 md:min-h-[600px]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Left Panel: Branding & Context */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-[#00477d] to-[#002a4d] p-5 sm:p-6 md:p-8 flex flex-col justify-between text-white">
          <div className="flex items-center gap-3 mb-4 md:mb-8">
            <img
              src={BRAND_ICON_SRC}
              alt="Aselius Platform"
              className="w-10 h-10"
            />
            <span className="text-xl font-bold tracking-tight">Aselius Platform</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="relative min-h-[4.75rem] md:min-h-[140px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCard}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-0 left-0 w-full"
                >
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-4">
                    {currentCard === 0 && "Welcome aboard."}
                    {currentCard === 1 && "Tell us about yourself."}
                    {currentCard === 2 && "You're all set!"}
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base md:text-lg">
                    {currentCard === 0 && "Foundational backbone for autonomous digital operations."}
                    {currentCard === 1 && "We'd love to get to know you better to personalize your experience."}
                    {currentCard === 2 && "Welcome to the future of work. Let's get you into your dashboard."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex md:hidden items-center gap-2 mt-6">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`h-1.5 rounded-full transition-all ${
                    currentCard === step.id
                      ? 'w-8 bg-white'
                      : currentCard > step.id
                        ? 'w-4 bg-white/70'
                        : 'w-4 bg-white/30'
                  }`}
                />
              ))}
            </div>

            <div className="hidden md:flex flex-col gap-4 mt-12">
              {steps.map((step) => (
                <motion.div
                  key={step.id}
                  className="flex items-center gap-3"
                  initial={false}
                  animate={{
                    opacity: currentCard === step.id ? 1 : 0.5,
                    x: currentCard === step.id ? 4 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 32 }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold"
                    animate={{
                      backgroundColor: currentCard === step.id ? "#ffffff" : "transparent",
                      color: currentCard === step.id ? "#00477d" : "#ffffff",
                      borderColor: "#ffffff"
                    }}
                  >
                    {currentCard > step.id ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CheckCircle size={18} />
                      </motion.div>
                    ) : (
                      step.id + 1
                    )}
                  </motion.div>
                  <div className="text-base font-medium text-white/90">{step.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-6 md:mt-12 pt-4 md:pt-6 border-t border-white/10 flex flex-col gap-1 min-w-0">
            <span className="text-xs text-white/50">Signed in as</span>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-white/90 truncate min-w-0">{email}</span>
              <a 
                href="/auth/logout"
                className="text-xs text-white/70 hover:text-white underline decoration-white/30 hover:decoration-white transition-all whitespace-nowrap"
              >
                Log out
              </a>
            </div>
          </div>
        </div>

        {/* Right Panel: Dynamic Content */}
        <div className="w-full md:w-3/5 p-4 sm:p-5 md:p-6 flex items-center justify-center !bg-canvas overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* Step 0: Welcome */}
            {currentCard === 0 && (
              <motion.div
                key="welcome"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center text-center max-w-md w-full"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00477d] to-[#002a4d] flex items-center justify-center mb-6 shadow-lg">
                  <Rocket size={36} className="text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">Let's get started</h2>
                <p className="text-slate-600 text-base sm:text-lg mb-6 sm:mb-8">
                  Join thousands of teams building on Aselius Platform.
                </p>

                <motion.button
                  onClick={handleNext}
                  className="w-full sm:w-auto min-h-11 bg-gradient-to-r from-[#00477d] to-[#003366] text-white px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Onboarding <ArrowRight size={20} />
                </motion.button>
              </motion.div>
            )}

            {/* Step 1: Form */}
            {currentCard === 1 && (
              <motion.div
                key="form"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="w-full max-w-lg"
              >
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="relative pb-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <User size={16} className="text-[#00477d]" />
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3.5 !bg-canvas border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-[#00477d] focus:ring-4 focus:ring-[#00477d]/10 transition-all outline-none"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  </div>

                  <div className="relative pb-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <User size={16} className="text-[#00477d]" />
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3.5 !bg-canvas border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-[#00477d] focus:ring-4 focus:ring-[#00477d]/10 transition-all outline-none"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                </div>



                {/* Cloud Handle Field */}
                <div className="mb-8">
                  <label className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Hash size={16} className="text-[#00477d]" />
                      Cloud Handle
                    </span>
                    <span className="hidden sm:inline text-xs font-normal text-slate-500">Your unique identifier</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      className="flex-1 min-w-0 px-4 py-3.5 !bg-canvas border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-[#00477d] focus:ring-4 focus:ring-[#00477d]/10 transition-all outline-none font-mono"
                      placeholder="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                    />
                    <select
                      className="w-full sm:w-auto sm:min-w-[11.5rem] px-4 py-3.5 !bg-canvas border-2 border-slate-200 rounded-xl text-slate-900 focus:border-[#00477d] focus:ring-4 focus:ring-[#00477d]/10 transition-all outline-none font-mono text-sm"
                      value={formData.domain}
                      onChange={(e) => handleInputChange('domain', e.target.value)}
                    >
                      <option value="@beunec.cloud">@beunec.cloud</option>
                      <option value="@beunec.cloud.edu">@beunec.cloud.edu</option>
                      <option value="@beunec.cloud.gov">@beunec.cloud.gov</option>
                    </select>
                  </div>

                  {/* Validation Messages with Smooth Transitions */}
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: (formData.username && (usernameValidation.error || validation.message)) ? '100px' : '0px'
                    }}
                  >
                    {formData.username && usernameValidation.error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg"
                      >
                        <AlertCircle size={16} /> {usernameValidation.error}
                      </motion.div>
                    )}
                    {formData.username && usernameValidation.isValid && validation.message && (
                      <div className="mt-2">
                        {validation.isValidating ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600 !bg-canvas border border-slate-200 p-3 rounded-lg">
                            <motion.div
                              className="w-4 h-4 border-2 border-slate-300 border-t-[#00477d] rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Checking availability...
                          </div>
                        ) : (
                          <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${validation.message.includes('available')
                            ? 'text-green-700 bg-green-50'
                            : 'text-red-600 bg-red-50'
                            }`}>
                            {validation.message.includes('available') ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {validation.message}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                  <motion.button
                    onClick={handleBack}
                    className="min-h-11 px-6 py-3.5 !bg-canvas border-2 border-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:border-slate-300 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ChevronLeft size={18} /> Back
                  </motion.button>
                  <motion.button
                    onClick={handleNext}
                    disabled={!isFormValid() || validation.isValidating}
                    className="flex-1 min-h-11 px-6 py-3.5 bg-gradient-to-r from-[#00477d] to-[#003366] text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                    whileHover={!(!isFormValid() || validation.isValidating) ? { scale: 1.02 } : {}}
                    whileTap={!(!isFormValid() || validation.isValidating) ? { scale: 0.98 } : {}}
                  >
                    Continue <ChevronRight size={18} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Success */}
            {currentCard === 2 && (
              <motion.div
                key="success"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center text-center max-w-md w-full"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00477d] to-[#002a4d] flex items-center justify-center mb-6 shadow-lg">
                  <CheckCircle size={36} className="text-white" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Welcome, {formData.firstName}!</h2>
                <p className="text-slate-600 text-base sm:text-lg mb-6 sm:mb-8">
                  Here are some resources to help you get started.
                </p>

                <div className="grid grid-cols-1 gap-4 w-full mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.open('https://cloud.beunec.com/docs/overview', '_blank')}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#00477d] flex items-center justify-center flex-shrink-0">
                        <Sparkles size={20} className="text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-slate-900">Explore the Documentation</div>
                        <div className="text-xs text-slate-600 mt-1">Learn about features and capabilities</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="!bg-canvas border border-slate-200 rounded-xl p-4 mb-6 sm:mb-8 text-left">
                  <div className="flex items-start gap-3">
                    <Shield size={18} className="text-[#00477d] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed">
                      By accessing or using Aselius Platform, you acknowledge that you have read, understood, and agreed to be legally bound by our{' '}
                      <a
                        href="https://beunec.co/terms-of-use"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00477d] font-semibold hover:underline"
                      >
                        Terms of Use
                      </a>
                      ,{' '}
                      <a
                        href="https://beunec.co/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00477d] font-semibold hover:underline"
                      >
                        Privacy Policy
                      </a>
                      , and{' '}
                      <a
                        href="https://beunec.co/data-readiness-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00477d] font-semibold hover:underline"
                      >
                        Data Readiness
                      </a>
                      .
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={handleAccessPortal}
                  className="w-full min-h-11 bg-gradient-to-r from-[#00477d] to-[#003366] text-white px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  whileHover={!isOnboarding ? { scale: 1.02 } : {}}
                  whileTap={!isOnboarding ? { scale: 0.98 } : {}}
                  disabled={isOnboarding}
                >
                  <Shield size={20} />
                  {isOnboarding ? 'Setting up...' : 'Access Portal'}
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>

      {/* CSS for watermark animation */}
      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default OnboardingPage;