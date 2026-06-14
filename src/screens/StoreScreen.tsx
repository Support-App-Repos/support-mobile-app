/**
 * Store Hub Screen
 */

import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BellIcon,
  Snackbar,
  ForwardIcon,
  StoreVerificationPendingIcon,
  StoreHubProfileIcon,
  StoreHubDashboardIcon,
  StoreHubCreateIcon,
  StoreHubListingsIcon,
} from '../components/common';
import { BottomNavigation } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { useProfile, useStore, useBottomNavHandlers } from '../hooks';

type HubRoute = 'CreateStore' | 'StoreProfile' | 'StoreDashboard' | 'ManageStoreListings';

type HubItem = {
  id: string;
  title: string;
  subtitle: string;
  route: HubRoute;
  Icon: React.FC<{ size?: number }>;
  requiresNoStore?: boolean;
  requiresStore?: boolean;
  requiresVerified?: boolean;
};

const HUB_ITEMS: HubItem[] = [
  {
    id: 'create',
    title: 'Create New Store',
    subtitle: 'Start your business journey',
    route: 'CreateStore',
    Icon: StoreHubCreateIcon,
    requiresNoStore: true,
  },
  {
    id: 'profile',
    title: 'View Store Profile',
    subtitle: 'Public store page',
    route: 'StoreProfile',
    Icon: StoreHubProfileIcon,
    requiresStore: true,
  },
  {
    id: 'dashboard',
    title: 'Store Dashboard',
    subtitle: 'Manage your store',
    route: 'StoreDashboard',
    Icon: StoreHubDashboardIcon,
    requiresStore: true,
  },
  {
    id: 'listings',
    title: 'Manage Listings',
    subtitle: 'View and edit your products',
    route: 'ManageStoreListings',
    Icon: StoreHubListingsIcon,
    requiresStore: true,
    requiresVerified: true,
  },
];

export const StoreScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { profileImageUrl } = useProfile();
  const { store, loading, refreshStore } = useStore();
  const {
    activeTab,
    setActiveTab,
    snackbarVisible,
    setSnackbarVisible,
    canCreateListing,
    handleCreatePress,
    handleTabPress,
    showCreateGateAlert,
  } = useBottomNavHandlers(navigation, 'Store');

  useFocusEffect(
    React.useCallback(() => {
      setActiveTab('Store');
      refreshStore();
    }, [setActiveTab, refreshStore])
  );

  const isPendingReview = store?.verificationStatus === 'pending';

  const visibleItems = HUB_ITEMS.filter((item) => {
    if (isPendingReview && (item.id === 'profile' || item.id === 'dashboard')) return false;
    if (item.requiresNoStore && store?.id) return false;
    if (item.requiresStore && !store?.id) return false;
    if (item.requiresVerified && !store?.isVerified) return false;
    return true;
  });

  const verificationBanner = () => {
    if (!store || isPendingReview) return null;
    if (store.isVerified) return null;
    if (store.verificationStatus === 'rejected') {
      return (
        <View style={styles.bannerRejected}>
          <Text style={styles.bannerText}>
            Verification was rejected. Please resubmit your documents.
          </Text>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => navigation?.navigate('CreateStore', { edit: true })}
          >
            <Text style={styles.bannerButtonText}>Resubmit</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.bannerUnverified}>
        <Text style={styles.bannerText}>
          Complete store verification to start adding listings.
        </Text>
        <TouchableOpacity
          style={styles.bannerButton}
          onPress={() => navigation?.navigate('CreateStore', { edit: true })}
        >
          <Text style={styles.bannerButtonText}>Verify Store</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Store</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <BellIcon size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation?.navigate('Profile')}
          >
            <Image
              source={{ uri: profileImageUrl || 'https://i.pravatar.cc/150?img=12' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isPendingReview && (
          <>
            <Text style={styles.welcomeTitle}>Welcome to Store</Text>
            <Text style={styles.welcomeSubtitle}>
              Manage your marketplace business with ease
            </Text>
          </>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 40 }} />
        ) : isPendingReview ? (
          <View style={styles.pendingReviewCard}>
            <StoreVerificationPendingIcon size={148} />
            <Text style={styles.pendingReviewTitle}>Verification Under Review</Text>
            <Text style={styles.pendingReviewMessage}>
              Your store verification is under review. It will take 1-2 days for approval and you
              can access your store dashboard and listings.
            </Text>
          </View>
        ) : (
          <>
            {verificationBanner()}
            {visibleItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.hubCard}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.route === 'StoreProfile' && store?.id) {
                    navigation?.navigate('StoreProfile', { storeId: store.id });
                  } else if (item.route === 'CreateStore' && store?.id) {
                    navigation?.navigate('CreateStore', { edit: true });
                  } else {
                    navigation?.navigate(item.route);
                  }
                }}
              >
                <View style={styles.hubIconWrap}>
                  {item.Icon ? <item.Icon size={44} /> : null}
                </View>
                <View style={styles.hubText}>
                  <Text style={styles.hubTitle}>{item.title}</Text>
                  <Text style={styles.hubSubtitle}>{item.subtitle}</Text>
                </View>
                <ForwardIcon size={22} color={Colors.light.primary} />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <BottomNavigation
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onCreatePress={handleCreatePress}
        canCreateListing={canCreateListing}
        onDisabledCreatePress={showCreateGateAlert}
        showCreateButton
      />

      <Snackbar
        visible={snackbarVisible}
        message="Coming soon feature"
        type="info"
        onDismiss={() => setSnackbarVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerTitle: { ...Typography.h3, color: Colors.light.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconButton: { padding: Spacing.xs },
  profileButton: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
  profileImage: { width: 36, height: 36 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  welcomeTitle: { ...Typography.h2, color: Colors.light.text, marginBottom: Spacing.xs },
  welcomeSubtitle: { ...Typography.body, color: Colors.light.textSecondary, marginBottom: Spacing.lg },
  pendingReviewCard: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#1A6B5A33',
    backgroundColor: '#1A6B5A0A',
  },
  pendingReviewTitle: {
    ...Typography.h3,
    color: '#1A6B5A',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  pendingReviewMessage: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  hubIconWrap: {
    marginRight: Spacing.md,
  },
  hubText: { flex: 1 },
  hubTitle: { ...Typography.body, fontWeight: '600', color: Colors.light.text },
  hubSubtitle: { ...Typography.caption, color: Colors.light.textSecondary, marginTop: 2 },
  bannerRejected: {
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  bannerUnverified: {
    backgroundColor: '#E0F2FE',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  bannerText: { ...Typography.caption, color: Colors.light.text, marginBottom: Spacing.sm },
  bannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  bannerButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
