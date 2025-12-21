/**
 * My Listing Card Component
 * Displays a listing card for the My Listings screen
 * Shows image on left, details on right with status badge
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
import { Colors, Spacing, Typography, BorderRadius } from '../../config/theme';

export interface MyListingCardData {
  id: string;
  title: string;
  price?: number;
  viewsCount?: number;
  status: 'Active' | 'Pending' | 'Rejected' | 'Expired';
  createdAt: string;
  photos?: Array<{ photoUrl: string }>;
}

interface MyListingCardProps {
  listing: MyListingCardData;
  onPress?: (listing: MyListingCardData) => void;
}

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

// Get status badge colors (text and background)
const getStatusColors = (status: string): { textColor: string; backgroundColor: string } => {
  switch (status) {
    case 'Active':
      return {
        textColor: '#10B981', // Green
        backgroundColor: 'rgba(16, 185, 129, 0.1)', // Light green background
      };
    case 'Pending':
      return {
        textColor: '#F59E0B', // Amber
        backgroundColor: 'rgba(245, 158, 11, 0.1)', // Light amber background
      };
    case 'Rejected':
      return {
        textColor: '#EF4444', // Red
        backgroundColor: 'rgba(239, 68, 68, 0.1)', // Light red background
      };
    case 'Expired':
      return {
        textColor: '#EF4444', // Red
        backgroundColor: 'rgba(239, 68, 68, 0.1)', // Light red background
      };
    default:
      return {
        textColor: '#6B7280', // Gray
        backgroundColor: 'rgba(107, 114, 128, 0.1)', // Light gray background
      };
  }
};

export const MyListingCard: React.FC<MyListingCardProps> = ({
  listing,
  onPress,
}) => {
  const handlePress = () => {
    onPress?.(listing);
  };

  const primaryPhoto = listing.photos?.[0]?.photoUrl;
  const imageSource = primaryPhoto
    ? { uri: primaryPhoto }
    : { uri: 'https://via.placeholder.com/100' };

  const statusColors = getStatusColors(listing.status);
  const timeAgo = formatTimeAgo(new Date(listing.createdAt));

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Image on left - flush with left edge */}
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Content on right */}
      <View style={styles.content}>
        {/* Header: Title and Status badge aligned at top */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {listing.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusColors.textColor }]}>
              {listing.status}
            </Text>
          </View>
        </View>

        {/* Views count - directly below title */}
        {listing.viewsCount !== undefined && listing.viewsCount !== null && (
          <Text style={styles.viewsText}>
            {listing.viewsCount} views
          </Text>
        )}

        {/* Price - larger, primary color */}
        {listing.price !== undefined && listing.price !== null && (
          <>
            <Text style={styles.price}>
              ${listing.price.toFixed(0)}
            </Text>
            <Text style={styles.totalPrice}>
              Total: ${listing.price.toFixed(0)}
            </Text>
          </>
        )}

        {/* Footer: Time listed - right aligned at bottom */}
        <View style={styles.footerRow}>
          <Text style={styles.timeText}>{timeAgo}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    height: 110,
    overflow: 'hidden', // Ensure image doesn't overflow border radius
  },
  imageContainer: {
    width: 97,
    height: 97,
    borderRadius: 0, // No border radius on left side
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
    overflow: 'hidden',
    marginRight: 8,
    marginLeft: 2,
    marginTop: 5.5,
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 4, // Align with image top margin
    paddingRight: 12, // Padding from right edge
    paddingBottom: 8, // Bottom padding for time text spacing
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    flex: 0,
  },
  title: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    minWidth: 55,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 9,
    textTransform: 'uppercase',
    lineHeight: 12,
  },
  viewsText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 14,
  },
  price: {
    ...Typography.h2,
    color: Colors.light.primary,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
    lineHeight: 22,
  },
  totalPrice: {
    ...Typography.body,
    color: Colors.light.primary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 'auto',
  },
  timeText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontSize: 10,
    marginBottom: 8
  },
});

