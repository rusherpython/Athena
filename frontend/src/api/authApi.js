import apiClient, { DEMO_MODE } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import { mockUser } from './mockData';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const authApi = {
  async login(email, password) {
    if (DEMO_MODE) {
      await delay(800);
      const token = 'demo-token-' + Date.now();
      return { token, user: { ...mockUser, email } };
    }
    const res = await apiClient.post(API_ENDPOINTS.auth.login, { email, password });
    const token = res.data.access_token || res.data.token;
    const user = {
      id: res.data.user_id,
      email,
      name: email.split('@')[0],
      ...(res.data.user || {}),
    };
    return { token, user };
  },

  async register(name, email, password) {
    if (DEMO_MODE) {
      await delay(800);
      const token = 'demo-token-' + Date.now();
      return { token, user: { ...mockUser, name, email, onboardingComplete: false } };
    }
    const res = await apiClient.post(API_ENDPOINTS.auth.register, { name, email, password });
    if (res.data.access_token) {
      return {
        token: res.data.access_token,
        user: { id: res.data.user_id, email, name },
      };
    }
    // Attempt automatic login after registration
    try {
      const loginRes = await apiClient.post(API_ENDPOINTS.auth.login, { email, password });
      return {
        token: loginRes.data.access_token,
        user: { id: loginRes.data.user_id, email, name },
      };
    } catch {
      return {
        token: null,
        user: { id: res.data.user_id, email, name },
        message: res.data.message,
      };
    }
  },

  async logout() {
    if (DEMO_MODE) return { success: true };
    try {
      const res = await apiClient.post(API_ENDPOINTS.auth.logout);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  async getMe() {
    if (DEMO_MODE) {
      await delay(400);
      return mockUser;
    }
    const res = await apiClient.get(API_ENDPOINTS.auth.me);
    return res.data;
  },
};
