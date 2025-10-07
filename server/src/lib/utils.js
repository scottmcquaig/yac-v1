import crypto from 'crypto';

/**
 * Generate a random alphanumeric invite code
 */
export const generateInviteCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Calculate snake draft order for a given pick number
 * @param {number} pickNumber - The current pick number (1-indexed)
 * @param {number} totalTeams - Total number of teams
 * @returns {number} The team index (0-indexed)
 */
export const calculateSnakeDraftOrder = (pickNumber, totalTeams) => {
  const round = Math.floor((pickNumber - 1) / totalTeams);
  const positionInRound = (pickNumber - 1) % totalTeams;

  // Even rounds go forward, odd rounds go backward
  if (round % 2 === 0) {
    return positionInRound;
  } else {
    return totalTeams - 1 - positionInRound;
  }
};
