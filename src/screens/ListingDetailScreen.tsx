/**
 * Listing Detail Screen
 * Displays full listing details with images and contact options
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BackIcon,
  SearchIcon,
  ShareIcon,
  SaveIcon,
  ReportIcon,
  PhoneIcon,
} from '../components/common';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { listingService, profileService } from '../services';

const { width } = Dimensions.get('window');

type ListingDetailScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      listingId?: string;
    };
  };
};

export const ListingDetailScreen: React.FC<ListingDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const listingId = route?.params?.listingId;

  const checkWishlistStatus = async () => {
    if (!listingId) return;
    
    try {
      const response = await profileService.getWishlist();
      if (response.success) {
        const wishlistData = (response.data as any)?.data || response.data || [];
        const isInWishlist = Array.isArray(wishlistData) && wishlistData.some(
          (item: any) => item.id === listingId || item._id === listingId
        );
        setSaved(isInWishlist);
      }
    } catch (error) {
      // Silently fail - user might not be logged in or wishlist check failed
      console.error('Error checking wishlist status:', error);
    }
  };

  useEffect(() => {
    if (listingId) {
      fetchListingDetails();
    }
  }, [listingId]);

  const fetchListingDetails = async () => {
    if (!listingId) return;

    try {
      setLoading(true);
      const response = await listingService.getListingById(listingId);
      
      if (response.success) {
        const listingData = (response.data as any)?.data || response.data;
        setListing(listingData);
        // Check wishlist status after listing is loaded
        if (listingId) {
          checkWishlistStatus();
        }
      } else {
        Alert.alert('Error', 'Failed to load listing details');
        navigation?.goBack();
      }
    } catch (error: any) {
      console.error('Error fetching listing details:', error);
      Alert.alert('Error', 'Failed to load listing details');
      navigation?.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation?.goBack();
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search pressed');
  };

  const handleShare = async () => {
    // TODO: Implement share functionality
    console.log('Share pressed');
  };

  const handleSave = async () => {
    if (!listingId || saving) return;

    try {
      setSaving(true);
      
      if (saved) {
        // Remove from wishlist
        const response = await profileService.removeFromWishlist(listingId);
        if (response.success) {
          setSaved(false);
        } else {
          Alert.alert('Error', 'Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await profileService.addToWishlist(listingId);
        if (response.success) {
          setSaved(true);
        } else {
          const errorMessage = (response.data as any)?.message;
          if (errorMessage?.includes('already in wishlist')) {
            setSaved(true);
          } else {
            Alert.alert('Error', errorMessage || 'Failed to add to wishlist');
          }
        }
      }
    } catch (error: any) {
      console.error('Error saving to wishlist:', error);
      Alert.alert('Error', error.message || 'Failed to update wishlist. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReport = () => {
    Alert.alert('Report Listing', 'Are you sure you want to report this listing?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: () => {
        // TODO: Implement report functionality
        console.log('Report listing:', listingId);
      }},
    ]);
  };

  const handlePhoneCall = () => {
    // TODO: Get phone number from listing or user data
    const phoneNumber = listing?.user?.phone || listing?.organizerContact;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleContactDealer = () => {
    // TODO: Navigate to contact/message screen or open phone
    handlePhoneCall();
  };

  const formatViews = (views?: number) => {
    if (!views) return '0 views';
    if (views >= 100000) return `${(views / 1000).toFixed(0)}K+ views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  const formatPrice = (price?: number) => {
    if (!price) return '$0';
    return `$ ${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading listing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Listing not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Get all photos for the slider
  const allPhotos = listing.photos?.map((photo: any) => photo.photoUrl || photo) || 
                    (listing.image ? [listing.image] : []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <BackIcon size={24} color="#030303" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleSearch}
            activeOpacity={0.7}
          >
            <SearchIcon size={14} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <ShareIcon size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Slider */}
        {allPhotos.length > 0 && (
          <View style={styles.imageSliderContainer}>
            <FlatList
              ref={flatListRef}
              data={allPhotos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `photo-${index}`}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / width
                );
                setCurrentImageIndex(index);
              }}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              )}
            />
            {/* Pagination Dots */}
            {allPhotos.length > 1 && (
              <View style={styles.paginationContainer}>
                {allPhotos.map((_: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Title and Views */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{listing.title || 'Listing Title'}</Text>
          <View style={styles.viewsAndActionsRow}>
            <Text style={styles.viewsText}>
              {formatViews(listing.viewsCount || listing.views)}
            </Text>
            <View style={styles.actionIconsContainer}>
              <TouchableOpacity
                style={styles.actionIconButton}
                onPress={handleSave}
                activeOpacity={0.7}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={saved ? '#EF4444' : '#1B1B1B'} />
                ) : (
                  <SaveIcon 
                    size={14} 
                    color={saved ? '#EF4444' : '#1B1B1B'} 
                    filled={saved}
                  />
                )}
                <Text style={styles.actionIconLabel}>Save</Text>
              </TouchableOpacity>
              <Text>|</Text>
              <TouchableOpacity
                style={styles.actionIconButton}
                onPress={handleReport}
                activeOpacity={0.7}
              >
                <ReportIcon size={12} color="#1B1B1B" />
                <Text style={styles.actionIconLabel}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Price */}
        <Text style={styles.price}>
          {formatPrice(listing.price)}
        </Text>


        {/* All Listing Information Based on Category */}
        <View style={styles.allInfoSection}>
          {/* Description */}
          {listing.description && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.infoValue}>{listing.description}</Text>
            </View>
          )}

          {/* Common Fields */}
          {listing.location && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{listing.location}</Text>
            </View>
          )}

          {listing.city && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>City</Text>
              <Text style={styles.infoValue}>{listing.city}</Text>
            </View>
          )}

          {/* Event-Specific Fields */}
          {listing.category?.slug?.toLowerCase().includes('event') && (
            <>
              {listing.venue && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Venue</Text>
                  <Text style={styles.infoValue}>{listing.venue}</Text>
                </View>
              )}
              {listing.eventDate && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Event Date</Text>
                  <Text style={styles.infoValue}>
                    {new Date(listing.eventDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {listing.eventTime && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Event Time</Text>
                  <Text style={styles.infoValue}>{listing.eventTime}</Text>
                </View>
              )}
              {listing.duration && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>{listing.duration}</Text>
                </View>
              )}
              {listing.maxCapacity && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Max Capacity</Text>
                  <Text style={styles.infoValue}>{listing.maxCapacity} people</Text>
                </View>
              )}
              {listing.organizerName && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Organizer Name</Text>
                  <Text style={styles.infoValue}>{listing.organizerName}</Text>
                </View>
              )}
              {listing.organizerContact && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Organizer Contact</Text>
                  <Text style={styles.infoValue}>{listing.organizerContact}</Text>
                </View>
              )}
              {listing.organizerEmail && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Organizer Email</Text>
                  <Text style={styles.infoValue}>{listing.organizerEmail}</Text>
                </View>
              )}
              {listing.tags && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Tags</Text>
                  <Text style={styles.infoValue}>{listing.tags}</Text>
                </View>
              )}
              {listing.eventType && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Event Type</Text>
                  <Text style={styles.infoValue}>{listing.eventType.name}</Text>
                </View>
              )}
            </>
          )}

          {/* Property-Specific Fields */}
          {listing.category?.slug?.toLowerCase().includes('propert') && (
            <>
              {listing.bedrooms && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Bedrooms</Text>
                  <Text style={styles.infoValue}>{listing.bedrooms}</Text>
                </View>
              )}
              {listing.bathrooms && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Bathrooms</Text>
                  <Text style={styles.infoValue}>{listing.bathrooms}</Text>
                </View>
              )}
              {listing.squareFeet && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Square Feet</Text>
                  <Text style={styles.infoValue}>
                    {listing.squareFeet.toLocaleString()} sq ft
                  </Text>
                </View>
              )}
              {listing.yearBuilt && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Year Built</Text>
                  <Text style={styles.infoValue}>{listing.yearBuilt}</Text>
                </View>
              )}
            </>
          )}

          {/* Service-Specific Fields */}
          {listing.category?.slug?.toLowerCase().includes('service') && (
            <>
              {listing.businessName && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Business Name</Text>
                  <Text style={styles.infoValue}>{listing.businessName}</Text>
                </View>
              )}
              {listing.specialization && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Specialization</Text>
                  <Text style={styles.infoValue}>{listing.specialization}</Text>
                </View>
              )}
              {listing.yearsOfExperience && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Years of Experience</Text>
                  <Text style={styles.infoValue}>
                    {listing.yearsOfExperience} {listing.yearsOfExperience === 1 ? 'year' : 'years'}
                  </Text>
                </View>
              )}
              {listing.serviceType && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Service Type</Text>
                  <Text style={styles.infoValue}>{listing.serviceType.name}</Text>
                </View>
              )}
            </>
          )}

          {/* Product-Specific Fields */}
          {listing.category?.slug?.toLowerCase().includes('product') && (
            <>
              {/* Products mainly use common fields (title, description, price, location) */}
            </>
          )}
        </View>

        {/* Spacer for bottom action bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity
          style={styles.phoneButton}
          onPress={handlePhoneCall}
          activeOpacity={0.8}
        >
          <PhoneIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactDealer}
          activeOpacity={0.8}
        >
          <Text style={styles.contactButtonText}>Contact Dealer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.md,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.light.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.background,
    zIndex: 10,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerIconButton: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  imageSliderContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  heroImage: {
    width: width,
    height: 300,
    backgroundColor: Colors.light.surface,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: Spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(13, 71, 92, 0.3)', // Primary color with opacity
  },
  paginationDotActive: {
    backgroundColor: Colors.light.primary,
    width: 24,
  },
  titleSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  viewsAndActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewsText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  price: {
    ...Typography.h2,
    color: Colors.light.primary,
    fontWeight: '700',
    fontSize: 28,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  detailsSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  detailItem: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  allInfoSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  actionIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionIconLabel: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 14,
  },
  gallerySection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  galleryImage: {
    width: '100%',
    height: 250,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.surface,
  },
  descriptionSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  descriptionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 18,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  infoSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoLabel: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 16,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  phoneButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButton: {
    flex: 1,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

