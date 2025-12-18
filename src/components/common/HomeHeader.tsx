/**
 * Home Header Component
 * Displays the promotional banner with "List, Manage & Connect" text and Create Now button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { Colors, Spacing, Typography, BorderRadius } from '../../config/theme';

interface HomeHeaderProps {
  onCreatePress: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ onCreatePress }) => {
  return (
    <View style={styles.banner}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 375 101"
        style={StyleSheet.absoluteFill}
        preserveAspectRatio="xMidYMid slice"
      >
        <Rect width="375" height="100" fill="#0D475C" />
        {/* Decorative circles */}
        <Circle
          cx="6"
          cy="36"
          r="27.5"
          fill="none"
          stroke="#FF6464"
          strokeWidth="15"
          opacity="0.5"
        />
        <Circle
          cx="375"
          cy="66"
          r="27.5"
          fill="none"
          stroke="#FF6464"
          strokeWidth="15"
          opacity="0.5"
        />
      </Svg>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerSubtitle}>
          List, Manage & Connect — All in One Place
        </Text>
        <Text style={styles.bannerTitle}>
          <Text style={styles.bannerTitleWhite}>Your Listings.</Text>
          <Text style={styles.bannerTitleYellow}> Your Control</Text>
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={onCreatePress}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>Create Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 100,
    backgroundColor: Colors.light.primary,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  bannerContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  bannerSubtitle: {
    ...Typography.caption,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.xs,
    fontSize: 12,
  },
  bannerTitle: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontSize: 20,
    fontWeight: '700',
  },
  bannerTitleWhite: {
    color: '#FFFFFF',
  },
  bannerTitleYellow: {
    color: '#F9BB00',
  },
  createButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  createButtonText: {
    ...Typography.body,
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});

