import { Platform, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../../config/theme';

export const listingWizardInputStyles = StyleSheet.create({
  input: {
    ...Typography.body,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'android' ? Spacing.sm - 2 : Spacing.sm,
    color: Colors.light.textHeading,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  half: {
    flex: 1,
  },
  wordCount: {
    ...Typography.caption,
    color: Colors.light.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },
  intro: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
    fontSize: 14,
  },
});

export const androidInputProps =
  Platform.OS === 'android'
    ? ({ includeFontPadding: false, textAlignVertical: 'center' as const } as const)
    : undefined;

export const androidMultilineProps =
  Platform.OS === 'android' ? ({ includeFontPadding: false } as const) : undefined;
