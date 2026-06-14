/**
 * Bottom Navigation Component
 * Fixed bottom navigation bar with Home, Store, Create, Messages, Profile
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HomeIcon,
  StoreIcon,
  MessageIcon,
  ProfileIcon,
  AddNewIcon,
} from '../common';
import { Colors, Spacing, Typography } from '../../config/theme';

export type BottomNavItem = 'Home' | 'Store' | 'Messages' | 'Profile';

interface BottomNavigationProps {
  activeTab: BottomNavItem;
  onTabPress: (tab: BottomNavItem) => void;
  onCreatePress: () => void;
  showCreateButton?: boolean;
  canCreateListing?: boolean;
  onDisabledCreatePress?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
  onCreatePress,
  showCreateButton = true,
  canCreateListing = true,
  onDisabledCreatePress,
}) => {
  const handleCreatePress = () => {
    if (!canCreateListing) {
      onDisabledCreatePress?.();
      return;
    }
    onCreatePress();
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabPress('Home')}
          activeOpacity={0.7}
        >
          <HomeIcon
            size={24}
            color={activeTab === 'Home' ? Colors.light.primary : '#828282'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'Home' && styles.navLabelActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabPress('Store')}
          activeOpacity={0.7}
        >
          <StoreIcon
            size={24}
            color={activeTab === 'Store' ? Colors.light.primary : '#828282'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'Store' && styles.navLabelActive,
            ]}
          >
            Store
          </Text>
        </TouchableOpacity>

        {showCreateButton && (
          <View style={styles.createButtonContainer}>
            <TouchableOpacity
              style={[
                styles.createButton,
                !canCreateListing && styles.createButtonDisabled,
              ]}
              onPress={handleCreatePress}
              activeOpacity={canCreateListing ? 0.8 : 1}
            >
              <AddNewIcon size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
        {!showCreateButton && <View style={styles.createButtonContainer} />}

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabPress('Messages')}
          activeOpacity={0.7}
        >
          <MessageIcon
            size={24}
            color={activeTab === 'Messages' ? Colors.light.primary : '#828282'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'Messages' && styles.navLabelActive,
            ]}
          >
            Messages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabPress('Profile')}
          activeOpacity={0.7}
        >
          <ProfileIcon
            size={24}
            color={activeTab === 'Profile' ? Colors.light.primary : '#828282'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'Profile' && styles.navLabelActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    backgroundColor: Colors.light.background,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: Spacing.xs,
  },
  navLabel: {
    ...Typography.caption,
    color: '#828282',
    marginTop: Spacing.xs,
    fontSize: 12,
  },
  navLabelActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  createButtonContainer: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginHorizontal: Spacing.sm,
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  createButtonDisabled: {
    opacity: 0.45,
  },
});
