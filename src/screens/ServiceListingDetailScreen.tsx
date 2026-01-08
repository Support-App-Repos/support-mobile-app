/**
 * Service Listing Detail Screen
 * Displays full service listing details with service-specific design
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
  MultiUserIcon,
} from '../components/common';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { listingService, profileService } from '../services';

const { width } = Dimensions.get('window');

type ServiceListingDetailScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      listingId?: string;
    };
  };
};

export const ServiceListingDetailScreen: React.FC<ServiceListingDetailScreenProps> = ({
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
          (item: any) => item.id === listingId || item._id === listingId || item.listingId === listingId
        );
        setSaved(isInWishlist);
      }
    } catch (error) {
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
    console.log('Search pressed');
  };

  const handleShare = async () => {
    console.log('Share pressed');
  };

  const handleSave = async () => {
    if (!listingId || saving) return;

    try {
      setSaving(true);
      
      if (saved) {
        const response = await profileService.removeFromWishlist(listingId);
        if (response.success) {
          setSaved(false);
        } else {
          Alert.alert('Error', 'Failed to remove from wishlist');
        }
      } else {
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
        console.log('Report listing:', listingId);
      }},
    ]);
  };

  const handlePhoneCall = () => {
    const phoneNumber = listing?.contactPhone;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const handleContactService = () => {
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
          <Text style={styles.loadingText}>Loading service...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Service not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Get all photos for the slider
  const allPhotos = listing.photos?.map((photo: any) => photo.photoUrl || photo.photo_url || photo) || 
                    (listing.image ? [listing.image] : []);

  // Get additional photos (excluding the first one which is the main image)
  const additionalPhotos = allPhotos.length > 1 ? allPhotos.slice(1) : [];

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
          <Text style={styles.title}>{listing.title || 'Service Title'}</Text>
          <Text style={styles.viewsText}>
            {formatViews(listing.viewsCount || listing.views)}
          </Text>
        </View>

        {/* Price */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>
            {formatPrice(listing.price)}
          </Text>
        </View>

        {/* Service Details Section */}
        <View style={styles.serviceDetailsSection}>
          <View style={styles.serviceDetailsHeader}>
            <Text style={[styles.sectionTitle, { marginTop: 2 }]}>Service Details</Text>
            <View style={[styles.actionButtons, { marginTop: 2 }]}>
              <TouchableOpacity
                style={styles.actionButton}
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
                <Text style={[styles.actionButtonText, saved && styles.actionButtonTextSaved]}>
                  Save
                </Text>
              </TouchableOpacity>
              <Text style={styles.actionSeparator}>|</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleReport}
                activeOpacity={0.7}
              >
                <ReportIcon size={12} color="#1B1B1B" />
                <Text style={styles.actionButtonText}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.serviceDetailsList}>
            {/* Service Type */}
            {listing.serviceType && (
              <View style={styles.detailItem}>
                <Text style={styles.detailTitle}>Service Type:</Text>
                <Text style={styles.detailValue}>
                  {listing.serviceType.name || listing.serviceType}
                </Text>
              </View>
            )}

            {/* Business Name */}
            {listing.businessName && (
              <View style={styles.detailItem}>
                <Text style={styles.detailTitle}>Business Name:</Text>
                <Text style={styles.detailValue}>{listing.businessName}</Text>
              </View>
            )}

            {/* Specialization */}
            {listing.specialization && (
              <View style={styles.detailItem}>
                <Text style={styles.detailTitle}>Specialization:</Text>
                <Text style={styles.detailValue}>{listing.specialization}</Text>
              </View>
            )}

            {/* Years of Experience */}
            {listing.yearsOfExperience && (
              <View style={styles.detailItem}>
                <Text style={styles.detailTitle}>Years of Experience:</Text>
                <Text style={styles.detailValue}>
                  {listing.yearsOfExperience} {listing.yearsOfExperience === 1 ? 'year' : 'years'}
                </Text>
              </View>
            )}

            {/* Location */}
            {listing.location && (
              <View style={styles.detailItem}>
                <Text style={styles.detailTitle}>Location:</Text>
                <Text style={styles.detailValue}>{listing.location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* About this service */}
        {listing.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this service</Text>
            <Text style={styles.descriptionText}>{listing.description}</Text>
          </View>
        )}

        {/* Service Provider */}
        {(listing.user || listing.businessName || listing.serviceProviderName) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Provider</Text>
            <View style={styles.hostRow}>
              <View style={styles.detailIconContainer}>
                <MultiUserIcon size={20} color="#040404" />
              </View>
              <View style={styles.hostInfoContainer}>
                <Text style={styles.hostName}>
                  {listing.serviceProviderName || listing.organizerName || listing.businessName || 'Unknown Provider'}
                </Text>
                {listing.user?._count?.listings && (
                  <Text style={styles.hostInfo}>
                    {listing.user._count.listings} services
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

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
          onPress={handleContactService}
          activeOpacity={0.8}
        >
          <Text style={styles.contactButtonText}>Contact Service</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
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
  viewsText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  price: {
    ...Typography.h2,
    color: Colors.light.primary,
    fontWeight: '700',
    fontSize: 28,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionButtonText: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 14,
  },
  actionButtonTextSaved: {
    color: '#EF4444',
  },
  actionSeparator: {
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  serviceDetailsSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.background,
  },
  serviceDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  serviceDetailsList: {
    gap: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  detailTitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    minWidth: 140,
  },
  detailValue: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 14,
    flex: 1,
  },
  detailIconContainer: {
    width: 24,
    alignItems: 'center',
  },
  descriptionText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photoThumbnail: {
    width: (width - Spacing.md * 2 - Spacing.sm) / 2,
    height: 120,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.surface,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  hostInfoContainer: {
    flex: 1,
  },
  hostName: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  hostInfo: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
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
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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

