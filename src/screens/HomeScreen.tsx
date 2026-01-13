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
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeHeader, SearchIcon, ScanIcon, Snackbar } from '../components/common';
import { CategoryTabs, ListingCard, type Category, type ListingCardData } from '../components/listings';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { listingService, categoryService } from '../services';
import { useProfile } from '../hooks';

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

// Helper function to convert listing to ListingCardData
const convertToListingCardData = (listing: any): ListingCardData => {
  const primaryPhoto = listing.photos?.find((p: any) => p.isPrimary) || listing.photos?.[0];
  const imageUrl = primaryPhoto?.photoUrl || 'https://via.placeholder.com/400';
  
  return {
    id: listing.id,
    title: listing.title,
    price: listing.price ? listing.price.toFixed(0) : '0',
    priceUnit: listing.priceType === 'Per Hour' ? 'hr' : listing.priceType === 'Per Seat' ? 'seat' : undefined,
    image: imageUrl,
    rating: listing._count?.reviews || 0,
    views: listing.viewsCount || 0,
    timePosted: listing.publishedAt ? formatTimeAgo(new Date(listing.publishedAt)) : 'Recently',
    category: listing.category?.name || 'Unknown',
  };
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { profileImageUrl } = useProfile();

  // Update active tab when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setActiveTab('Home');
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
        setCategories(categoriesData);
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

  const handleListingPress = (listing: ListingCardData) => {
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

  // Filter listings by search query
  const filteredListings = searchQuery.trim()
    ? listings.filter(listing => 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : listings;


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
            <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
              <Image
                source={{ uri: profileImageUrl || 'https://i.pravatar.cc/150?img=12' }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.scanIconContainer}>
              <ScanIcon size={20} color="#797979" />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={Colors.light.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
              <SearchIcon size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Promotional Banner */}
        {/* <HomeHeader onCreatePress={handleCreatePress} /> */}
        <Image 
          source={require('../assets/images/home_header.png')} 
          style={styles.homeHeaderImage}
          resizeMode="cover"
        />

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
          ) : filteredListings.length > 0 ? (
            <View style={styles.listingsGrid}>
              {filteredListings.map((listing) => (
                <View key={listing.id} style={styles.cardWrapper}>
                  <ListingCard listing={listing} onPress={handleListingPress} navigation={navigation} />
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
    paddingBottom: Spacing.xl,
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
    ...Typography.h1,
    color: Colors.light.text,
    fontWeight: '700',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 9999, // Pill shape
    borderWidth: 1,
    borderColor: '#E5E7EB', // Light border
    paddingLeft: Spacing.md,
    paddingRight: 0, // No padding on right, button will extend
    height: 52,
    overflow: 'hidden',
  },
  scanIconContainer: {
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.light.text,
    paddingVertical: 0,
    paddingHorizontal: Spacing.xs,
    fontSize: 14,
  },
  searchButton: {
    width: 55,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
  },
  homeHeaderImage: {
    width: '100%',
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
