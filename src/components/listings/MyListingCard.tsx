/**
 * My Listing Card — Figma listing row (node 1055:806)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import {
  RatingIcon,
  LocationIcon,
  VisibilityIcon,
  SaveIcon,
  DurationIcon,
} from '../common';
import { Colors, BorderRadius } from '../../config/theme';
import { formatListingPriceWithType } from '../../utils/currency';
import {
  getListingBadgeColor,
  getListingBadgeLabel,
  getListingStatusStyle,
} from './myListingUtils';

const MP = Colors.light.marketplace;
const IMAGE_SIZE = 84;

export interface MyListingCardData {
  id: string;
  title: string;
  price?: number;
  currency?: string | null;
  priceType?: string | null;
  viewsCount?: number;
  ratingAverage?: number;
  status: 'Active' | 'Pending' | 'Rejected' | 'Expired' | 'Paused';
  createdAt: string;
  location?: string;
  city?: string;
  propertyPurpose?: string;
  photos?: Array<{ photoUrl: string }>;
  category?: {
    id: string;
    name: string;
    slug: string;
    iconUrl?: string;
  };
  serviceType?: {
    name?: string;
    slug?: string;
  };
}

interface MyListingCardProps {
  listing: MyListingCardData;
  onPress?: (listing: MyListingCardData) => void;
  onLongPress?: (listing: MyListingCardData) => void;
  wishlisted?: boolean;
  onToggleWishlist?: (listingId: string) => void;
}

function formatShortTimeAgo(raw?: string): string {
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 604800)}w ago`;
  return `${Math.floor(diffSec / 2592000)}mo ago`;
}

export const MyListingCard: React.FC<MyListingCardProps> = ({
  listing,
  onPress,
  onLongPress,
  wishlisted = false,
  onToggleWishlist,
}) => {
  const primaryPhoto = listing.photos?.[0]?.photoUrl;
  const imageSource = primaryPhoto
    ? { uri: primaryPhoto }
    : { uri: 'https://via.placeholder.com/100' };

  const locationLine =
    [listing.location, listing.city].filter(Boolean).join(', ') || 'Location TBD';

  const ratingText =
    listing.ratingAverage != null && listing.ratingAverage > 0
      ? Number(listing.ratingAverage).toFixed(1)
      : null;

  const viewsText =
    listing.viewsCount != null && listing.viewsCount > 0
      ? String(listing.viewsCount)
      : null;

  const timeAgo = formatShortTimeAgo(listing.createdAt);
  const badgeLabel = getListingBadgeLabel(listing);
  const badgeColor = getListingBadgeColor(listing);
  const statusColors = getListingStatusStyle(listing.status);
  const heartColor = wishlisted ? '#EF4444' : MP.chipInactiveText;

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.pressable}
        onPress={() => onPress?.(listing)}
        onLongPress={() => onLongPress?.(listing)}
        delayLongPress={400}
      >
        <View style={styles.imageWrap}>
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {listing.title}
            </Text>
          </View>

          {listing.price != null || listing.priceType ? (
            <Text style={styles.price}>
              {formatListingPriceWithType(listing.price, listing.currency, listing.priceType)}
            </Text>
          ) : null}

          <View style={styles.locationRow}>
            <LocationIcon size={10} color={MP.metaMuted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationLine}
            </Text>
          </View>

          <View style={styles.metaRow}>
            {ratingText ? (
              <View style={styles.metaItem}>
                <RatingIcon size={10} color="#FFB904" />
                <Text style={styles.metaText}>{ratingText}</Text>
              </View>
            ) : null}
            {viewsText ? (
              <View style={styles.metaItem}>
                <VisibilityIcon size={10} color={MP.metaText} />
                <Text style={styles.metaText}>{viewsText}</Text>
              </View>
            ) : null}
            {timeAgo ? (
              <View style={styles.metaItem}>
                <DurationIcon size={10} color="#BBBBBB" />
                <Text style={styles.timeText}>{timeAgo}</Text>
              </View>
            ) : null}
            <View style={styles.statusSpacer} />
            <View style={[styles.statusPill, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.color }]}>
                {statusColors.label}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>

      <Pressable
        style={styles.actionCircle}
        onPress={() => onToggleWishlist?.(listing.id)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={wishlisted ? 'Remove from favourites' : 'Add to favourites'}
      >
        <SaveIcon size={14} color={heartColor} filled={wishlisted} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.xl,
    padding: 12,
    paddingRight: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  pressable: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  imageWrap: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    borderRadius: BorderRadius.round,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: Colors.light.textHeading,
  },
  actionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginTop: 0,
  },
  price: {
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: '700',
    color: MP.primary,
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16.5,
    fontWeight: '500',
    color: MP.metaMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
    color: MP.metaText,
  },
  timeText: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
    color: '#BBBBBB',
  },
  statusSpacer: {
    flex: 1,
    minWidth: 4,
  },
  statusPill: {
    borderRadius: BorderRadius.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
  },
});
