/**
 * Store Bookings — Service / Event tabs for store owners
 */

import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon } from '../components/common';
import { storeService } from '../services';
import { unwrapApiPayload } from '../utils/apiHelpers';
import { formatListingPriceWithType } from '../utils/currency';

const C = {
  screen: '#F2F2F2',
  white: '#FFFFFF',
  title: '#131218',
  subtitle: '#696971',
  meta: '#8A8A93',
  iconBtn: '#F2F2F7',
  primary: '#1B4F72',
  chipBorder: '#E8E8ED',
  tabActive: '#1B4F72',
  tabInactive: '#8A8A93',
};

type BookingTab = 'service' | 'event';

type StoreBookingItem = {
  id: string;
  type: BookingTab;
  imageUrl?: string | null;
  serviceTitle?: string;
  eventTitle?: string;
  appointmentDate?: string | null;
  appointmentTime?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  ticketQuantity?: number;
  totalAmount?: number;
  currency?: string | null;
  priceType?: string | null;
  status?: string;
  location?: string | null;
  addonsSnapshot?: Array<{ id?: string; name?: string; price?: number; icon?: string | null }>;
  addonsTotal?: number;
  buyer?: { id: string; fullName: string; profileImageUrl?: string | null } | null;
  createdAt?: string;
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Date pending';
  const parts = String(value).split('-').map(Number);
  if (parts.length >= 3 && !parts.some((n) => Number.isNaN(n))) {
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const StoreBookingsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [tab, setTab] = useState<BookingTab>('service');
  const [bookings, setBookings] = useState<StoreBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async (nextTab: BookingTab) => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeService.getMyStoreBookings(nextTab);
      const payload = unwrapApiPayload<StoreBookingItem[]>(response);
      setBookings(Array.isArray(payload) ? payload : []);
    } catch (err: any) {
      console.error('Error loading store bookings:', err);
      setError(err.message || 'Failed to load bookings.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookings(tab);
    }, [loadBookings, tab]),
  );

  const onSelectTab = (next: BookingTab) => {
    if (next === tab) return;
    setTab(next);
  };

  const renderItem = ({ item }: { item: StoreBookingItem }) => {
    const title =
      tab === 'service'
        ? item.serviceTitle || 'Service booking'
        : item.eventTitle || 'Event booking';
    const when =
      tab === 'service'
        ? `${formatDate(item.appointmentDate)} · ${item.appointmentTime || 'Time pending'}`
        : `${formatDate(item.eventDate)} · ${item.eventTime || 'Time pending'}`;
    const total = formatListingPriceWithType(item.totalAmount, item.currency, null);
    const ticketLabel = `${item.ticketQuantity ?? 0} ticket${
      (item.ticketQuantity ?? 0) === 1 ? '' : 's'
    }`;

    if (tab === 'event') {
      return (
        <View style={styles.card}>
          <View style={styles.eventRow}>
            <View style={styles.eventLeft}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
              ) : (
                <View style={styles.thumbFallback}>
                  <Text style={styles.thumbEmoji}>🎫</Text>
                </View>
              )}
              <Text style={styles.eventLeftName}>{title}</Text>
              <Text style={styles.eventLeftMeta}>{ticketLabel}</Text>
            </View>

            <View style={styles.eventRight}>
              <View style={[styles.statusPill, styles.eventStatusTop]}>
                <Text style={styles.statusText}>{item.status || 'Confirmed'}</Text>
              </View>
              <Text style={styles.cardPrice}>{total}</Text>
              <Text style={styles.eventRightMeta}>{when}</Text>
              <Text style={styles.eventRightBuyer} numberOfLines={1}>
                {item.buyer?.fullName || 'Customer'}
              </Text>
            </View>
          </View>
          {item.location ? (
            <Text style={styles.eventAddress}>{item.location}</Text>
          ) : null}
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={styles.thumbFallback}>
              <Text style={styles.thumbEmoji}>✂</Text>
            </View>
          )}
          <View style={styles.cardBody}>
            <View style={styles.serviceTopRow}>
              <Text style={styles.serviceName}>{title}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{item.status || 'Confirmed'}</Text>
              </View>
            </View>
            <Text style={styles.cardMeta}>{when}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.buyerText} numberOfLines={1}>
                {item.buyer?.fullName || 'Customer'}
              </Text>
              <Text style={styles.cardPrice}>{total}</Text>
            </View>
          </View>
        </View>
        {Array.isArray(item.addonsSnapshot) && item.addonsSnapshot.length > 0 ? (
          <View style={styles.addonsBlock}>
            <Text style={styles.addonsHeading}>Add-ons</Text>
            {item.addonsSnapshot.map((addon, index) => (
              <View
                key={addon.id || `${item.id}-addon-${index}`}
                style={styles.addonRow}
              >
                <View style={styles.addonIconBubble}>
                  <Text style={styles.addonIconText}>{addon.icon || '✦'}</Text>
                </View>
                <Text style={styles.addonName} numberOfLines={1}>
                  {addon.name || 'Add-on'}
                </Text>
                <Text style={styles.addonPrice}>
                  {formatListingPriceWithType(addon.price, item.currency, null)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.75}
        >
          <BackIcon size={18} color={C.title} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Bookings</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'service' && styles.tabActive]}
          onPress={() => onSelectTab('service')}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabText, tab === 'service' && styles.tabTextActive]}>Service</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'event' && styles.tabActive]}
          onPress={() => onSelectTab('event')}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabText, tab === 'event' && styles.tabTextActive]}>Event</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.stateText}>Loading bookings...</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.errorTitle}>Could not load bookings</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadBookings(tab)} activeOpacity={0.85}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No {tab} bookings yet</Text>
              <Text style={styles.emptyText}>
                When customers book your {tab === 'service' ? 'services' : 'events'}, they will show
                up here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.screen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 14,
    backgroundColor: C.white,
    gap: 10,
  },
  headerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.iconBtn,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: C.title,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 4,
    borderRadius: 14,
    backgroundColor: C.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#EFF5F9',
  },
  tabText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: C.tabInactive,
  },
  tabTextActive: {
    color: C.tabActive,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventLeft: {
    width: 120,
    alignItems: 'flex-start',
  },
  eventLeftName: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    color: C.title,
    textAlign: 'left',
  },
  eventLeftMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    color: C.subtitle,
    textAlign: 'left',
  },
  eventAddress: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
    color: C.subtitle,
    textAlign: 'left',
  },
  eventRight: {
    flex: 1,
    marginLeft: 14,
    alignItems: 'flex-end',
    minWidth: 0,
  },
  eventRightMeta: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: C.subtitle,
    textAlign: 'right',
  },
  eventRightBuyer: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: C.title,
    textAlign: 'right',
  },
  eventStatusTop: {
    marginBottom: 8,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E8E8ED',
  },
  thumbFallback: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF3F6',
  },
  thumbEmoji: {
    fontSize: 20,
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
    alignItems: 'flex-start',
  },
  serviceName: {
    flex: 1,
    marginRight: 8,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: C.title,
    textAlign: 'left',
  },
  serviceTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: C.title,
    textAlign: 'left',
  },
  cardPrice: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: C.primary,
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: C.subtitle,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  cardFooter: {
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  buyerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: C.title,
    textAlign: 'left',
  },
  addonsBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.chipBorder,
  },
  addonsHeading: {
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: C.meta,
    textTransform: 'uppercase',
  },
  addonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 6,
  },
  addonIconBubble: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF3F6',
  },
  addonIconText: {
    fontSize: 14,
    lineHeight: 18,
  },
  addonName: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: C.title,
  },
  addonPrice: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: C.primary,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#E8F7EE',
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#15803D',
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stateText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: C.subtitle,
  },
  errorTitle: {
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '700',
    color: C.title,
  },
  retryBtn: {
    marginTop: 16,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: C.primary,
  },
  retryText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: C.white,
  },
  empty: {
    marginTop: 48,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
    color: C.title,
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: C.subtitle,
  },
});
