import axiosClient from "@/lib/axios-client";

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: 'GENERAL' | 'PAYMENT' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: (tenantId?: number) => {
    return axiosClient.get<Notification[]>('/notifications', {
        params: { tenantId }
    });
  },
  
  getLatest: () => {
    return axiosClient.get<Notification>('/notifications/latest');
  }
};
