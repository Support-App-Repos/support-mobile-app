/**
 * Full-width marketplace search result: hero carousel, meta row, optional service lines from API.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import { RatingIcon, SaveIcon } from '../common';
import { Colors, Spacing, Typography, BorderRadius } from '../../config/theme';

const { width: SCREEN_W } = Dimensions.get('window');

export type MarketplaceSearchServiceLine = {
  id: string;
  title: string;
  priceLabel: string;
  durationLabel: string;
};

export type MarketplaceSearchListingVM = {
  id: string;
  title: string;
  /** Hero images (deduped URLs) */
  photoUrls: string[];
  categoryLabel: string;
  ratingAverage?: number;
  reviewCount?: number;
  /** e.g. "Nearby · Poplar, London" */
  distanceLocationLine?: string;
  currency?: string;
};

type MarketplaceSearchResultCardProps = {
  listing: MarketplaceSearchListingVM;
  /** Property-style add-on rows; omit or empty to hide block */
  services?: MarketplaceSearchServiceLine[];
  totalServicesCount?: number;
  /** When true, use tall carousel + service list layout */
  isPropertyLayout: boolean;
  onPress: () => void;
  wishlisted?: boolean;
  onToggleWishlist?: (listingId: string, nextWishlisted: boolean) => void | Promise<void>;
  onSeeAllServices?: () => void;
};

export const MarketplaceSearchResultCard: React.FC<MarketplaceSearchResultCardProps> = ({
  listing,
  services = [],
  totalServicesCount,
  isPropertyLayout,
  onPress,
  wishlisted = false,
  onToggleWishlist,
  onSeeAllServices,
}) => {
  const heartColor = wishlisted ? '#EF4444' : '#6B7280';
  const cardWidth = SCREEN_W - Spacing.md * 2;
  const [heroIndex, setHeroIndex] = useState(0);
  const photos = listing.photoUrls.length > 0 ? listing.photoUrls : ['https://via.placeholder.com/800x480'];
  const heroH = isPropertyLayout ? 200 : 160;
  const reviews = listing.reviewCount ?? 0;
  const ratingText =
    listing.ratingAverage != null && !Number.isNaN(listing.ratingAverage)
      ? listing.ratingAverage.toFixed(1)
      : '—';

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / cardWidth);
    if (idx >= 0 && idx < photos.length) setHeroIndex(idx);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={[styles.heroWrap, { width: cardWidth, height: heroH }]}>
        <FlatList
          data={photos}
          keyExtractor={(uri, i) => `${uri}-${i}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ width: cardWidth }}
          onMomentumScrollEnd={onHeroScroll}
          onScrollEndDrag={onHeroScroll}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={{ width: cardWidth, height: heroH }} resizeMode="cover" />
          )}
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{listing.categoryLabel}</Text>
        </View>
        <TouchableOpacity
          style={styles.heartWrap}
          activeOpacity={0.85}
          onPress={(e: any) => {
            e?.stopPropagation?.();
            onToggleWishlist?.(listing.id, !wishlisted);
          }}
        >
          <View style={styles.heartCircle}>
            <SaveIcon size={20} color={heartColor} filled={wishlisted} />
          </View>
        </TouchableOpacity>
        {photos.length > 1 && (
          <View style={styles.dotsRow}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === heroIndex && styles.dotActive]} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {listing.title}
          </Text>
          <View style={styles.ratingPill}>
            <RatingIcon size={14} color="#FFB904" />
            <Text style={styles.ratingNum}>{ratingText}</Text>
            <Text style={styles.reviewCount}>({reviews})</Text>
          </View>
        </View>
        {!!listing.distanceLocationLine && (
          <Text style={styles.subline} numberOfLines={1}>
            {listing.distanceLocationLine}
          </Text>
        )}

        {isPropertyLayout && services.length > 0 && (
          <View style={styles.servicesBlock}>
            {services.slice(0, 3).map((s) => (
              <View key={s.id} style={styles.serviceCard}>
                <View style={styles.serviceTextCol}>
                  <Text style={styles.serviceTitle} numberOfLines={2}>
                    {s.title}
                  </Text>
                  <Text style={styles.serviceDuration}>{s.durationLabel}</Text>
                </View>
                <Text style={styles.servicePrice}>{s.priceLabel}</Text>
              </View>
            ))}
            {(totalServicesCount ?? services.length) > 3 && (
              <TouchableOpacity onPress={onSeeAllServices} activeOpacity={0.7} hitSlop={8}>
                <Text style={styles.seeAll}>
                  See all {(totalServicesCount ?? services.length)} services
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8E8ED',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  heroWrap: {
    position: 'relative',
    backgroundColor: Colors.light.surface,
  },
  badge: {
    position: 'absolute',
    left: Spacing.sm,
    bottom: Spacing.md + 10,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  heartWrap: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  heartCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  dotsRow: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    backgroundColor: '#FFF',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  body: {
    padding: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  ratingNum: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  reviewCount: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  subline: {
    ...Typography.small,
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  servicesBlock: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  serviceTextCol: {
    flex: 1,
    minWidth: 0,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  seeAll: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
