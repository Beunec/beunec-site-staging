'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, LayoutGrid, Table2, X } from 'lucide-react';
import { paymentAPI } from '@/utils/paymentAPI';
import { useStore } from '@/lib/store';
import {
  PLAN_COMPARISON_ROWS,
  PLAN_DEFINITIONS,
  isCurrentPlan,
  type PlanId,
} from '@/lib/planConfig';
import { ENGINE_MIN_SUMMARY } from '@/lib/creditConfig';

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
  type?: 'success' | 'cancel';
  currentPlan?: string;
}

type ViewMode = 'cards' | 'compare';

const ACCENT_STYLES = {
  emerald: {
    header: 'bg-emerald-600',
    ring: 'ring-emerald-500/40',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    price: 'text-emerald-700 dark:text-emerald-400',
  },
  orange: {
    header: 'bg-orange-500',
    ring: 'ring-orange-500/50',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    price: 'text-orange-600 dark:text-orange-400',
  },
  rose: {
    header: 'bg-rose-600',
    ring: 'ring-rose-500/40',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    price: 'text-rose-700 dark:text-rose-400',
  },
} as const;

export default function PricingModal({ open, onClose, message, type, currentPlan }: PricingModalProps) {
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('cards');
  const darkMode = useStore((state) => state.darkMode);

  const handleSubscribe = async (planId: PlanId) => {
    if (planId === 'base') return;
    setLoading(planId);
    setError(null);
    try {
      const hasPaidPlan = currentPlan === 'pro' || currentPlan === 'essential';
      if (hasPaidPlan) {
        const { url } = await paymentAPI.createCustomerPortalSession();
        window.location.href = url;
        return;
      }

      if (planId === 'pro') {
        const { url } = await paymentAPI.createCheckoutSession();
        window.location.href = url;
      } else {
        const { url } = await paymentAPI.activateEssential();
        if (url) window.location.href = url;
        else onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout.');
    } finally {
      setLoading(null);
    }
  };

  const getButtonLabel = (planId: PlanId, cta: string | null) => {
    if (!cta) return null;
    if (isCurrentPlan(planId, currentPlan)) return 'Current plan';
    if (loading === planId) return 'Redirecting…';
    if ((currentPlan === 'pro' || currentPlan === 'essential') && planId !== 'base') {
      return 'Manage in billing portal';
    }
    return cta;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pricing-modal-title"
            className={`relative w-full sm:max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl border overflow-hidden ${
              darkMode ? 'bg-[#1e2430] border-gray-700/60' : '!bg-canvas border-gray-200'
            }`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex-shrink-0 px-4 sm:px-6 pt-5 pb-4 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-100'
            }`}>
              <button
                type="button"
                className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
                  darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`}
                onClick={onClose}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {message ? (
                <p className={`text-center text-base font-semibold pr-8 ${
                  type === 'success' ? 'text-green-600' : type === 'cancel' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {message}
                </p>
              ) : (
                <>
                  <h2
                    id="pricing-modal-title"
                    className={`text-xl sm:text-2xl font-bold pr-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    Choose Your Plan
                  </h2>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    All plans include credits that never expire. Pay-as-you-go at $1 = 1 Credit. Engine start floors are the same on every plan: {ENGINE_MIN_SUMMARY}.
                  </p>

                  <div className={`inline-flex mt-4 p-1 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <button
                      type="button"
                      onClick={() => setView('cards')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        view === 'cards'
                          ? darkMode ? 'bg-gray-700 text-white' : '!bg-canvas text-gray-900 shadow-sm'
                          : darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      Plans
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('compare')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        view === 'compare'
                          ? darkMode ? 'bg-gray-700 text-white' : '!bg-canvas text-gray-900 shadow-sm'
                          : darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      <Table2 className="w-4 h-4" />
                      Compare
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5">
              {!message && view === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
                  {PLAN_DEFINITIONS.map((plan) => {
                    const styles = ACCENT_STYLES[plan.accent];
                    const selected = isCurrentPlan(plan.id, currentPlan);
                    const buttonLabel = getButtonLabel(plan.id, plan.cta);

                    return (
                      <div
                        key={plan.id}
                        className={`flex flex-col rounded-2xl border overflow-hidden transition-shadow ${
                          plan.highlight
                            ? `shadow-lg ring-2 ${styles.ring} ${darkMode ? 'border-orange-500/50' : 'border-orange-300'}`
                            : darkMode ? 'border-gray-700' : 'border-gray-200'
                        } ${selected ? 'ring-2 ring-[#00477d]' : ''}`}
                      >
                        {plan.highlight && (
                          <div className="bg-orange-500 text-white text-center text-xs font-bold py-1 tracking-wide">
                            RECOMMENDED
                          </div>
                        )}

                        <div className={`px-5 py-4 ${styles.header}`}>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                            {selected && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-white/80 text-xs mt-1 leading-relaxed">{plan.description}</p>
                        </div>

                        <div className={`flex-1 flex flex-col p-5 ${darkMode ? 'bg-[#1e2430]' : '!bg-canvas'}`}>
                          <div className="mb-4">
                            <span className={`text-3xl font-bold ${styles.price}`}>
                              {plan.priceLabel}
                            </span>
                            {plan.priceMonthly > 0 && (
                              <span className={`text-sm ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                /month
                              </span>
                            )}
                          </div>

                          <ul className={`space-y-2 text-sm flex-1 mb-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {plan.highlights.map((feature) => (
                              <li key={feature} className="flex items-start gap-2">
                                <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${styles.price}`} />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          {buttonLabel ? (
                            <button
                              type="button"
                              onClick={() => handleSubscribe(plan.id)}
                              disabled={loading !== null || selected}
                              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors ${
                                selected
                                  ? darkMode ? 'bg-gray-800 text-gray-500 cursor-default' : 'bg-gray-100 text-gray-400 cursor-default'
                                  : plan.highlight
                                    ? 'bg-[#00477d] hover:bg-[#003366] text-white'
                                    : darkMode
                                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                      : 'bg-gray-800 hover:bg-gray-900 text-white'
                              } disabled:opacity-60`}
                            >
                              {buttonLabel}
                            </button>
                          ) : (
                            <div className={`w-full py-2.5 px-4 rounded-xl text-center text-sm font-medium ${
                              selected
                                ? darkMode ? 'bg-[#00477d]/20 text-blue-300' : 'bg-blue-50 text-[#00477d]'
                                : darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-50 text-gray-500'
                            }`}>
                              {selected ? 'Your current plan' : 'Always free'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!message && view === 'compare' && (
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full min-w-[640px] text-sm border-collapse">
                    <thead>
                      <tr>
                        <th className={`text-left p-3 font-semibold sticky left-0 z-10 ${
                          darkMode ? 'bg-[#1e2430] text-gray-300' : '!bg-canvas text-gray-700'
                        }`}>
                          Feature
                        </th>
                        {PLAN_DEFINITIONS.map((plan) => {
                          const styles = ACCENT_STYLES[plan.accent];
                          return (
                            <th
                              key={plan.id}
                              className={`p-3 text-center font-bold text-white ${styles.header}`}
                            >
                              <div>{plan.name}</div>
                              <div className="text-xs font-normal opacity-90 mt-0.5">
                                {plan.priceMonthly === 0 ? 'Free' : `${plan.priceLabel}/mo`}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {PLAN_COMPARISON_ROWS.map((row, i) => (
                        <tr
                          key={row.label}
                          className={i % 2 === 0
                            ? darkMode ? 'bg-gray-800/40' : 'bg-gray-50'
                            : ''
                          }
                        >
                          <td className={`p-3 font-medium sticky left-0 z-10 ${
                            i % 2 === 0
                              ? darkMode ? 'bg-gray-800/40 text-gray-300' : 'bg-gray-100/70 text-gray-700'
                              : darkMode ? 'bg-[#1e2430] text-gray-300' : '!bg-canvas text-gray-700'
                          }`}>
                            {row.label}
                          </td>
                          <td className={`p-3 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {row.base}
                          </td>
                          <td className={`p-3 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {row.pro}
                          </td>
                          <td className={`p-3 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {row.essential}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {error && (
                <p className="text-red-500 text-center mt-4 text-sm">{error}</p>
              )}
            </div>

            {/* Footer */}
            {!message && (
              <div className={`flex-shrink-0 px-4 sm:px-6 py-4 border-t text-center ${
                darkMode ? 'border-gray-700/60 bg-[#1e2430]' : 'border-gray-100 !bg-canvas'
              }`}>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  By subscribing, you agree to our{' '}
                  <a
                    href="https://beunec.co/terms-of-use"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#00477d]"
                  >
                    Terms of Use
                  </a>
                  ,{' '}
                  <a
                    href="https://beunec.co/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#00477d]"
                  >
                    Privacy Policy
                  </a>
                  , and{' '}
                  <a
                    href="https://beunec.co/data-readiness-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#00477d]"
                  >
                    Data Readiness
                  </a>
                  . No refunds. Cancel anytime via the billing portal.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
