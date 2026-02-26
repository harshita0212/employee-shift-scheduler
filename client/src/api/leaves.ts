import api from './axios';

export const leaveApi = {
    getAll: (params?: { employeeId?: string; status?: string }) =>
        api.get('/leaves', { params }),

    getById: (id: string) => api.get(`/leaves/${id}`),

    create: (data: any) => api.post('/leaves', data),

    updateStatus: (id: string, status: string) =>
        api.patch(`/leaves/${id}/status`, { status }),

    delete: (id: string) => api.delete(`/leaves/${id}`),
};
