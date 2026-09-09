import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../../config/theme';

type ListingTypeCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  tag?: string;
  selected?: boolean;
  onPress: () => void;
  style?: object;
};

export const ListingTypeCard: React.FC<ListingTypeCardProps> = ({
  title,
  description,
  icon,
  tag,
  selected = false,
  onPress,
  style,
}) => (
  <TouchableOpacity
    style={[styles.card, selected && styles.cardSelected, style]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.icon}>{icon}</View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
    {tag ? (
      <View style={styles.tag}>
        <Text style={styles.tagText}>⭐ {tag}</Text>
      </View>
    ) : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.light.cardBorder,
    minHeight: 150,
    marginBottom: Spacing.md,
  },
  cardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.cardSelectedBg,
  },
  icon: {
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    color: Colors.light.textHeading,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  tag: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
  },
  tagText: {
    ...Typography.small,
    color: '#92400E',
    fontWeight: '500',
  },
});

export const ListingTypeCardGrid: React.FC<{ children: ReactNode }> = ({ children }) => (
  <View style={gridStyles.grid}>{children}</View>
);

const gridStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
});
