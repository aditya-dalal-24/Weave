import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Candidate APIs
export const candidateAPI = {
  getDashboard: () => api.get('/candidate/dashboard'),
  getProfile: () => api.get('/candidate/profile'),
  updateProfile: (data) => api.put('/candidate/profile', data),
  uploadAvatar: (formData) => api.post('/candidate/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadResume: (formData) => api.post('/candidate/profile/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  extractResume: () => api.post('/candidate/profile/extract-resume'),
  addEducation: (data) => api.post('/candidate/education', data),
  updateEducation: (id, data) => api.put(`/candidate/education/${id}`, data),
  deleteEducation: (id) => api.delete(`/candidate/education/${id}`),
  addSkill: (data) => api.post('/candidate/skills', data),
  deleteSkill: (id) => api.delete(`/candidate/skills/${id}`),
  updatePreferences: (data) => api.put('/candidate/preferences', data),
  getSuggestions: () => api.get('/candidate/suggestions'),
};

// Recruiter APIs
export const recruiterAPI = {
  getDashboard: () => api.get('/recruiter/dashboard'),
  getProfile: () => api.get('/recruiter/profile'),
  updateProfile: (data) => api.put('/recruiter/profile', data),
  uploadLogo: (formData) => api.post('/recruiter/profile/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getApplicants: (params) => api.get('/recruiter/applicants', { params }),
  shortlist: (applicationId) => api.patch(`/recruiter/applications/${applicationId}/shortlist`),
  updateStatus: (applicationId, status) => api.patch(`/recruiter/applications/${applicationId}/status`, { status }),
};

// Internship APIs
export const internshipAPI = {
  getAll: (params) => api.get('/internships', { params }),
  getById: (id) => api.get(`/internships/${id}`),
  create: (data) => api.post('/internships', data),
  getMyInternships: () => api.get('/internships/my/list'),
  update: (id, data) => api.put(`/internships/${id}`, data),
  delete: (id) => api.delete(`/internships/${id}`),
};

// Application APIs
export const applicationAPI = {
  apply: (data) => api.post('/applications', data),
  getMyApplications: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  withdraw: (id) => api.delete(`/applications/${id}`),
};

// Recommendation APIs
export const recommendationAPI = {
  get: () => api.get('/recommendations'),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (userId) => api.patch(`/admin/users/${userId}/toggle`),
  getVerifications: () => api.get('/admin/verifications'),
  reviewVerification: (id, data) => api.patch(`/admin/verifications/${id}`, data),
  getStats: () => api.get('/admin/stats'),
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data) => api.put('/admin/profile', data),
  uploadAvatar: (formData) => api.post('/admin/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Chat APIs
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId, page) => api.get(`/chat/conversations/${conversationId}/messages`, { params: { page } }),
  sendMessage: (data) => api.post('/chat/messages', data),
  getUnreadCount: () => api.get('/chat/unread'),
};

// Notification APIs
export const notificationAPI = {
  getAll: (unread) => api.get('/notifications', { params: { unread } }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export default api;
