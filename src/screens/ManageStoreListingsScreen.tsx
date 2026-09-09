/**
 * Manage Store Listings Screen — Figma My Listings (1055:771)
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, NoListingIcon, Snackbar } from '../components/common';
import {
  MyListingCard,
  MyListingsHeaderSection,
  MyListingOptionsSheet,
  DeleteListingModal,
  type MyListingCardData,
  type MyListingStatusFilter,
} from '../components/listings';
import { BottomNavigation } from '../components/navigation';
import { Colors, Spacing, BorderRadius } from '../config/theme';
import { profileService } from '../services';
import { useBottomNavHandlers, useMyListingActions, useWishlist } from '../hooks';
import { dedupeListingsById } from '../utils/listingPhotos';

function toCardData(listing: any): MyListingCardData {
  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    currency: listing.currency,
    priceType: listing.priceType,
    viewsCount: listing.viewsCount,
    ratingAverage: listing.ratingAverage,
    status: listing.status,
    createdAt: listing.createdAt,
    location: listing.location,
    city: listing.city,
    propertyPurpose: listing.propertyPurpose,
    photos: listing.photos,
    category: listing.category,
    serviceType: listing.serviceType,
  };
}

export const ManageStoreListingsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [selectedStatus, setSelectedStatus] = useState<MyListingStatusFilter>('All');
  const [listings, setListings] = useState<any[]>([]);
  const [statsSource, setStatsSource] = useState<any[]>([]);
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

  const stats = useMemo(() => {
    return {
      active: statsSource.filter((l) => l.status === 'Active').length,
      pending: statsSource.filter((l) => l.status === 'Pending').length,
      views: statsSource.reduce((sum, l) => sum + (l.viewsCount || 0), 0),
    };
  }, [statsSource]);

  const emptyTitle =
    selectedStatus === 'All' ? 'No Listings' : `No ${selectedStatus} Listings`;
  const emptyBody =
    selectedStatus === 'All'
      ? 'Your listings will appear here.'
      : `Your ${selectedStatus.toLowerCase()} listings will appear here.`;

  const fetchStats = useCallback(async () => {
    try {
      const response = await profileService.getMyListings({ limit: 500 });
      const data = (response.data as any)?.data || response.data || [];
      if (response.success && Array.isArray(data)) {
        setStatsSource(dedupeListingsById(data));
      }
    } catch {
      // stats are non-blocking
    }
  }, []);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const status = selectedStatus === 'All' ? undefined : selectedStatus;
      const response = await profileService.getMyListings({ status });
      const data = (response.data as any)?.data || response.data || [];
      if (response.success && Array.isArray(data)) setListings(dedupeListingsById(data));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  const refreshListings = useCallback(() => {
    fetchStats();
    fetchListings();
  }, [fetchStats, fetchListings]);

  const {
    selectedListing,
    optionsVisible,
    deleteModalVisible,
    deleteLoading,
    listingSnackbar,
    openOptions,
    closeOptions,
    openDeleteModal,
    closeDeleteModal,
    handleMarkAsSold,
    handleConfirmDelete,
    dismissListingSnackbar,
    markAsSoldDisabled,
  } = useMyListingActions({ onRefresh: refreshListings });

  const { isWishlisted, toggleWishlist, refresh: refreshWishlist } = useWishlist();

  useFocusEffect(
    useCallback(() => {
      setActiveTab('Store');
      fetchStats();
      fetchListings();
      refreshWishlist();
    }, [setActiveTab, fetchStats, fetchListings, refreshWishlist]),
  );

  const navigateToDetail = (listing: MyListingCardData) => {
    const categorySlug = listing.category?.slug?.toLowerCase() || '';
    const categoryName = listing.category?.name?.toLowerCase() || '';
    if (categorySlug.includes('event') || categoryName.includes('event')) {
      navigation?.navigate('EventListingDetail', { listingId: listing.id });
    } else if (categorySlug.includes('propert') || categoryName.includes('propert')) {
      navigation?.navigate('PropertyListingDetail', { listingId: listing.id });
    } else if (categorySlug.includes('service') || categoryName.includes('service')) {
      navigation?.navigate('ServiceListingDetail', { listingId: listing.id });
    } else {
      navigation?.navigate('ListingDetail', { listingId: listing.id });
    }
  };

  const handlePostListing = () => {
    if (canCreateListing) {
      navigation?.navigate('SelectCategory');
    } else {
      showCreateGateAlert();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.backRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <BackIcon size={18} color="#030303" />
        </TouchableOpacity>
      </View>

      <MyListingsHeaderSection
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        activeCount={stats.active}
        pendingCount={stats.pending}
        totalViews={stats.views}
        onSeeAllPress={() => setSelectedStatus('All')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.light.marketplace.primary} style={styles.loader} />
        ) : listings.length === 0 ? (
          <View style={styles.empty}>
            <NoListingIcon size={117} color="#BBBBBB" />
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptyText}>{emptyBody}</Text>
            <TouchableOpacity style={styles.postListingButton} onPress={handlePostListing} activeOpacity={0.8}>
              <Text style={styles.postListingButtonText}>Post Listing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          listings.map((listing) => (
            <MyListingCard
              key={listing.id}
              listing={toCardData(listing)}
              onPress={navigateToDetail}
              onLongPress={() => openOptions(toCardData(listing))}
              wishlisted={isWishlisted(listing.id)}
              onToggleWishlist={toggleWishlist}
            />
          ))
        )}
      </ScrollView>

      <MyListingOptionsSheet
        visible={optionsVisible}
        listing={selectedListing}
        onClose={closeOptions}
        onMarkAsSold={handleMarkAsSold}
        onDelete={openDeleteModal}
        markAsSoldDisabled={markAsSoldDisabled}
      />

      <DeleteListingModal
        visible={deleteModalVisible}
        loading={deleteLoading}
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />

      <BottomNavigation
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onCreatePress={handleCreatePress}
        canCreateListing={canCreateListing}
        onDisabledCreatePress={showCreateGateAlert}
      />

      <Snackbar
        visible={listingSnackbar.visible}
        message={listingSnackbar.message}
        type={listingSnackbar.type}
        onDismiss={dismissListingSnackbar}
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
  container: {
    flex: 1,
    backgroundColor: Colors.light.marketplace.screenSurface,
  },
  backRow: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    backgroundColor: Colors.light.background,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: Spacing.xxl,
  },
  loader: {
    marginTop: 40,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textHeading,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  postListingButton: {
    backgroundColor: Colors.light.marketplace.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minWidth: 200,
    alignItems: 'center',
  },
  postListingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
