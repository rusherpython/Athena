/**
 * API endpoint configuration — change paths here to match actual backend routes.
 * The frontend reads from this single file, so nothing breaks if the backend renames endpoints.
 */
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
  },

  // User / Profile
  user: {
    profile: '/user/profile',
    update: '/user/profile',
    onboarding: '/user/onboarding',
    onboardingComplete: '/user/onboarding/complete',
  },

  // Chat / ATHENA
  chat: {
    send: '/chat',
    history: '/chat/history',
  },

  // Tasks
  tasks: {
    list: '/tasks',
    create: '/tasks',
    update: (id) => `/tasks/${id}`,
    delete: (id) => `/tasks/${id}`,
    complete: (id) => `/tasks/${id}`,
  },

  // Reminders
  reminders: {
    list: '/reminders',
    create: '/reminders',
    update: (id) => `/reminders/${id}`,
    delete: (id) => `/reminders/${id}`,
  },

  // Memory
  memory: {
    get: '/memory',
    add: '/memory',
    update: (id) => `/memory/${id}`,
    delete: (id) => `/memory/${id}`,
  },

  // Behavior / Digital Twin
  behavior: {
    patterns: '/behavior',
    insights: '/behavior',
  },

  // Wellness
  wellness: {
    get: '/wellness',
    update: '/wellness',
    period: '/wellness',
    sleep: '/wellness',
    workout: '/wellness',
  },

  // Lifestyle
  lifestyle: {
    get: '/lifestyle',
    update: '/lifestyle',
    spotify: '/lifestyle',
    youtube: '/lifestyle',
    pets: '/lifestyle',
  },

  // Safety
  safety: {
    contacts: '/safety/contacts',
    sos: '/safety/sos',
    checkIn: '/safety/check-in',
    settings: '/safety/config',
  },

  // Rewards
  rewards: {
    get: '/rewards',
    history: '/rewards/history',
    redeem: (id) => `/rewards/${id}/redeem`,
  },

  // Feedback
  feedback: {
    submit: '/feedback',
  },
};
