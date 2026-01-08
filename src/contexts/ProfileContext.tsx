/**
 * Profile Context
 * Provides global profile state and refresh functionality
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { profileService } from '../services';

interface ProfileContextType {
  user: any;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  profileImageUrl: string | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileService.getProfile();
      const profileData = (response.data as any)?.data || response.data;
      
      if (response.success && profileData) {
        setUser(profileData);
      } else {
        setError('Failed to fetch profile');
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const profileImageUrl = user?.profileImageUrl || user?.profileImage || null;

  return (
    <ProfileContext.Provider
      value={{
        user,
        loading,
        error,
        refreshProfile,
        profileImageUrl,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};

