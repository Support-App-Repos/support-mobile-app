/**
 * Select Category Screen
 * Screen for selecting a category when creating a new listing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, BellIcon, ForwardIcon } from '../components/common';
import {
  CategoryEventIcon,
  CategoryProductIcon,
  PropertiesIcon,
  CategoryServiceIcon,
} from '../components/common';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2; // Account for padding and gap

type SelectCategoryScreenProps = {
  navigation?: any;
};

export type CategoryType = 'Events' | 'Products' | 'Properties' | 'Services';

interface CategoryOption {
  id: CategoryType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const categories: CategoryOption[] = [
  {
    id: 'Events',
    title: 'Events',
    description: 'Parties, Meetings, Workshop',
    icon: <CategoryEventIcon size={24} color="#2563EB" backgroundColor="#E0ECFC" />,
  },
  {
    id: 'Products',
    title: 'Products',
    description: 'Items, gadgets, Merchandise',
    icon: <CategoryProductIcon size={24} color="#16A34A" backgroundColor="#F0FDF4" />,
  },
  {
    id: 'Properties',
    title: 'Properties',
    description: 'Rentals, sales, sublets',
    icon: <PropertiesIcon size={24} color="#9333EA" backgroundColor="#FAD8FF" />,
  },
  {
    id: 'Services',
    title: 'Services',
    description: 'Reviews, Consulting, business',
    icon: <CategoryServiceIcon size={24} color="#EA580C" backgroundColor="#FFCA95" />,
  },
];

export const SelectCategoryScreen: React.FC<SelectCategoryScreenProps> = ({
  navigation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategory(category);
  };

  const handleNext = () => {
    if (selectedCategory) {
      // Navigate to appropriate screen based on category
      if (selectedCategory === 'Products') {
        navigation?.navigate('ProductListing', { category: selectedCategory });
      } else if (selectedCategory === 'Events') {
        navigation?.navigate('SelectEventType', { category: selectedCategory });
      } else if (selectedCategory === 'Services') {
        navigation?.navigate('SelectServiceType', { category: selectedCategory });
      } else if (selectedCategory === 'Properties') {
        navigation?.navigate('PropertyListing', { category: selectedCategory });
      }
    }
  };

  const handleBack = () => {
    navigation?.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <BackIcon size={24} color="#030303" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: Navigate to notifications
              console.log('Notifications pressed');
            }}
          >
            <BellIcon size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: Navigate to profile
              console.log('Profile pressed');
            }}
          >
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>Select Category</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardSelected,
              ]}
              onPress={() => handleCategorySelect(category.id)}
              activeOpacity={0.8}
            >
              <View style={styles.categoryIcon}>{category.icon}</View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription}>
                {category.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedCategory && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedCategory}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.nextButtonText,
              !selectedCategory && styles.nextButtonTextDisabled,
            ]}
          >
            Next
          </Text>
          <ForwardIcon
            size={20}
            color={selectedCategory ? '#FFFFFF' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'Home') {
            navigation?.navigate('Home');
          }
          // TODO: Handle other tab navigations
        }}
        onCreatePress={() => {}}
        showCreateButton={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  titleText: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minHeight: 160,
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  categoryCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F0F9FF',
  },
  categoryIcon: {
    marginBottom: Spacing.sm,
  },
  categoryTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    fontSize: 16,
    textAlign: 'left',
  },
  categoryDescription: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    textAlign: 'left',
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.background,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 9999, // Pill shape
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  nextButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  nextButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

