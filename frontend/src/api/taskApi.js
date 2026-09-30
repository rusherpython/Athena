import apiClient, { DEMO_MODE } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import { mockTasks } from './mockData';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let localTasks = [...mockTasks];

export const taskApi = {
  async getTasks() {
    if (DEMO_MODE) { await delay(400); return localTasks; }
    const res = await apiClient.get(API_ENDPOINTS.tasks.list);
    return res.data;
  },

  async createTask(task) {
    if (DEMO_MODE) {
      await delay(500);
      const newTask = { ...task, id: 't' + Date.now(), createdAt: new Date().toISOString(), status: task.status || 'todo' };
      localTasks = [newTask, ...localTasks];
      return newTask;
    }
    const res = await apiClient.post(API_ENDPOINTS.tasks.create, task);
    return res.data;
  },

  async updateTask(id, updates) {
    if (DEMO_MODE) {
      await delay(400);
      localTasks = localTasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
      return localTasks.find((t) => t.id === id);
    }
    const res = await apiClient.patch(API_ENDPOINTS.tasks.update(id), updates);
    return res.data;
  },

  async deleteTask(id) {
    if (DEMO_MODE) {
      await delay(400);
      localTasks = localTasks.filter((t) => t.id !== id);
      return { success: true };
    }
    const res = await apiClient.delete(API_ENDPOINTS.tasks.delete(id));
    return res.data;
  },

  async completeTask(id) {
    if (DEMO_MODE) {
      await delay(400);
      localTasks = localTasks.map((t) => (t.id === id ? { ...t, status: 'completed' } : t));
      return { success: true };
    }
    const res = await apiClient.patch(API_ENDPOINTS.tasks.update(id), { status: 'completed' });
    return res.data;
  },
};
