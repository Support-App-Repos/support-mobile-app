/**
 * My Listings header — title, stats row, status filter chips (Figma 1055:774)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../config/theme';

const MP = Colors.light.marketplace;

export type MyListingStatusFilter = 'All' | 'Active' | 'Pending' | 'Expired';

type MyListingsHeaderSectionProps = {
  selectedStatus: MyListingStatusFilter;
  onStatusChange: (status: MyListingStatusFilter) => void;
  activeCount: number;
  pendingCount: number;
  totalViews: number;
  onSeeAllPress?: () => void;
  showSeeAll?: boolean;
};

const FILTER_TABS: MyListingStatusFilter[] = ['All', 'Active', 'Pending', 'Expired'];

export const MyListingsHeaderSection: React.FC<MyListingsHeaderSectionProps> = ({
  selectedStatus,
  onStatusChange,
  activeCount,
  pendingCount,
  totalViews,
  onSeeAllPress,
  showSeeAll = true,
}) => (
  <View style={styles.wrap}>
    <View style={styles.titleRow}>
      <Text style={styles.title}>My Listings</Text>
      {showSeeAll ? (
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7} hitSlop={8}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      ) : null}
    </View>

    <View style={styles.statsRow}>
      <View style={[styles.statCard, styles.statActive]}>
        <Text style={[styles.statValue, styles.statActiveValue]}>{activeCount}</Text>
        <Text style={[styles.statLabel, styles.statActiveValue]}>Active</Text>
      </View>
      <View style={[styles.statCard, styles.statPending]}>
        <Text style={[styles.statValue, styles.statPendingValue]}>{pendingCount}</Text>
        <Text style={[styles.statLabel, styles.statPendingValue]}>Pending</Text>
      </View>
      <View style={[styles.statCard, styles.statViews]}>
        <Text style={[styles.statValue, styles.statViewsValue]}>{totalViews}</Text>
        <Text style={[styles.statLabel, styles.statViewsValue]}>Views</Text>
      </View>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
    >
      {FILTER_TABS.map((tab) => {
        const selected = selectedStatus === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onStatusChange(tab)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{tab}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '700',
    color: Colors.light.textHeading,
  },
  seeAll: {
    fontSize: 13,
    lineHeight: 19.5,
    fontWeight: '600',
    color: MP.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statActive: {
    backgroundColor: '#EAFAF1',
  },
  statPending: {
    backgroundColor: '#FEF5EC',
  },
  statViews: {
    backgroundColor: '#EBF5FB',
  },
  statValue: {
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '700',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  statActiveValue: {
    color: MP.ctaGreen,
  },
  statPendingValue: {
    color: '#E67E22',
  },
  statViewsValue: {
    color: MP.primary,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 2,
  },
  chip: {
    borderRadius: BorderRadius.round,
    borderWidth: 1.18,
    borderColor: '#E0E0E0',
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  chipSelected: {
    backgroundColor: MP.primary,
    borderColor: MP.primary,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    color: MP.chipInactiveText,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
