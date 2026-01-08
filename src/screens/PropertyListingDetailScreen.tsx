/**
 * Property Listing Detail Screen
 * Displays full property listing details with property-specific design
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
  LocationIcon,
} from '../components/common';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { listingService, profileService } from '../services';

const { width } = Dimensions.get('window');

type PropertyListingDetailScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      listingId?: string;
    };
  };
};

export const PropertyListingDetailScreen: React.FC<PropertyListingDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false);
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

  const handleContactDealer = () => {
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
    return `$. ${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading property...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Property not found</Text>
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

  // Get interior photos (excluding the first one which is the main exterior image)
  const interiorPhotos = allPhotos.length > 1 ? allPhotos.slice(1) : [];
  const displayedPhotos = showAllPhotos ? interiorPhotos : interiorPhotos.slice(0, 4);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Exterior Image */}
        {allPhotos.length > 0 && (
          <View style={styles.mainImageContainer}>
            <Image
              source={{ uri: allPhotos[0] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            {/* Header overlay */}
            <View style={styles.headerOverlay}>
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
          </View>
        )}

        {/* Title and Views */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{listing.title || 'Property Title'}</Text>
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

        {/* Apartment Details and Actions */}
        <View style={styles.apartmentDetailsHeader}>
          <Text style={styles.propertyDetailsTitle}>Apartment Details</Text>
          <View style={styles.actionButtons}>
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

        {/* Property Details */}
        <View style={styles.propertyDetailsSection}>
          <View style={styles.propertyDetailsColumn}>
            {listing.bedrooms && (
              <View style={styles.propertyDetailItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.propertyDetailText}>
                  {listing.bedrooms} bedrooms
                </Text>
              </View>
            )}
            {listing.bathrooms && (
              <View style={styles.propertyDetailItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.propertyDetailText}>
                  {listing.bathrooms} bathroom
                </Text>
              </View>
            )}
            {listing.squareFeet && (
              <View style={styles.propertyDetailItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.propertyDetailText}>
                  {listing.squareFeet.toLocaleString()} sqr feet
                </Text>
              </View>
            )}
          </View>
          {interiorPhotos.length > 4 && (
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => setShowAllPhotos(!showAllPhotos)}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>
                {showAllPhotos ? 'Show less' : 'See all >'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Interior Photos */}
        {displayedPhotos.length > 0 && (
          <View style={styles.photosSection}>
            {displayedPhotos.map((photo: string, index: number) => (
              <Image
                key={index}
                source={{ uri: photo }}
                style={styles.interiorPhoto}
                resizeMode="cover"
              />
            ))}
          </View>
        )}

        {/* See All Button for Description and Property Details */}
        <View style={styles.propertyDetailsSection}>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => setShowAllDetails(!showAllDetails)}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>
              {showAllDetails ? 'Show less' : 'See all >'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Description - Shown when See All is clicked */}
        {showAllDetails && listing.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{listing.description}</Text>
          </View>
        )}

        {/* Additional Property Details - Shown when See All is clicked */}
        {showAllDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Details</Text>
            
            {listing.location && (
              <View style={styles.detailRow}>
                <LocationIcon size={15} color="#6B7280" />
                <Text style={styles.detailValue}>{listing.location}</Text>
              </View>
            )}

            {listing.city && (
              <View style={styles.detailRow}>
                <LocationIcon size={15} color="#6B7280" />
                <Text style={styles.detailValue}>{listing.city}</Text>
              </View>
            )}

            {listing.yearBuilt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Year Built:</Text>
                <Text style={styles.detailValue}>{listing.yearBuilt}</Text>
              </View>
            )}
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
    backgroundColor: 'transparent',
    zIndex: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
  mainImageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.light.surface,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'transparent',
    zIndex: 10,
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  price: {
    ...Typography.h2,
    color: Colors.light.primary,
    fontWeight: '700',
    fontSize: 28,
  },
  apartmentDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2, // Slight adjustment to align with heading
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
  propertyDetailsSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  propertyDetailsTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 18,
    marginTop: 2, // Slight adjustment to align with buttons
  },
  propertyDetailsColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  propertyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.text,
    marginTop: 2,
  },
  propertyDetailText: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 14,
  },
  seeAllButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  seeAllText: {
    ...Typography.body,
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  photosSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  interiorPhoto: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.surface,
    marginBottom: Spacing.sm,
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
  descriptionText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  detailLabel: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  detailValue: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 14,
    flex: 1,
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

