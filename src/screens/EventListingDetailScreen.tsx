/**
 * Event Listing Detail Screen
 * Displays full event listing details with event-specific design
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
  CalendarIcon,
  DurationIcon,
  LocationColorIcon,
  MultiColoredUserIcon,
  MultiUserIcon,
} from '../components/common';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { listingService, profileService } from '../services';

const { width } = Dimensions.get('window');

type EventListingDetailScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      listingId?: string;
    };
  };
};

export const EventListingDetailScreen: React.FC<EventListingDetailScreenProps> = ({
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
    const phoneNumber = listing?.organizerContact;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const handleBookNow = () => {
    // TODO: Navigate to booking screen
    Alert.alert('Book Now', 'Booking functionality coming soon');
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const dayName = days[date.getDay()];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${dayName} ${day} ${month}, ${year}`;
    } catch (e) {
      return dateString;
    }
  };

  const getCapacityProgress = () => {
    const current = listing?.currentAttendees || listing?.attendeesCount || 0;
    const max = listing?.maxCapacity || listing?.capacity || 0;
    if (max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
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

  // Get inclusions from description or separate field
  const inclusions = listing.inclusions || listing.whatsIncluded || [];

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
          <Text style={styles.title}>{listing.title || 'Event Title'}</Text>
          <Text style={styles.viewsText}>
            {formatViews(listing.viewsCount || listing.views)}
          </Text>
        </View>

        {/* Price and Actions */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>
            {formatPrice(listing.price)}
          </Text>
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

        {/* Event Details Section */}
        <View style={styles.eventDetailsSection}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          
          {/* Event Type */}
          {listing.eventType && (
            <View style={styles.detailRowColumn}>
              <Text style={styles.detailLabel}>Event Type</Text>
              <Text style={styles.detailValue}>
                {listing.eventType.name || listing.eventType}
              </Text>
            </View>
          )}

          {/* Date & Time */}
          {(listing.eventDate || listing.date) && (
            <View style={styles.detailRowColumn}>
              <View style={styles.detailRowInsideColumn}>
                <View style={styles.detailIconContainer}>
                  <CalendarIcon size={20} color="#00CAD4" />
                </View>
                <Text style={styles.detailLabel}>Date & Time</Text>
              </View>
              <Text style={styles.detailValue}>
                {formatDate(listing.eventDate || listing.date)}
                {listing.eventTime && ` ${listing.eventTime}`}
              </Text>
            </View>
          )}

          {/* Duration */}
          {listing.duration && (
            <View style={styles.detailRowColumn}>
              <View style={styles.detailRowInsideColumn}>
                <View style={styles.detailIconContainer}>
                  <DurationIcon size={20} color="#00CAD4" />
                </View>
                <Text style={styles.detailLabel}>Duration</Text>
              </View>
              <Text style={styles.detailValue}>
                {listing.eventTime || '14:00'} ({listing.duration})
              </Text>
            </View>
          )}

          {/* Location */}
          {listing.location && (
            <View style={styles.detailRowColumn}>
              <View style={styles.detailRowInsideColumn}>
                <View style={styles.detailIconContainer}>
                  <LocationColorIcon size={20} color="#00CAD4" />
                </View>
                <Text style={styles.detailLabel}>Location</Text>
              </View>
              <Text style={styles.detailValue}>{listing.location}</Text>
            </View>
          )}

          {/* Capacity */}
          {(listing.maxCapacity || listing.capacity) && (
            <View style={styles.detailRowColumn}>
              <View style={styles.detailRowInsideColumn}>
                <View style={styles.detailIconContainer}>
                  <MultiColoredUserIcon size={20} color="#00CAD4" />
                </View>
                <Text style={styles.detailLabel}>Capacity</Text>
              </View>
              <View style={styles.capacityContainer}>
                <Text style={styles.detailValue}>
                  {listing.currentAttendees || listing.attendeesCount || 0} / {listing.maxCapacity || listing.capacity} attendees
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${getCapacityProgress()}%` }]} />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* About this event */}
        {listing.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this event</Text>
            <Text style={styles.descriptionText}>{listing.description}</Text>
          </View>
        )}

        {/* What's included */}
        {/* {inclusions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's included</Text>
            {inclusions.map((item: string, index: number) => (
              <View key={index} style={styles.inclusionItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.inclusionText}>{item}</Text>
              </View>
            ))}
          </View>
        )} */}

        {/* More Photos */}
        {/* {additionalPhotos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>More Photos</Text>
            <View style={styles.photosGrid}>
              {additionalPhotos.slice(0, 4).map((photo: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photoThumbnail}
                  resizeMode="cover"
                />
              ))}
            </View>
          </View>
        )} */}

         {/* Hosted By */}
         {(listing.user || listing.organizerName) && (
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Hosted By</Text>
             <View style={styles.hostRow}>
               <View style={styles.detailIconContainer}>
                 <MultiUserIcon size={20} color="#040404" />
               </View>
               <View style={styles.hostInfoContainer}>
                 <Text style={styles.hostName}>
                   {listing.organizerName}
                 </Text>
                 {listing.user?._count?.listings && (
                   <Text style={styles.hostInfo}>
                     {listing.user._count.listings} bookings
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
          style={styles.bookButton}
          onPress={handleBookNow}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>Book now</Text>
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
  eventDetailsSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.background,
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  detailRowColumn: {
    flexDirection: 'column',
    marginBottom: Spacing.md,
  },
  detailRowInsideColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  detailIconContainer: {
    width: 24,
    alignItems: 'center',
  },
  detailLabel: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
    minWidth: 100,
  },
  detailValue: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 14,
    flex: 1,
  },
  capacityContainer: {
    flex: 1,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: Spacing.xs,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  descriptionText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.primary,
    marginTop: 6,
  },
  inclusionText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
    flex: 1,
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
  bookButton: {
    flex: 1,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

