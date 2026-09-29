import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  title: string;
  timeAgo: string;
  category: string;
  linkPath?: string;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New batch assigned: UX-Foundation (Starts 12 Feb).',
    timeAgo: '15 minutes ago',
    category: 'Batch Notifications',
    linkPath: '/faculty/batches',
  },
  {
    id: 'notif-2',
    title: 'New student added to your batch.',
    timeAgo: '1 hour ago',
    category: 'Batch Notifications',
    linkPath: '/faculty/students',
  },
];

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="font-['Onest'] text-[#050720] pb-16 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-['Sora'] text-[#050720]">Notifications</h1>
        <p className="text-xs text-[#050720]/60 mt-1">
          Stay updated on tasks, demos, and system activity
        </p>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {NOTIFICATIONS.map((item) => (
          <div
            key={item.id}
            onClick={() => item.linkPath && navigate(item.linkPath)}
            className="bg-white border border-[#050720]/10 rounded-xl px-6 py-4 flex items-center justify-between shadow-xs hover:border-[#FFB908] transition-colors cursor-pointer"
          >
            <div>
              <p className="text-xs font-medium text-[#050720]">{item.title}</p>
              <span className="text-[10px] text-[#050720]/40 block mt-1">{item.timeAgo}</span>
            </div>

            <span className="text-xs font-medium text-[#0066FF] hover:underline whitespace-nowrap">
              {item.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};