/**
 * Event booking confirmed — separate from service BookingConfirmedScreen
 * Spec: docs/superpowers/specs/2026-09-09-event-booking-design.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SuccessIcon } from '../../components/common';
import { eventBookingService } from '../../services';
import type { EventBooking } from '../../services/eventBookingService';
import type { RootStackParamList } from '../../types';
import { unwrapApiPayload } from '../../utils/apiHelpers';
import { formatListingPriceWithType } from '../../utils/currency';

const C = {
  screen: '#F2F2F2',
  white: '#FFFFFF',
  title: '#131218',
  subtitle: '#696971',
  primary: '#1B4F72',
  cta: '#27AE60',
  chipBorder: '#E8E8ED',
};

type EventBookingConfirmedScreenProps = {
  navigation?: any;
  route?: {
    params?: RootStackParamList['EventBookingConfirmed'];
  };
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Date pending';
  const parts = value.split('-').map(Number);
  if (parts.length >= 3 && !parts.some((n) => Number.isNaN(n))) {
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const EventBookingConfirmedScreen: React.FC<EventBookingConfirmedScreenProps> = ({
  navigation,
  route,
}) => {
  const bookingId = route?.params?.bookingId;
  const [booking, setBooking] = useState<EventBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBooking = useCallback(async () => {
    if (!bookingId) {
      setError('Booking ID is missing.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await eventBookingService.getBooking(bookingId);
      const payload = unwrapApiPayload<EventBooking>(response);
      setBooking(payload);
    } catch (err: any) {
      console.error('Error loading event booking confirmation:', err);
      setError(err.message || 'Failed to load booking confirmation.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const handleDone = () => {
    navigation?.navigate('Home');
  };

  const totalPrice = formatListingPriceWithType(booking?.totalAmount, booking?.currency, null);
  const unitPrice = formatListingPriceWithType(
    booking?.eventPrice,
    booking?.currency,
    booking?.priceType,
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.stateText}>Loading booking...</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.errorTitle}>
            {!bookingId ? 'Unable to continue' : 'Could not load booking'}
          </Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadBooking} activeOpacity={0.85}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneLink} onPress={handleDone} activeOpacity={0.85}>
            <Text style={styles.doneLinkText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroCard}>
              <SuccessIcon size={78} />
              <Text style={styles.heroTitle}>Booking Confirmed</Text>
              <Text style={styles.heroText}>
                Your event tickets have been booked. We saved the event details for this
                reservation.
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Event</Text>
                <Text style={styles.summaryValue}>{booking?.eventTitle || 'Event'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>{formatDate(booking?.eventDate)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>{booking?.eventTime || 'Time pending'}</Text>
              </View>
              {booking?.location ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Location</Text>
                  <Text style={styles.summaryValue}>{booking.location}</Text>
                </View>
              ) : null}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tickets</Text>
                <Text style={styles.summaryValue}>{booking?.ticketQuantity ?? 0}</Text>
              </View>
            </View>

            <View style={styles.totalCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Price each</Text>
                <Text style={styles.totalValue}>{unitPrice}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>{totalPrice}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.86}>
              <Text style={styles.doneBtnText}>Done</Text>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 28,
    gap: 16,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
  },
  heroTitle: {
    marginTop: 12,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: C.title,
    textAlign: 'center',
  },
  heroText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: C.subtitle,
    textAlign: 'center',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: C.title,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: C.subtitle,
  },
  summaryValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: C.title,
  },
  totalCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  totalLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: C.subtitle,
  },
  totalValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: C.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
    backgroundColor: C.chipBorder,
  },
  grandTotalLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: C.title,
  },
  grandTotalValue: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '900',
    color: C.primary,
  },
  footer: {
    padding: 16,
    backgroundColor: C.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.chipBorder,
  },
  doneBtn: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.cta,
  },
  doneBtnText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
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
  doneLink: {
    marginTop: 14,
  },
  doneLinkText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: C.primary,
  },
});
