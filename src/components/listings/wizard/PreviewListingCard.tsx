import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LocationIcon } from '../../common';
import { Colors, Spacing, Typography, BorderRadius } from '../../../config/theme';
import { formatListingPriceWithType } from '../../../utils/currency';

type PreviewListingCardProps = {
  title?: string;
  categoryLabel?: string;
  price?: number | string | null;
  currency?: string | null;
  priceType?: string | null;
  location?: string | null;
  imageUri?: string | null | Record<string, unknown>;
  storeName?: string | null;
  onViewStore?: () => void;
  onEdit?: () => void;
  showEdit?: boolean;
};

function resolvePreviewUri(imageUri: PreviewListingCardProps['imageUri']): string | null {
  if (!imageUri) return null;
  if (typeof imageUri === 'string' && imageUri.trim()) return imageUri.trim();
  if (typeof imageUri === 'object') {
    const candidate = imageUri.photoUrl ?? imageUri.url ?? imageUri.uri;
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return null;
}

export const PreviewListingCard: React.FC<PreviewListingCardProps> = ({
  title = 'Title',
  categoryLabel = 'Category',
  price,
  currency,
  priceType,
  location = 'Location',
  imageUri,
  storeName,
  onViewStore,
  onEdit,
  showEdit = false,
}) => {
  const resolvedUri = resolvePreviewUri(imageUri);

  return (
  <View style={styles.wrap}>
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.previewTitle}>Preview Listing</Text>
        <Text style={styles.previewSubtitle}>This is how your listing will appear</Text>
      </View>
      {showEdit && onEdit ? (
        <TouchableOpacity onPress={onEdit} activeOpacity={0.7}>
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
      ) : null}
    </View>
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {resolvedUri ? (
          <Image source={{ uri: resolvedUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{categoryLabel}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.price}>
          {price != null && price !== ''
            ? formatListingPriceWithType(Number(price), currency, priceType)
            : 'Price'}
        </Text>
        <View style={styles.locationRow}>
          <LocationIcon size={14} color={Colors.light.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        </View>
        {storeName ? (
          <View style={styles.storeRow}>
            <Text style={styles.listedBy}>Listed by</Text>
            <Text style={styles.storeName}>{storeName}</Text>
            {onViewStore ? (
              <TouchableOpacity onPress={onViewStore} activeOpacity={0.7}>
                <Text style={styles.viewStore}>View Store</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  previewTitle: {
    ...Typography.h3,
    color: Colors.light.textHeading,
    fontWeight: '700',
    fontSize: 16,
  },
  previewSubtitle: {
    ...Typography.caption,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  editLink: {
    ...Typography.caption,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    overflow: 'hidden',
    backgroundColor: Colors.light.background,
  },
  imageWrap: {
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  badge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
  },
  badgeText: {
    ...Typography.small,
    color: Colors.light.textHeading,
    fontWeight: '600',
  },
  body: {
    padding: Spacing.md,
  },
  title: {
    ...Typography.body,
    color: Colors.light.textHeading,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  price: {
    ...Typography.h3,
    color: Colors.light.textHeading,
    fontWeight: '700',
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  location: {
    ...Typography.caption,
    color: Colors.light.textMuted,
    flex: 1,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.light.cardBorder,
  },
  listedBy: {
    ...Typography.small,
    color: Colors.light.textMuted,
  },
  storeName: {
    ...Typography.caption,
    color: Colors.light.textHeading,
    fontWeight: '600',
  },
  viewStore: {
    ...Typography.caption,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
