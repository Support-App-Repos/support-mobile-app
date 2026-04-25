/**
 * Category Tabs Component
 * Horizontal scrollable chips for listing categories
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CategoryTabSvgIcon } from './CategoryTabSvgIcon';
import { Colors, Spacing, Typography, BorderRadius } from '../../config/theme';

export type Category = 'All' | 'Property' | 'Events' | 'Product' | 'Services';

const CATEGORY_LABEL: Record<Category, string> = {
  All: 'All',
  Property: 'Property',
  Events: 'Events',
  Product: 'Products',
  Services: 'Services',
};

const categories: {
  name: Category;
  iconVariant?: 'property' | 'product' | 'services' | 'event';
}[] = [
  { name: 'All' },
  { name: 'Property', iconVariant: 'property' },
  { name: 'Product', iconVariant: 'product' },
  { name: 'Services', iconVariant: 'services' },
  { name: 'Events', iconVariant: 'event' },
];

interface CategoryTabsProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const INACTIVE_ICON = '#828282';
const ACTIVE_ON_PRIMARY = '#FFFFFF';

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const active = selectedCategory === category.name;
        const iconColor = active ? ACTIVE_ON_PRIMARY : INACTIVE_ICON;

        return (
          <TouchableOpacity
            key={category.name}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onCategoryChange(category.name)}
            activeOpacity={0.75}
          >
            <View style={styles.chipInner}>
              {category.iconVariant && (
                <View style={styles.iconWrap}>
                  <CategoryTabSvgIcon
                    variant={category.iconVariant}
                    size={14}
                    color={iconColor}
                  />
                </View>
              )}
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {CATEGORY_LABEL[category.name]}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    ...Typography.caption,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  chipTextActive: {
    color: ACTIVE_ON_PRIMARY,
    fontWeight: '600',
  },
});
