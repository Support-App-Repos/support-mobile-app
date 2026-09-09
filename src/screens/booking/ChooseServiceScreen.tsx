import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BackIcon,
  BeautyWellnessIcon,
  CategoryServiceIcon,
  DurationIcon,
  ForwardIcon,
} from '../../components/common';
import { Spacing } from '../../config/theme';
import { bookingService, storeService } from '../../services';
import type { RootStackParamList } from '../../types';
import { unwrapApiPayload } from '../../utils/apiHelpers';
import { formatListingPriceWithType } from '../../utils/currency';

/**
 * Colors sampled from Figma frame 1179:6569 (Choose a Service)
 * https://www.figma.com/design/Aq7w5zn2boHQ0mYyioCjd7/Support?node-id=1179-6569
 */
const C = {
  screen: '#F2F2F2',
  white: '#FFFFFF',
  title: '#131218',
  subtitle: '#696971',
  meta: '#8A8A93',
  iconBtn: '#F2F2F7',
  primary: '#1B4F72',
  ratingBorder: '#C1DBE8',
  ratingBg: '#EFF7FB',
  ratingText: '#1F485E',
};

const SERVICE_ICON_TILES: Array<{
  bg: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  color?: string;
}> = [
  { bg: '#EFF3F6', Icon: CategoryServiceIcon, color: '#C45C4A' },
  { bg: '#F7F0F4', Icon: BeautyWellnessIcon, color: '#C0267E' },
  { bg: '#F0F9F4', Icon: BeautyWellnessIcon, color: '#16A34A' },
  { bg: '#F4F0F7', Icon: CategoryServiceIcon, color: '#7C3AED' },
];

const isServiceListing = (listing: any) => {
  const slug = String(listing?.category?.slug || listing?.category?.name || '').toLowerCase();
  return slug.includes('service');
};

type StoreServiceListing = {
  id?: string;
  _id?: string;
  title?: string;
  description?: string | null;
  duration?: string | null;
  price?: number | string | null;
  currency?: string | null;
  priceType?: string | null;
  specialization?: string | null;
  photos?: Array<{ photoUrl?: string; isPrimary?: boolean }>;
};

type StoreServiceCatalog = {
  store?: {
    id?: string;
    _id?: string;
    name?: string;
    logoUrl?: string | null;
    logo?: string | null;
    ratingAverage?: number | string | null;
    reviewsCount?: number | string | null;
    businessCategory?: string | null;
  } | null;
  listings?: StoreServiceListing[];
  highlightListingId?: string | null;
};

type ChooseServiceScreenProps = {
  navigation?: any;
  route?: {
    params?: RootStackParamList['ChooseService'];
  };
};

const getListingId = (listing: StoreServiceListing) => listing.id || listing._id || '';

const getInitials = (name?: string) =>
  (name || 'Store')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const formatRating = (rating?: number | string | null) => {
  if (rating == null || Number.isNaN(Number(rating))) return null;
  const value = Number(rating);
  if (value <= 0) return null;
  return value.toFixed(1);
};

const prioritizeListing = (
  listings: StoreServiceListing[],
  highlightListingId?: string | null,
) => {
  if (!highlightListingId) return listings;
  const idx = listings.findIndex((item) => getListingId(item) === highlightListingId);
  if (idx <= 0) return listings;
  const next = [...listings];
  const [highlighted] = next.splice(idx, 1);
  next.unshift(highlighted);
  return next;
};

const getPrimaryPhoto = (listing: StoreServiceListing) => {
  const photos = listing.photos || [];
  const primary = photos.find((p) => p.isPrimary && p.photoUrl);
  return primary?.photoUrl || photos.find((p) => p.photoUrl)?.photoUrl || null;
};

