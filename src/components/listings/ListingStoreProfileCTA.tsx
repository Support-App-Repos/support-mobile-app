/**
 * Marketplace-aligned store row for listing detail screens (Figma product detail)
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
import { Colors, BorderRadius } from '../../config/theme';

const MP = Colors.light.marketplace;

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
  variant?: 'default' | 'marketplace';
}

export const ListingStoreProfileCTA: React.FC<ListingStoreProfileCTAProps> = ({
  store,
  onPress,
  style,
  variant = 'default',
}) => {
  if (!store?.id) {
    return null;
  }

  const storeName = store.name?.trim() || 'Store';
  const isMarketplace = variant === 'marketplace';

  return (
    <View style={[isMarketplace ? styles.marketplaceRow : styles.container, style]}>
      <View style={styles.left}>
        {store.logoUrl ? (
          <Image source={{ uri: store.logoUrl }} style={styles.logo} resizeMode="cover" />
        ) : (
          <View style={styles.logoFallback}>
            <StoreIcon size={16} color={MP.primary} />
          </View>
        )}
        <View style={styles.textWrap}>
          <Text style={isMarketplace ? styles.marketplaceLabel : styles.label}>Listed by</Text>
          <Text
            style={isMarketplace ? styles.marketplaceStoreName : styles.storeName}
            numberOfLines={1}
          >
            {storeName}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={isMarketplace ? styles.marketplaceButton : styles.button}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`View ${storeName} profile`}
      >
        <Text style={isMarketplace ? styles.marketplaceButtonText : styles.buttonText}>
          View Store
        </Text>
        <ForwardIcon size={12} color={MP.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(13, 71, 92, 0.18)',
    backgroundColor: 'rgba(13, 71, 92, 0.05)',
    marginBottom: 8,
  },
  marketplaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
  },
  logoFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F1F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginBottom: 1,
  },
  marketplaceLabel: {
    fontSize: 12,
    lineHeight: 18,
    color: MP.metaMuted,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  marketplaceStoreName: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: MP.titleText,
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
  marketplaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 10,
    borderWidth: 1.18,
    borderColor: MP.primary,
    backgroundColor: Colors.light.background,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  marketplaceButtonText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: MP.primary,
  },
});
