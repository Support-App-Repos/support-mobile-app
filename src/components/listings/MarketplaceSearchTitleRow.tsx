/**
 * Marketplace search: Service / Event row — pill background, title + optional meta (matches design spec).
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Spacing, Typography } from '../../config/theme';

const BG = 'rgba(17, 24, 39, 0.04)';
const TITLE = '#111827';
const META = '#797979';

type MarketplaceSearchTitleRowProps = {
  title: string;
  /** Second line (e.g. category · location) — #797979 in design */
  subtitle?: string;
  /** Shown top-right (e.g. currency formatted or "Free") */
  priceLabel?: string;
  onPress: () => void;
};

export const MarketplaceSearchTitleRow: React.FC<MarketplaceSearchTitleRowProps> = ({
  title,
  subtitle,
  priceLabel,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.72}
      accessibilityRole="button"
    >
      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {!!priceLabel && (
        <Text style={styles.price} numberOfLines={1}>
          {priceLabel}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: BG,
    borderRadius: 12,
    minHeight: 54,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 2,
  },
  title: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: TITLE,
    letterSpacing: -0.2,
  },
  subtitle: {
    ...Typography.small,
    fontSize: 13,
    fontWeight: '400',
    color: META,
    marginTop: 2,
  },
  price: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: TITLE,
    marginTop: 1,
    flexShrink: 0,
    maxWidth: '42%',
    textAlign: 'right',
  },
});
