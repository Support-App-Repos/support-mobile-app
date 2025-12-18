/**
 * Profile Screen
 * User profile screen with account settings, browsing history, and wishlist
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BellIcon,
  MoreIcon,
  EditIcon,
  SettingsIcon,
  HelpIcon,
  LockIcon,
  RatingIcon,
  SignOutIcon,
} from '../components/common';
import { ListingCard, type ListingCardData } from '../components/listings';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';

// Extended ListingCardData for ProfileScreen
interface ExtendedListingCardData extends ListingCardData {
  badge?: string;
}
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2;

type ProfileScreenProps = {
  navigation?: any;
};

type TabType = 'Browsing History' | 'Wishlist';

// Mock data for user
const mockUser = {
  name: 'Aousaf Ahmad',
  profileImage: 'https://i.pravatar.cc/150?img=12',
  myListings: 12,
  reviews: 140,
};

// Mock data for browsing history (horizontal scroll)
const mockBrowsingHistory: ExtendedListingCardData[] = [
  {
    id: 'bh1',
    title: 'USB LED Desk Lamp',
    price: '850',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    rating: 35,
    views: 969,
  },
  {
    id: 'bh2',
    title: '1Pc Fashionable Amethyst Bracelet',
    price: '400',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    rating: 28,
    views: 456,
    badge: 'Almost Sold Out',
  },
  {
    id: 'bh3',
    title: 'Wireless Earbuds',
    price: '1,200',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    rating: 42,
    views: 1234,
  },
  {
    id: 'bh4',
    title: 'USB LED Desk Lamp',
    price: '850',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    rating: 35,
    views: 969,
  },
];

// Mock data for grid listings (with full titles)
const mockGridListings: ExtendedListingCardData[] = [
  {
    id: 'g1',
    title: 'Casta Auto USB LED Desk Lamp With',
    price: '850',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    rating: 35,
    views: 969,
  },
  {
    id: 'g2',
    title: 'Casta Auto 1Pc Fashionable Ameth....',
    price: '1,000',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    rating: 35,
    views: 969,
  },
];

// Mock data for wishlist
const mockWishlist: ListingCardData[] = [
  {
    id: 'w1',
    title: 'USB LED Desk Lamp With',
    price: '850',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    rating: 35,
    views: 969,
    category: 'Product',
  },
  {
    id: 'w2',
    title: '1Pc Fashionable Ameth....',
    price: '1,000',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    rating: 35,
    views: 969,
    category: 'Product',
  },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  navigation,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('Browsing History');
  const [bottomNavTab, setBottomNavTab] = useState<BottomNavItem>('Profile');

  const handleAccountSettings = () => {
    // TODO: Navigate to account settings
    console.log('Account Settings pressed');
  };

  const handleHelpSupport = () => {
    // TODO: Navigate to help & support
    console.log('Help & Support pressed');
  };

  const handleSignOut = () => {
    // TODO: Implement sign out logic
    navigation?.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderBrowsingHistoryItem = ({ item }: { item: ExtendedListingCardData }) => (
    <View style={styles.horizontalCard}>
      <View style={styles.horizontalImageContainer}>
        {typeof item.image === 'string' ? (
          <Image
            source={{ uri: item.image }}
            style={styles.horizontalImage}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={item.image}
            style={styles.horizontalImage}
            resizeMode="cover"
          />
        )}
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.horizontalPrice}>$ {item.price}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
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
              // TODO: Navigate to profile settings
              console.log('Profile pressed');
            }}
          >
            <Image
              source={{ uri: mockUser.profileImage }}
              style={styles.headerProfileImage}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: Show menu
              console.log('More options pressed');
            }}
          >
            <MoreIcon size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileTopRow}>
            <Image
              source={{ uri: mockUser.profileImage }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{mockUser.name}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  activeOpacity={0.7}
                  onPress={() => {
                    // TODO: Edit name
                    console.log('Edit name pressed');
                  }}
                >
                  <EditIcon size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{mockUser.myListings}</Text>
                  <Text style={styles.statLabel}>My Listings</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{mockUser.reviews}</Text>
                  <Text style={styles.statLabel}>Reviews</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.privacyRow}>
            <LockIcon size={12} color="#004C9D" style={{marginTop: 3}} />
            <Text style={styles.privacyText}>
              Your information and privacy will be kept secure and
              uncompromised.
            </Text>
          </View>
        </View>

        {/* Account Management Section */}
        <View style={styles.accountSection}>
          <TouchableOpacity
            style={styles.accountButton}
            onPress={handleAccountSettings}
            activeOpacity={0.7}
          >
            <SettingsIcon size={24} color="#B7B7B7" />
            <Text style={styles.accountButtonText}>Account Setting</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.accountButton}
            onPress={handleHelpSupport}
            activeOpacity={0.7}
          >
            <HelpIcon size={24} color="#B7B7B7" />
            <Text style={styles.accountButtonText}>Help & Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.accountButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <SignOutIcon size={24} color="#B7B7B7" />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs Section */}
        <View style={styles.tabsSection}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'Browsing History' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('Browsing History')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Browsing History' && styles.tabTextActive,
              ]}
            >
              Browsing History
            </Text>
            {activeTab === 'Browsing History' && (
              <View style={styles.tabUnderline} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Wishlist' && styles.tabActive]}
            onPress={() => setActiveTab('Wishlist')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Wishlist' && styles.tabTextActive,
              ]}
            >
              Wishlist ({mockWishlist.length})
            </Text>
            {activeTab === 'Wishlist' && (
              <View style={styles.tabUnderline} />
            )}
          </TouchableOpacity>
        </View>

        {/* Horizontal Scrollable List */}
        {activeTab === 'Browsing History' && (
          <View style={styles.horizontalSection}>
            <FlatList
              data={mockBrowsingHistory}
              renderItem={renderBrowsingHistoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Product Listings Grid */}
        <View style={styles.listingsSection}>
          {activeTab === 'Browsing History' ? (
            <View style={styles.listingsGrid}>
              {mockGridListings.map((listing) => (
                <View key={listing.id} style={styles.listingCardWrapper}>
                  <View style={styles.listingImageContainer}>
                    {typeof listing.image === 'string' ? (
                      <Image
                        source={{ uri: listing.image }}
                        style={styles.listingImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={listing.image}
                        style={styles.listingImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.listingBadge}>
                      <Text style={styles.listingBadgeText}>Casta Auto</Text>
                    </View>
                  </View>
                  <View style={styles.listingContent}>
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      {listing.title}
                    </Text>
                    <Text style={styles.listingPrice}>$ {listing.price}</Text>
                    <View style={styles.listingMeta}>
                      <View style={styles.listingRating}>
                        <RatingIcon size={12} color="#FFB904" />
                        <Text style={styles.listingMetaText}>
                          ({listing.rating})
                        </Text>
                      </View>
                      <Text style={styles.listingMetaText}>
                        {listing.views} Views
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.listingsGrid}>
              {mockWishlist.map((listing) => (
                <View key={listing.id} style={styles.listingCardWrapper}>
                  <ListingCard listing={listing} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={bottomNavTab}
        onTabPress={(tab) => {
          setBottomNavTab(tab);
          if (tab === 'Home') {
            navigation?.navigate('Home');
          } else if (tab === 'Profile') {
            // Already on Profile screen
          }
          // TODO: Handle other tab navigations
        }}
        onCreatePress={() => {}}
        showCreateButton={false}
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
    backgroundColor: Colors.light.background,
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
  headerProfileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  profileSection: {
    backgroundColor: Colors.light.background,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  userName: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 20,
  },
  editButton: {
    padding: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  privacyText: {
    ...Typography.caption,
    color: '#004C9D',
    fontSize: 12,
    flex: 1,
  },
  accountSection: {
    backgroundColor: Colors.light.background,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 4,
    marginHorizontal: Spacing.lg,
    marginVertical: 2,
  },
  accountButtonText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  signOutButtonText: {
    ...Typography.body,
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '500',
  },
  tabsSection: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingBottom: Spacing.md,
    marginRight: Spacing.xl,
    position: 'relative',
  },
  tabActive: {
    // Active state handled by underline
  },
  tabText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.light.primary,
  },
  horizontalSection: {
    backgroundColor: Colors.light.background,
    paddingVertical: Spacing.md,
  },
  horizontalList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  horizontalCard: {
    width: 120,
    marginRight: Spacing.md,
  },
  horizontalImageContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
    position: 'relative',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    ...Typography.caption,
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '600',
  },
  horizontalPrice: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 14,
  },
  listingsSection: {
    backgroundColor: Colors.light.background,
    padding: Spacing.md,
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listingCardWrapper: {
    width: CARD_WIDTH,
    marginBottom: Spacing.md,
  },
  listingImageContainer: {
    width: '100%',
    height: 160,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  listingImage: {
    width: '100%',
    height: '100%',
  },
  listingBadge: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  listingBadgeText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  listingContent: {
    // Content styles
  },
  listingTitle: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  listingPrice: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  listingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  listingRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  listingMetaText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
});

