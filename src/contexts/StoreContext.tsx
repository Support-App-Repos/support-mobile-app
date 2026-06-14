/**
 * Store Context
 * Provides current user's store state for gating listing creation
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authService, storeService } from '../services';
import type { Store } from '../types';
import { unwrapApiPayload } from '../utils/apiHelpers';
import { useProfileContext } from './ProfileContext';

interface StoreContextType {
  store: Store | null;
  loading: boolean;
  error: string | null;
  refreshStore: () => Promise<void>;
  clearStore: () => void;
  canCreateListing: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useProfileContext();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.id ?? null;

  const fetchStore = useCallback(async () => {
    try {
      const authed = await authService.isAuthenticated();
      if (!authed) {
        setStore(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const response = await storeService.getMyStore();
      const storeData = unwrapApiPayload<Store>(response);

      if (response.success) {
        setStore(storeData);
      } else {
        setStore(null);
        setError('Failed to fetch store');
      }
    } catch (err: any) {
      console.error('Error fetching store:', err);
      setError(err.message || 'Failed to fetch store');
      setStore(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStore();
  }, [fetchStore, userId]);

  const canCreateListing = store != null && store.isVerified === true;

  const clearStore = useCallback(() => {
    setStore(null);
    setError(null);
    setLoading(false);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        store,
        loading,
        error,
        refreshStore: fetchStore,
        clearStore,
        canCreateListing,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
};
