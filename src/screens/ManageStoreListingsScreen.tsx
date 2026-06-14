/**
 * Manage Store Listings Screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BackIcon,
  BellIcon,
  NoListingIcon,
  Snackbar,
  ActiveStatusIcon,
  PendingStatusIcon,
  RejectedStatusIcon,
  ExpiredStatusIcon,
} from '../components/common';
import { MyListingCard, type MyListingCardData } from '../components/listings';
import { BottomNavigation } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { profileService, listingService } from '../services';
import { useBottomNavHandlers, useProfile } from '../hooks';

type ListingStatus = 'All' | 'Active' | 'Pending' | 'Rejected' | 'Expired';

export const ManageStoreListingsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [selectedStatus, setSelectedStatus] = useState<ListingStatus>('All');
  const [listings, setListings] = useState<any[]>([]);
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
  const { profileImageUrl } = useProfile();

  const emptyTitle =
    selectedStatus === 'All' ? 'No Listings' : `No ${selectedStatus} Listings`;
  const emptyBody =
    selectedStatus === 'All'
      ? 'Your listings will appear here.'
      : `Your ${selectedStatus.toLowerCase()} listings will appear here.`;

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const status = selectedStatus === 'All' ? undefined : selectedStatus;
      const response = await profileService.getMyListings({ status });
      const data = (response.data as any)?.data || response.data || [];
      if (response.success && Array.isArray(data)) setListings(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      setActiveTab('Store');
      fetchListings();
    }, [setActiveTab, fetchListings])
  );

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

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

  const handleDelete = (listing: any) => {
    Alert.alert('Delete Listing', `Delete "${listing.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setListings((prev) => prev.filter((item) => item.id !== listing.id));
            await listingService.deleteListing(listing.id);
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete');
            fetchListings();
          }
        },
      },
    ]);
  };

  const statusTabs: Array<{ label: ListingStatus; icon: React.ReactNode }> = [
    { label: 'All', icon: null },
    {
      label: 'Active',
      icon: <ActiveStatusIcon size={14} color="#6B7280" />,
    },
    {
      label: 'Pending',
      icon: <PendingStatusIcon size={14} color="#6B7280" />,
    },
    {
      label: 'Rejected',
      icon: <RejectedStatusIcon size={14} color="#6B7280" />,
    },
    {
      label: 'Expired',
      icon: <ExpiredStatusIcon size={14} color="#6B7280" />,
    },
  ];

  const handlePostListing = () => {
    if (canCreateListing) {
      navigation?.navigate('SelectCategory');
    } else {
      showCreateGateAlert();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <BackIcon size={24} color="#030303" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Listings</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => setSnackbarVisible(true)}
          >
            <BellIcon size={24} color="#111827" />
          </TouchableOpacity>
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
      </View>

      <View style={styles.statusTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusTabsScroll}
        >
          {statusTabs.map((tab) => (
            <TouchableOpacity
              key={tab.label}
              style={[
                styles.statusTab,
                selectedStatus === tab.label && styles.statusTabActive,
              ]}
              onPress={() => setSelectedStatus(tab.label)}
              activeOpacity={0.7}
            >
              {tab.icon && <View style={styles.statusIcon}>{tab.icon}</View>}
              <Text
                style={[
                  styles.statusTabText,
                  selectedStatus === tab.label && styles.statusTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 40 }} />
        ) : listings.length === 0 ? (
          <View style={styles.empty}>
            <NoListingIcon size={117} color="#BBBBBB" />
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptyText}>{emptyBody}</Text>
            <TouchableOpacity
              style={styles.postListingButton}
              onPress={handlePostListing}
              activeOpacity={0.8}
            >
              <Text style={styles.postListingButtonText}>Post Listing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listingsContainer}>
            {listings.map((listing) => {
              const cardData: MyListingCardData = {
                id: listing.id,
                title: listing.title,
                price: listing.price,
                currency: listing.currency,
                viewsCount: listing.viewsCount,
                status: listing.status as MyListingCardData['status'],
                currency: listing.currency,
                createdAt: listing.createdAt,
                photos: listing.photos,
                category: listing.category,
              };

              return (
                <MyListingCard
                  key={listing.id}
                  listing={cardData}
                  onPress={navigateToDetail}
                  onDelete={() => handleDelete(listing)}
                />
              );
            })}
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 18,
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
  statusTabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  statusTabsScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statusTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  statusTabActive: {
    backgroundColor: '#F0F9FF',
  },
  statusIcon: {
    marginRight: Spacing.xs,
  },
  statusTabText: {
    ...Typography.body,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  statusTabTextActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  listingsContainer: { gap: 0 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 18,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  postListingButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postListingButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
