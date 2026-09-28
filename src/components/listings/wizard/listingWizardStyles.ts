import { Platform, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../../config/theme';

export const listingWizardInputStyles = StyleSheet.create({
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
    color: Colors.light.textHeading,
    fontSize: 14,
    fontWeight: Typography.body.fontWeight,
    // iOS single-line TextInputs sit low when lineHeight is set — omit it and
    // use slightly more bottom padding to keep the value vertically centered.
    ...(Platform.OS === 'ios'
      ? {
          paddingTop: 10,
          paddingBottom: 14,
        }
      : {
          paddingVertical: Spacing.sm - 2,
          lineHeight: 20,
        }),
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    ...(Platform.OS === 'ios' ? { lineHeight: 20 } : {}),
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
