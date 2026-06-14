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
import { DeleteIcon } from '../common/DeleteIcon';
import { formatListingPrice } from '../../utils/currency';

export interface MyListingCardData {
  id: string;
  title: string;
  price?: number;
  currency?: string | null;
  viewsCount?: number;
  status: 'Active' | 'Pending' | 'Rejected' | 'Expired';
  createdAt: string;
  photos?: Array<{ photoUrl: string }>;
  category?: {
    id: string;
    name: string;
    slug: string;
    iconUrl?: string;
  };
}

interface MyListingCardProps {
  listing: MyListingCardData;
  onPress?: (listing: MyListingCardData) => void;
  onDelete?: () => void;
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
  onDelete,
}) => {
  const handlePress = () => {
    onPress?.(listing);
  };

  const primaryPhoto = listing.photos?.[0]?.photoUrl;
  const imageSource = primaryPhoto
    ? { uri: primaryPhoto }
    : { uri: 'https://via.placeholder.com/100' };

  const statusColors = getStatusColors(listing.status);
  const timeAgo = listing.createdAt
    ? formatTimeAgo(new Date(listing.createdAt))
    : '';

  const statusColumn = (
    <View style={styles.statusColumn}>
      <View
        style={[
          styles.badgeChip,
          { backgroundColor: statusColors.backgroundColor },
        ]}
      >
        <Text
          style={[styles.badgeText, { color: statusColors.textColor }]}
          numberOfLines={1}
        >
          {listing.status}
        </Text>
      </View>
      {onDelete ? (
        <TouchableOpacity
          style={[styles.badgeChip, styles.deleteAction]}
          onPress={onDelete}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <DeleteIcon size={10} color="#DC2626" />
          <Text style={[styles.badgeText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const bodyContent = (
    <>
      <View style={[styles.imageContainer, onDelete && styles.imageContainerWithDelete]}>
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={[styles.content, onDelete && styles.contentWithDelete]}>
        <View style={styles.mainSection}>
          <View style={styles.headerRow}>
            <Text
              style={[styles.title, onDelete && styles.titleWithActions]}
              numberOfLines={1}
            >
              {listing.title}
            </Text>
            {!onDelete ? statusColumn : null}
          </View>

          {listing.viewsCount !== undefined && listing.viewsCount !== null && (
            <Text style={styles.viewsText}>
              {listing.viewsCount} views
            </Text>
          )}

          {listing.price !== undefined && listing.price !== null && (
            <>
              <Text style={styles.price}>
                {formatListingPrice(listing.price, listing.currency)}
              </Text>
              <Text style={styles.totalPrice}>
                Total: {formatListingPrice(listing.price, listing.currency)}
              </Text>
            </>
          )}
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.timeText} numberOfLines={1}>
            {timeAgo}
          </Text>
        </View>
      </View>
    </>
  );

  if (onDelete) {
    return (
      <View style={[styles.card, styles.cardWithDelete]}>
        <TouchableOpacity
          style={styles.pressableBody}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          {bodyContent}
        </TouchableOpacity>
        <View style={styles.statusColumnOverlay}>{statusColumn}</View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {bodyContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  cardWithDelete: {
    minHeight: 128,
    height: undefined,
    position: 'relative',
  },
  pressableBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  statusColumnOverlay: {
    position: 'absolute',
    top: 6,
    right: 12,
  },
  imageContainer: {
    width: 97,
    height: 97,
    borderRadius: 0,
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
    overflow: 'hidden',
    marginRight: 8,
    marginLeft: 2,
    marginTop: 5.5,
    backgroundColor: '#F3F4F6',
  },
  imageContainerWithDelete: {
    height: 116,
    marginTop: 6,
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 5.5,
    paddingRight: 12,
    paddingBottom: 8,
    minHeight: 97,
  },
  contentWithDelete: {
    paddingTop: 6,
    minHeight: 116,
  },
  mainSection: {
    flexShrink: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
    flex: 0,
  },
  statusColumn: {
    width: 72,
    alignItems: 'stretch',
    flexShrink: 0,
    gap: 4,
  },
  badgeChip: {
    height: 22,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    paddingHorizontal: 6,
  },
  deleteAction: {
    flexDirection: 'row',
    gap: 2,
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    lineHeight: 11,
    textAlign: 'center',
    includeFontPadding: false,
  },
  deleteText: {
    color: '#DC2626',
    textTransform: 'none',
  },
  title: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 14,
    flex: 1,
    marginRight: Spacing.sm,
  },
  titleWithActions: {
    marginRight: 80,
  },
  viewsText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 10,
    marginTop: 0,
    marginBottom: 4,
    lineHeight: 11,
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
    marginBottom: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexShrink: 0,
  },
  timeText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontSize: 10,
  },
});

