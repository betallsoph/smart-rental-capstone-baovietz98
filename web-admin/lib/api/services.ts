import axiosClient from '../axios-client';
import { CreateServiceDto, Service, ServiceType, UpdateServiceDto } from '../../types/service';

export const servicesApi = {
    getAll: async (includeInactive = false) => {
        const response = await axiosClient.get<Service[]>('/services', {
            params: { includeInactive },
        });
        return response.data;
    },

    getByType: async (type: ServiceType) => {
        const response = await axiosClient.get<Service[]>(`/services/type/${type}`);
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await axiosClient.get<Service>(`/services/${id}`);
        return response.data;
    },

    create: async (data: CreateServiceDto) => {
        const response = await axiosClient.post<Service>('/services', data);
        return response.data;
    },

    update: async (id: number, data: UpdateServiceDto) => {
        const response = await axiosClient.patch<Service>(`/services/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await axiosClient.delete(`/services/${id}`);
        return response.data;
    },

    seed: async () => {
        const response = await axiosClient.get('/services/seed');
        return response.data;
    },
};
