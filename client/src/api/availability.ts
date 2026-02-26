import api from './axios';

export const availabilityApi = {
    getAll: () => api.get('/availability'),

    getByEmployee: (employeeId: string) =>
        api.get(`/availability/employee/${employeeId}`),

    set: (employeeId: string, availabilities: any[]) =>
        api.post('/availability', { employeeId, availabilities }),

    delete: (id: string) => api.delete(`/availability/${id}`),
};
