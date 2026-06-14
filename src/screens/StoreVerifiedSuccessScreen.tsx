/**
 * Store Verified Success Screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/common';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';

export const StoreVerifiedSuccessScreen: React.FC<{ navigation?: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const storeName = route?.params?.storeName || 'Your Store';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.title}>Your Store is Verified!</Text>
        <Text style={styles.subtitle}>
          Congratulations! Your store now has a verified badge visible to all buyers.
        </Text>

        <View style={styles.previewCard}>
          <Text style={styles.previewName}>{storeName}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>🛡 Verified</Text>
          </View>
        </View>

        <Button
          title="Go to My Store"
          onPress={() => navigation?.replace('StoreDashboard')}
          style={styles.primaryBtn}
        />
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation?.reset({ index: 0, routes: [{ name: 'Home' }] })}
        >
          <Text style={styles.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <View style={styles.nextBox}>
          <Text style={styles.nextTitle}>What's Next?</Text>
          <Text style={styles.nextItem}>• Start adding your products or services</Text>
          <Text style={styles.nextItem}>• Complete your store profile</Text>
          <Text style={styles.nextItem}>• Share your store with customers</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { flex: 1, alignItems: 'center', padding: Spacing.lg, paddingTop: 60 },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  checkMark: { fontSize: 36, color: Colors.light.primary, fontWeight: '700' },
  title: { ...Typography.h2, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { ...Typography.body, color: Colors.light.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  previewName: { ...Typography.h3 },
  verifiedBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  verifiedText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  primaryBtn: { width: '100%', marginBottom: Spacing.sm },
  secondaryBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  secondaryBtnText: { fontWeight: '600', color: Colors.light.text },
  nextBox: {
    width: '100%',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  nextTitle: { ...Typography.h3, marginBottom: Spacing.sm },
  nextItem: { ...Typography.body, color: Colors.light.textSecondary, marginBottom: 4 },
});
