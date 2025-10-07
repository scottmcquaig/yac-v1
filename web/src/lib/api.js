import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get the current league ID from localStorage
 */
export const getCurrentLeagueId = () => {
  return localStorage.getItem('currentLeagueId');
};

/**
 * Set the current league ID in localStorage
 */
export const setCurrentLeagueId = (leagueId) => {
  if (leagueId) {
    localStorage.setItem('currentLeagueId', leagueId);
  } else {
    localStorage.removeItem('currentLeagueId');
  }
};

/**
 * Get the Firebase ID token
 */
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
};

/**
 * Generic API request helper
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

/**
 * League API
 */
export const leagueApi = {
  // Create a league
  create: (data) => apiRequest('/api/leagues', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get user's leagues
  getMine: () => apiRequest('/api/leagues/mine'),

  // Get a specific league
  get: (leagueId) => apiRequest(`/api/leagues/${leagueId}`),

  // Update league settings
  updateSettings: (leagueId, settings) => apiRequest(`/api/leagues/${leagueId}/settings`, {
    method: 'PATCH',
    body: JSON.stringify({ settings }),
  }),

  // Update league status
  updateStatus: (leagueId, status) => apiRequest(`/api/leagues/${leagueId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  }),
};

/**
 * Team API
 */
export const teamApi = {
  // Create a team
  create: (leagueId, name) => apiRequest(`/api/leagues/${leagueId}/teams`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  }),

  // Get all teams
  getAll: (leagueId) => apiRequest(`/api/leagues/${leagueId}/teams`),

  // Get leaderboard
  getLeaderboard: (leagueId) => apiRequest(`/api/leagues/${leagueId}/teams/leaderboard`),

  // Join a team
  join: (leagueId, teamId) => apiRequest(`/api/leagues/${leagueId}/teams/${teamId}/join`, {
    method: 'POST',
  }),
};

/**
 * Player API
 */
export const playerApi = {
  // Get all players
  getAll: (leagueId) => apiRequest(`/api/leagues/${leagueId}/players`),

  // Import players
  import: (leagueId, players) => apiRequest(`/api/leagues/${leagueId}/players/import`, {
    method: 'POST',
    body: JSON.stringify({ players }),
  }),

  // Update player
  update: (leagueId, playerId, data) => apiRequest(`/api/leagues/${leagueId}/players/${playerId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Delete player
  delete: (leagueId, playerId) => apiRequest(`/api/leagues/${leagueId}/players/${playerId}`, {
    method: 'DELETE',
  }),
};

/**
 * Draft API
 */
export const draftApi = {
  // Start draft
  start: (leagueId) => apiRequest(`/api/leagues/${leagueId}/draft/start`, {
    method: 'POST',
  }),

  // Make a pick
  pick: (leagueId, playerId, teamId) => apiRequest(`/api/leagues/${leagueId}/draft/pick`, {
    method: 'POST',
    body: JSON.stringify({ playerId, teamId }),
  }),

  // Reset draft
  reset: (leagueId) => apiRequest(`/api/leagues/${leagueId}/draft/reset`, {
    method: 'POST',
  }),

  // Get draft status
  getStatus: (leagueId) => apiRequest(`/api/leagues/${leagueId}/draft/status`),
};

/**
 * Scoring API
 */
export const scoringApi = {
  // Add scoring event
  add: (leagueId, data) => apiRequest(`/api/leagues/${leagueId}/scoring/add`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get weekly scoring
  getWeek: (leagueId, week) => apiRequest(`/api/leagues/${leagueId}/scoring/week/${week}`),

  // Delete scoring event
  delete: (leagueId, eventId) => apiRequest(`/api/leagues/${leagueId}/scoring/${eventId}`, {
    method: 'DELETE',
  }),
};

/**
 * Week API
 */
export const weekApi = {
  // Get all weeks
  getAll: (leagueId) => apiRequest(`/api/leagues/${leagueId}/weeks`),

  // Create a week
  create: (leagueId, data) => apiRequest(`/api/leagues/${leagueId}/weeks`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Bulk create weeks
  bulkCreate: (leagueId, weeks) => apiRequest(`/api/leagues/${leagueId}/weeks/bulk`, {
    method: 'POST',
    body: JSON.stringify({ weeks }),
  }),

  // Finalize week
  finalize: (leagueId, week) => apiRequest(`/api/leagues/${leagueId}/weeks/${week}/finalize`, {
    method: 'PATCH',
  }),
};

/**
 * Invite API
 */
export const inviteApi = {
  // Create invite
  create: (leagueId, data) => apiRequest(`/api/leagues/${leagueId}/invites`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get all invites for a league
  getAll: (leagueId) => apiRequest(`/api/leagues/${leagueId}/invites`),

  // Redeem invite
  redeem: (code, teamName) => apiRequest('/api/invites/redeem', {
    method: 'POST',
    body: JSON.stringify({ code, teamName }),
  }),
};
