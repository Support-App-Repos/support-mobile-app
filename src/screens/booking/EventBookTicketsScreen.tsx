/**
 * Book Event tickets — visual language aligned with Add Extra Services
 * Spec: docs/superpowers/specs/2026-09-09-event-booking-design.md
 */

import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon } from '../../components/common';
import { eventBookingService } from '../../services';
import type { RootStackParamList } from '../../types';
import { unwrapApiPayload } from '../../utils/apiHelpers';
import { formatListingPriceWithType } from '../../utils/currency';

const C = {
  screen: '#F2F2F2',
  white: '#FFFFFF',
  title: '#131218',
  subtitle: '#696971',
  meta: '#8A8A93',
  iconBtn: '#F2F2F7',
  primary: '#1B4F72',
  cta: '#27AE60',
  chipBorder: '#E8E8ED',
};

const MIN_QTY = 1;
const MAX_QTY = 5;

type EventBookTicketsScreenProps = {
  navigation?: any;
  route?: {
    params?: RootStackParamList['EventBookTickets'];
  };
};

const isAuthError = (error: any) => {
  const status = error?.response?.status;
  const message = String(error?.message || '').toLowerCase();
  return (
    status === 401 ||
    message.includes('auth') ||
    message.includes('login') ||
    message.includes('sign in') ||
    message.includes('session')
  );
};

const formatEventDate = (iso?: string | null) => {
  if (!iso) return 'Date pending';
  const parts = iso.split('-').map(Number);
  if (parts.length >= 3 && !parts.some((n) => Number.isNaN(n))) {
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  const parsed = new Date(iso);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return iso;
};

export const EventBookTicketsScreen: React.FC<EventBookTicketsScreenProps> = ({
  navigation,
  route,
}) => {
  const params = route?.params;
  const [quantity, setQuantity] = useState(MIN_QTY);
  const [submitting, setSubmitting] = useState(false);

  const unitPrice = params?.eventPrice != null && !Number.isNaN(Number(params.eventPrice))
    ? Number(params.eventPrice)
    : 0;
  const totalAmount = unitPrice * quantity;

  const unitPriceLabel = formatListingPriceWithType(
    params?.eventPrice,
    params?.currency,
    params?.priceType,
  );
  const totalPriceLabel = formatListingPriceWithType(totalAmount, params?.currency, null);

  const metaLine = useMemo(() => {
    const dateLabel = formatEventDate(params?.eventDate);
    const timeLabel = params?.eventTime || 'Time pending';
    return `${dateLabel} · ${timeLabel}`;
  }, [params?.eventDate, params?.eventTime]);

  const promptLogin = () => {
    Alert.alert('Login required', 'Please log in before confirming this booking.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Login', onPress: () => navigation?.navigate('Login') },
    ]);
  };

  const adjustQuantity = (delta: number) => {
    setQuantity((current) => Math.min(MAX_QTY, Math.max(MIN_QTY, current + delta)));
  };

  const confirmBooking = async () => {
    if (!params?.listingId || submitting) return;

    try {
      setSubmitting(true);
      const response = await eventBookingService.createBooking({
        listingId: params.listingId,
        ticketQuantity: quantity,
        storeId: params.storeId || undefined,
      });
      const booking = unwrapApiPayload<{ id?: string; _id?: string }>(response);
      const bookingId = booking?.id || booking?._id;
      if (!bookingId) {
        Alert.alert('Error', 'Booking was created but the confirmation ID is missing.');
        return;
      }
      navigation?.replace('EventBookingConfirmed', { bookingId });
    } catch (err: any) {
      console.error('Error creating event booking:', err);
      if (isAuthError(err)) {
        promptLogin();
        return;
      }
      Alert.alert('Error', err.message || 'Failed to confirm booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const missingParams = !params?.listingId;

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
        <Text style={styles.headerTitle}>Book Event</Text>
      </View>

      {missingParams ? (
        <View style={styles.state}>
          <Text style={styles.errorTitle}>Unable to continue</Text>
          <Text style={styles.stateText}>Event details are missing. Please go back and try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation?.goBack()} activeOpacity={0.85}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.summaryCard}>
              <Text style={styles.eyebrow}>YOUR EVENT</Text>
              <View style={styles.summaryRow}>
                {params?.eventImageUrl ? (
                  <Image
                    source={{ uri: params.eventImageUrl }}
                    style={styles.thumb}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.thumbFallback}>
                    <Text style={styles.thumbEmoji}>🎫</Text>
                  </View>
                )}
                <View style={styles.summaryCopy}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {params?.eventTitle || 'Event'}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {metaLine}
                  </Text>
                  {params?.location ? (
                    <Text style={styles.location} numberOfLines={1}>
                      {params.location}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.unitPrice}>{unitPriceLabel}</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tickets</Text>
              <Text style={styles.sectionSubtitle}>Choose how many tickets you need (max {MAX_QTY})</Text>
            </View>

            <View style={styles.qtyCard}>
              <Text style={styles.qtyLabel}>Number of tickets</Text>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity <= MIN_QTY && styles.qtyBtnDisabled]}
                  onPress={() => adjustQuantity(-1)}
                  disabled={quantity <= MIN_QTY}
                  activeOpacity={0.8}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity >= MAX_QTY && styles.qtyBtnDisabled]}
                  onPress={() => adjustQuantity(1)}
                  disabled={quantity >= MAX_QTY}
                  activeOpacity={0.8}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Total amount</Text>
                <Text style={styles.totalValue}>{totalPriceLabel}</Text>
              </View>
              <Text style={styles.ticketCount}>
                {quantity} ticket{quantity === 1 ? '' : 's'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, submitting && styles.confirmBtnDisabled]}
              onPress={confirmBooking}
              activeOpacity={0.86}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm Booking · {totalPriceLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
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
    textAlign: 'left',
  },
  content: {
    flex: 1,
    backgroundColor: C.screen,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  summaryCard: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 17,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
    overflow: 'hidden',
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: C.meta,
  },
  summaryRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8E8ED',
  },
  thumbFallback: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF3F6',
  },
  thumbEmoji: {
    fontSize: 22,
  },
  summaryCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
    minWidth: 0,
  },
  eventTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: C.title,
  },
  meta: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: C.subtitle,
  },
  location: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: C.meta,
  },
  unitPrice: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: C.primary,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    color: C.title,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: C.subtitle,
  },
  qtyCard: {
    marginHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 17,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: C.title,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
  },
  qtyBtnDisabled: {
    backgroundColor: '#A8B6C0',
  },
  qtyBtnText: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
    color: C.white,
  },
  qtyValue: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: C.title,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: C.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.chipBorder,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: C.subtitle,
  },
  totalValue: {
    marginTop: 2,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: C.primary,
  },
  ticketCount: {
    fontSize: 13,
    lineHeight: 18,
    color: C.subtitle,
  },
  confirmBtn: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.cta,
  },
  confirmBtnDisabled: {
    opacity: 0.72,
  },
  confirmBtnText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: C.white,
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
});
