/**
 * Store Hub Screen
 */

import React, { useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Snackbar,
  ForwardIcon,
  StoreVerificationPendingIcon,
  StoreHubProfileIcon,
  StoreHubDashboardIcon,
  StoreHubCreateIcon,
  StoreHubListingsIcon,
  StoreHubBookingsIcon,
  StoreWelcomeHeaderIcon,
} from '../components/common';
import { BottomNavigation } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { useStore, useBottomNavHandlers } from '../hooks';

type HubRoute =
  | 'CreateStore'
  | 'StoreProfile'
  | 'StoreDashboard'
  | 'ManageStoreListings'
  | 'StoreBookings';

type HubItem = {
  id: string;
  title: string;
  subtitle: string;
  route: HubRoute;
  Icon: React.FC<{ size?: number; style?: any }>;
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
    id: 'bookings',
    title: 'View Bookings',
    subtitle: 'Service and event bookings',
    route: 'StoreBookings',
    Icon: StoreHubBookingsIcon,
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

const HubActionCard: React.FC<{
  item: HubItem;
  onPress: () => void;
}> = ({ item, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      friction: 6,
      tension: 160,
    }).start();
  };

  return (
    <Pressable
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
      onPress={onPress}
    >
      <Animated.View style={[styles.hubCard, { transform: [{ scale }] }]}>
        <View style={styles.hubIconWrap}>
          <item.Icon size={48} />
        </View>
        <View style={styles.hubText}>
          <Text style={styles.hubTitle}>{item.title}</Text>
          <Text style={styles.hubSubtitle}>{item.subtitle}</Text>
        </View>
        <ForwardIcon size={18} color={Colors.light.textSecondary} />
      </Animated.View>
    </Pressable>
  );
};

export const StoreScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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
    useCallback(() => {
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={[styles.welcomeBanner, { paddingTop: Math.max(insets.top, Spacing.md) + Spacing.sm }]}>
        <View style={styles.welcomeCircleLeft} />
        <View style={styles.welcomeCircleRight} />
        <StoreWelcomeHeaderIcon size={56} />
        <Text style={styles.welcomeBannerTitle}>Welcome to Your Store</Text>
        <Text style={styles.welcomeBannerSubtitle}>Manage everything about your business</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
              <HubActionCard
                key={item.id}
                item={item}
                onPress={() => {
                  if (item.route === 'StoreProfile' && store?.id) {
                    navigation?.navigate('StoreProfile', { storeId: store.id });
                  } else if (item.route === 'CreateStore' && store?.id) {
                    navigation?.navigate('CreateStore', { edit: true });
                  } else {
                    navigation?.navigate(item.route);
                  }
                }}
              />
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

const WELCOME_NAVY = '#0D475C';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  welcomeBanner: {
    backgroundColor: WELCOME_NAVY,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    overflow: 'hidden',
  },
  welcomeCircleLeft: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: 40,
    left: -60,
  },
  welcomeCircleRight: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -40,
    right: -40,
  },
  welcomeBannerTitle: {
    ...Typography.h2,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34,
    marginTop: Spacing.md,
  },
  welcomeBannerSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.72)',
    marginTop: Spacing.xs,
    fontSize: 15,
  },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
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
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  hubIconWrap: {
    marginRight: Spacing.md,
  },
  hubText: { flex: 1 },
  hubTitle: { ...Typography.body, fontWeight: '700', color: Colors.light.text, fontSize: 16 },
  hubSubtitle: { ...Typography.caption, color: Colors.light.textSecondary, marginTop: 3 },
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
