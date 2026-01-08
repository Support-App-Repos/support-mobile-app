/**
 * My Listings Screen
 * Shows user's listings with status filters: All, Active, Pending, Rejected, Expired
 */

import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BellIcon,
  ActiveStatusIcon,
  PendingStatusIcon,
  RejectedStatusIcon,
  ExpiredStatusIcon,
  NoListingIcon,
  Snackbar,
} from '../components/common';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { MyListingCard, type MyListingCardData } from '../components/listings';
import { profileService } from '../services';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { useProfile } from '../hooks';

type ListingStatus = 'All' | 'Active' | 'Pending' | 'Rejected' | 'Expired';

interface Listing {
  id: string;
  title: string;
  description: string;
  price?: number;
  status: string;
  viewsCount?: number;
  photos?: Array<{ photoUrl: string }>;
  createdAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    iconUrl?: string;
  };
}

export const MyListingsScreen: React.FC<{
  navigation?: any;
  route?: any;
}> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<BottomNavItem>('MyListings');
  const [selectedStatus, setSelectedStatus] = useState<ListingStatus>('All');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { profileImageUrl } = useProfile();

  // Update active tab when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setActiveTab('MyListings');
    }, [])
  );

  useEffect(() => {
    fetchListings();
  }, [selectedStatus]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const status = selectedStatus === 'All' ? undefined : selectedStatus;
      const response = await profileService.getMyListings({ status });
      
      // Backend returns { success: true, data: { success, data: [...] } }
      const listingsData = (response.data as any)?.data || response.data || [];
      
      if (response.success && Array.isArray(listingsData)) {
        setListings(listingsData);
      }
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      Alert.alert('Error', error.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: ListingStatus) => {
    setSelectedStatus(status);
  };

  const handlePostListing = () => {
    navigation?.navigate('SelectCategory');
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Listings</Text>
        </View>
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
              source={{ uri: profileImageUrl || 'https://i.pravatar.cc/150?img=12' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Tabs */}
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
              onPress={() => handleStatusChange(tab.label)}
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

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Loading listings...</Text>
          </View>
        ) : listings.length === 0 ? (
          <View style={styles.emptyState}>
            <NoListingIcon size={117} color="#BBBBBB" />
            <Text style={styles.emptyStateTitle}>No Active Listings</Text>
            <Text style={styles.emptyStateText}>
              Your active listings will appear here.
            </Text>
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
                viewsCount: listing.viewsCount,
                status: listing.status as 'Active' | 'Pending' | 'Rejected' | 'Expired',
                createdAt: listing.createdAt,
                photos: listing.photos,
                category: listing.category, // Pass category for navigation
              };

              return (
                <MyListingCard
                  key={listing.id}
                  listing={cardData}
                  onPress={(listing) => {
                    // Determine the correct detail screen based on category
                    const categorySlug = listing.category?.slug?.toLowerCase() || '';
                    const categoryName = listing.category?.name?.toLowerCase() || '';
                    const isEvent = categorySlug.includes('event') || categoryName.includes('event');
                    const isProperty = categorySlug.includes('propert') || categoryName.includes('propert');
                    const isService = categorySlug.includes('service') || categoryName.includes('service');
                    
                    if (isEvent) {
                      navigation?.navigate('EventListingDetail', { listingId: listing.id });
                    } else if (isProperty) {
                      navigation?.navigate('PropertyListingDetail', { listingId: listing.id });
                    } else if (isService) {
                      navigation?.navigate('ServiceListingDetail', { listingId: listing.id });
                    } else {
                      // Default to ListingDetail for Products or unknown categories
                      navigation?.navigate('ListingDetail', { listingId: listing.id });
                    }
                  }}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'Home') {
            navigation?.navigate('Home');
          } else if (tab === 'MyListings') {
            // Already on MyListings screen
          } else if (tab === 'Messages') {
            // Show coming soon snackbar
            setSnackbarVisible(true);
          } else if (tab === 'Profile') {
            navigation?.navigate('Profile');
          }
        }}
        onCreatePress={() => {
          navigation?.navigate('SelectCategory');
        }}
        showCreateButton={true}
      />

      {/* Snackbar for Messages */}
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
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyStateTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 18,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
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
  listingsContainer: {
    gap: 0,
  },
});

