/**
 * Home Screen - Marketplace Feed
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeHeader, SearchIcon, ScanIcon } from '../components/common';
import { CategoryTabs, ListingCard, type Category, type ListingCardData } from '../components/listings';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';

type HomeScreenProps = {
  navigation?: any;
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2; // Account for padding and gap

// Mock data for listings
const mockListings: ListingCardData[] = [
  {
    id: '1',
    title: 'Modern Downtown Apartment',
    price: '1,500',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    rating: 35,
    views: 147,
    timePosted: '2 days ago',
    category: 'Property',
  },
  {
    id: '2',
    title: 'Vintage Furniture Set',
    price: '1,500',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    rating: 28,
    views: 89,
    timePosted: '2 days ago',
    category: 'Product',
  },
  {
    id: '3',
    title: 'Web Design Services',
    price: '1,500',
    priceUnit: 'hr',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400',
    rating: 42,
    views: 203,
    timePosted: '1 day ago',
    category: 'Services',
  },
  {
    id: '4',
    title: 'Photography Workshop',
    price: '1,500',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
    rating: 31,
    views: 156,
    timePosted: '3 days ago',
    category: 'Events',
  },
  {
    id: '5',
    title: 'Modern Downtown Apartment',
    price: '1,500',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    rating: 35,
    views: 147,
    timePosted: '2 days ago',
    category: 'Property',
  },
  {
    id: '6',
    title: 'Vintage Furniture Set',
    price: '1,500',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    rating: 28,
    views: 89,
    timePosted: '2 days ago',
    category: 'Product',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    // TODO: Filter listings by category
  };

  const handleListingPress = (listing: ListingCardData) => {
    // TODO: Navigate to listing detail screen
    console.log('Listing pressed:', listing.id);
  };

  const handleCreatePress = () => {
    navigation?.navigate('SelectCategory');
  };

  const handleTabPress = (tab: BottomNavItem) => {
    setActiveTab(tab);
    if (tab === 'Profile') {
      navigation?.navigate('Profile');
    }
    // TODO: Navigate to other respective screens
  };

  // Filter listings by category
  const filteredListings = selectedCategory === 'All'
    ? mockListings
    : mockListings.filter(listing => listing.category === selectedCategory);


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
                source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
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
              placeholder="Property"
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
        <Image source={require('../assets/images/home_header.png')} />

        {/* Category Tabs */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Listings Grid */}
        <View style={styles.listingsContainer}>
          <View style={styles.listingsGrid}>
            {filteredListings.map((listing) => (
              <View key={listing.id} style={styles.cardWrapper}>
                <ListingCard listing={listing} onPress={handleListingPress} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onCreatePress={handleCreatePress}
        showCreateButton={true}
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
    height: 48,
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
});
