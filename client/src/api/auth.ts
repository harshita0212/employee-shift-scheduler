import api from './axios';

export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    register: (email: string, password: string, role?: string) =>
        api.post('/auth/register', { email, password, role }),

    getProfile: () => api.get('/auth/profile'),
};
