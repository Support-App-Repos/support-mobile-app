import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ForwardIcon } from '../../common';
import { Colors, Spacing, Typography, BorderRadius } from '../../../config/theme';

type ListingWizardFooterProps = {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  showArrow?: boolean;
};

export const ListingWizardFooter: React.FC<ListingWizardFooterProps> = ({
  label = 'Save & Continue',
  onPress,
  disabled = false,
  loading = false,
  showArrow = true,
}) => (
  <View style={styles.footer}>
    <TouchableOpacity
      style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>{label}</Text>
          {showArrow ? (
            <ForwardIcon size={20} color={disabled ? '#9CA3AF' : '#FFFFFF'} />
          ) : null}
        </>
      )}
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.cardBorder,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.round,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  buttonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },
});
