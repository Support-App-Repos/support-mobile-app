/**
 * Listing Card Component
 * Displays a listing in card format with image, title, price, rating, and views
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
import { RatingIcon } from '../common';
import { Colors, Spacing, Typography, BorderRadius } from '../../config/theme';

export interface ListingCardData {
  id: string;
  title: string;
  price: string;
  priceUnit?: string;
  image: ImageSourcePropType | string;
  rating?: number;
  views?: number;
  timePosted?: string;
  category?: 'Property' | 'Events' | 'Product' | 'Services';
}

interface ListingCardProps {
  listing: ListingCardData;
  onPress?: (listing: ListingCardData) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onPress,
}) => {
  const handlePress = () => {
    onPress?.(listing);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {typeof listing.image === 'string' ? (
          <Image
            source={{ uri: listing.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={listing.image}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            $ {listing.price}
            {listing.priceUnit && `/${listing.priceUnit}`}
          </Text>
          {listing.timePosted && (
            <Text style={styles.timePosted}>{listing.timePosted}</Text>
          )}
        </View>
        <View style={styles.metaRow}>
          {listing.rating !== undefined && (
            <View style={styles.ratingContainer}>
              <RatingIcon size={12} color="#FFB904" />
              <Text style={styles.ratingText}>({listing.rating})</Text>
            </View>
          )}
          {listing.views !== undefined && (
            <Text style={styles.viewsText}>{listing.views} views</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 280, // Fixed height for consistent card sizing
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.light.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: Spacing.sm,
  },
  title: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    minHeight: 40,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  price: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
  },
  timePosted: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ratingText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  viewsText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
});