export const ChooseServiceScreen: React.FC<ChooseServiceScreenProps> = ({
  navigation,
  route,
}) => {
  const params = route?.params;
  const storeId = params?.storeId;
  const currentListingId = params?.listingId;
  const [data, setData] = useState<StoreServiceCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    if (!storeId) {
      setError('Store is required to choose a service.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      try {
        const response = await bookingService.getStoreServiceListings(
          storeId,
          currentListingId,
        );
        const payload = unwrapApiPayload<StoreServiceCatalog>(response);
        setData({
          store: payload?.store ?? null,
          listings: Array.isArray(payload?.listings) ? payload.listings : [],
          highlightListingId: payload?.highlightListingId ?? currentListingId ?? null,
        });
        return;
      } catch (primaryErr: any) {
        console.warn(
          'service-listings failed, falling back to store listings:',
          primaryErr?.message,
        );
      }

      const [storeRes, listingsRes] = await Promise.all([
        storeService.getStoreById(storeId),
        storeService.getStoreListings(storeId, { status: 'Active', limit: 50 }),
      ]);
      const store = unwrapApiPayload<StoreServiceCatalog['store']>(storeRes);
      const allListings = unwrapApiPayload<any[]>(listingsRes) || [];
      const serviceListings = prioritizeListing(
        allListings.filter(isServiceListing),
        currentListingId,
      );

      setData({
        store: store ?? null,
        listings: serviceListings,
        highlightListingId: currentListingId ?? null,
      });
    } catch (err: any) {
      console.error('Error loading store service listings:', err);
      setError(err.message || 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  }, [currentListingId, storeId]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleClose = () => navigation?.goBack();

  const handleServicePress = (item: StoreServiceListing) => {
    const listingId = getListingId(item);
    if (!storeId || !listingId) return;

    navigation?.navigate('SelectBookingDateTime', {
      storeId,
      listingId,
      serviceTitle: item.title || 'Service',
      servicePrice:
        item.price != null && item.price !== '' && !Number.isNaN(Number(item.price))
          ? Number(item.price)
          : null,
      currency: item.currency ?? null,
      priceType: item.priceType ?? null,
      duration: item.duration ?? null,
      serviceImageUrl: getPrimaryPhoto(item),
      storeName: data?.store?.name ?? null,
      storeLogoUrl: data?.store?.logoUrl || data?.store?.logo || null,
    });
  };

  const providerRole =
    data?.store?.businessCategory ||
    data?.listings?.[0]?.specialization ||
    'Service Provider';
  const ratingLabel = formatRating(data?.store?.ratingAverage);

  const renderProviderCard = () => {
    const store = data?.store;
    const logo = store?.logoUrl || store?.logo;

    return (
      <View style={styles.providerCard}>
        {logo ? (
          <Image source={{ uri: logo }} style={styles.avatar} resizeMode="cover" />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{getInitials(store?.name)}</Text>
          </View>
        )}

        <View style={styles.providerCopy}>
          <Text style={styles.providerName} numberOfLines={1}>
            {store?.name || 'Service provider'}
          </Text>
          <Text style={styles.providerRole} numberOfLines={1}>
            {providerRole}
          </Text>
        </View>

        {ratingLabel ? (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{ratingLabel}</Text>
            <Text style={styles.ratingStar}>★</Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderService = ({
    item,
    index,
  }: {
    item: StoreServiceListing;
    index: number;
  }) => {
    const tile = SERVICE_ICON_TILES[index % SERVICE_ICON_TILES.length];
    const TileIcon = tile.Icon;
    const photoUrl = getPrimaryPhoto(item);

    return (
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() => handleServicePress(item)}
        activeOpacity={0.88}
      >
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.serviceImage} resizeMode="cover" />
        ) : (
          <View style={[styles.serviceIcon, { backgroundColor: tile.bg }]}>
            <TileIcon size={22} color={tile.color} />
          </View>
        )}

        <View style={styles.serviceCopy}>
          <Text style={styles.serviceTitle} numberOfLines={1}>
            {item.title || 'Service'}
          </Text>
          {item.description ? (
            <Text style={styles.serviceDescription} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
          {item.duration ? (
            <View style={styles.durationRow}>
              <DurationIcon size={13} color={C.meta} />
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.serviceRight}>
          <Text style={styles.priceText}>
            {formatListingPriceWithType(item.price, item.currency, item.priceType)}
          </Text>
          <ForwardIcon size={18} color="#C7C7CC" />
        </View>
      </TouchableOpacity>
    );
  };

  const listings = data?.listings ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleClose} activeOpacity={0.75}>
          <BackIcon size={18} color={C.title} />
        </TouchableOpacity>

        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Choose a Service</Text>
          <Text style={styles.headerSubtitle}>Select the service you'd like to book</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={C.ratingText} />
          <Text style={styles.stateText}>Loading services...</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.errorTitle}>
            {!storeId ? 'Unable to continue' : 'Could not load services'}
          </Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadServices} activeOpacity={0.85}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item, index) => getListingId(item) || `service-${index}`}
          renderItem={renderService}
          showsVerticalScrollIndicator={false}
          style={styles.listSurface}
          contentContainerStyle={styles.list}
          ListHeaderComponent={renderProviderCard()}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No services available</Text>
              <Text style={styles.emptyText}>
                This provider does not have any bookable services right now.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.screen,
  },
  listSurface: {
    flex: 1,
    backgroundColor: C.screen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 16,
    backgroundColor: C.white,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.iconBtn,
  },
  headerCopy: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: C.title,
    letterSpacing: -0.2,
    textAlign: 'left',
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: C.subtitle,
    textAlign: 'left',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8ED',
    overflow: 'hidden',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E8E8ED',
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4B942',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.white,
  },
  providerCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  providerName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: C.title,
  },
  providerRole: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: C.subtitle,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.ratingBorder,
    backgroundColor: C.ratingBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ratingText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    color: C.ratingText,
  },
  ratingStar: {
    fontSize: 11,
    lineHeight: 14,
    color: C.ratingText,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8ED',
    overflow: 'hidden',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8E8ED',
  },
  serviceCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
    minWidth: 0,
  },
  serviceTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: C.title,
  },
  serviceDescription: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: C.subtitle,
  },
  durationRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  durationText: {
    fontSize: 12,
    lineHeight: 16,
    color: C.meta,
  },
  serviceRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 18,
    paddingLeft: 4,
  },
  priceText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: C.primary,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  stateText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: C.subtitle,
  },
  errorTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    color: C.title,
  },
  retryBtn: {
    marginTop: Spacing.md,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: C.ratingText,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
  empty: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: 18,
    backgroundColor: C.white,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.title,
  },
  emptyText: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: C.subtitle,
  },
});
