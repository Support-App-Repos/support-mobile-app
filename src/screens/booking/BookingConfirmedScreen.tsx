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
import { BorderRadius, Colors, Spacing } from '../../config/theme';
import { bookingService } from '../../services';
import type { ServiceBooking } from '../../services/bookingService';
import type { RootStackParamList } from '../../types';
import { unwrapApiPayload } from '../../utils/apiHelpers';
import { formatListingPriceWithType } from '../../utils/currency';

const MP = Colors.light.marketplace;

type BookingConfirmedScreenProps = {
  navigation?: any;
  route?: {
    params?: RootStackParamList['BookingConfirmed'];
  };
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Date pending';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const BookingConfirmedScreen: React.FC<BookingConfirmedScreenProps> = ({
  navigation,
  route,
}) => {
  const bookingId = route?.params?.bookingId;
  const [booking, setBooking] = useState<ServiceBooking | null>(null);
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
      const response = await bookingService.getBooking(bookingId);
      const payload = unwrapApiPayload<ServiceBooking>(response);
      setBooking(payload);
    } catch (err: any) {
      console.error('Error loading booking confirmation:', err);
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
  const servicePrice = formatListingPriceWithType(
    booking?.servicePrice,
    booking?.currency,
    booking?.priceType,
  );
  const addonsTotal = formatListingPriceWithType(booking?.addonsTotal, booking?.currency, null);
  const addons = booking?.addonsSnapshot ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={MP.primary} />
          <Text style={styles.stateText}>Loading booking...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorTitle}>
            {!bookingId ? 'Unable to continue' : 'Could not load booking'}
          </Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBooking} activeOpacity={0.85}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneLinkButton} onPress={handleDone} activeOpacity={0.85}>
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
                Your booking has been created. We saved the latest service and add-on details for
                this appointment.
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service</Text>
                <Text style={styles.summaryValue}>{booking?.serviceTitle || 'Service'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>{formatDate(booking?.appointmentDate)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>
                  {booking?.appointmentTime || 'Time pending'}
                </Text>
              </View>
              {booking?.duration ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Duration</Text>
                  <Text style={styles.summaryValue}>{booking.duration}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Add-ons</Text>
              {addons.length > 0 ? (
                addons.map((addon) => (
                  <View key={addon.id} style={styles.addonRow}>
                    <Text style={styles.addonName}>{addon.name}</Text>
                    <Text style={styles.addonPrice}>
                      {formatListingPriceWithType(addon.price, booking?.currency, null)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No extras were added to this booking.</Text>
              )}
            </View>

            <View style={styles.totalCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Service</Text>
                <Text style={styles.totalValue}>{servicePrice}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Add-ons</Text>
                <Text style={styles.totalValue}>{addonsTotal}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>{totalPrice}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.86}>
              <Text style={styles.doneButtonText}>Done</Text>
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
    backgroundColor: MP.screenSurface,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: 16,
  },
  heroCard: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MP.cardBorder,
  },
  heroTitle: {
    marginTop: Spacing.md,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '900',
    color: MP.titleText,
  },
  heroText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: MP.descriptionText,
  },
  summaryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MP.cardBorder,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '800',
    color: MP.titleText,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 13,
    lineHeight: 19,
    color: MP.metaText,
  },
  summaryValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    color: MP.titleText,
  },
  addonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MP.divider,
  },
  addonName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: MP.titleText,
  },
  addonPrice: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    color: MP.primary,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: MP.descriptionText,
  },
  totalCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MP.cardBorder,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: MP.descriptionText,
  },
  totalValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: MP.primary,
  },
  divider: {
    height: 1,
    marginVertical: 4,
    backgroundColor: MP.divider,
  },
  grandTotalLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '800',
    color: MP.titleText,
  },
  grandTotalValue: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '900',
    color: MP.primary,
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: MP.headerBg,
    borderTopWidth: 1,
    borderTopColor: MP.bottomBarBorder,
  },
  doneButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MP.primary,
  },
  doneButtonText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  stateText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: MP.chipInactiveText,
  },
  errorTitle: {
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '700',
    color: MP.titleText,
  },
  retryButton: {
    marginTop: Spacing.md,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: MP.primary,
  },
  retryButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doneLinkButton: {
    marginTop: Spacing.sm,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  doneLinkText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    color: MP.primary,
  },
});
