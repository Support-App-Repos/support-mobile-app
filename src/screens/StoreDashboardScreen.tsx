/**
 * Store Dashboard Screen — matches Figma store dashboard
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
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BackIcon,
  Snackbar,
  SettingsIcon,
  RatingIcon,
  StoreDashboardListingsIcon,
  StoreDashboardActiveIcon,
  StoreDashboardMessagesIcon,
  StoreDashboardViewsIcon,
  StoreQuickActionAddIcon,
  StoreQuickActionEditIcon,
} from '../components/common';
import { BottomNavigation } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { storeService } from '../services';
import { useStore, useBottomNavHandlers } from '../hooks';
import type { StoreDashboard } from '../types';

const HEADER_NAVY = '#0D475C';

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const formatReviewName = (fullName?: string) => {
  if (!fullName?.trim()) return 'User';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

type StatConfig = {
  label: string;
  value: number;
  Icon: React.FC<{ size?: number; color?: string }>;
  iconColor: string;
  iconBg: string;
  valueColor: string;
};

export const StoreDashboardScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { store } = useStore();
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
  const recentReviews = dashboard?.recentReviews || [];

  const statItems: StatConfig[] = [
    {
      label: 'Total Listings',
      value: stats?.totalListings ?? 0,
      Icon: StoreDashboardListingsIcon,
      iconColor: '#0D475C',
      iconBg: '#E8EEF2',
      valueColor: '#0D475C',
    },
    {
      label: 'Active',
      value: stats?.activeListings ?? 0,
      Icon: StoreDashboardActiveIcon,
      iconColor: '#22C55E',
      iconBg: '#E8F8EF',
      valueColor: '#22C55E',
    },
    {
      label: 'Messages',
      value: stats?.messages ?? 0,
      Icon: StoreDashboardMessagesIcon,
      iconColor: '#A855F7',
      iconBg: '#F3E8FF',
      valueColor: '#0D475C',
    },
    {
      label: 'Views',
      value: stats?.views ?? 0,
      Icon: StoreDashboardViewsIcon,
      iconColor: '#EC4899',
      iconBg: '#FCE7F3',
      valueColor: '#0D475C',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing.sm) }]}>
        <TouchableOpacity
          style={styles.headerCircleBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <BackIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Dashboard</Text>
        <TouchableOpacity
          style={styles.headerCircleBtn}
          activeOpacity={0.7}
          onPress={() => navigation?.navigate('CreateStore', { edit: true })}
        >
          <SettingsIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.storeCard}>
            <View style={styles.avatar}>
              {storeData?.logoUrl ? (
                <Image source={{ uri: storeData.logoUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{getInitials(storeData?.name || 'S')}</Text>
              )}
            </View>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName} numberOfLines={1}>
                {storeData?.name || 'Your Store'}
              </Text>
              <View style={styles.badges}>
                {storeData?.isVerified && (
                  <View style={styles.badge}>
                    <StoreDashboardActiveIcon size={12} color="#16A34A" />
                    <Text style={styles.badgeText}>Verified</Text>
                  </View>
                )}
                <View style={styles.badge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.badgeText}>Active</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            {statItems.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <View style={styles.statTopRow}>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <View style={[styles.statIconWrap, { backgroundColor: s.iconBg }]}>
                    <s.Icon size={18} color={s.iconColor} />
                  </View>
                </View>
                <Text style={[styles.statValue, { color: s.valueColor }]}>{s.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            <TouchableOpacity
              onPress={() => setSnackbarVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentReviews.length === 0 ? (
            <Text style={styles.emptyReviews}>No reviews yet</Text>
          ) : (
            recentReviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewAvatar}>
                  {review.user?.profileImageUrl ? (
                    <Image
                      source={{ uri: review.user.profileImageUrl }}
                      style={styles.reviewAvatarImage}
                    />
                  ) : (
                    <Text style={styles.reviewInitials}>
                      {getInitials(review.user?.fullName || 'U')}
                    </Text>
                  )}
                </View>
                <View style={styles.reviewBody}>
                  <View style={styles.reviewTopRow}>
                    <Text style={styles.reviewName} numberOfLines={1}>
                      {formatReviewName(review.user?.fullName)}
                    </Text>
                    <View style={styles.starsRow}>
                      {Array.from({ length: Math.min(5, Math.max(0, review.rating)) }).map(
                        (_, i) => (
                          <RatingIcon key={i} size={12} color="#FBBF24" />
                        )
                      )}
                    </View>
                  </View>
                  <Text style={styles.reviewComment} numberOfLines={2}>
                    {review.comment}
                  </Text>
                </View>
              </View>
            ))
          )}

          <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <Pressable
              style={styles.actionItem}
              onPress={
                canCreateListing
                  ? () => navigation?.navigate('SelectCategory')
                  : showCreateGateAlert
              }
            >
              <StoreQuickActionAddIcon size={56} />
              <Text style={styles.actionLabel}>Add Listing</Text>
            </Pressable>
            <Pressable
              style={styles.actionItem}
              onPress={() => navigation?.navigate('CreateStore', { edit: true })}
            >
              <StoreQuickActionEditIcon size={56} />
              <Text style={styles.actionLabel}>Edit Store</Text>
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
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: HEADER_NAVY,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarText: { color: Colors.light.primary, fontWeight: '700', fontSize: 16 },
  storeInfo: { flex: 1 },
  storeName: { ...Typography.h3, color: Colors.light.text, fontSize: 18 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F8EF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: '#16A34A', fontSize: 12, fontWeight: '600' },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  statLabel: { ...Typography.caption, color: Colors.light.textSecondary, flex: 1, marginRight: 8 },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: { ...Typography.h3, color: Colors.light.text, fontSize: 17 },
  seeAll: { color: HEADER_NAVY, fontWeight: '600', fontSize: 14 },
  emptyReviews: { color: Colors.light.textSecondary, marginBottom: Spacing.lg },
  reviewCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    overflow: 'hidden',
  },
  reviewAvatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  reviewInitials: { fontWeight: '700', color: Colors.light.primary, fontSize: 13 },
  reviewBody: { flex: 1 },
  reviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  reviewName: { fontWeight: '700', color: Colors.light.text, flexShrink: 1 },
  starsRow: { flexDirection: 'row', gap: 2 },
  reviewComment: { ...Typography.caption, color: Colors.light.textSecondary, marginTop: 4, lineHeight: 18 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  actionItem: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionLabel: {
    ...Typography.caption,
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
