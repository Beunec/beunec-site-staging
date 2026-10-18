import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  Check,
  Trash2,
  MoreVertical,
  Circle,
  MessageSquare,
  Hash,
  Users,
  User,
  Upload,
  Share2,
  Smile,
  FileText,
  ExternalLink,
  AlertCircle,
  UserPlus,
  UserCheck,
  UserX,
  Building2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Notification } from '../../lib/store';
import {
  buildNotificationMessage,
  formatRelativeTime,
  groupNotificationsByDay,
  type PlatformNotificationType,
} from '@/lib/platformNotifications';
import {
  preloadPlatformNotificationSound,
  unlockPlatformNotificationSound,
} from '@/lib/notificationSound';

interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
  darkMode: boolean;
  onMarkAsRead?: (id: string | number) => void;
  onMarkAsUnread?: (id: string | number) => void;
  onRemove?: (id: string | number) => void;
  onClearAll?: () => void;
  onMarkAllAsRead?: () => void;
}

function getTypeIcon(type: PlatformNotificationType | string) {
  switch (type) {
    case 'message_received':
    case 'message_sent':
      return MessageSquare;
    case 'message_reaction':
      return Smile;
    case 'file_uploaded':
      return Upload;
    case 'file_shared_to_me':
    case 'file_shared_by_me':
      return Share2;
    case 'workspace_shared_to_me':
    case 'workspace_shared_by_me':
    case 'workspace_invite_accepted':
    case 'workspace_event':
      return Share2;
    case 'workspace_deliverable_ready':
    case 'workspace_turn_done':
      return FileText;
    case 'workspace_turn_error':
      return AlertCircle;
    case 'file_deleted':
      return Trash2;
    case 'file_shared_in_message':
      return Share2;
    case 'connection':
    case 'connection_request_received':
    case 'connection_request_sent':
      return UserPlus;
    case 'connection_accepted':
      return UserCheck;
    case 'connection_declined':
      return UserX;
    case 'team_created':
    case 'team_member_added':
      return Building2;
    case 'channel_created':
    case 'channel_deleted':
      return Hash;
    default:
      return FileText;
  }
}

function getTypeLabel(notification: Notification): string | null {
  if (notification.type === 'team_created' || notification.type === 'team_member_added') {
    return 'Team';
  }
  if (notification.type === 'channel_created' || notification.type === 'channel_deleted') {
    return 'Channel';
  }
  if (
    notification.type === 'connection' ||
    notification.type === 'connection_request_received' ||
    notification.type === 'connection_request_sent' ||
    notification.type === 'connection_accepted' ||
    notification.type === 'connection_declined'
  ) {
    return 'Network';
  }
  if (!notification.chatType) {
    if (notification.type === 'file_shared_to_me' || notification.type === 'file_shared_by_me') {
      return 'File';
    }
    if (
      notification.type === 'workspace_shared_to_me' ||
      notification.type === 'workspace_shared_by_me' ||
      notification.type === 'workspace_invite_accepted' ||
      notification.type === 'workspace_event' ||
      notification.type === 'workspace_deliverable_ready' ||
      notification.type === 'workspace_turn_done' ||
      notification.type === 'workspace_turn_error'
    ) {
      return 'Workspace';
    }
    if (notification.type?.startsWith('file_')) return 'Files';
    return null;
  }
  if (notification.chatType === 'group-chat') return 'General';
  if (notification.chatType === 'group-channel' || notification.chatType === 'dm-channel') return 'Channel';
  return 'Direct';
}

