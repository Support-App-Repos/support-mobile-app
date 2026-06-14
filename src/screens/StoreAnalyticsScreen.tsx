/**
 * Store Analytics Screen - v1
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon } from '../components/common';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { storeService } from '../services';
import type { StoreDashboard } from '../types';

export const StoreAnalyticsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [dashboard, setDashboard] = useState<StoreDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storeService.getStoreDashboard().then((res) => {
      const data = (res.data as any)?.data || res.data;
      if (res.success) setDashboard(data);
      setLoading(false);
    });
  }, []);

  const stats = dashboard?.stats;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <BackIcon size={24} color="#030303" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.content}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Views</Text>
            <Text style={styles.statValue}>{stats?.views ?? 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Listings</Text>
            <Text style={styles.statValue}>{stats?.totalListings ?? 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Listings</Text>
            <Text style={styles.statValue}>{stats?.activeListings ?? 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Average Rating</Text>
            <Text style={styles.statValue}>{stats?.ratingAverage?.toFixed(1) ?? '0.0'} ★</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Reviews</Text>
            <Text style={styles.statValue}>{stats?.reviewsCount ?? 0}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.background,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 18,
  },
  content: { padding: Spacing.md },
  statCard: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statLabel: { ...Typography.caption, color: Colors.light.textSecondary },
  statValue: { ...Typography.h1, color: Colors.light.text, marginTop: Spacing.xs },
  note: { ...Typography.caption, color: Colors.light.textSecondary, textAlign: 'center', marginTop: Spacing.md },
});
