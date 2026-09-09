/**
 * Service Listing Detail Screen
 * Visual layout aligned with Event detail; service-specific fields retained.
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
  SaveIcon,
  ReportIcon,
  PhoneIcon,
  RatingIcon,
  VisibilityIcon,
  DurationIcon,
  LocationIcon,
} from '../components/common';
import { Colors, Spacing, BorderRadius } from '../config/theme';
import { listingService, profileService } from '../services';
import { formatListingPriceWithType } from '../utils/currency';
import { ListingStoreProfileCTA } from '../components/listings';

const { width } = Dimensions.get('window');
const MP = Colors.light.marketplace;
const HERO_HEIGHT = 240;

type ServiceListingDetailScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      listingId?: string;
    };
  };
};

type DetailTile = { label: string; value: string; tall?: boolean };

function formatShortTimePosted(raw?: string | Date | null): string {
  if (!raw) return '';
  if (raw instanceof Date) {
    const diff = Date.now() - raw.getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'today';
    if (days === 1) return '1d ago';
    return `${days}d ago`;
  }
  const text = String(raw);
  if (/^just now$/i.test(text.trim())) return 'now';
  return text
    .replace(/(\d+)\s+minutes?\s+ago/gi, '$1m ago')
    .replace(/(\d+)\s+hours?\s+ago/gi, '$1h ago')
    .replace(/(\d+)\s+days?\s+ago/gi, '$1d ago')
    .replace(/(\d+)\s+weeks?\s+ago/gi, '$1w ago');
}

function formatViews(views?: number) {
  if (views == null) return '0 views';
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views} views`;
}

function DetailGridCard({ label, value, tall }: DetailTile) {
  return (
    <View style={[styles.detailCard, tall && styles.detailCardTall]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={tall ? 3 : 2}>
        {value}
      </Text>
    </View>
  );
}

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
        const isInWishlist =
          Array.isArray(wishlistData) &&
          wishlistData.some(
            (item: any) =>
              item.id === listingId || item._id === listingId || item.listingId === listingId,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const fetchListingDetails = async () => {
    if (!listingId) return;
    try {
      setLoading(true);
      const response = await listingService.getListingById(listingId);
      if (response.success) {
        const listingData = (response.data as any)?.data || response.data;
        setListing(listingData);
        checkWishlistStatus();
      } else {
        Alert.alert('Error', 'Failed to load service details');
        navigation?.goBack();
      }
    } catch (error: any) {
      console.error('Error fetching service details:', error);
      Alert.alert('Error', 'Failed to load service details');
      navigation?.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigation?.goBack();

  const handleViewStoreProfile = () => {
    if (listing?.store?.id) {
      navigation?.navigate('StoreProfile', { storeId: listing.store.id });
    }
  };

  const handleSave = async () => {
    if (!listingId || saving) return;
    try {
      setSaving(true);
      if (saved) {
        const response = await profileService.removeFromWishlist(listingId);
        if (response.success) setSaved(false);
        else Alert.alert('Error', 'Failed to remove from wishlist');
      } else {
        const response = await profileService.addToWishlist(listingId);
        if (response.success) setSaved(true);
        else {
          const errorMessage = (response.data as any)?.message;
          if (errorMessage?.includes('already in wishlist')) setSaved(true);
          else Alert.alert('Error', errorMessage || 'Failed to add to wishlist');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update wishlist.');
    } finally {
      setSaving(false);
    }
  };

  const handleReport = () => {
    Alert.alert('Report Listing', 'Are you sure you want to report this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => console.log('Report listing:', listingId),
      },
    ]);
  };

  const handlePhoneCall = () => {
    const phoneNumber =
      listing?.serviceProviderContact ||
      listing?.organizerContact ||
      listing?.store?.phone ||
      listing?.contactPhone ||
      listing?.user?.phoneNumber;

    const cleaned = typeof phoneNumber === 'string' ? phoneNumber.replace(/[^\d+]/g, '') : '';

    if (!cleaned) {
      Alert.alert('Unavailable', 'No phone number is available for this service.');
      return;
    }

    Linking.openURL(`tel:${cleaned}`).catch(() =>
      Alert.alert('Error', 'Could not start call.'),
    );
  };

  const handleBookNow = () => {
    const storeId = listing?.store?.id;
    if (!storeId) {
      Alert.alert('Unavailable', 'Booking requires a store listing');
      return;
    }
    navigation?.navigate('ChooseService', {
      storeId,
      listingId: listing.id,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MP.primary} />
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
          <TouchableOpacity style={styles.errorBack} onPress={handleBack}>
            <Text style={styles.errorBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const allPhotos =
    listing.photos?.map((photo: any) => photo.photoUrl || photo.photo_url || photo) ||
    (listing.image ? [listing.image] : []);

  const locationLine =
    [listing.location, listing.city].filter(Boolean).join(', ') || 'Location TBD';

  const ratingText =
    listing.ratingAverage != null && !Number.isNaN(listing.ratingAverage)
      ? Number(listing.ratingAverage).toFixed(1)
      : listing.reviewsCount > 0
        ? String(listing.reviewsCount)
        : '—';

  const timePosted = listing.publishedAt
    ? formatShortTimePosted(new Date(listing.publishedAt))
    : formatShortTimePosted(listing.timePosted);

  const serviceTypeValue =
    listing.serviceType?.name ||
    (typeof listing.serviceType === 'string' ? listing.serviceType : null) ||
    listing.categoryType ||
    '—';

  const detailTiles: DetailTile[] = [
    { label: 'Service Type', value: serviceTypeValue },
    {
      label: 'Specialization',
      value: listing.specialization || '—',
      tall: Boolean(listing.specialization && String(listing.specialization).length > 28),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrap}>
          {allPhotos.length > 0 ? (
            <>
              <FlatList
                ref={flatListRef}
                data={allPhotos}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => `photo-${index}`}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / width);
                  setCurrentImageIndex(index);
                }}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.heroImage} resizeMode="cover" />
                )}
              />
              {allPhotos.length > 1 && (
                <View style={styles.pagination}>
                  {allPhotos.map((_: string, index: number) => (
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
            </>
          ) : (
            <View style={styles.heroPlaceholder} />
          )}

          <View style={styles.heroGradient} pointerEvents="none" />

          <TouchableOpacity
            style={styles.heroIconBtn}
            onPress={handleBack}
            activeOpacity={0.85}
          >
            <BackIcon size={18} color={MP.titleText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.heroIconBtn, styles.heroIconBtnRight]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={saved ? MP.report : MP.primary} />
            ) : (
              <SaveIcon size={14} color={saved ? MP.report : MP.titleText} filled={saved} />
            )}
          </TouchableOpacity>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>Service</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {listing.title || 'Service'}
            </Text>
            <Text style={styles.price}>
              {formatListingPriceWithType(listing.price, listing.currency, listing.priceType)}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <RatingIcon size={12} color="#FFB904" />
              <Text style={styles.statText}>{ratingText}</Text>
            </View>
            <View style={styles.statItem}>
              <VisibilityIcon size={12} color={MP.metaText} />
              <Text style={styles.statText}>
                {formatViews(listing.viewsCount ?? listing.views)}
              </Text>
            </View>
            {timePosted ? (
              <View style={styles.statItem}>
                <DurationIcon size={12} color={MP.metaText} />
                <Text style={styles.statText}>{timePosted}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.locationRow}>
            <LocationIcon size={13} color={MP.chipInactiveText} />
            <Text style={styles.locationText}>{locationLine}</Text>
          </View>

          <View style={styles.divider} />

          <ListingStoreProfileCTA
            store={listing.store}
            onPress={handleViewStoreProfile}
            variant="marketplace"
          />

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionLink}
              onPress={handleSave}
              activeOpacity={0.7}
              disabled={saving}
            >
              <SaveIcon size={13} color={MP.primary} filled={saved} />
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionLink} onPress={handleReport} activeOpacity={0.7}>
              <ReportIcon size={13} color={MP.report} />
              <Text style={styles.reportText}>Report</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {listing.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{listing.description}</Text>
            </View>
          ) : null}

          {listing.description ? <View style={styles.divider} /> : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailGrid}>
              {detailTiles.map((tile) => (
                <DetailGridCard
                  key={tile.label}
                  label={tile.label}
                  value={tile.value}
                  tall={tile.tall}
                />
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.callButton} onPress={handlePhoneCall} activeOpacity={0.85}>
          <PhoneIcon size={16} color={MP.primary} />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow} activeOpacity={0.85}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MP.screenSurface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: MP.chipInactiveText,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: MP.titleText,
    marginBottom: Spacing.md,
  },
  errorBack: {
    padding: Spacing.md,
  },
  errorBackText: {
    fontSize: 16,
    color: MP.primary,
    fontWeight: '600',
  },
  heroWrap: {
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: MP.screenBg,
    position: 'relative',
  },
  heroImage: {
    width,
    height: HERO_HEIGHT,
  },
  heroPlaceholder: {
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: MP.screenBg,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  heroIconBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  heroIconBtnRight: {
    left: undefined,
    right: 16,
  },
  categoryBadge: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    backgroundColor: MP.beautyBadge,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 16.5,
  },
  pagination: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
  body: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: MP.titleText,
  },
  price: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '800',
    color: MP.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    lineHeight: 16.5,
    color: MP.metaText,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  locationText: {
    fontSize: 13,
    lineHeight: 19.5,
    color: MP.chipInactiveText,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: MP.divider,
    marginVertical: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saveText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: MP.primary,
  },
  reportText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: MP.report,
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: '700',
    color: MP.titleText,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20.8,
    color: MP.descriptionText,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  detailCard: {
    width: (width - Spacing.md * 2 - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    minHeight: 62,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  detailCardTall: {
    minHeight: 82,
  },
  detailLabel: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
    color: MP.metaMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    lineHeight: 19.5,
    fontWeight: '600',
    color: MP.titleText,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    paddingHorizontal: Spacing.md,
    paddingTop: 13,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.18,
    borderTopColor: MP.bottomBarBorder,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1.18,
    borderColor: MP.primary,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  callButtonText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: MP.primary,
  },
  bookButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: MP.primary,
    shadowColor: MP.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  bookButtonText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