function isNavigable(notification: Notification): boolean {
  return Boolean(notification.deeplink || notification.chatType);
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onClose,
  darkMode,
  onMarkAsRead,
  onMarkAsUnread,
  onRemove,
  onClearAll,
  onMarkAllAsRead,
}) => {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

  // Opening the panel is a user gesture — unlock audio for immediate notification sounds.
  useEffect(() => {
    preloadPlatformNotificationSound();
    unlockPlatformNotificationSound();
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const hasNotifications = notifications.length > 0;

  const sortedNotifications = useMemo(() => {
    // Defensive: `notifications` ultimately comes from localStorage
    // (platformNotifications.ts), which now dedupes on read/write, but this
    // component must never re-introduce a duplicate-key warning even if a
    // caller ever passes raw/unfiltered data via setNotifications directly.
    const seen = new Set<string>();
    const deduped = notifications.filter((n) => {
      if (!n?.id || seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });
    return deduped.sort((a, b) => {
      const aPinned = a.unread && a.requiresAttention ? 1 : 0;
      const bPinned = b.unread && b.requiresAttention ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notifications]);

  const groupedNotifications = useMemo(
    () => groupNotificationsByDay(sortedNotifications),
    [sortedNotifications]
  );

  const handleNotificationClick = (notification: Notification) => {
    if (notification.unread) {
      onMarkAsRead?.(notification.id);
    }

    if (notification.deeplink) {
      onClose();
      router.push(notification.deeplink);
    }
  };

  const handleOpenFile = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.unread) {
      onMarkAsRead?.(notification.id);
    }
    onClose();
    router.push(notification.deeplink || '/workspace/shared-with-me');
  };

  const handleMarkAsRead = (id: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onMarkAsRead?.(id);
    setOpenMenuId(null);
  };

  const handleMarkAsUnread = (id: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onMarkAsUnread?.(id);
    setOpenMenuId(null);
  };

  const handleRemove = (id: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onRemove?.(id);
    setOpenMenuId(null);
  };

  const renderNotificationCard = (notification: Notification) => {
    const isHovered = hoveredId === notification.id;
    const isMenuOpen = openMenuId === notification.id;
    const TypeIcon = getTypeIcon(notification.type);
    const typeLabel = getTypeLabel(notification);
    const displayActor =
      notification.actor ||
      notification.contactName ||
      notification.senderName ||
      notification.groupName ||
      'Unknown';
    const messageText = buildNotificationMessage(notification);
    const timeLabel = notification.createdAt
      ? formatRelativeTime(notification.createdAt)
      : notification.time || '';
    const showAttentionBadge =
      notification.unread && notification.requiresAttention && notification.type === 'message_received';
    const navigable = isNavigable(notification);

    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setHoveredId(notification.id)}
        onMouseLeave={() => {
          setHoveredId(null);
          setOpenMenuId(null);
        }}
        onClick={() => navigable && handleNotificationClick(notification)}
        className={`group relative mx-3 mb-2 rounded-lg transition-all duration-200 border ${
          notification.unread
            ? 'notification-card-unread border-[#00477d]/25'
            : 'notification-card-read border-gray-200/80 dark:border-gray-700/50'
        } ${navigable ? 'cursor-pointer hover:shadow-md' : ''} ${
          darkMode ? 'hover:bg-gray-700/80' : 'hover:bg-white/60'
        }`}
      >
        <div className="p-3">
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[#00477d] to-[#003a6b]">
                <TypeIcon className="h-4 w-4 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`font-semibold text-sm truncate ${
                      notification.unread
                        ? darkMode
                          ? 'text-white'
                          : 'text-gray-900'
                        : darkMode
                          ? 'text-gray-200'
                          : 'text-gray-700'
                    }`}
                  >
                    {displayActor}
                  </span>
                  {typeLabel && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#00477d] text-white">
                      {notification.chatType === 'group-chat' || notification.chatType === 'group-channel' ? (
                        <Users className="h-2.5 w-2.5" />
                      ) : notification.chatType?.includes('channel') ? (
                        <Hash className="h-2.5 w-2.5" />
                      ) : notification.chatType ? (
                        <User className="h-2.5 w-2.5" />
                      ) : (
                        <FileText className="h-2.5 w-2.5" />
                      )}
                      {typeLabel}
                    </span>
                  )}
                  {notification.channelName && (
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                        darkMode
                          ? 'bg-[#00477d]/30 text-[#00477d] border border-[#00477d]/50'
                          : 'bg-[#00477d]/10 text-[#00477d] border border-[#00477d]/20'
                      }`}
                    >
                      <Hash className="h-2.5 w-2.5" />
                      {notification.channelName}
                    </span>
                  )}
                  {showAttentionBadge && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      <AlertCircle className="h-2.5 w-2.5" />
                      Attention Required
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-1 flex-shrink-0 ml-2">
              {notification.unread && (
                <div className="mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00477d]" />
                </div>
              )}

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(isMenuOpen ? null : notification.id);
                  }}
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    isMenuOpen || isHovered
                      ? darkMode
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-600'
                      : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 top-10 z-10 w-44 rounded-lg shadow-xl border ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-canvas border-gray-200'
                    } py-1`}
                  >
                    {notification.unread ? (
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors duration-200 ${
                          darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Check className="h-4 w-4" />
                        Mark as read
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleMarkAsUnread(notification.id, e)}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors duration-200 ${
                          darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Circle className="h-4 w-4" />
                        Mark as unread
                      </button>
                    )}
                    <button
                      onClick={(e) => handleRemove(notification.id, e)}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors duration-200 ${
                        darkMode ? 'text-red-400 hover:bg-red-950/20' : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Dismiss
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="ml-10">
            <p
              className={`text-sm leading-snug ${
                notification.unread
                  ? darkMode
                    ? 'text-gray-100'
                    : 'text-gray-900'
                  : darkMode
                    ? 'text-gray-300'
                    : 'text-gray-700'
              }`}
            >
              {messageText}
            </p>
            <div className="flex items-center justify-between mt-1.5 gap-2">
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{timeLabel}</p>
              {notification.type === 'file_shared_to_me' && (
                <button
                  onClick={(e) => handleOpenFile(notification, e)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#00477d] hover:text-[#003a6b] transition-colors"
                >
                  Open File
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      data-notifications-panel
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 32 }}
      className={`fixed top-0 right-0 h-screen w-[420px] z-50 flex flex-col border-l shadow-2xl ${
        darkMode
          ? 'bg-gray-900 text-white border-gray-700'
          : '!bg-canvas text-gray-900 border-gray-200'
      }`}
    >
      <div
        className={`notification-panel-header px-6 py-5 border-b flex items-center justify-between ${
          darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 !bg-canvas'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-full ${darkMode ? 'bg-[#00477d]/30' : 'bg-[#00477d]/10'}`}>
            <Bell className="h-5 w-5 text-[#00477d]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {unreadCount} unread
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasNotifications && (
            <button
              onClick={() => onClearAll?.()}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                darkMode
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-200 ${
              darkMode
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasNotifications ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-6 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}
            >
              <Bell className={`h-8 w-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </motion.div>
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No notifications yet
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              You&apos;re all caught up!
            </p>
          </div>
        ) : (
          <div className="py-2">
            <AnimatePresence>
              {groupedNotifications.map((group) => (
                <div key={group.label} className="mb-3">
                  <p
                    className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                      darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}
                  >
                    {group.label}
                  </p>
                  {group.items.map((notification) => renderNotificationCard(notification))}
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {hasNotifications && unreadCount > 0 && (
        <div
          className={`notification-panel-footer px-4 py-3 border-t ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 !bg-canvas'
          }`}
        >
          <button
            onClick={() => onMarkAllAsRead?.()}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 bg-[#00477d] hover:bg-[#003a6b] text-white shadow-sm hover:shadow-md"
          >
            Mark all as read
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default React.memo(NotificationsPanel);
