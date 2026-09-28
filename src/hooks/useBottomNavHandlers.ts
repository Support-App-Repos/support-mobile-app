import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import type { BottomNavItem } from '../components/navigation';
import { useStore } from './useStore';

export const useBottomNavHandlers = (
  navigation: any,
  initialTab: BottomNavItem = 'Home'
) => {
  const [activeTab, setActiveTab] = useState<BottomNavItem>(initialTab);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { canCreateListing } = useStore();

  const showCreateGateAlert = useCallback(() => {
    Alert.alert(
      'Aesthetics store required',
      'Create and verify your Aesthetics store before adding Aesthetics listings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Store', onPress: () => navigation?.navigate('Store') },
      ]
    );
  }, [navigation]);

  const handleCreatePress = useCallback(() => {
    navigation?.navigate('SelectCategory');
  }, [navigation]);

  const handleTabPress = useCallback(
    (tab: BottomNavItem) => {
      setActiveTab(tab);
      if (tab === 'Home') {
        navigation?.navigate('Home');
      } else if (tab === 'Store') {
        navigation?.navigate('Store');
      } else if (tab === 'Messages') {
        setSnackbarVisible(true);
      } else if (tab === 'Profile') {
        navigation?.navigate('Profile');
      }
    },
    [navigation]
  );

  return {
    activeTab,
    setActiveTab,
    snackbarVisible,
    setSnackbarVisible,
    canCreateListing,
    handleCreatePress,
    handleTabPress,
    showCreateGateAlert,
  };
};
