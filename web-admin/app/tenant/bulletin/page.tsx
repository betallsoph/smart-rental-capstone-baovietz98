"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Info,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { message, Spin, Empty } from "antd";
import axiosClient from "@/lib/axios-client";
import { notificationsApi, Notification } from "@/lib/api/notifications";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function TenantBulletinPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get Tenant Profile to allow filtering by tenantId if needed by backend (though backend handles null for public)
        const profile = await axiosClient.get("/auth/profile");
        const tenantId = profile.data.tenant?.id;

        const res = await notificationsApi.getAll(tenantId);
        setNotifications(res.data);
      } catch (error) {
        console.error(error);
        message.error("Lỗi tải thông báo.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "SYSTEM":
        return <AlertTriangle size={20} className="text-amber-500" />;
      case "PAYMENT":
        return <CheckCircle2 size={20} className="text-emerald-500" />;
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "SYSTEM":
        return "bg-amber-50 border-amber-100 text-amber-700";
      case "PAYMENT":
        return "bg-emerald-50 border-emerald-100 text-emerald-700";
      default:
        return "bg-blue-50 border-blue-100 text-blue-700";
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F9F9F7] pb-10 font-sans text-slate-900">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md p-4 border-b border-slate-100 sticky top-0 z-20 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Bell size={20} className="text-indigo-600" />
          Bảng Tin
        </h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {notifications.length === 0 ? (
          <div className="mt-20">
            <Empty description="Chưa có thông báo nào" />
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getTypeStyle(notif.type)}`}
                  >
                    {getIcon(notif.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                      {notif.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                      <Calendar size={12} />
                      {dayjs(notif.createdAt).fromNow()}
                    </p>
                  </div>
                </div>
                {/* {notif.type === 'SYSTEM' && <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">QUAN TRỌNG</span>} */}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-600 leading-relaxed">
                {notif.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
