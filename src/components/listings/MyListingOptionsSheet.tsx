/**
 * Long-press options sheet — Mark as Sold / Delete (Figma 1070:4792)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { ForwardIcon, CheckedIcon, DeleteIcon } from '../common';
import { Colors, BorderRadius } from '../../config/theme';
import { MyListingCardData } from './MyListingCard';
import { getListingBadgeColor, getListingBadgeLabel, getListingStatusStyle } from './myListingUtils';

type MyListingOptionsSheetProps = {
  visible: boolean;
  listing: MyListingCardData | null;
  onClose: () => void;
  onMarkAsSold: () => void;
  onDelete: () => void;
  markAsSoldDisabled?: boolean;
};

export const MyListingOptionsSheet: React.FC<MyListingOptionsSheetProps> = ({
  visible,
  listing,
  onClose,
  onMarkAsSold,
  onDelete,
  markAsSoldDisabled = false,
}) => {
  if (!listing) return null;

  const primaryPhoto = listing.photos?.[0]?.photoUrl;
  const imageSource = primaryPhoto
    ? { uri: primaryPhoto }
    : { uri: 'https://via.placeholder.com/100' };
  const badgeLabel = getListingBadgeLabel(listing);
  const badgeColor = getListingBadgeColor(listing);
  const statusStyle = getListingStatusStyle(listing.status);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={styles.previewRow}>
            <View style={styles.previewImageWrap}>
              <Image source={imageSource} style={styles.previewImage} resizeMode="cover" />
              <View style={[styles.previewBadge, { backgroundColor: badgeColor }]}>
                <Text style={styles.previewBadgeText}>{badgeLabel}</Text>
              </View>
            </View>
            <View style={styles.previewText}>
              <Text style={styles.previewTitle} numberOfLines={2}>
                {listing.title}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusPillText, { color: statusStyle.color }]}>
                  {statusStyle.label}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={onMarkAsSold}
            activeOpacity={0.7}
            disabled={markAsSoldDisabled}
          >
            <CheckedIcon size={20} color={markAsSoldDisabled ? '#D1D5DB' : '#1A1A2E'} />
            <Text style={[styles.actionText, markAsSoldDisabled && styles.actionTextDisabled]}>
              Mark as Sold
            </Text>
            <ForwardIcon size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteRow} onPress={onDelete} activeOpacity={0.7}>
            <DeleteIcon size={20} color="#EF4444" />
            <Text style={styles.deleteText}>Delete Listing</Text>
            <ForwardIcon size={16} color="#EF4444" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.cancelRow} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: 8,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  previewImageWrap: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    borderRadius: BorderRadius.round,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  previewBadgeText: {
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  previewText: {
    flex: 1,
    minWidth: 0,
  },
  previewTitle: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
    color: Colors.light.marketplace.titleText,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  statusPillText: {
    fontSize: 11,
    lineHeight: 16.5,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: Colors.light.marketplace.titleText,
  },
  actionTextDisabled: {
    color: '#D1D5DB',
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1.18,
    borderTopColor: '#FEE2E2',
  },
  deleteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: '#EF4444',
  },
  cancelRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  cancelText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: '#6B7280',
  },
});
