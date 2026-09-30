import apiClient, { DEMO_MODE, getBaseUrl } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import { mockUser } from './mockData';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const authApi = {
  async login(email, password) {
    if (DEMO_MODE) {
      await delay(600);
      const token = 'demo-token-' + Date.now();
      return { token, user: { ...mockUser, email, name: email.split('@')[0] } };
    }

    try {
      const res = await apiClient.post(API_ENDPOINTS.auth.login, { email, password });
      const token = res.data.access_token || res.data.token;
      if (!token) {
        throw new Error('Login succeeded but no access token received from server.');
      }
      const user = {
        id: res.data.user_id,
        email,
        name: email.split('@')[0],
        onboardingComplete: true,
        ...(res.data.user || {}),
      };
      return { token, user };
    } catch (err) {
      if (!err.response) {
        const url = getBaseUrl();
        throw new Error(
          `Cannot connect to backend (${url}). If your Render server is waking up from standby, please retry in 30 seconds, or use Demo Mode.`
        );
      }
      if (err.response.status === 404) {
        const url = getBaseUrl();
        throw new Error(`Authentication route not found (404) at ${url}${API_ENDPOINTS.auth.login}.`);
      }
      const data = err.response?.data;
      let detail = '';
      if (typeof data?.detail === 'string') {
        detail = data.detail;
      } else if (Array.isArray(data?.detail)) {
        detail = data.detail.map((d) => d.msg || d.message).join(', ');
      } else if (data?.message) {
        detail = data.message;
      }
      if (typeof detail === 'string' && (detail.toLowerCase().includes('confirm') || detail.toLowerCase().includes('verify'))) {
        throw new Error('Supabase email confirmation is enabled. Please confirm your email via your inbox, or disable email verification in Supabase dashboard.');
      }
      throw new Error(detail || 'Invalid email or password.');
    }
  },

  async register(name, email, password) {
    if (DEMO_MODE) {
      await delay(600);
      const token = 'demo-token-' + Date.now();
      return { token, user: { ...mockUser, name, email, onboardingComplete: false } };
    }

    let res;
    try {
      res = await apiClient.post(API_ENDPOINTS.auth.register, { name, email, password });
    } catch (err) {
      if (!err.response) {
        const url = getBaseUrl();
        throw new Error(
          `Cannot connect to backend (${url}). Ensure your Render backend is running, or use Demo Mode.`
        );
      }
      if (err.response.status === 404) {
        const url = getBaseUrl();
        throw new Error(`Authentication route not found (404) at ${url}${API_ENDPOINTS.auth.register}. Please check server URL.`);
      }
      const data = err.response?.data;
      let errorMsg = '';
      if (typeof data?.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data?.detail)) {
        errorMsg = data.detail.map((d) => d.msg || d.message).join(', ');
      } else if (data?.message) {
        errorMsg = data.message;
      }
      throw new Error(errorMsg || `Registration failed (status ${err.response.status}). Please try a different email or password.`);
    }

    // If server provided access_token immediately
    if (res.data?.access_token) {
      return {
        token: res.data.access_token,
        user: { id: res.data.user_id, email, name, onboardingComplete: false },
      };
    }

    // Otherwise attempt automatic login with the new credentials
    try {
      const loginRes = await apiClient.post(API_ENDPOINTS.auth.login, { email, password });
      return {
        token: loginRes.data.access_token,
        user: { id: loginRes.data.user_id, email, name, onboardingComplete: false },
      };
    } catch (loginErr) {
      const detail = loginErr?.response?.data?.detail || '';
      if (detail.toLowerCase().includes('confirm') || detail.toLowerCase().includes('verify')) {
        throw new Error(
          'Account created! Supabase requires email verification. Check your email or disable confirmation in Supabase Authentication settings.'
        );
      }
      throw new Error(
        detail || 'Account registered! Please sign in with your email and password.'
      );
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
