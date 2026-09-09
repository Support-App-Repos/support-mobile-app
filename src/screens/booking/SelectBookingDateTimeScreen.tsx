import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, CalendarIcon } from '../../components/common';
import type { RootStackParamList } from '../../types';
import { formatListingPriceWithType } from '../../utils/currency';

/**
 * Layout from Figma frame 1180:52 — "date nd time"
 * https://www.figma.com/design/Aq7w5zn2boHQ0mYyioCjd7/Support?node-id=1180-52
 */
const C = {
  screen: '#F2F2F2',
  white: '#FFFFFF',
  title: '#131218',
  subtitle: '#696971',
  meta: '#8A8A93',
  iconBtn: '#F2F2F7',
  primary: '#1F485E',
  selected: '#1B4F72',
  available: '#22C55E',
  partial: '#F59E0B',
  pending: '#3B82F6',
  booked: '#EF4444',
  chipBorder: '#E8E8ED',
  link: '#1B4F72',
};

const TIME_SLOTS = [
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

type SelectBookingDateTimeScreenProps = {
  navigation?: any;
  route?: {
    params?: RootStackParamList['SelectBookingDateTime'];
  };
};

type CalendarCell = {
  key: string;
  date?: Date;
  outsideMonth?: boolean;
};

const padDatePart = (value: number) => String(value).padStart(2, '0');

const toLocalISODate = (date: Date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;

const startOfLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameLocalDate = (a?: Date | null, b?: Date | null) =>
  Boolean(
    a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate(),
  );

/** Monday-first calendar grid (matches Figma Mo–Su). */
const buildCalendarCells = (monthDate: Date): CalendarCell[] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayIndex = (firstDay.getDay() + 6) % 7;
  const cells: CalendarCell[] = [];

  for (let i = 0; i < mondayIndex; i += 1) {
    const date = new Date(year, month, -mondayIndex + i + 1);
    cells.push({ key: `prev-${toLocalISODate(date)}`, date, outsideMonth: true });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({ key: toLocalISODate(date), date });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    const date = new Date(year, month + 1, nextDay);
    cells.push({ key: `next-${toLocalISODate(date)}`, date, outsideMonth: true });
    nextDay += 1;
  }

  return cells;
};

const formatMonthTitle = (date: Date) =>
  date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

const formatTimesHeading = (date: Date) =>
  `Available times — ${date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  })}`;

const getInitials = (name?: string | null) =>
  (name || 'S')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const SelectBookingDateTimeScreen: React.FC<SelectBookingDateTimeScreenProps> = ({
  navigation,
  route,
}) => {
  const params = route?.params;
  const today = useMemo(() => startOfLocalDay(new Date()), []);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const calendarCells = useMemo(() => buildCalendarCells(visibleMonth), [visibleMonth]);
  const selectedDateISO = selectedDate ? toLocalISODate(selectedDate) : null;
  const canGoPreviousMonth =
    visibleMonth.getFullYear() > today.getFullYear() ||
    (visibleMonth.getFullYear() === today.getFullYear() &&
      visibleMonth.getMonth() > today.getMonth());
  const canContinue = Boolean(params && selectedDateISO && selectedTime);

  const goToPreviousMonth = () => {
    if (!canGoPreviousMonth) return;
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const handleContinue = () => {
    if (!params || !selectedDateISO || !selectedTime) return;

    navigation?.navigate('ServiceBookingAddOns', {
      ...params,
      appointmentDate: selectedDateISO,
      appointmentTime: selectedTime,
    });
  };

  const missingParams = !params?.storeId || !params?.listingId;
  const serviceTitle = params?.serviceTitle || 'Selected service';
  const servicePrice = formatListingPriceWithType(
    params?.servicePrice,
    params?.currency,
    params?.priceType,
  );
  const storeName = params?.storeName || 'Service Provider';
  const storeLogo = params?.storeLogoUrl;
  const serviceImageUrl = params?.serviceImageUrl;

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
        <Text style={styles.headerTitle}>Select date and time</Text>
      </View>

      {missingParams ? (
        <View style={styles.state}>
          <Text style={styles.errorTitle}>Unable to continue</Text>
          <Text style={styles.stateText}>
            Booking details are missing. Please go back and try again.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.serviceChip}>
              {serviceImageUrl ? (
                <Image
                  source={{ uri: serviceImageUrl }}
                  style={styles.serviceChipImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.serviceIconBubble}>
                  <Text style={styles.serviceIconText}>✂</Text>
                </View>
              )}
              <Text style={styles.serviceChipTitle} numberOfLines={1}>
                {serviceTitle}
              </Text>
              <Text style={styles.serviceChipPrice}>{servicePrice}</Text>
            </View>

            <View style={styles.providerRow}>
              <View style={styles.providerChip}>
                {storeLogo ? (
                  <Image source={{ uri: storeLogo }} style={styles.providerAvatar} />
                ) : (
                  <View style={styles.providerAvatarFallback}>
                    <Text style={styles.providerAvatarText}>{getInitials(storeName)}</Text>
                  </View>
                )}
                <Text style={styles.providerName} numberOfLines={1}>
                  {storeName}
                </Text>
              </View>
            </View>

            <View style={styles.calendarCard}>
              <View style={styles.monthHeader}>
                <TouchableOpacity
                  style={[styles.monthBtn, !canGoPreviousMonth && styles.monthBtnDisabled]}
                  onPress={goToPreviousMonth}
                  disabled={!canGoPreviousMonth}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.monthBtnGlyph,
                      !canGoPreviousMonth && styles.monthBtnGlyphDisabled,
                    ]}
                  >
                    ‹
                  </Text>
                </TouchableOpacity>

                <View style={styles.monthTitleRow}>
                  <CalendarIcon size={15} color="#1B4F72" />
                  <Text style={styles.monthTitle}>{formatMonthTitle(visibleMonth)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.monthBtn}
                  onPress={goToNextMonth}
                  activeOpacity={0.75}
                >
                  <Text style={styles.monthBtnGlyph}>›</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.weekdayRow}>
                {WEEKDAYS.map((weekday) => (
                  <Text key={weekday} style={styles.weekdayText}>
                    {weekday}
                  </Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {calendarCells.map((cell) => {
                  const isPast = cell.date
                    ? startOfLocalDay(cell.date) < today || Boolean(cell.outsideMonth)
                    : true;
                  const selected = isSameLocalDate(selectedDate, cell.date) && !cell.outsideMonth;

                  return (
                    <TouchableOpacity
                      key={cell.key}
                      style={styles.dateCellWrap}
                      onPress={() => {
                        if (!cell.date || isPast) return;
                        setSelectedDate(cell.date);
                        setSelectedTime(null);
                      }}
                      activeOpacity={0.75}
                      disabled={isPast}
                    >
                      <View
                        style={[
                          styles.dateCell,
                          selected && styles.dateCellSelected,
                        ]}
                      >
                        {cell.date ? (
                          <Text
                            style={[
                              styles.dateText,
                              (isPast || cell.outsideMonth) && styles.dateTextMuted,
                              selected && styles.dateTextSelected,
                            ]}
                          >
                            {cell.date.getDate()}
                          </Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: C.available }]} />
                  <Text style={styles.legendText}>Available</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: C.partial }]} />
                  <Text style={styles.legendText}>Partially Booked</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: C.pending }]} />
                  <Text style={styles.legendText}>Pending</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: C.booked }]} />
                  <Text style={styles.legendText}>Booked</Text>
                </View>
              </View>
            </View>

            <View style={styles.timesSection}>
              <Text style={styles.timesHeading}>
                {selectedDate
                  ? formatTimesHeading(selectedDate)
                  : 'Available times'}
              </Text>
              <View style={styles.timeGrid}>
                {TIME_SLOTS.map((slot) => {
                  const selected = selectedTime === slot;
                  const disabled = !selectedDate;

                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.timeChip,
                        selected && styles.timeChipSelected,
                        disabled && styles.timeChipDisabled,
                      ]}
                      onPress={() => !disabled && setSelectedTime(slot)}
                      activeOpacity={0.8}
                      disabled={disabled}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          selected && styles.timeTextSelected,
                          disabled && styles.timeTextDisabled,
                        ]}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.waitlistRow}>
              <Text style={styles.waitlistText}>Can't find a suitable time? </Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('Waitlist', 'Waitlist will be available in a future update.')
                }
                activeOpacity={0.7}
              >
                <Text style={styles.waitlistLink}>Join the waitlist</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}
              onPress={handleContinue}
              activeOpacity={0.86}
              disabled={!canContinue}
            >
              <Text style={styles.primaryBtnText}>
                {canContinue ? 'Continue' : 'Select a date and time'}
              </Text>
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
    flexGrow: 1,
    backgroundColor: C.screen,
    paddingBottom: 24,
  },
  serviceChip: {
    marginTop: 12,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
    overflow: 'hidden',
  },
  serviceIconBubble: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF3F6',
    marginRight: 10,
  },
  serviceChipImage: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#E8E8ED',
  },
  serviceIconText: {
    fontSize: 14,
    color: C.title,
  },
  serviceChipTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: C.title,
  },
  serviceChipPrice: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: C.selected,
    marginLeft: 8,
  },
  providerRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  providerChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 12,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
    overflow: 'hidden',
  },
  providerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E8E8ED',
  },
  providerAvatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4B942',
  },
  providerAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.white,
  },
  providerName: {
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: C.title,
    maxWidth: 160,
  },
  calendarCard: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 17,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
    overflow: 'hidden',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.iconBtn,
  },
  monthBtnDisabled: {
    opacity: 0.45,
  },
  monthBtnGlyph: {
    fontSize: 24,
    lineHeight: 28,
    color: C.title,
    fontWeight: '600',
  },
  monthBtnGlyphDisabled: {
    color: C.meta,
  },
  monthTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: C.title,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 4,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: C.meta,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCellWrap: {
    width: '14.285714%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCellSelected: {
    backgroundColor: C.selected,
  },
  dateText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: C.title,
  },
  dateTextMuted: {
    color: '#C5C5CA',
  },
  dateTextSelected: {
    color: C.white,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
    paddingTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
    lineHeight: 15,
    color: C.subtitle,
  },
  timesSection: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  timesHeading: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: C.title,
    marginBottom: 12,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  timeChip: {
    width: '31.5%',
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.chipBorder,
  },
  timeChipSelected: {
    backgroundColor: C.selected,
    borderColor: C.selected,
  },
  timeChipDisabled: {
    opacity: 0.45,
  },
  timeText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: C.title,
  },
  timeTextSelected: {
    color: C.white,
  },
  timeTextDisabled: {
    color: C.meta,
  },
  waitlistRow: {
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitlistText: {
    fontSize: 13,
    lineHeight: 18,
    color: C.subtitle,
  },
  waitlistLink: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: C.link,
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: C.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EAEAEA',
  },
  primaryBtn: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.selected,
  },
  primaryBtnDisabled: {
    backgroundColor: '#A8B6C0',
  },
  primaryBtnText: {
    fontSize: 15,
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
    lineHeight: 26,
    fontWeight: '700',
    color: C.title,
  },
});
