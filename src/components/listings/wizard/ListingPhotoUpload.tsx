import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { AddPhotoIcon, DeleteIcon } from '../../common';
import { Colors, Spacing, Typography, BorderRadius } from '../../../config/theme';

export type ListingPhotoItem = {
  uri: string;
  id?: string;
};

type ListingPhotoUploadProps = {
  photos: ListingPhotoItem[];
  maxPhotos?: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
  uploading?: boolean;
  label?: string;
  required?: boolean;
  uploadTitle?: string;
  uploadHint?: string;
};

export const ListingPhotoUpload: React.FC<ListingPhotoUploadProps> = ({
  photos,
  maxPhotos = 6,
  onAdd,
  onRemove,
  uploading = false,
  label = 'Photos',
  required = true,
  uploadTitle,
  uploadHint,
}) => (
  <View>
    <Text style={styles.label}>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
    <TouchableOpacity
      style={styles.uploadArea}
      onPress={onAdd}
      disabled={uploading || photos.length >= maxPhotos}
      activeOpacity={0.8}
    >
      {uploading ? (
        <ActivityIndicator color={Colors.light.primary} />
      ) : (
        <>
          <AddPhotoIcon size={32} color={Colors.light.textMuted} />
          {uploadTitle ? (
            <Text style={styles.uploadTitleCustom}>{uploadTitle}</Text>
          ) : (
            <Text style={styles.uploadTitle}>
              <Text style={styles.uploadTitlePrimary}>Click to upload</Text>
              <Text style={styles.uploadTitleSecondary}> or drag and drop</Text>
            </Text>
          )}
          <Text style={styles.uploadHint}>
            {uploadHint || `Add up to ${maxPhotos} photos`}
          </Text>
        </>
      )}
    </TouchableOpacity>
    {photos.length > 0 ? (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
        {photos.map((photo, index) => (
          <View key={`${photo.uri}-${index}`} style={styles.thumbWrap}>
            <Image source={{ uri: photo.uri }} style={styles.thumb} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemove(index)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <DeleteIcon size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  label: {
    ...Typography.caption,
    color: Colors.light.textHeading,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.light.error,
  },
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.light.cardBorder,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  uploadTitle: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  uploadTitleCustom: {
    ...Typography.caption,
    color: Colors.light.marketplace.detailProductBadge,
    fontWeight: '600',
    fontSize: 13,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  uploadTitlePrimary: {
    ...Typography.caption,
    color: Colors.light.marketplace.detailProductBadge,
    fontWeight: '600',
    fontSize: 13,
  },
  uploadTitleSecondary: {
    ...Typography.caption,
    color: '#999999',
    fontWeight: '400',
    fontSize: 13,
  },
  uploadHint: {
    ...Typography.small,
    color: Colors.light.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  thumbRow: {
    marginTop: Spacing.sm,
  },
  thumbWrap: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
