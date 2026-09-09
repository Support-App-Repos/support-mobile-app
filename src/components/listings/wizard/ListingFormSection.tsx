import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../../config/theme';

type ListingFormSectionProps = {
  title: string;
  subtitle?: string;
  required?: boolean;
  /** Figma property form: white rounded card on screen surface */
  variant?: 'default' | 'card';
  children: ReactNode;
};

export const ListingFormSection: React.FC<ListingFormSectionProps> = ({
  title,
  subtitle,
  required,
  variant = 'default',
  children,
}) => (
  <View style={[styles.section, variant === 'card' && styles.sectionCard]}>
    <View style={[styles.header, variant === 'card' && styles.headerCard]}>
      <Text style={[styles.title, variant === 'card' && styles.titleCard]}>
        {title}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  sectionCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  headerCard: {
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.h3,
    color: Colors.light.textHeading,
    fontWeight: '700',
    fontSize: 16,
  },
  titleCard: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  required: {
    color: Colors.light.error,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
});
