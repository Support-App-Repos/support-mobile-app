/**
 * Publish Screen
 * Success screen shown after listing is published
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, BellIcon, SuccessIcon } from '../components/common';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';

type PublishScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      listingId?: string;
    };
  };
};

export const PublishScreen: React.FC<PublishScreenProps> = ({
  navigation,
  route,
}) => {
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');

  const handleBack = () => {
    navigation?.goBack();
  };

  const handleViewListing = () => {
    // Navigate to MyListings screen
    navigation?.navigate('MyListings');
  };

  const handleCreateAnother = () => {
    // Navigate back to SelectCategory to create another listing
    navigation?.reset({
      index: 0,
      routes: [{ name: 'SelectCategory' }],
    });
  };

  const handleReturnToHome = () => {
    navigation?.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <BackIcon size={24} color="#030303" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: Navigate to notifications
              console.log('Notifications pressed');
            }}
          >
            <BellIcon size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: Navigate to profile
              console.log('Profile pressed');
            }}
          >
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <SuccessIcon size={70} />
        </View>

        {/* Success Message */}
        <Text style={styles.successTitle}>Your listing is published!</Text>
        <Text style={styles.successMessage}>
          Congratulations! Your listing is now live and visible to potential
          customers.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.viewListingButton}
            onPress={handleViewListing}
            activeOpacity={0.8}
          >
            <Text style={styles.viewListingButtonText}>View Listing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createAnotherButton}
            onPress={handleCreateAnother}
            activeOpacity={0.8}
          >
            <Text style={styles.createAnotherButtonText}>Create Another</Text>
          </TouchableOpacity>
        </View>

        {/* Return To Home Link */}
        <TouchableOpacity
          style={styles.returnHomeLink}
          onPress={handleReturnToHome}
          activeOpacity={0.7}
        >
          <Text style={styles.returnHomeLinkText}>Return To Home</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'Home') {
            handleReturnToHome();
          } else if (tab === 'MyListings') {
            navigation?.navigate('MyListings');
          } else if (tab === 'Messages') {
            // TODO: Navigate to Messages screen when implemented
            console.log('Messages screen not yet implemented');
          } else if (tab === 'Profile') {
            navigation?.navigate('Profile');
          }
        }}
        onCreatePress={() => {}}
        showCreateButton={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  successIconContainer: {
    marginBottom: Spacing.xl,
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  successMessage: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    lineHeight: 20,
  },
  buttonsContainer: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  viewListingButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewListingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createAnotherButton: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAnotherButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  returnHomeLink: {
    paddingVertical: Spacing.sm,
  },
  returnHomeLinkText: {
    ...Typography.body,
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});


