'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Coins, Loader2, Share2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '@/lib/store';
import { useCloudHandle } from '@/contexts/CloudHandleContext';
import { ConnectionPicker, mapApiConnections } from '@/components/ui/ConnectionPicker';
import { getConnections } from '@/utils/platformAPI';
import { paymentAPI } from '@/utils/paymentAPI';
import { CREDIT_SHARE_LIMITS, formatCredits } from '@/lib/creditConfig';

interface ShareCreditsModalProps {
  open: boolean;
  onClose: () => void;
  shareableBalance: number;
  shareLimits?: { min: number; max: number };
  onShared: () => void;
}

export default function ShareCreditsModal({
  open,
  onClose,
  shareableBalance,
  shareLimits = CREDIT_SHARE_LIMITS,
  onShared,
}: ShareCreditsModalProps) {
  const { darkMode } = useStore();
  const cloudHandle = useCloudHandle();
  const [connections, setConnections] = useState<{ cloudhandle: string; name?: string }[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!open || !cloudHandle) return;
    setConnectionsLoading(true);
    getConnections(cloudHandle)
      .then((rows) => setConnections(mapApiConnections(rows)))
      .catch(() => toast.error('Failed to load connections'))
      .finally(() => setConnectionsLoading(false));
  }, [open, cloudHandle]);

  useEffect(() => {
    if (!open) {
      setSelectedRecipient('');
      setAmount('');
      setAcknowledged(false);
      setSharing(false);
    }
  }, [open]);

  const parsedAmount = parseFloat(amount);
  const maxShare = Math.min(shareLimits.max, shareableBalance);
  const amountValid = Number.isFinite(parsedAmount)
    && parsedAmount >= shareLimits.min
    && parsedAmount <= maxShare;

  const handleShare = async () => {
    if (sharing) return;
    if (!selectedRecipient) {
      toast.error('Select a connection');
      return;
    }
    if (!amountValid) {
      toast.error(`Enter between ${formatCredits(shareLimits.min)} and ${formatCredits(maxShare)}`);
      return;
    }
    if (!acknowledged) {
      toast.error('Please confirm you understand this action');
      return;
    }

    setSharing(true);
    try {
      await paymentAPI.shareCredits({
        recipientCloudhandle: selectedRecipient,
        amount: parsedAmount,
        acknowledged: true,
      });
      toast.success(`Shared ${formatCredits(parsedAmount)} with @${selectedRecipient}`);
      onShared();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to share credits');
    } finally {
      setSharing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`rounded-2xl shadow-xl w-full max-w-md relative border ${
              darkMode ? 'bg-[#1e2430] border-gray-700' : '!bg-canvas border-gray-200'
            }`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className={`absolute top-4 right-4 p-1 rounded-lg ${
                darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-700'
              }`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3 pr-8">
                <div className="p-2.5 rounded-xl bg-[#00477d]/10">
                  <Share2 className="w-5 h-5 text-[#00477d]" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Share credits via CloudHandle
                  </h3>
                  <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Send credits to a connection. Promo credits cannot be shared.
                  </p>
                </div>
              </div>

              <div className={`rounded-xl border p-3 text-sm ${
                darkMode ? 'border-amber-900/40 bg-amber-950/20 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}>
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    Shared credits are <strong>permanent and cannot be recovered</strong>. Only purchased or plan-granted credits can be shared — not promo code credits.
                  </p>
                </div>
              </div>

              <div>
                <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Shareable balance: <span className="text-emerald-500 font-bold">{formatCredits(shareableBalance)}</span>
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Share with
                </label>
                <ConnectionPicker
                  connections={connections}
                  value={selectedRecipient}
                  onChange={setSelectedRecipient}
                  loading={connectionsLoading}
                  disabled={sharing}
                  placeholder="Search connections…"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                  <input
                    type="number"
                    min={shareLimits.min}
                    max={maxShare}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`${shareLimits.min} – ${maxShare.toFixed(2)}`}
                    disabled={sharing || shareableBalance < shareLimits.min}
                    className={`w-full pl-7 pr-3 py-2.5 rounded-xl border text-sm ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-100'
                        : '!bg-canvas border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <p className={`text-xs mt-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Min {formatCredits(shareLimits.min)} · Max {formatCredits(maxShare)} per transfer
                </p>
              </div>

              <label className={`flex items-start gap-2.5 cursor-pointer text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  disabled={sharing}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#00477d] focus:ring-[#00477d]"
                />
                <span>
                  I understand that once I share credits, I cannot get them back.
                </span>
              </label>

              <button
                type="button"
                onClick={handleShare}
                disabled={
                  sharing
                  || !selectedRecipient
                  || !amountValid
                  || !acknowledged
                  || shareableBalance < shareLimits.min
                }
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00477d] hover:bg-[#003366] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sharing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Coins className="w-4 h-4" />
                )}
                Share credits
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
