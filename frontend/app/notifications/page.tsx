"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Clock3, Inbox, Zap, BarChart2 } from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  type NotificationRecord,
} from "@/services/api/notifications.api";

import { useBrandStore } from "@/state/brand.store";

const typeLabel: Record<NotificationRecord["type"], string> = {
  post_generated: "Synthesis Complete",
  post_published: "Deployment Successful",
  analytics_ready: "Intelligence Updated",
};

const typeIcon: Record<NotificationRecord["type"], React.ReactNode> = {
  post_generated: <Zap size={14} />,
  post_published: <CheckCheck size={14} />,
  analytics_ready: <BarChart2 size={14} />,
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const activeBrand = useBrandStore((s) => s.activeBrand);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", activeBrand?._id],
    queryFn: () => getNotifications(activeBrand?._id, 100),
    enabled: !!activeBrand?._id,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", activeBrand?._id],
      });
    },
  });

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  if (!activeBrand?._id) {
    return (
      <div className="mx-auto max-w-4xl min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-white/5 text-gray-600">
            <Bell size={32} strokeWidth={1} />
          </div>
          <h1 className="text-2xl font-serif font-light text-white">System Logs</h1>
          <p className="text-sm text-gray-500">Please select a brand context to view activity.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-10">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-white/5 rounded-[2rem]" />
          <div className="h-32 bg-white/5 rounded-[2rem]" />
          <div className="h-32 bg-white/5 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 p-6 bg-[#0A0A0A] min-h-screen text-white">
      
      <header className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 md:p-10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Bell size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-light tracking-tight">System Activity</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mt-1">
                Monitoring: <span className="text-gray-300">{activeBrand.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end px-4 border-r border-white/10">
              <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Total Events</span>
              <span className="text-lg font-serif">{notifications.length}</span>
            </div>
            <div className="flex flex-col items-end px-4">
              <span className="text-[10px] uppercase tracking-widest text-sky-600 font-bold">Unread</span>
              <span className="text-lg font-serif text-sky-400">{unreadCount}</span>
            </div>
          </div>
        </div>
      </header>

      
      {notifications.length === 0 ? (
        <div className="rounded-[2.5rem] border border-dashed border-white/10 py-24 text-center">
          <Inbox className="mx-auto mb-4 text-gray-700" size={40} strokeWidth={1} />
          <p className="text-sm text-gray-500 font-light italic">No activity recorded in the current stream.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <article
              key={notification._id}
              className={`group relative overflow-hidden rounded-4xl border transition-all duration-300 p-6 ${
                notification.isRead
                  ? "border-white/5 bg-white/1 opacity-60"
                  : "border-sky-500/20 bg-sky-500/3 shadow-[0_0_20px_-12px_rgba(14,165,233,0.5)]"
              }`}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex gap-4">
                  <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                    notification.isRead ? "border-white/10 text-gray-500" : "border-sky-500/30 text-sky-400 bg-sky-500/10"
                  }`}>
                    {typeIcon[notification.type]}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        notification.isRead ? "text-gray-600" : "text-sky-500"
                      }`}>
                        {typeLabel[notification.type]}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-white/10" />
                      <span className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                        <Clock3 size={10} />
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <h2 className={`text-base font-medium tracking-tight ${notification.isRead ? "text-gray-400" : "text-white"}`}>
                      {notification.title}
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-2xl font-light">
                      {notification.message}
                    </p>
                    
                    <p className="mt-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {!notification.isRead && (
                  <button
                    onClick={() => markReadMutation.mutate(notification._id)}
                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    <CheckCheck size={14} />
                    Acknowledge
                  </button>
                )}
              </div>
              
              
              {!notification.isRead && (
                <div className="absolute left-0 top-0 h-full w-1 bg-sky-500" />
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
