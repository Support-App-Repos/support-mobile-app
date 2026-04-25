/**
 * Marketplace search — filter strip; property/product use image cards; service/event use title rows.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BackIcon,
  SearchIcon,
  MarketplaceFilterIcon,
  ArrowDownIcon,
  VerifiedBadgeIcon,
} from '../components/common';
import {
  MarketplaceSearchResultCard,
  MarketplaceSearchTitleRow,
  type MarketplaceSearchListingVM,
} from '../components/listings';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { listingService } from '../services';

type MarketplaceSearchScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      initialQuery?: string;
    };
  };
};

type SortKey = 'recent' | 'price_asc' | 'price_desc' | 'rating';

type RawListing = Record<string, any>;

function badgeLabel(categoryName?: string): string {
  if (!categoryName) return 'Listing';
  const c = String(categoryName).toLowerCase();
  if (c.includes('propert')) return 'Property';
  if (c.includes('event')) return 'Event';
  if (c.includes('product')) return 'Product';
  if (c.includes('service')) return 'Service';
  return categoryName.length > 12 ? `${categoryName.slice(0, 11)}…` : categoryName;
}

function isPropertyCategory(listing: RawListing): boolean {
  const name = listing?.category?.name || '';
  return String(name).toLowerCase().includes('propert');
}

/** Service and event listings show as title-only rows in marketplace search. */
function isServiceOrEventCategory(listing: RawListing): boolean {
  const name = listing?.category?.name || '';
  const n = String(name).toLowerCase();
  return n.includes('service') || n.includes('event');
}

function navigateToListingDetail(navigation: any, item: RawListing, listingId: string) {
  if (isPropertyCategory(item)) {
    navigation?.navigate('PropertyListingDetail', { listingId });
    return;
  }
  const cat = String(item?.category?.name || '').toLowerCase();
  if (cat.includes('service')) {
    navigation?.navigate('ServiceListingDetail', { listingId });
  } else if (cat.includes('event')) {
    navigation?.navigate('EventListingDetail', { listingId });
  } else {
    navigation?.navigate('ListingDetail', { listingId });
  }
}

function formatSearchPriceLabel(listing: RawListing): string | undefined {
  const priceType = String(listing.priceType || '').toLowerCase();
  const raw = listing.price;
  if (priceType === 'free' || raw === 0 || raw === '0') {
    return 'Free';
  }
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''));
  if (raw == null || raw === '' || Number.isNaN(n)) {
    return undefined;
  }
  const cur = (listing.currency && String(listing.currency).length === 3
    ? String(listing.currency).toUpperCase()
    : 'USD') as string;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

function formatDistanceLocation(listing: RawListing): string | undefined {
  const city = listing.city || listing.regions?.[0]?.name || listing.region?.name;
  const loc = listing.location;
  if (city && loc) return `Nearby · ${loc}, ${city}`;
  if (city) return `Nearby · ${city}`;
  if (loc) return `Nearby · ${loc}`;
  return undefined;
}

function toPhotoUrls(listing: RawListing): string[] {
  const raw = listing.photos || [];
  const urls = raw
    .map((p: any) => (typeof p === 'string' ? p : p?.photoUrl || p?.url))
    .filter((u: any) => typeof u === 'string' && u.length > 0);
  return [...new Set(urls)];
}

function toSearchVM(listing: RawListing): MarketplaceSearchListingVM {
  const urls = toPhotoUrls(listing);
  return {
    id: String(listing.id),
    title: listing.title || 'Untitled',
    photoUrls: urls.length ? urls : ['https://via.placeholder.com/800x480'],
    categoryLabel: badgeLabel(listing.category?.name),
    ratingAverage:
      typeof listing.averageRating === 'number' ? listing.averageRating : undefined,
    reviewCount: listing._count?.reviews ?? listing.reviewsCount ?? 0,
    distanceLocationLine: formatDistanceLocation(listing),
    currency: listing.currency,
  };
}

const SORT_LABELS: Record<SortKey, string> = {
  recent: 'Recent',
  price_asc: 'Price: Low to high',
  price_desc: 'Price: High to low',
  rating: 'Top rated',
};

