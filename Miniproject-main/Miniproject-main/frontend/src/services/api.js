const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api');

export const api = {
    // Auth
    login: async (mailId, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mailId, password }),
        });
        return res.json();
    },
    
    sendOtp: async (mailId) => {
        const res = await fetch(`${API_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mailId }),
        });
        return res.json();
    },

    verifyOtp: async (mailId, otp) => {
        const res = await fetch(`${API_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mailId, otp }),
        });
        return res.json();
    },

    uploadCsv: async (file, adminId) => {
        const formData = new FormData();
        formData.append('file', file);
        if (adminId) formData.append('adminId', adminId);

        const res = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData,
        });
        return res.json();
    },

    // Dashboard
    searchAccount: async (query) => {
        const res = await fetch(`${API_URL}/dashboard/search?query=${query}`);
        return res.json();
    },

    getAlerts: async () => {
        const res = await fetch(`${API_URL}/dashboard/alerts`);
        return res.json();
    },

    getGraph: async () => {
        const res = await fetch(`${API_URL}/dashboard/graph`);
        return res.json();
    },

    getCases: async () => {
        const res = await fetch(`${API_URL}/dashboard/cases`);
        return res.json();
    },

    getRisks: async () => {
        const res = await fetch(`${API_URL}/dashboard/risks`);
        return res.json();
    },
    resolveCase: async (caseId) => {
        const res = await fetch(`${API_URL}/dashboard/cases/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caseId }),
        });
        return res.json();
    },

    // User Profile & Settings
    getSettings: async (email) => {
        const res = await fetch(`${API_URL}/user/settings?email=${email}`);
        return res.json();
    },

    updateSettings: async (data) => {
        const res = await fetch(`${API_URL}/user/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    getAuditLogs: async (email) => {
        const res = await fetch(`${API_URL}/user/audit-logs?email=${email}`);
        return res.json();
    },

    getNotifications: async (email) => {
        const res = await fetch(`${API_URL}/user/notifications?email=${email}`);
        return res.json();
    },

    markNotificationAsRead: async (id) => {
        const res = await fetch(`${API_URL}/user/notifications/${id}/read`, {
            method: 'PATCH',
        });
        return res.json();
    },

    submitHelpRequest: async (data) => {
        const res = await fetch(`${API_URL}/user/help-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    // AI Chat
    chatWithAI: async (message) => {
        const res = await fetch(`${API_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });
        return res.json();
    }
};
