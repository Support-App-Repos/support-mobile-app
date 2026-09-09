/**
 * Select Category Screen — Events, Products, Services, Property
 * Figma: node 1054:379
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ForwardIcon, Snackbar } from '../components/common';
import { ListingWizardHeader, ListingCategoryCard } from '../components/listings/wizard';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing } from '../config/theme';
import { categoryService } from '../services';
import { useProfile, useStore } from '../hooks';

const MP = Colors.light.marketplace;

type SelectCategoryScreenProps = {
  navigation?: any;
};

const CATEGORY_ORDER = ['event', 'product', 'service', 'propert'] as const;

type CategoryTheme = {
  emoji: string;
  iconBg: string;
  chevronBg: string;
  chevronColor: string;
  displayName: string;
  subtitle: string;
};

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  event: {
    emoji: '🎟️',
    iconBg: '#F5EEF8',
    chevronBg: '#F5EEF8',
    chevronColor: MP.eventBadge,
    displayName: 'Events',
    subtitle: 'Parties, concerts, meetups',
  },
  product: {
    emoji: '🛍️',
    iconBg: '#EBF5FB',
    chevronBg: '#EBF5FB',
    chevronColor: MP.primary,
    displayName: 'Products',
    subtitle: 'Electronics, clothing, furniture & more',
  },
  service: {
    emoji: '💼',
    iconBg: '#FFEDD5',
    chevronBg: '#FFEDD5',
    chevronColor: '#E99132',
    displayName: 'Services',
    subtitle: 'Consulting, beauty, repairs & more',
  },
  propert: {
    emoji: '🏠',
    iconBg: '#FEF5EC',
    chevronBg: '#FEF5EC',
    chevronColor: '#E99132',
    displayName: 'Property',
    subtitle: 'Rent, sale & commercial spaces',
  },
};

function normalizeCategories(apiList: any[]): any[] {
  if (!Array.isArray(apiList) || apiList.length === 0) return [];
  const out: any[] = [];

  for (const key of CATEGORY_ORDER) {
    const found = apiList.find((c) => {
      const s = `${c?.name || ''} ${c?.slug || ''}`.toLowerCase();
      return s.includes(key);
    });
    if (found?.id == null) continue;
    out.push({ ...found, optionKey: key });
  }

  return out;
}

const STORE_CATEGORY_TO_KEY: Record<string, string> = {
  product: 'product',
  service: 'service',
  property: 'propert',
  event: 'event',
};

function filterCategoriesForStore(categories: any[], businessCategory?: string | null): any[] {
  if (!businessCategory || businessCategory.trim().toLowerCase() === 'mixed') {
    return categories;
  }
  const key = STORE_CATEGORY_TO_KEY[businessCategory.trim().toLowerCase()];
  if (!key) return categories;
  return categories.filter((category) => {
    const label = `${category?.name || ''} ${category?.slug || ''}`.toLowerCase();
    return label.includes(key);
  });
}

function categoryKey(category: any): string {
  const s = `${category?.name || ''} ${category?.slug || ''}`.toLowerCase();
  if (s.includes('event')) return 'event';
  if (s.includes('product')) return 'product';
  if (s.includes('propert')) return 'propert';
  if (s.includes('service')) return 'service';
  return 'product';
}

function categoryTheme(category: any): CategoryTheme {
  const key = categoryKey(category);
  return CATEGORY_THEMES[key] ?? CATEGORY_THEMES.product;
}

export const SelectCategoryScreen: React.FC<SelectCategoryScreenProps> = ({ navigation }) => {
  const [categoriesRaw, setCategoriesRaw] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { profileImageUrl } = useProfile();
  const { store } = useStore();

  const categories = useMemo(() => {
    const normalized = normalizeCategories(categoriesRaw);
    return filterCategoriesForStore(normalized, store?.businessCategory);
  }, [categoriesRaw, store?.businessCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      const apiResponse = response.data as any;
      const categoriesData = apiResponse?.data || [];
      if (response.success && Array.isArray(categoriesData)) {
        setCategoriesRaw(categoriesData);
      } else {
        setCategoriesRaw([]);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', error.message || 'Failed to load categories');
      setCategoriesRaw([]);
    } finally {
      setLoading(false);
    }
  };

  const goToListingFlow = (category: any) => {
    const categoryName = category.name || category.slug || '';
    const n = categoryName.toLowerCase();
    if (n.includes('product')) {
      navigation?.navigate('ProductListing', { categoryId: category.id, category: categoryName });
    } else if (n.includes('event')) {
      navigation?.navigate('SelectEventType', { categoryId: category.id, category: categoryName });
    } else if (n.includes('service')) {
      navigation?.navigate('SelectServiceType', {
        categoryId: category.id,
        category: categoryName,
      });
    } else if (n.includes('propert')) {
      navigation?.navigate('PropertyListing', { categoryId: category.id, category: categoryName });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBand}>
        <ListingWizardHeader
          title="Select Category"
          subtitle="Choose what you want to list"
          profileImageUrl={profileImageUrl}
          onBack={() => navigation?.goBack()}
          onProfilePress={() => navigation?.navigate('Profile')}
          showBell={false}
          usePillControls
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={MP.primary} />
            <Text style={styles.loadingText}>Loading categories…</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No categories available</Text>
            <Text style={styles.emptySubtext}>
              {store?.businessCategory && store.businessCategory.toLowerCase() !== 'mixed'
                ? `Your store is set to ${store.businessCategory}. No matching listing category was found.`
                : 'Please check your connection or contact support'}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.cardList}>
              {categories.map((category) => {
                const theme = categoryTheme(category);
                return (
                  <ListingCategoryCard
                    key={category.optionKey ?? String(category.id)}
                    title={theme.displayName}
                    subtitle={theme.subtitle}
                    emoji={theme.emoji}
                    iconBackgroundColor={theme.iconBg}
                    chevronBackgroundColor={theme.chevronBg}
                    chevronColor={theme.chevronColor}
                    onPress={() => goToListingFlow(category)}
                  />
                );
              })}
            </View>

            <View style={styles.hintBox}>
              <Text style={styles.hintEmoji}>💡</Text>
              <View style={styles.hintTextBlock}>
                <Text style={styles.hintTitle}>Not sure?</Text>
                <Text style={styles.hintSubtitle}>You can change this later anytime.</Text>
              </View>
              <ForwardIcon size={14} color={MP.primary} />
            </View>
          </>
        )}
      </ScrollView>

      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'Home') navigation?.navigate('Home');
          else if (tab === 'Store') navigation?.navigate('Store');
          else if (tab === 'Messages') setSnackbarVisible(true);
          else if (tab === 'Profile') navigation?.navigate('Profile');
        }}
        onCreatePress={() => {}}
        showCreateButton
      />

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
    backgroundColor: MP.screenSurface,
  },
  headerBand: {
    backgroundColor: Colors.light.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
    paddingBottom: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  cardList: {
    gap: 12,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: MP.chipInactiveText,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textHeading,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#EBF5FB',
  },
  hintEmoji: {
    fontSize: 16,
    lineHeight: 24,
  },
  hintTextBlock: {
    flex: 1,
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    color: MP.primary,
  },
  hintSubtitle: {
    fontSize: 11,
    lineHeight: 16.5,
    color: '#5A8FAA',
    marginTop: 1,
  },
});
