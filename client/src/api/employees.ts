import api from './axios';

export const employeeApi = {
    getAll: (params?: { page?: number; limit?: number; search?: string }) =>
        api.get('/employees', { params }),

    getById: (id: string) => api.get(`/employees/${id}`),

    create: (data: any) => api.post('/employees', data),

    update: (id: string, data: any) => api.put(`/employees/${id}`, data),

    delete: (id: string) => api.delete(`/employees/${id}`),
};
