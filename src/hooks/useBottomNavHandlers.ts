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
      'Store required',
      'Create and verify your store before adding listings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Store', onPress: () => navigation?.navigate('Store') },
      ]
    );
  }, [navigation]);

  const handleCreatePress = useCallback(() => {
    if (!canCreateListing) {
      showCreateGateAlert();
      return;
    }
    navigation?.navigate('SelectCategory');
  }, [canCreateListing, navigation, showCreateGateAlert]);

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
