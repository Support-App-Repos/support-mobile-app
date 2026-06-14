/**
 * Store Listings All Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon } from '../components/common';
import { ListingCard, type ListingCardData } from '../components/listings';
import { Colors, Spacing, Typography } from '../config/theme';
import { storeService } from '../services';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2;

export const StoreListingsAllScreen: React.FC<{ navigation?: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const { storeId, storeName } = route?.params || {};
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;
    storeService.getStoreListings(storeId, { limit: 50 }).then((res) => {
      const data = (res.data as any)?.data || res.data || [];
      if (res.success) setListings(data);
      setLoading(false);
    });
  }, [storeId]);

  const toCard = (listing: any): ListingCardData => ({
    id: listing.id,
    title: listing.title,
    price: listing.price ? String(listing.price) : '0',
    image: listing.photos?.[0]?.photoUrl || 'https://via.placeholder.com/200',
    ratingAverage: listing.ratingAverage,
    category: listing.category?.name,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <BackIcon size={24} color="#030303" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{storeName || 'Listings'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={listings}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH }}>
              <ListingCard
                listing={toCard(item)}
                onPress={() => navigation?.navigate('ListingDetail', { listingId: item.id })}
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No listings found</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  headerTitle: { ...Typography.h3 },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  row: { gap: Spacing.md, marginBottom: Spacing.md },
  empty: { textAlign: 'center', color: Colors.light.textSecondary, marginTop: 40 },
});
