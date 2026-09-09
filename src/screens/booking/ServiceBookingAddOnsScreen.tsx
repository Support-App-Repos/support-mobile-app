/**
 * Add Extra Services — Figma frame 1180:797
 * https://www.figma.com/design/Aq7w5zn2boHQ0mYyioCjd7/Support?node-id=1180-797
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { bookingService } from '../../services';
import type { ServiceAddon } from '../../services/bookingService';
import type { RootStackParamList } from '../../types';
import { unwrapApiPayload } from '../../utils/apiHelpers';
import { computeBookingTotals } from '../../utils/bookingTotals';
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
  checkBg: '#1B4F72',
};

const ADDON_EMOJI = ['🧴', '💆', '✨', '🌿', '💎', '🧴'];

type ServiceBookingAddOnsScreenProps = {
  navigation?: any;
  route?: {
    params?: RootStackParamList['ServiceBookingAddOns'];
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

const getAddonId = (addon: ServiceAddon & { _id?: string }) => addon.id || addon._id || '';

const formatBookingDate = (iso?: string | null) => {
  if (!iso) return 'Date';
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return iso;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatPlusPrice = (
  price: number | null | undefined,
  currency?: string | null,
) => {
  const formatted = formatListingPriceWithType(price, currency, null);
  if (!formatted || formatted === '—') return formatted;
  return formatted.startsWith('+') ? formatted : `+${formatted}`;
};

export const ServiceBookingAddOnsScreen: React.FC<ServiceBookingAddOnsScreenProps> = ({
  navigation,
  route,
}) => {
  const params = route?.params;
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAddons = useCallback(async () => {
    if (!params?.listingId) {
      setError('Service is required to choose add-ons.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await bookingService.getAddons(params.listingId);
      const payload = unwrapApiPayload<ServiceAddon[]>(response);
      const activeAddons = Array.isArray(payload)
        ? payload.filter((addon) => addon.isActive !== false)
        : [];
      setAddons(activeAddons);
    } catch (err: any) {
      console.error('Error loading service add-ons:', err);
      setError(err.message || 'Failed to load add-ons.');
    } finally {
      setLoading(false);
    }
  }, [params?.listingId]);

  useEffect(() => {
    loadAddons();
  }, [loadAddons]);

  const selectedAddons = useMemo(
    () => addons.filter((addon) => selectedIds.includes(getAddonId(addon))),
    [addons, selectedIds],
  );

  const totals = useMemo(
    () => computeBookingTotals(params?.servicePrice, selectedAddons),
    [params?.servicePrice, selectedAddons],
  );

  const toggleAddon = (addonId: string) => {
    setSelectedIds((current) =>
      current.includes(addonId)
        ? current.filter((id) => id !== addonId)
        : [...current, addonId],
    );
  };

  const promptLogin = () => {
    Alert.alert('Login required', 'Please log in before confirming this booking.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Login', onPress: () => navigation?.navigate('Login') },
    ]);
  };

  const confirmBooking = async (addonIds: string[]) => {
    if (!params || submitting) return;

    try {
      setSubmitting(true);
      const response = await bookingService.createBooking({
        storeId: params.storeId,
        listingId: params.listingId,
        appointmentDate: params.appointmentDate,
        appointmentTime: params.appointmentTime,
        addonIds,
      });
      const booking = unwrapApiPayload<{ id?: string; _id?: string }>(response);
      const bookingId = booking?.id || booking?._id;

      if (!bookingId) {
        Alert.alert('Error', 'Booking was created but the confirmation ID is missing.');
        return;
      }

      navigation?.replace('BookingConfirmed', { bookingId });
    } catch (err: any) {
      console.error('Error creating booking:', err);
      if (isAuthError(err)) {
        promptLogin();
        return;
      }
      Alert.alert('Error', err.message || 'Failed to confirm booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const servicePrice = formatListingPriceWithType(
    params?.servicePrice,
    params?.currency,
    params?.priceType,
  );
  const totalPrice = formatListingPriceWithType(totals.totalAmount, params?.currency, null);
  const storeName = params?.storeName || 'Provider';
  const storeLogo = params?.storeLogoUrl;
  const serviceImageUrl = params?.serviceImageUrl;
  const bookingDateLabel = formatBookingDate(params?.appointmentDate);
  const timeWithProvider = `${params?.appointmentTime || 'Time'} with ${storeName}`;
  const selectedCount = selectedIds.length;

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
        <Text style={styles.headerTitle}>Add Extra Services</Text>
      </View>

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.stateText}>Loading add-ons...</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.errorTitle}>
            {!params?.listingId ? 'Unable to continue' : 'Could not load add-ons'}
          </Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadAddons} activeOpacity={0.85}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.bookingCard}>
              <Text style={styles.bookingEyebrow}>YOUR BOOKING</Text>

              <View style={styles.bookingMainRow}>
                {serviceImageUrl ? (
                  <Image
                    source={{ uri: serviceImageUrl }}
                    style={styles.serviceThumb}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.serviceThumbFallback}>
                    <Text style={styles.serviceThumbEmoji}>✂</Text>
                  </View>
                )}

                <View style={styles.bookingCopy}>
                  <Text style={styles.bookingTitle} numberOfLines={1}>
                    {params?.serviceTitle || 'Selected service'}
                  </Text>
                  <Text style={styles.bookingMeta} numberOfLines={1}>
                    {storeName} · {bookingDateLabel}
                  </Text>
                </View>

                <Text style={styles.bookingPrice}>{servicePrice}</Text>
              </View>

              <View style={styles.timeRow}>
                {storeLogo ? (
                  <Image source={{ uri: storeLogo }} style={styles.timeAvatar} />
                ) : (
                  <View style={styles.timeAvatarFallback}>
                    <Text style={styles.timeAvatarText}>
                      {storeName
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.timeText} numberOfLines={1}>
                  🕐 {timeWithProvider}
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Enhance your visit</Text>
              <Text style={styles.sectionSubtitle}>
                Optional add-ons for an even better experience
              </Text>
            </View>

            {addons.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No add-ons available</Text>
                <Text style={styles.emptyText}>
                  You can confirm this booking without selecting any extras.
                </Text>
              </View>
            ) : (
              <View style={styles.addonList}>
                {addons.map((addon, index) => {
                  const addonId = getAddonId(addon);
                  const selected = selectedIds.includes(addonId);
                  const emoji = addon.icon || ADDON_EMOJI[index % ADDON_EMOJI.length];

                  return (
                    <TouchableOpacity
                      key={addonId}
                      style={[styles.addonRow, selected && styles.addonRowSelected]}
                      onPress={() => toggleAddon(addonId)}
                      activeOpacity={0.86}
                    >
                      <View style={styles.addonIcon}>
                        <Text style={styles.addonEmoji}>{emoji}</Text>
                      </View>

                      <View style={styles.addonBody}>
                        <Text style={styles.addonName} numberOfLines={1}>
                          {addon.name}
                        </Text>
                        {addon.description ? (
                          <Text style={styles.addonDescription} numberOfLines={1}>
                            {addon.description}
                          </Text>
                        ) : null}
                      </View>

                      <Text style={styles.addonPrice}>
                        {formatPlusPrice(addon.price, params?.currency)}
                      </Text>

                      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                        {selected ? <Text style={styles.checkmark}>✓</Text> : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Total amount</Text>
                <Text style={styles.totalValue}>{totalPrice}</Text>
              </View>
              {selectedCount > 0 ? (
                <Text style={styles.selectedCount}>
                  {selectedCount} add-on{selectedCount === 1 ? '' : 's'} selected
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, submitting && styles.confirmBtnDisabled]}
              onPress={() => confirmBooking(addons.length > 0 ? selectedIds : [])}
              activeOpacity={0.86}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm Booking · {totalPrice}</Text>
              )}
            </TouchableOpacity>

            {addons.length > 0 ? (
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => confirmBooking([])}
                activeOpacity={0.75}
                disabled={submitting}
              >
                <Text style={styles.skipBtnText}>Skip and confirm without extras</Text>
              </TouchableOpacity>
            ) : null}
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
    backgroundColor: C.screen,
  },
  bookingCard: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 17,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
    overflow: 'hidden',
  },
  bookingEyebrow: {
    fontSize: 11,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: C.meta,
  },
  bookingMainRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceThumb: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8E8ED',
  },
  serviceThumbFallback: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF3F6',
  },
  serviceThumbEmoji: {
    fontSize: 18,
    color: C.title,
  },
  bookingCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
    minWidth: 0,
  },
  bookingTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: C.title,
  },
  bookingMeta: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: C.subtitle,
  },
  bookingPrice: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: C.primary,
  },
  timeRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.chipBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAvatar: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#E8E8ED',
  },
  timeAvatarFallback: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4B942',
  },
  timeAvatarText: {
    fontSize: 8,
    fontWeight: '800',
    color: C.white,
  },
  timeText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: C.subtitle,
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
  addonList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  addonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 17,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
    overflow: 'hidden',
  },
  addonRowSelected: {
    borderColor: C.primary,
    backgroundColor: '#F4F8FB',
  },
  addonIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF3F6',
  },
  addonEmoji: {
    fontSize: 18,
  },
  addonBody: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    minWidth: 0,
  },
  addonName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: C.title,
  },
  addonDescription: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: C.subtitle,
  },
  addonPrice: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: C.primary,
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
  },
  checkboxSelected: {
    borderColor: C.checkBg,
    backgroundColor: C.checkBg,
  },
  checkmark: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: C.white,
  },
  emptyCard: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: C.title,
  },
  emptyText: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: C.subtitle,
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
  selectedCount: {
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
  skipBtn: {
    marginTop: 8,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: C.primary,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: C.screen,
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
