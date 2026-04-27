/**
 * Reusable Input component
 */

import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.light.textSecondary}
        // Android tends to vertically center text with extra font padding.
        // This makes single-line inputs look "low" compared to designs.
        {...(Platform.OS === 'android'
          ? { includeFontPadding: false, textAlignVertical: 'center' as const }
          : null)}
        {...textInputProps}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm - 2,
    backgroundColor: Colors.light.surface,
    color: Colors.light.text,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  errorText: {
    ...Typography.small,
    color: Colors.light.error,
    marginTop: Spacing.xs,
  },
});



