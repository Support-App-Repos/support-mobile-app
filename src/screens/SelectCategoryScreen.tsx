/**
 * Select Category Screen — create listing: pick Events, Products, Properties, or Services
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, ForwardIcon, Snackbar } from '../components/common';
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

type SelectCategoryScreenProps = {
  navigation?: any;
};

/** Fixed order; only first match per type (drops duplicate Services from API). */
const CATEGORY_ORDER: { key: string }[] = [
  { key: 'event' },
  { key: 'product' },
  { key: 'propert' },
  { key: 'service' },
];

function normalizeCategories(apiList: any[]): any[] {
  if (!Array.isArray(apiList) || apiList.length === 0) return [];
  const usedIds = new Set<string>();
  const out: any[] = [];
  for (const { key } of CATEGORY_ORDER) {
    const found = apiList.find((c) => {
      const s = `${c?.name || ''} ${c?.slug || ''}`.toLowerCase();
      return s.includes(key);
    });
    if (found?.id != null) {
      const id = String(found.id);
      if (!usedIds.has(id)) {
        usedIds.add(id);
        out.push(found);
      }
    }
  }
  return out;
}

function categorySubtitle(category: any): string {
  const s = `${category?.name || ''} ${category?.slug || ''}`.toLowerCase();
  if (s.includes('event')) return 'Parties, meetings, workshops';
  if (s.includes('product')) return 'Items, gadgets, merchandise';
  if (s.includes('propert')) return 'Rentals, sales, sublets';
  if (s.includes('service')) return 'Consulting, business, repairs';
  return category?.description?.trim() || 'Select to create listing';
}

function getCategoryIcon(categoryName: string) {
  const name = (categoryName || '').toLowerCase();
  if (name.includes('event')) {
    return <CategoryEventIcon />;
  }
  if (name.includes('product')) {
    return <CategoryProductIcon />;
  }
  if (name.includes('propert')) {
    return <PropertiesIcon />;
  }
  if (name.includes('service')) {
    return <CategoryServiceIcon />;
  }
  return <CategoryProductIcon />;
}

function chevronColorForCategory(categoryName: string): string {
  const name = (categoryName || '').toLowerCase();
  if (name.includes('event')) return '#3B75E1';
  if (name.includes('product')) return '#3EB177';
  if (name.includes('propert')) return '#B74DED';
  if (name.includes('service')) return '#E99132';
  return Colors.light.primary;
}

export const SelectCategoryScreen: React.FC<SelectCategoryScreenProps> = ({ navigation }) => {
  const [categoriesRaw, setCategoriesRaw] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { profileImageUrl } = useProfile();

  const categories = useMemo(() => normalizeCategories(categoriesRaw), [categoriesRaw]);

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
      navigation?.navigate('SelectServiceType', { categoryId: category.id, category: categoryName });
    } else if (n.includes('propert')) {
      navigation?.navigate('PropertyListing', { categoryId: category.id, category: categoryName });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
          <BackIcon size={24} color="#030303" />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.titleText}>Select Category</Text>
          <Text style={styles.subtitleText}>Choose what you want to list</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.7}
          onPress={() => navigation?.navigate('Profile')}
        >
          <Image
            source={{ uri: profileImageUrl || 'https://i.pravatar.cc/150?img=12' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Loading categories…</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No categories available</Text>
            <Text style={styles.emptySubtext}>Please check your connection or contact support</Text>
          </View>
        ) : (
          categories.map((category) => {
            const name = category.name || category.slug || '';
            return (
              <TouchableOpacity
                key={String(category.id)}
                style={styles.rowCard}
                onPress={() => goToListingFlow(category)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`${name}, ${categorySubtitle(category)}`}
              >
                <View style={styles.rowIconWrap}>{getCategoryIcon(name)}</View>
                <View style={styles.rowTextBlock}>
                  <Text style={styles.rowTitle}>{name}</Text>
                  <Text style={styles.rowSubtitle}>{categorySubtitle(category)}</Text>
                </View>
                <ForwardIcon size={22} color={chevronColorForCategory(name)} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'Home') navigation?.navigate('Home');
          else if (tab === 'MyListings') navigation?.navigate('MyListings');
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
    backgroundColor: Colors.light.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
    marginTop: 2,
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
  },
  titleText: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 20,
  },
  subtitleText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginTop: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8E8ED',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  rowIconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  rowSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
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
    textAlign: 'center',
  },
});
