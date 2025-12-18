/**
 * Category Tabs Component
 * Horizontal scrollable tabs for listing categories
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { PropertyIcon, EventIcon, ProductIcon, ServicesIcon } from '../common';
import { Colors, Spacing, Typography } from '../../config/theme';

export type Category = 'All' | 'Property' | 'Events' | 'Product' | 'Services';

interface CategoryTabsProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const categories: { name: Category; icon?: React.ReactNode }[] = [
  { name: 'All' },
  { name: 'Property', icon: <PropertyIcon size={14} color="#828282" /> },
  { name: 'Events', icon: <EventIcon size={14} color="#828282" /> },
  { name: 'Product', icon: <ProductIcon size={14} color="#828282" /> },
  { name: 'Services', icon: <ServicesIcon size={14} color="#828282" /> },
];

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
      {categories.map((category) => (
        <TouchableOpacity
          key={category.name}
          style={[
            styles.tab,
            selectedCategory === category.name && styles.tabActive,
          ]}
          onPress={() => onCategoryChange(category.name)}
          activeOpacity={0.7}
        >
          <View style={styles.tabContent}>
            {category.icon && (
              <View style={styles.iconContainer}>{category.icon}</View>
            )}
            <Text
              style={[
                styles.tabText,
                selectedCategory === category.name && styles.tabTextActive,
              ]}
            >
              {category.name}
            </Text>
          </View>
          {selectedCategory === category.name && (
            <View style={styles.underline} />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 12, // 12px gap between items
  },
  tab: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 0,
    marginRight: 0,
    height: 23, // Fixed height: 23px
    justifyContent: 'center',
    opacity: 1, // Fully opaque
  },
  tabActive: {
    // Active state styling
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    height: 23, // Match parent height
  },
  iconContainer: {
    marginRight: Spacing.xs,
  },
  tabText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 23, // Match height
  },
  tabTextActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.light.primary,
    borderRadius: 1,
  },
});

