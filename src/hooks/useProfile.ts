/**
 * useProfile Hook
 * Fetches and caches user profile data for use across screens
 * Now uses ProfileContext for global state management
 */

import { useProfileContext } from '../contexts/ProfileContext';

export const useProfile = () => {
  return useProfileContext();
};

