/**
 * Bottom Navigation Component
 * Fixed bottom navigation bar with Home, My Listings, Create, Messages, Profile
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
  MyListingsIcon,
  MessageIcon,
  ProfileIcon,
  AddNewIcon,
} from '../common';
import { Colors, Spacing, Typography } from '../../config/theme';

export type BottomNavItem = 'Home' | 'MyListings' | 'Messages' | 'Profile';

interface BottomNavigationProps {
  activeTab: BottomNavItem;
  onTabPress: (tab: BottomNavItem) => void;
  onCreatePress: () => void;
  showCreateButton?: boolean; // Only show plus button on Home screen
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
  onCreatePress,
  showCreateButton = true,
}) => {
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
            color={activeTab === 'Home' ? Colors.light.primary : '#6B7280'}
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
          onPress={() => onTabPress('MyListings')}
          activeOpacity={0.7}
        >
          <MyListingsIcon
            size={24}
            color={activeTab === 'MyListings' ? Colors.light.primary : '#6B7280'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'MyListings' && styles.navLabelActive,
            ]}
          >
            My Listings
          </Text>
        </TouchableOpacity>

        {showCreateButton && (
          <View style={styles.createButtonContainer}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={onCreatePress}
              activeOpacity={0.8}
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
            color={activeTab === 'Messages' ? Colors.light.primary : '#6B7280'}
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
            color={activeTab === 'Profile' ? Colors.light.primary : '#6B7280'}
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
    color: '#6B7280',
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
    marginTop: -30, // Half the button height (56/2 = 28) to position it half above
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

