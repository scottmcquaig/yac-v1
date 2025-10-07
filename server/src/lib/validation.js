/**
 * Validation utilities for input sanitization and type checking
 */

export const validateLeagueName = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error('League name is required and must be a string');
  }
  if (name.trim().length < 3) {
    throw new Error('League name must be at least 3 characters');
  }
  if (name.length > 100) {
    throw new Error('League name must be less than 100 characters');
  }
  return name.trim();
};

export const validateTeamName = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error('Team name is required and must be a string');
  }
  if (name.trim().length < 2) {
    throw new Error('Team name must be at least 2 characters');
  }
  if (name.length > 50) {
    throw new Error('Team name must be less than 50 characters');
  }
  return name.trim();
};

export const validatePlayerName = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error('Player name is required and must be a string');
  }
  if (name.trim().length < 1) {
    throw new Error('Player name cannot be empty');
  }
  if (name.length > 100) {
    throw new Error('Player name must be less than 100 characters');
  }
  return name.trim();
};

export const validateNumber = (value, min = 0, max = Infinity, fieldName = 'Value') => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a number`);
  }
  if (num < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }
  if (num > max) {
    throw new Error(`${fieldName} must be at most ${max}`);
  }
  return num;
};

export const validateEnum = (value, allowedValues, fieldName = 'Value') => {
  if (!allowedValues.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
  return value;
};

export const validateObjectId = (id, fieldName = 'ID') => {
  if (!id || typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error(`${fieldName} must be a valid ObjectId`);
  }
  return id;
};

export const validateScoringRules = (rules) => {
  if (!rules || typeof rules !== 'object') {
    throw new Error('Scoring rules must be an object');
  }

  const validated = {};
  for (const [key, value] of Object.entries(rules)) {
    if (typeof key !== 'string' || key.trim().length === 0) {
      throw new Error('Scoring rule keys must be non-empty strings');
    }
    const points = validateNumber(value, -100, 100, `Points for ${key}`);
    validated[key.toUpperCase()] = points;
  }

  return validated;
};

export const validateInviteCode = (code) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Invite code is required');
  }
  const cleaned = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{6,12}$/.test(cleaned)) {
    throw new Error('Invite code must be 6-12 alphanumeric characters');
  }
  return cleaned;
};
