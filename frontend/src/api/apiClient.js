import axios from 'axios';

// Get base URL from env, or localStorage override, or default to localhost for local dev
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('athena_api_url');
    if (customUrl) return customUrl.trim().replace(/\/$/, '');
  }
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl.trim().replace(/\/$/, '');
  return 'http://localhost:8000';
};

export const DEMO_MODE =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  (typeof window !== 'undefined' && localStorage.getItem('athena_demo_mode') === 'true');

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45s to accommodate Render free-tier cold starts
});

// Attach current baseURL & auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseUrl();
    const token = localStorage.getItem('athena_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('athena_token');
      localStorage.removeItem('athena_user');
      window.dispatchEvent(new Event('athena:logout'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
