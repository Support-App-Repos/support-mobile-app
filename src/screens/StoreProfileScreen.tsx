/**
 * Public Store Profile Screen
 */

import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VerifiedBadgeIcon, Snackbar, BackIcon, PhoneIcon, LocationIcon } from '../components/common';
import { ListingCard, type ListingCardData } from '../components/listings';
import { BottomNavigation } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { storeService } from '../services';
import { useStore, useBottomNavHandlers } from '../hooks';
import type { Store, StoreReview } from '../types';
import { unwrapApiPayload } from '../utils/apiHelpers';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2;

const getInitials = (name?: string) =>
  (name || 'Store')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const formatTimeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

export const StoreProfileScreen: React.FC<{ navigation?: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const { store: myStore } = useStore();
  const paramStoreId = route?.params?.storeId as string | undefined;
  const [store, setStore] = useState<Store | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    activeTab,
    snackbarVisible,
    setSnackbarVisible,
    canCreateListing,
    handleCreatePress,
    handleTabPress,
    showCreateGateAlert,
  } = useBottomNavHandlers(navigation, 'Store');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const storeId = paramStoreId || myStore?.id;

      const load = async () => {
        if (!storeId) {
          setLoading(false);
          setError('No store selected. Create your store first.');
          setStore(null);
          return;
        }

        try {
          setLoading(true);
          setError(null);

          const storeRes = await storeService.getStoreById(storeId);
          const storeData = unwrapApiPayload<Store>(storeRes);

          if (cancelled) return;

          if (!storeData?.id) {
            setStore(null);
            setError('Store not found.');
            return;
          }

          setStore(storeData);

          const [listingsResult, reviewsResult] = await Promise.allSettled([
            storeService.getStoreListings(storeId, { limit: 4 }),
            storeService.getStoreReviews(storeId, { limit: 5 }),
          ]);

          if (cancelled) return;

          if (listingsResult.status === 'fulfilled') {
            const listingsData = unwrapApiPayload<any[]>(listingsResult.value);
            setListings(Array.isArray(listingsData) ? listingsData : []);
          } else {
            setListings([]);
          }

          if (reviewsResult.status === 'fulfilled') {
            const reviewsData = unwrapApiPayload<StoreReview[]>(reviewsResult.value);
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
          } else {
            setReviews([]);
          }
        } catch (err: any) {
          if (!cancelled) {
            console.error('Store profile load error:', err);
            setStore(null);
            setError(err.message || 'Failed to load store profile');
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      load();

      return () => {
        cancelled = true;
      };
    }, [paramStoreId, myStore?.id])
  );

  const renderHeader = (title?: string) => (
    <View style={styles.topBar}>
      <TouchableOpacity
        onPress={() => navigation?.goBack()}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <BackIcon size={24} color="#030303" />
      </TouchableOpacity>
      {title ? <Text style={styles.topBarTitle}>{title}</Text> : null}
      <View style={styles.topBarSpacer} />
    </View>
  );

  const showContact = () => {
    Alert.alert(
      'Contact',
      [
        store?.contactPhone ? `Phone: ${store.contactPhone}` : null,
        store?.contactEmail ? `Email: ${store.contactEmail}` : null,
      ]
        .filter(Boolean)
        .join('\n') || 'No contact details available'
    );
  };

  const showLocation = () => {
    const hours = store?.workingHours;
    const hoursText = hours
      ? `Hours: ${hours.open} - ${hours.close}\nDays: ${hours.days?.join(', ')}`
      : '';
    Alert.alert(
      'Location',
      [store?.address || store?.location, hoursText].filter(Boolean).join('\n\n') ||
        'No location available'
    );
  };

  const toCardData = (listing: any): ListingCardData => ({
    id: listing.id,
    title: listing.title,
    price: listing.price ? String(listing.price) : '0',
    image: listing.photos?.[0]?.photoUrl || 'https://via.placeholder.com/200',
    ratingAverage: listing.ratingAverage,
    reviewCount: listing.reviewsCount,
    category: listing.category?.name,
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader('Store Profile')}
        <ActivityIndicator size="large" color={Colors.light.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!store) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader('Store Profile')}
        <Text style={styles.errorText}>{error || 'Store not found'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation?.goBack()}>
          <Text style={styles.retryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cover}>
          {store.coverImageUrl ? (
            <Image source={{ uri: store.coverImageUrl }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder} />
          )}
        </View>

        <View style={styles.logoWrap}>
          <View style={styles.logo}>
            {store.logoUrl ? (
              <Image source={{ uri: store.logoUrl }} style={styles.logoImage} />
            ) : (
              <Text style={styles.logoText}>{getInitials(store.name)}</Text>
            )}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.storeName}>{store.name}</Text>
            {store.isVerified && <VerifiedBadgeIcon size={20} />}
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.stat}>{store.listingsCount ?? listings.length} Listings</Text>
            <Text style={styles.stat}>★ {store.ratingAverage?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.stat}>{store.reviewsCount || 0} Reviews</Text>
          </View>

          {store.description ? (
            <Text style={styles.description}>{store.description}</Text>
          ) : null}

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.outlineBtn} onPress={showContact}>
              <View style={styles.outlineBtnContent}>
                <PhoneIcon size={18} color={Colors.light.text} />
                <Text style={styles.outlineBtnText}>Contact</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} onPress={showLocation}>
              <View style={styles.outlineBtnContent}>
                <LocationIcon size={18} color={Colors.light.text} />
                <Text style={styles.outlineBtnText}>Location</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Listings</Text>
            <TouchableOpacity
              onPress={() =>
                navigation?.navigate('StoreListingsAll', {
                  storeId: store.id,
                  storeName: store.name,
                })
              }
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {listings.slice(0, 4).map((listing) => (
              <View key={listing.id} style={{ width: CARD_WIDTH }}>
                <ListingCard
                  listing={toCardData(listing)}
                  navigation={navigation}
                  onPress={() => navigation?.navigate('ListingDetail', { listingId: listing.id })}
                />
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <Text style={styles.ratingBadge}>★ {store.ratingAverage?.toFixed(1) || '0.0'}</Text>
          </View>

          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewInitials}>
                  {getInitials(review.user?.fullName || 'U')}
                </Text>
              </View>
              <View style={styles.reviewBody}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>{review.user?.fullName}</Text>
                  <Text style={styles.reviewTime}>{formatTimeAgo(review.createdAt)}</Text>
                </View>
                <Text style={styles.reviewStars}>{'★'.repeat(review.rating)}</Text>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

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
  container: { flex: 1, backgroundColor: Colors.light.background },
  cover: { height: 140 },
  coverImage: { width: '100%', height: '100%' },
  coverPlaceholder: { flex: 1, backgroundColor: Colors.light.primary },
  logoWrap: { alignItems: 'center', marginTop: -40 },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.background,
    borderWidth: 3,
    borderColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: { width: 80, height: 80 },
  logoText: { fontSize: 24, fontWeight: '700', color: Colors.light.primary },
  body: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  storeName: { ...Typography.h2, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, marginVertical: Spacing.sm },
  stat: { ...Typography.caption, color: Colors.light.textSecondary },
  description: { ...Typography.body, color: Colors.light.textSecondary, textAlign: 'center', marginBottom: Spacing.md },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  outlineBtnText: { fontWeight: '600', color: Colors.light.text },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { ...Typography.h3 },
  seeAll: { color: Colors.light.primary, fontWeight: '600' },
  ratingBadge: { color: '#F59E0B', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.lg },
  reviewCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
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
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewName: { fontWeight: '600' },
  reviewTime: { ...Typography.caption, color: Colors.light.textSecondary },
  reviewStars: { color: '#F59E0B', fontSize: 12 },
  reviewComment: { ...Typography.caption, color: Colors.light.textSecondary, marginTop: 4 },
  errorText: { textAlign: 'center', marginTop: 40, color: Colors.light.textSecondary, paddingHorizontal: Spacing.lg },
  loader: { marginTop: 40 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  topBarTitle: { ...Typography.h3 },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  topBarSpacer: { width: 24 },
  retryBtn: {
    alignSelf: 'center',
    marginTop: Spacing.lg,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  retryBtnText: { color: '#fff', fontWeight: '600' },
});
