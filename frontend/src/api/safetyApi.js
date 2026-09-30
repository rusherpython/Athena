import apiClient, { DEMO_MODE } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let localContacts = [];
let localSosSettings = {
  enabled: false,
  autoEscalation: false,
  timeout: 60,
  escalationMethod: 'both',
};

export const safetyApi = {
  async getContacts() {
    if (DEMO_MODE) { await delay(400); return localContacts; }
    const res = await apiClient.get(API_ENDPOINTS.safety.contacts);
    return res.data;
  },

  async updateContacts(contacts) {
    if (DEMO_MODE) {
      await delay(500);
      localContacts = contacts;
      return { success: true };
    }
    const res = await apiClient.post(API_ENDPOINTS.safety.contacts, { contacts });
    return res.data;
  },

  async getSettings() {
    if (DEMO_MODE) { await delay(300); return localSosSettings; }
    const res = await apiClient.get(API_ENDPOINTS.safety.settings);
    return res.data;
  },

  async updateSettings(settings) {
    if (DEMO_MODE) {
      await delay(400);
      localSosSettings = { ...localSosSettings, ...settings };
      return localSosSettings;
    }
    const res = await apiClient.patch(API_ENDPOINTS.safety.settings, settings);
    return res.data;
  },

  async triggerSOS() {
    if (DEMO_MODE) {
      await delay(1000);
      return {
        success: false,
        message: 'SOS requires backend integration and explicit user configuration. (Demo Mode)',
      };
    }
    const res = await apiClient.post(API_ENDPOINTS.safety.sos);
    return res.data;
  },

  async checkIn(status) {
    if (DEMO_MODE) {
      await delay(600);
      return { success: true, status };
    }
    const res = await apiClient.post(API_ENDPOINTS.safety.checkIn, { status });
    return res.data;
  },
};
