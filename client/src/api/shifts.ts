import api from './axios';

export const shiftApi = {
    getAll: (params?: { employeeId?: string; startDate?: string; endDate?: string; status?: string }) =>
        api.get('/shifts', { params }),

    getById: (id: string) => api.get(`/shifts/${id}`),

    create: (data: any) => api.post('/shifts', data),

    update: (id: string, data: any) => api.put(`/shifts/${id}`, data),

    delete: (id: string) => api.delete(`/shifts/${id}`),
};
