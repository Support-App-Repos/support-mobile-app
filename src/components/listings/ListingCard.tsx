/**
 * Listing Card Component
 * Marketplace grid card: image overlays, location, price, stats row
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import {
  RatingIcon,
  LocationIcon,
  VisibilityIcon,
  SaveIcon,
  DurationIcon,
} from '../common';
import { Colors, Spacing, Typography, BorderRadius } from '../../config/theme';
import { formatListingPrice } from '../../utils/currency';

export interface ListingCardData {
  id: string;
  title: string;
  price: string;
  priceUnit?: string;
  image: ImageSourcePropType | string;
  /** Average rating 0–5 when API provides it */
  ratingAverage?: number;
  /** Number of reviews (fallback display) */
  reviewCount?: number;
  /** @deprecated use reviewCount; kept for compatibility */
  rating?: number;
  views?: number;
  timePosted?: string;
  category?: 'Property' | 'Events' | 'Product' | 'Services' | string;
  location?: string;
  /** ISO code e.g. USD, AED — drives symbol vs code in price line */
  currency?: string;
}

function badgeLabel(category?: string): string {
  if (!category || category === 'Unknown') return 'Listing';
  const c = String(category).toLowerCase();
  if (c.includes('propert')) return 'Property';
  if (c.includes('event')) return 'Event';
  if (c.includes('product')) return 'Product';
  if (c.includes('service')) return 'Service';
  return category.length > 12 ? `${category.slice(0, 11)}…` : category;
}

function formatShortTimePosted(raw?: string): string {
  if (!raw) return '';
  if (/^just now$/i.test(raw.trim())) return 'now';
  return raw
    .replace(/(\d+)\s+minutes?\s+ago/gi, '$1m ago')
    .replace(/(\d+)\s+hours?\s+ago/gi, '$1h ago')
    .replace(/(\d+)\s+days?\s+ago/gi, '$1d ago')
    .replace(/(\d+)\s+weeks?\s+ago/gi, '$1w ago')
    .replace(/(\d+)\s+months?\s+ago/gi, '$1mo ago');
}

interface ListingCardProps {
  listing: ListingCardData;
  onPress?: (listing: ListingCardData) => void;
  navigation?: any;
  wishlisted?: boolean;
  onToggleWishlist?: (listingId: string, nextWishlisted: boolean) => void | Promise<void>;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onPress,
  navigation,
  wishlisted = false,
  onToggleWishlist,
}) => {
  const heartColor = wishlisted ? '#EF4444' : '#6B7280';
  const handlePress = () => {
    if (navigation) {
      const categoryName = listing.category || '';
      const categoryLower = categoryName.toLowerCase();

      const isEvent = categoryLower.includes('event') || categoryName === 'Events';
      const isProperty =
        categoryLower.includes('propert') ||
        categoryName === 'Properties' ||
        categoryName === 'Property';
      const isService = categoryLower.includes('service') || categoryName === 'Services';

      if (isEvent) {
        navigation.navigate('EventListingDetail', { listingId: listing.id });
        return;
      }
      if (isProperty) {
        navigation.navigate('PropertyListingDetail', { listingId: listing.id });
        return;
      }
      if (isService) {
        navigation.navigate('ServiceListingDetail', { listingId: listing.id });
        return;
      }
      navigation.navigate('ListingDetail', { listingId: listing.id });
      return;
    }
    onPress?.(listing);
  };

  const reviews = listing.reviewCount ?? listing.rating;
  const ratingText =
    listing.ratingAverage != null && !Number.isNaN(listing.ratingAverage)
      ? listing.ratingAverage.toFixed(1)
      : reviews != null && reviews > 0
        ? String(reviews)
        : '—';

  const priceSuffix = listing.priceUnit ? `/${listing.priceUnit}` : '';
  const locationText = listing.location?.trim() || 'Location TBD';

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        {typeof listing.image === 'string' ? (
          <Image
            source={{ uri: listing.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Image source={listing.image} style={styles.image} resizeMode="cover" />
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{badgeLabel(listing.category)}</Text>
        </View>
        <TouchableOpacity
          style={styles.heartBtn}
          activeOpacity={0.85}
          onPress={(e: any) => {
            e?.stopPropagation?.();
            onToggleWishlist?.(listing.id, !wishlisted);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={styles.heartCircle}>
            <SaveIcon size={18} color={heartColor} filled={wishlisted} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.locationRow}>
          <LocationIcon size={12} color={Colors.light.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationText}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={styles.price}>
          {formatListingPrice(
            listing.price != null && listing.price !== ''
              ? Number(listing.price)
              : 0,
            listing.currency,
          )}
          {priceSuffix}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <RatingIcon size={12} color="#FFB904" />
            <Text style={styles.metaText}>{ratingText}</Text>
          </View>
          <View style={styles.metaItem}>
            <VisibilityIcon size={14} color={Colors.light.textSecondary} />
            <Text style={styles.metaText}>
              {listing.views != null ? String(listing.views) : '—'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <DurationIcon size={14} color={Colors.light.textSecondary} />
            <Text style={styles.metaText}>{formatShortTimePosted(listing.timePosted)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8ED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 148,
    backgroundColor: Colors.light.surface,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    left: Spacing.sm,
    bottom: Spacing.sm,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
  },
  categoryBadgeText: {
    ...Typography.small,
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heartBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  heartCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    ...Typography.small,
    flex: 1,
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  title: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 6,
    minHeight: 40,
  },
  price: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    ...Typography.small,
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
});
