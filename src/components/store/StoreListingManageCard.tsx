/**
 * Store Listing Manage Card with action buttons
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../config/theme';
import { formatListingPrice } from '../../utils/currency';

export interface StoreListingManageData {
  id: string;
  title: string;
  price?: number;
  currency?: string;
  status: string;
  photos?: Array<{ photoUrl: string }>;
  category?: { name: string };
}

interface Props {
  listing: StoreListingManageData;
  onEdit: () => void;
  onPauseResume: () => void;
  onView: () => void;
  onDelete: () => void;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  Active: { bg: '#D1FAE5', text: '#065F46' },
  Paused: { bg: '#FEF3C7', text: '#92400E' },
  Expired: { bg: '#FEE2E2', text: '#991B1B' },
  Pending: { bg: '#E0E7FF', text: '#3730A3' },
  Rejected: { bg: '#FEE2E2', text: '#991B1B' },
};

export const StoreListingManageCard: React.FC<Props> = ({
  listing,
  onEdit,
  onPauseResume,
  onView,
  onDelete,
}) => {
  const imageUrl = listing.photos?.[0]?.photoUrl;
  const colors = statusColors[listing.status] || statusColors.Pending;
  const isPaused = listing.status === 'Paused';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Text>📦</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
          <Text style={styles.meta}>
            {formatListingPrice(listing.price, listing.currency)}
            {listing.category?.name ? ` · ${listing.category.name}` : ''}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>{listing.status}</Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Text style={styles.actionText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onPauseResume}>
          <Text style={styles.actionText}>{isPaused ? '▶ Resume' : '⏸ Pause'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onView}>
          <Text style={styles.actionText}>👁 View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
          <Text style={[styles.actionText, styles.deleteText]}>🗑 Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  topRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  thumb: { width: 56, height: 56, borderRadius: BorderRadius.sm },
  thumbPlaceholder: { backgroundColor: Colors.light.surface, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: Spacing.sm },
  title: { ...Typography.body, fontWeight: '600', color: Colors.light.text },
  meta: { ...Typography.caption, color: Colors.light.textSecondary, marginTop: 2 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: Spacing.xs },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  actionText: { fontSize: 11, color: Colors.light.text },
  deleteBtn: { borderColor: '#FCA5A5' },
  deleteText: { color: '#DC2626' },
});
