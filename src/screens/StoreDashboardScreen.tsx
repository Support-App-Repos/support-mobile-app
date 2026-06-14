/**
 * Store Dashboard Screen
 */

import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BackIcon,
  Snackbar,
  StoreDashboardListingsIcon,
  StoreDashboardActiveIcon,
  StoreDashboardMessagesIcon,
  StoreDashboardViewsIcon,
  StoreQuickActionAddIcon,
  StoreQuickActionEditIcon,
  StoreQuickActionAnalyticsIcon,
} from '../components/common';
import { BottomNavigation } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { storeService } from '../services';
import { useStore, useBottomNavHandlers, useProfile } from '../hooks';
import type { StoreDashboard } from '../types';

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const StoreDashboardScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { store } = useStore();
  const { profileImageUrl } = useProfile();
  const [dashboard, setDashboard] = useState<StoreDashboard | null>(null);
  const [loading, setLoading] = useState(true);
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

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await storeService.getStoreDashboard();
      const data = (response.data as any)?.data || response.data;
      if (response.success && data) setDashboard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setActiveTab('Store');
      fetchDashboard();
    }, [setActiveTab, fetchDashboard])
  );

  const stats = dashboard?.stats;
  const storeData = dashboard?.store || store;
  const coverImageUrl = storeData?.coverImageUrl;

  const storeCardBody = (
    <>
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{storeData?.name}</Text>
        <View style={styles.badges}>
          {storeData?.isVerified && (
            <View style={styles.badgeVerified}>
              <StoreDashboardActiveIcon size={14} color="#FFFFFF" />
              <Text style={styles.badgeVerifiedText}>Verified</Text>
            </View>
          )}
          <View style={styles.badgeActive}>
            <Text style={styles.badgeActiveText}>Active</Text>
          </View>
        </View>
      </View>
      <View style={styles.avatar}>
        {storeData?.logoUrl ? (
          <Image source={{ uri: storeData.logoUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{getInitials(storeData?.name || 'S')}</Text>
        )}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <BackIcon size={24} color="#030303" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Store</Text>
        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.7}
          onPress={() => navigation?.navigate('Profile')}
        >
          <Image
            source={{ uri: profileImageUrl || 'https://i.pravatar.cc/150?img=12' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {coverImageUrl ? (
            <ImageBackground
              source={{ uri: coverImageUrl }}
              style={styles.storeCard}
              imageStyle={styles.storeCardCoverImage}
            >
              <View style={styles.storeCardOverlay} />
              <View style={styles.storeCardContent}>{storeCardBody}</View>
            </ImageBackground>
          ) : (
            <View style={[styles.storeCard, styles.storeCardSolid]}>
              <View style={styles.storeCardContent}>{storeCardBody}</View>
            </View>
          )}

          <View style={styles.statsGrid}>
            {[
              { label: 'Total Listings', value: stats?.totalListings ?? 0, Icon: StoreDashboardListingsIcon },
              { label: 'Active', value: stats?.activeListings ?? 0, Icon: StoreDashboardActiveIcon },
              { label: 'Messages', value: stats?.messages ?? 0, Icon: StoreDashboardMessagesIcon },
              { label: 'Views', value: stats?.views ?? 0, Icon: StoreDashboardViewsIcon },
            ].map((s) => (
              <View key={s.label} style={styles.statCard}>
                <s.Icon size={34} color="#A6A6A6" style={styles.statIcon} />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {(dashboard?.recentReviews || []).length === 0 ? (
            <Text style={styles.emptyReviews}>No reviews yet</Text>
          ) : (
            dashboard?.recentReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewInitials}>
                    {getInitials(review.user?.fullName || 'U')}
                  </Text>
                </View>
                <View style={styles.reviewBody}>
                  <Text style={styles.reviewName}>{review.user?.fullName}</Text>
                  <Text style={styles.reviewStars}>{'★'.repeat(review.rating)}</Text>
                  <Text style={styles.reviewComment} numberOfLines={2}>{review.comment}</Text>
                </View>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <Pressable
              style={styles.actionItem}
              android_ripple={{ color: 'transparent', borderless: true }}
              onPress={canCreateListing ? () => navigation?.navigate('SelectCategory') : showCreateGateAlert}
            >
              <View style={styles.actionIconClip}>
                <StoreQuickActionAddIcon size={51} />
              </View>
              <Text style={styles.actionLabel}>Add Listing</Text>
            </Pressable>
            <Pressable
              style={styles.actionItem}
              android_ripple={{ color: 'transparent', borderless: true }}
              onPress={() => navigation?.navigate('CreateStore', { edit: true })}
            >
              <View style={styles.actionIconClip}>
                <StoreQuickActionEditIcon size={51} />
              </View>
              <Text style={styles.actionLabel}>Edit Store</Text>
            </Pressable>
            <Pressable
              style={styles.actionItem}
              android_ripple={{ color: 'transparent', borderless: true }}
              onPress={() => navigation?.navigate('StoreAnalytics')}
            >
              <View style={styles.actionIconClip}>
                <StoreQuickActionAnalyticsIcon size={51} />
              </View>
              <Text style={styles.actionLabel}>Analytics</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      <BottomNavigation
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onCreatePress={handleCreatePress}
        canCreateListing={canCreateListing}
        onDisabledCreatePress={showCreateGateAlert}
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
  container: { flex: 1, backgroundColor: Colors.light.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.background,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  headerTitle: {
    ...Typography.h3,
    flex: 1,
    textAlign: 'center',
    color: Colors.light.text,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  storeCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  storeCardSolid: {
    backgroundColor: Colors.light.primary,
  },
  storeCardCoverImage: {
    borderRadius: BorderRadius.lg,
    resizeMode: 'cover',
  },
  storeCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  storeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  storeInfo: { flex: 1 },
  storeName: { ...Typography.h3, color: '#fff' },
  badges: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.xs },
  badgeVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeVerifiedText: { color: '#fff', fontSize: 11 },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeActiveText: { color: '#fff', fontSize: 11 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: {
    width: '47%',
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statIcon: { marginBottom: 4 },
  statValue: { ...Typography.h2, color: Colors.light.text },
  statLabel: { ...Typography.caption, color: Colors.light.textSecondary },
  sectionTitle: { ...Typography.h3, marginBottom: Spacing.sm },
  emptyReviews: { color: Colors.light.textSecondary, marginBottom: Spacing.lg },
  reviewCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  reviewInitials: { fontWeight: '700', color: Colors.light.primary },
  reviewBody: { flex: 1 },
  reviewName: { fontWeight: '600' },
  reviewStars: { color: '#F59E0B', fontSize: 12 },
  reviewComment: { ...Typography.caption, color: Colors.light.textSecondary, marginTop: 2 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    gap: 8,
  },
  actionItem: {
    flex: 1,
    maxWidth: 111.4,
    minHeight: 112.9,
    paddingTop: 16.98,
    paddingRight: 16.99,
    paddingBottom: 16.99,
    paddingLeft: 16.99,
    borderRadius: 10.62,
    borderWidth: 1.25,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8.48,
    opacity: 1,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as const, outlineWidth: 0 } : {}),
  },
  actionIconClip: {
    width: 51,
    height: 51,
    borderRadius: 25.5,
    overflow: 'hidden',
  },
  actionLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});
