/**
 * Home Screen - Marketplace Feed
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  SearchIcon,
  BellIcon,
  ForwardIcon,
  Snackbar,
} from '../components/common';
import {
  CategoryTabs,
  HomeListingSection,
  type Category,
  type ListingCardData,
} from '../components/listings';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { listingPriceUnitLabel } from '../utils/currency';
import { formatListingCardLocation } from '../utils/format';
import { listingService, categoryService } from '../services';
import { useProfile, useWishlist, useBottomNavHandlers } from '../hooks';

const MP = Colors.light.marketplace;

type HomeScreenProps = {
  navigation?: any;
};

type ListingKind = 'event' | 'product' | 'service' | 'property' | 'other';

const getListingKind = (category?: string): ListingKind => {
  const c = String(category || '').toLowerCase();
  if (c.includes('event')) return 'event';
  if (c.includes('product')) return 'product';
  if (c.includes('service')) return 'service';
  if (c.includes('propert')) return 'property';
  return 'other';
};

const groupListings = (items: ListingCardData[]) => ({
  events: items.filter((l) => getListingKind(l.category) === 'event'),
  products: items.filter((l) => getListingKind(l.category) === 'product'),
  services: items.filter((l) => getListingKind(l.category) === 'service'),
  properties: items.filter((l) => getListingKind(l.category) === 'property'),
});

const SECTION_META: Record<
  Category,
  { title: string; kind?: ListingKind }
> = {
  All: { title: '' },
  Events: { title: 'Featured Events', kind: 'event' },
  Product: { title: 'Popular Products', kind: 'product' },
  Services: { title: 'Top Services', kind: 'service' },
  Property: { title: 'Featured Properties', kind: 'property' },
};

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

const convertToListingCardData = (listing: any): ListingCardData => {
  const primaryPhoto = listing.photos?.find((p: any) => p.isPrimary) || listing.photos?.[0];
  const imageUrl = primaryPhoto?.photoUrl || 'https://via.placeholder.com/400';

  return {
    id: listing.id,
    title: listing.title,
    price: listing.price ? listing.price.toFixed(0) : '0',
    priceUnit: listingPriceUnitLabel(listing.priceType),
    image: imageUrl,
    ratingAverage:
      typeof listing.averageRating === 'number' ? listing.averageRating : undefined,
    reviewCount: listing._count?.reviews ?? listing.reviewsCount,
    rating: listing._count?.reviews || 0,
    views: listing.viewsCount || 0,
    timePosted: listing.publishedAt ? formatTimeAgo(new Date(listing.publishedAt)) : 'Recently',
    category: listing.category?.name || 'Unknown',
    location: formatListingCardLocation(listing),
    currency: listing.currency,
  };
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const {
    activeTab,
    setActiveTab,
    snackbarVisible,
    setSnackbarVisible,
    canCreateListing,
    handleCreatePress,
    handleTabPress,
    showCreateGateAlert,
  } = useBottomNavHandlers(navigation, 'Home');
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const { profileImageUrl } = useProfile();
  const { isWishlisted, toggleWishlist, refresh: refreshWishlist } = useWishlist();

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
        status: 'Active',
        categoryId,
        limit: categoryId ? 20 : 40,
      });
      
      const listingsData = (response.data as any)?.data || response.data || [];
      
      if (response.success && Array.isArray(listingsData)) {
        const convertedListings = listingsData.map(convertToListingCardData);
        const seen = new Set<string>();
        setListings(
          convertedListings.filter((item) => {
            if (!item.id || seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          }),
        );
      }
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      Alert.alert('Error', error.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const refetchHomeListings = useCallback(() => {
    if (selectedCategory !== 'All') {
      if (Object.keys(categoryMap).length === 0) {
        return;
      }

      const categoryNameMap: Record<Category, string> = {
        All: 'All',
        Property: 'Properties',
        Events: 'Events',
        Product: 'Products',
        Services: 'Services',
      };

      const categoryId = categoryMap[categoryNameMap[selectedCategory]];
      if (categoryId) {
        fetchListings(categoryId);
      } else {
        setListings([]);
        setLoading(false);
      }
      return;
    }

    fetchListings();
  }, [selectedCategory, categoryMap]);

  useFocusEffect(
    useCallback(() => {
      setActiveTab('Home');
      refreshWishlist();
      refetchHomeListings();
    }, [setActiveTab, refreshWishlist, refetchHomeListings])
  );

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleListingPress = (_listing: ListingCardData) => {
    // Navigation is handled inside ListingCard based on category
  };

  const grouped = groupListings(listings);
  const filteredSectionTitle = SECTION_META[selectedCategory].title;
  const filteredListings =
    selectedCategory === 'All'
      ? []
      : listings.filter((l) => getListingKind(l.category) === SECTION_META[selectedCategory].kind);

  const renderListingSections = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading listings...</Text>
        </View>
      );
    }

    if (selectedCategory === 'All') {
      const hasAny =
        grouped.events.length +
          grouped.products.length +
          grouped.services.length +
          grouped.properties.length >
        0;

      if (!hasAny) {
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No listings found</Text>
          </View>
        );
      }

      return (
        <>
          <HomeListingSection
            title="Featured Events"
            listings={grouped.events}
            navigation={navigation}
            isWishlisted={isWishlisted}
            onToggleWishlist={toggleWishlist}
            onSeeAll={() => setSelectedCategory('Events')}
            onListingPress={handleListingPress}
          />
          <HomeListingSection
            title="Popular Products"
            listings={grouped.products}
            navigation={navigation}
            isWishlisted={isWishlisted}
            onToggleWishlist={toggleWishlist}
            onSeeAll={() => setSelectedCategory('Product')}
            onListingPress={handleListingPress}
          />
          <HomeListingSection
            title="Top Services"
            listings={grouped.services}
            navigation={navigation}
            isWishlisted={isWishlisted}
            onToggleWishlist={toggleWishlist}
            onSeeAll={() => setSelectedCategory('Services')}
            onListingPress={handleListingPress}
          />
          <HomeListingSection
            title="Featured Properties"
            listings={grouped.properties}
            navigation={navigation}
            isWishlisted={isWishlisted}
            onToggleWishlist={toggleWishlist}
            onSeeAll={() => setSelectedCategory('Property')}
            onListingPress={handleListingPress}
          />
        </>
      );
    }

    if (filteredListings.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No listings found</Text>
        </View>
      );
    }

    return (
      <HomeListingSection
        title={filteredSectionTitle}
        listings={filteredListings}
        navigation={navigation}
        isWishlisted={isWishlisted}
        onToggleWishlist={toggleWishlist}
        onListingPress={handleListingPress}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Marketplace</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.bellButton}
                activeOpacity={0.7}
                onPress={() => {
                  setSnackbarVisible(true);
                }}
              >
                <BellIcon size={18} color={MP.titleText} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
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
          </View>

          <View style={styles.searchRow}>
            <TouchableOpacity
              style={styles.searchField}
              activeOpacity={0.88}
              onPress={() => navigation?.navigate?.('MarketplaceSearch', { initialQuery: '' })}
            >
              <SearchIcon size={16} color={MP.chipInactiveText} />
              <Text style={styles.searchPlaceholder}>
                Search listings, stores, events...
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.promoBanner}>
          <View style={styles.promoTextBlock}>
            <Text style={styles.promoEyebrow}>List, Manage & Connect</Text>
            <Text style={styles.promoTitle}>Your Listings.{'\n'}Your Control.</Text>
            <TouchableOpacity
              style={styles.promoCta}
              activeOpacity={0.85}
              onPress={handleCreatePress}
            >
              <Text style={styles.promoCtaText}>List New Item</Text>
              <ForwardIcon size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.promoLogoOuter}>
            <Image
              source={require('../assets/images/youzell-logo-mark.png')}
              style={styles.promoLogoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Category Tabs */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Listing sections */}
        <View style={styles.listingsContainer}>{renderListingSections()}</View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onCreatePress={handleCreatePress}
        canCreateListing={canCreateListing}
        onDisabledCreatePress={showCreateGateAlert}
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
    backgroundColor: MP.screenBg,
  },
  scrollView: {
    flex: 1,
    backgroundColor: MP.screenBg,
  },
  content: {
    paddingBottom: Spacing.xxl + 24,
  },
  header: {
    backgroundColor: MP.headerBg,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 1.5,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26.4,
    color: MP.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MP.searchBg,
    borderWidth: 1.18,
    borderColor: MP.searchBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MP.notificationDot,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.18,
    borderColor: MP.primary,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MP.searchBg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.18,
    borderColor: MP.searchBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    minHeight: 42,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: MP.searchPlaceholder,
    paddingVertical: 0,
  },
  promoBanner: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: 0,
    backgroundColor: MP.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 154,
    shadowColor: MP.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  promoTextBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  promoEyebrow: {
    fontSize: 11,
    letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 25,
    marginBottom: 16,
  },
  promoCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: MP.ctaGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    gap: 8,
    shadowColor: MP.ctaGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  promoCtaText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19.5,
    color: '#FFFFFF',
  },
  promoLogoOuter: {
    width: 88,
    height: 88,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  promoLogoImage: {
    width: 78,
    height: 78,
  },
  listingsContainer: {
    marginTop: 20,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: MP.chipInactiveText,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: MP.chipInactiveText,
  },
});
