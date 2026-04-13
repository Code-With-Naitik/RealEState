import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export const listingsAPI = {
    getAll: (params) => api.get('/listings', { params }),
    getOne: (id) => api.get(`/listings/${id}`),
    create: (data) => api.post('/listings', data),
    update: (id, data) => api.put(`/listings/${id}`, data),
    delete: (id) => api.delete(`/listings/${id}`),
    getStats: () => api.get('/listings/stats/overview'),
    getUserListings: (userId) => api.get('/listings', { params: { userRef: userId, limit: 50 } }),
};

export const authAPI = {
    signin: (data) => api.post('/auth/signin', data),
    signup: (data) => api.post('/auth/signup', data),
    signout: () => api.post('/auth/signout'),
};

export const userAPI = {
    getMe: () => api.get('/users/me'),
    getAll: () => api.get('/users'),
    update: (id, data) => api.put(`/users/update/${id}`, data),
    getListings: (id) => api.get(`/users/listings/${id}`),
    delete: (id) => api.delete(`/users/delete/${id}`),
};

export const contactAPI = {
    send: (data) => api.post('/contact', data),
    getAll: () => api.get('/contact'),
    update: (id, data) => api.patch(`/contact/${id}`, data),
    delete: (id) => api.delete(`/contact/${id}`),
};


export const uploadAPI = {
    images: (formData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const blogAPI = {
    getAll: () => api.get('/blogs'),
    getAllAdmin: () => api.get('/blogs/all'),
    getOne: (id) => api.get(`/blogs/${id}`),
    create: (data) => api.post('/blogs', data),
    update: (id, data) => api.put(`/blogs/${id}`, data),
    delete: (id) => api.delete(`/blogs/${id}`),
};

export default api;