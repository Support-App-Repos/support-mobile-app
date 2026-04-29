/**
 * Home Screen - Marketplace Feed
 */

import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  SearchIcon,
  Snackbar,
} from '../components/common';
import { CategoryTabs, ListingCard, type Category, type ListingCardData } from '../components/listings';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { listingService, categoryService } from '../services';
import { useProfile, useWishlist } from '../hooks';

type HomeScreenProps = {
  navigation?: any;
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2; // Account for padding and gap

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

const priceUnitLabel = (priceType?: string): string | undefined => {
  if (!priceType) return undefined;
  if (priceType === 'Per Hour') return 'hr';
  if (priceType === 'Per Seat') return 'seat';
  if (priceType === 'Per Month' || priceType === 'Monthly') return 'mo';
  return undefined;
};

// Helper function to convert listing to ListingCardData
const convertToListingCardData = (listing: any): ListingCardData => {
  const primaryPhoto = listing.photos?.find((p: any) => p.isPrimary) || listing.photos?.[0];
  const imageUrl = primaryPhoto?.photoUrl || 'https://via.placeholder.com/400';
  const regionName =
    listing.regions?.[0]?.name ||
    listing.region?.name ||
    listing.city ||
    listing.location;

  return {
    id: listing.id,
    title: listing.title,
    price: listing.price ? listing.price.toFixed(0) : '0',
    priceUnit: priceUnitLabel(listing.priceType),
    image: imageUrl,
    ratingAverage:
      typeof listing.averageRating === 'number' ? listing.averageRating : undefined,
    reviewCount: listing._count?.reviews ?? listing.reviewsCount,
    rating: listing._count?.reviews || 0,
    views: listing.viewsCount || 0,
    timePosted: listing.publishedAt ? formatTimeAgo(new Date(listing.publishedAt)) : 'Recently',
    category: listing.category?.name || 'Unknown',
    location: typeof regionName === 'string' ? regionName : undefined,
    currency: listing.currency,
  };
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { profileImageUrl } = useProfile();
  const { isWishlisted, toggleWishlist, refresh: refreshWishlist } = useWishlist();

  // Update active tab when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setActiveTab('Home');
      refreshWishlist();
    }, [])
  );

  // Fetch categories and listings on mount
  useEffect(() => {
    fetchCategories();
    fetchListings();
  }, []);

  // Refetch listings when category changes
  useEffect(() => {
    // Wait for categories to be loaded before filtering
    if (Object.keys(categoryMap).length === 0 && selectedCategory !== 'All') {
      return; // Categories not loaded yet, wait
    }

    if (selectedCategory !== 'All') {
      // Map CategoryTabs names to actual backend category names
      const categoryNameMap: Record<Category, string> = {
        'All': 'All',
        'Property': 'Properties', // Backend uses 'Properties' (plural)
        'Events': 'Events',
        'Product': 'Products', // Backend uses 'Products' (plural)
        'Services': 'Services',
      };
      
      const actualCategoryName = categoryNameMap[selectedCategory];
      const categoryId = categoryMap[actualCategoryName];
      
      if (categoryId) {
        fetchListings(categoryId);
      } else {
        console.warn(`Category ID not found for: ${selectedCategory} (mapped to: ${actualCategoryName})`);
        console.log('Available categories:', Object.keys(categoryMap));
        // If category not found, show empty listings
        setListings([]);
        setLoading(false);
      }
    } else {
      fetchListings();
    }
  }, [selectedCategory, categoryMap]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      const categoriesData = (response.data as any)?.data || response.data || [];
      
      if (response.success && Array.isArray(categoriesData)) {
        // Create category map for filtering
        const map: Record<string, string> = {};
        categoriesData.forEach((cat: any) => {
          map[cat.name] = cat.id;
        });
        setCategoryMap(map);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchListings = async (categoryId?: string) => {
    try {
      setLoading(true);
      const response = await listingService.getListings({
        status: 'Active', // Only show Active (approved) listings on home screen
        categoryId,
        limit: 20,
      });
      
      const listingsData = (response.data as any)?.data || response.data || [];
      
      if (response.success && Array.isArray(listingsData)) {
        const convertedListings = listingsData.map(convertToListingCardData);
        setListings(convertedListings);
      }
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      Alert.alert('Error', error.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleListingPress = (_listing: ListingCardData) => {
    // Navigation is now handled inside ListingCard based on category
    // This is kept for backward compatibility
  };

  const handleCreatePress = () => {
    navigation?.navigate('SelectCategory');
  };

  const handleTabPress = (tab: BottomNavItem) => {
    setActiveTab(tab);
    if (tab === 'Home') {
      // Already on Home screen
    } else if (tab === 'MyListings') {
      navigation?.navigate('MyListings');
    } else if (tab === 'Messages') {
      // Show coming soon snackbar
      setSnackbarVisible(true);
    } else if (tab === 'Profile') {
      navigation?.navigate('Profile');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Marketplace</Text>
            <TouchableOpacity
              style={styles.profileButton}
              activeOpacity={0.7}
              onPress={() => navigation?.navigate?.('Profile')}
            >
              <Image
                source={{ uri: profileImageUrl || 'https://i.pravatar.cc/150?img=12' }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <TouchableOpacity
              style={styles.searchField}
              activeOpacity={0.88}
              onPress={() => navigation?.navigate?.('MarketplaceSearch', { initialQuery: '' })}
            >
              <SearchIcon size={18} color="#828282" />
              <Text style={styles.searchPlaceholder}>Search listings...</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.promoBanner}>
          <View style={styles.promoTextBlock}>
            <Text style={styles.promoEyebrow}>List, Manage & Connect</Text>
            <Text style={styles.promoTitle}>
              Your Listings.{' '}
              <Text style={styles.promoHighlight}>Your Control</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.promoCta}
            activeOpacity={0.85}
            onPress={handleCreatePress}
          >
            <Text style={styles.promoCtaText}>List New Item</Text>
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Listings Grid */}
        <View style={styles.listingsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.loadingText}>Loading listings...</Text>
            </View>
          ) : listings.length > 0 ? (
            <View style={styles.listingsGrid}>
              {listings.map((listing) => (
                <View key={listing.id} style={styles.cardWrapper}>
                  <ListingCard
                    listing={listing}
                    onPress={handleListingPress}
                    navigation={navigation}
                    wishlisted={isWishlisted(listing.id)}
                    onToggleWishlist={(id) => toggleWishlist(id)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No listings found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onCreatePress={handleCreatePress}
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xxl + 24,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: -0.3,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E8E8ED',
    paddingHorizontal: Spacing.md,
    minHeight: 52,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchPlaceholder: {
    flex: 1,
    ...Typography.body,
    color: Colors.light.textSecondary,
    paddingVertical: Spacing.sm,
    fontSize: 14,
  },
  promoBanner: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  promoTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  promoEyebrow: {
    ...Typography.small,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
    fontWeight: '500',
  },
  promoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  promoHighlight: {
    color: Colors.light.bannerAccent,
  },
  promoCta: {
    backgroundColor: Colors.light.bannerAccent,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.round,
  },
  promoCtaText: {
    ...Typography.small,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  listingsContainer: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: Spacing.md,
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
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
});
