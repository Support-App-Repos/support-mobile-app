/**
 * Select Category Screen
 * Screen for selecting a category when creating a new listing
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, BellIcon, ForwardIcon, Snackbar } from '../components/common';
import {
  CategoryEventIcon,
  CategoryProductIcon,
  PropertiesIcon,
  CategoryServiceIcon,
} from '../components/common';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { categoryService } from '../services';
import { useProfile } from '../hooks';

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

// Map category names to icons and colors
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('event')) {
    return <CategoryEventIcon size={24} color="#2563EB" backgroundColor="#E0ECFC" />;
  }
  if (name.includes('product')) {
    return <CategoryProductIcon size={24} color="#16A34A" backgroundColor="#F0FDF4" />;
  }
  if (name.includes('propert')) {
    return <PropertiesIcon size={24} color="#9333EA" backgroundColor="#FAD8FF" />;
  }
  if (name.includes('service')) {
    return <CategoryServiceIcon size={24} color="#EA580C" backgroundColor="#FFCA95" />;
  }
  return <CategoryProductIcon size={24} color="#16A34A" backgroundColor="#F0FDF4" />;
};

export const SelectCategoryScreen: React.FC<SelectCategoryScreenProps> = ({
  navigation,
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { profileImageUrl } = useProfile();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      
      // Debug: Log full response structure
      console.log('Full API Response:', JSON.stringify(response, null, 2));
      
      // The API service returns { data: { success: true, data: categories }, success: true }
      // So we need to extract the nested data
      const apiResponse = response.data as any;
      const categoriesData = apiResponse?.data || [];
      
      console.log('Extracted categoriesData:', categoriesData);
      console.log('Response success:', response.success);
      console.log('Is array?', Array.isArray(categoriesData));
      
      if (response.success && Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else {
        if (__DEV__) {
          console.warn('Categories data is not an array or response failed:', {
            success: response.success,
            categoriesData,
            apiResponse,
            fullResponse: response,
          });
        }
        setCategories([]);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', error.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category);
  };

  const handleNext = () => {
    if (selectedCategory) {
      const categoryName = selectedCategory.name || selectedCategory.slug || '';
      // Navigate to appropriate screen based on category
      if (categoryName.toLowerCase().includes('product')) {
        navigation?.navigate('ProductListing', { categoryId: selectedCategory.id, category: categoryName });
      } else if (categoryName.toLowerCase().includes('event')) {
        navigation?.navigate('SelectEventType', { categoryId: selectedCategory.id, category: categoryName });
      } else if (categoryName.toLowerCase().includes('service')) {
        navigation?.navigate('SelectServiceType', { categoryId: selectedCategory.id, category: categoryName });
      } else if (categoryName.toLowerCase().includes('propert')) {
        navigation?.navigate('PropertyListing', { categoryId: selectedCategory.id, category: categoryName });
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
              source={{ uri: profileImageUrl || 'https://i.pravatar.cc/150?img=12' }}
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No categories available</Text>
            <Text style={styles.emptySubtext}>Please check your connection or contact support</Text>
          </View>
        ) : (
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory?.id === category.id && styles.categoryCardSelected,
                ]}
                onPress={() => handleCategorySelect(category)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryIcon}>{getCategoryIcon(category.name)}</View>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <Text style={styles.categoryDescription}>
                  {category.description || 'Select to create listing'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
          } else if (tab === 'MyListings') {
            navigation?.navigate('MyListings');
          } else if (tab === 'Messages') {
            // Show coming soon snackbar
            setSnackbarVisible(true);
          } else if (tab === 'Profile') {
            navigation?.navigate('Profile');
          }
        }}
        onCreatePress={() => {}}
        showCreateButton={false}
      />

      {/* Snackbar for Messages */}
      <Snackbar
        visible={snackbarVisible}
        message="Coming soon feature"
        type="info"
        onDismiss={() => setSnackbarVisible(false)}
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
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
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

