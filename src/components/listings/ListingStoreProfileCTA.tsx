/**
 * Store profile CTA for public listing detail screens
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import { StoreIcon, ForwardIcon } from '../common';
import { Colors, Spacing, Typography, BorderRadius } from '../../config/theme';

export interface ListingStoreInfo {
  id: string;
  name?: string | null;
  logoUrl?: string | null;
  isVerified?: boolean;
}

interface ListingStoreProfileCTAProps {
  store?: ListingStoreInfo | null;
  onPress: () => void;
  style?: ViewStyle;
}

export const ListingStoreProfileCTA: React.FC<ListingStoreProfileCTAProps> = ({
  store,
  onPress,
  style,
}) => {
  if (!store?.id) {
    return null;
  }

  const storeName = store.name?.trim() || 'Store';

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`View ${storeName} profile`}
    >
      <View style={styles.left}>
        {store.logoUrl ? (
          <Image source={{ uri: store.logoUrl }} style={styles.logo} resizeMode="cover" />
        ) : (
          <View style={styles.logoFallback}>
            <StoreIcon size={16} color={Colors.light.primary} />
          </View>
        )}
        <View style={styles.textWrap}>
          <Text style={styles.label}>Listed by</Text>
          <Text style={styles.storeName} numberOfLines={1}>
            {storeName}
          </Text>
        </View>
      </View>
      <View style={styles.button}>
        <Text style={styles.buttonText}>View Store</Text>
        <ForwardIcon size={14} color={Colors.light.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(13, 71, 92, 0.18)',
    backgroundColor: 'rgba(13, 71, 92, 0.05)',
    marginBottom: Spacing.sm,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 0,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.surface,
  },
  logoFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F1F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginBottom: 1,
  },
  storeName: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.background,
  },
  buttonText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
