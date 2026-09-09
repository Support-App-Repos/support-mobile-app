import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../../config/theme';

type ListingFormFieldProps = {
  label: string;
  required?: boolean;
  helperText?: string;
  children: ReactNode;
};

export const ListingFormField: React.FC<ListingFormFieldProps> = ({
  label,
  required,
  helperText,
  children,
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
    {children}
    {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    color: '#555555',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 6,
  },
  required: {
    color: Colors.light.error,
  },
  helper: {
    ...Typography.small,
    color: Colors.light.textMuted,
    marginTop: 4,
  },
});