export const MarketplaceSearchScreen: React.FC<MarketplaceSearchScreenProps> = ({
  navigation,
  route,
}) => {
  const initialQuery = route?.params?.initialQuery ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [rawListings, setRawListings] = useState<RawListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [minPriceText, setMinPriceText] = useState('');
  const [maxPriceText, setMaxPriceText] = useState('');
  const [onlyVerified, setOnlyVerified] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listingService.getListings({
        status: 'Active',
        limit: 50,
      });
      const data = (response.data as any)?.data || response.data || [];
      setRawListings(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to load search results');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const minPrice = minPriceText.trim() === '' ? undefined : parseFloat(minPriceText.replace(/[^0-9.]/g, ''));
  const maxPrice = maxPriceText.trim() === '' ? undefined : parseFloat(maxPriceText.replace(/[^0-9.]/g, ''));

  const filteredSorted = useMemo(() => {
    let rows = [...rawListings];
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((l) => {
        const blob = `${l.title || ''} ${l.location || ''} ${l.city || ''} ${l.category?.name || ''}`.toLowerCase();
        return blob.includes(q);
      });
    }
    if (onlyVerified) {
      rows = rows.filter((l) => l.sellerVerified === true || l.verified === true || l.isVerified === true);
    }
    if (minPrice != null && !Number.isNaN(minPrice)) {
      rows = rows.filter((l) => (Number(l.price) || 0) >= minPrice);
    }
    if (maxPrice != null && !Number.isNaN(maxPrice)) {
      rows = rows.filter((l) => (Number(l.price) || 0) <= maxPrice);
    }
    if (sortKey === 'price_asc') {
      rows.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortKey === 'price_desc') {
      rows.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortKey === 'rating') {
      rows.sort((a, b) => (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0));
    } else {
      rows.sort((a, b) => {
        const da = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const db = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return db - da;
      });
    }
    return rows;
  }, [rawListings, query, onlyVerified, minPrice, maxPrice, sortKey]);

  const openAdvancedFilters = () => {
    Alert.alert('Filters', 'More filter options can connect here (categories, distance, etc.).');
  };

  const renderItem = ({ item }: { item: RawListing }) => {
    const vm = toSearchVM(item);

    if (isServiceOrEventCategory(item)) {
      const subtitleParts = [vm.categoryLabel, vm.distanceLocationLine].filter(Boolean);
      const subtitle = subtitleParts.length ? subtitleParts.join(' · ') : undefined;
      const priceLabel = formatSearchPriceLabel(item);
      return (
        <MarketplaceSearchTitleRow
          title={vm.title}
          subtitle={subtitle}
          priceLabel={priceLabel}
          onPress={() => navigateToListingDetail(navigation, item, vm.id)}
        />
      );
    }

    const property = isPropertyCategory(item);

    return (
      <MarketplaceSearchResultCard
        listing={vm}
        isPropertyLayout={property}
        onPress={() => navigateToListingDetail(navigation, item, vm.id)}
      />
    );
  };

  const filterHeader = (
    <View style={styles.filterSection}>
      <View style={styles.searchBar}>
        <SearchIcon size={18} color="#828282" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={Colors.light.textSecondary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsRow}
      >
        <TouchableOpacity style={styles.filterIconBtn} activeOpacity={0.85} onPress={openAdvancedFilters}>
          <MarketplaceFilterIcon size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip} activeOpacity={0.85} onPress={() => setSortModalOpen(true)}>
          <Text style={styles.chipText}>Sort</Text>
          <ArrowDownIcon size={14} color={Colors.light.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip} activeOpacity={0.85} onPress={() => setPriceModalOpen(true)}>
          <Text style={styles.chipText}>Price</Text>
          <ArrowDownIcon size={14} color={Colors.light.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, styles.chipWide, onlyVerified && styles.chipActive]}
          activeOpacity={0.85}
          onPress={() => setOnlyVerified((v) => !v)}
        >
          <VerifiedBadgeIcon
            size={18}
            color={onlyVerified ? Colors.light.primary : Colors.light.textSecondary}
          />
          <Text style={[styles.chipText, onlyVerified && styles.chipTextActive]}>Only Verified</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
          <BackIcon size={22} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Search</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSorted}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={filterHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.empty}>No results match your filters.</Text>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={sortModalOpen} transparent animationType="fade" onRequestClose={() => setSortModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortModalOpen(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Sort by</Text>
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.modalRow, sortKey === key && styles.modalRowActive]}
                onPress={() => {
                  setSortKey(key);
                  setSortModalOpen(false);
                }}
              >
                <Text style={[styles.modalRowText, sortKey === key && styles.modalRowTextActive]}>
                  {SORT_LABELS[key]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={priceModalOpen} transparent animationType="slide" onRequestClose={() => setPriceModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPriceModalOpen(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Price range</Text>
            <View style={styles.priceRow}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="decimal-pad"
                value={minPriceText}
                onChangeText={setMinPriceText}
              />
              <Text style={styles.priceDash}>—</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="decimal-pad"
                value={maxPriceText}
                onChangeText={setMaxPriceText}
              />
            </View>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setPriceModalOpen(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8ED',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  topTitle: { ...Typography.h3, fontSize: 18, color: Colors.light.text },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: Spacing.xxl },
  filterSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E8E8ED',
    paddingHorizontal: Spacing.md,
    minHeight: 52,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    paddingVertical: Spacing.sm,
  },
  filterChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  filterIconBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: BorderRadius.round,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8ED',
  },
  chipWide: { paddingRight: Spacing.md },
  chipActive: {
    borderColor: Colors.light.primary,
    backgroundColor: 'rgba(13, 71, 92, 0.06)',
  },
  chipText: { fontSize: 14, fontWeight: '500', color: Colors.light.text },
  chipTextActive: { color: Colors.light.primary, fontWeight: '600' },
  empty: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    padding: Spacing.xl,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h3,
    fontSize: 17,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalRow: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.md },
  modalRowActive: { backgroundColor: '#F3F4F6' },
  modalRowText: { fontSize: 16, color: Colors.light.text },
  modalRowTextActive: { fontWeight: '600', color: Colors.light.primary },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.light.text,
  },
  priceDash: { color: Colors.light.textSecondary, fontSize: 16 },
  applyBtn: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  applyBtnText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});
