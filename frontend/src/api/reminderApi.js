import apiClient, { DEMO_MODE } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import { mockReminders } from './mockData';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let localReminders = [...mockReminders];

export const reminderApi = {
  async getReminders() {
    if (DEMO_MODE) { await delay(400); return localReminders; }
    const res = await apiClient.get(API_ENDPOINTS.reminders.list);
    return res.data;
  },

  async createReminder(reminder) {
    if (DEMO_MODE) {
      await delay(500);
      const newR = { ...reminder, id: 'r' + Date.now(), status: 'pending' };
      localReminders = [newR, ...localReminders];
      return newR;
    }
    const res = await apiClient.post(API_ENDPOINTS.reminders.create, reminder);
    return res.data;
  },

  async updateReminder(id, updates) {
    if (DEMO_MODE) {
      await delay(400);
      localReminders = localReminders.map((r) => (r.id === id ? { ...r, ...updates } : r));
      return localReminders.find((r) => r.id === id);
    }
    const res = await apiClient.patch(API_ENDPOINTS.reminders.update(id), updates);
    return res.data;
  },

  async deleteReminder(id) {
    if (DEMO_MODE) {
      await delay(400);
      localReminders = localReminders.filter((r) => r.id !== id);
      return { success: true };
    }
    const res = await apiClient.delete(API_ENDPOINTS.reminders.delete(id));
    return res.data;
  },
};
