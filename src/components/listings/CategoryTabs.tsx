/**
 * Category Tabs Component
 * Horizontal scrollable chips for listing categories
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, BorderRadius } from '../../config/theme';

export type Category = 'All' | 'Property' | 'Events' | 'Product' | 'Services';

const MP = Colors.light.marketplace;

const CATEGORY_LABEL: Record<Category, string> = {
  All: 'All',
  Property: 'Property',
  Events: 'Events',
  Product: 'Products',
  Services: 'Services',
};

const categories: Category[] = [
  'All',
  'Events',
  'Product',
  'Services',
  'Property',
];

interface CategoryTabsProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

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
        const active = selectedCategory === category;

        return (
          <TouchableOpacity
            key={category}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onCategoryChange(category)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {CATEGORY_LABEL[category]}
            </Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.light.background,
    borderWidth: 1.18,
    borderColor: MP.searchBorder,
    minHeight: 32,
  },
  chipActive: {
    backgroundColor: MP.primary,
    borderColor: MP.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    color: MP.chipInactiveText,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
