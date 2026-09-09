import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StepCompletedMarkIcon } from '../../common';
import { Colors, Spacing, Typography } from '../../../config/theme';
import { LISTING_FORM_STEPS } from './constants';

const MP = Colors.light.marketplace;

type ListingStepProgressProps = {
  currentStep: number;
  steps?: readonly string[];
  /** Figma product/property flow: numbered circles with inline labels */
  numbered?: boolean;
  /** Active step accent (defaults to product blue) */
  activeColor?: string;
};

export const ListingStepProgress: React.FC<ListingStepProgressProps> = ({
  currentStep,
  steps = LISTING_FORM_STEPS,
  numbered = false,
  activeColor = MP.detailProductBadge,
}) => {
  if (numbered) {
    return (
      <View style={styles.numberedContainer}>
        {steps.map((step, index) => (
          <View key={step} style={styles.numberedStep}>
            <View
              style={[
                styles.numberedCircle,
                index === currentStep && { backgroundColor: activeColor },
                index < currentStep && { backgroundColor: activeColor },
              ]}
            >
              {index < currentStep ? (
                <StepCompletedMarkIcon size={10} color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.numberedStepNum,
                    (index === currentStep || index < currentStep) && styles.numberedStepNumActive,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.numberedLabel,
                index === currentStep && { color: activeColor, fontWeight: '600' },
                index < currentStep && styles.numberedLabelCompleted,
              ]}
              numberOfLines={1}
            >
              {step}
            </Text>
            {index < steps.length - 1 ? <View style={styles.numberedLine} /> : null}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={step} style={styles.stepContainer}>
          <View style={styles.circleWrapper}>
            <View
              style={[
                styles.circle,
                index === currentStep && styles.circleActive,
                index < currentStep && styles.circleCompleted,
              ]}
            >
              {index < currentStep ? (
                <StepCompletedMarkIcon size={8} />
              ) : index === currentStep ? (
                <View style={styles.dotActive} />
              ) : (
                <View style={styles.dotInactive} />
              )}
            </View>
            {index < steps.length - 1 ? (
              <View style={[styles.line, index < currentStep && styles.lineActive]} />
            ) : null}
          </View>
          <Text
            style={[
              styles.label,
              index === currentStep && styles.labelActive,
              index < currentStep && styles.labelCompleted,
            ]}
            numberOfLines={2}
          >
            {step}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  circleWrapper: {
    width: '100%',
    height: 28,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  circleActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderColor: Colors.light.primary,
  },
  circleCompleted: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
  dotInactive: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  line: {
    position: 'absolute',
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E5E7EB',
    top: 13,
    zIndex: 1,
  },
  lineActive: {
    backgroundColor: Colors.light.primary,
  },
  label: {
    ...Typography.stepLabel,
    color: Colors.light.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
    fontSize: 11,
  },
  labelActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  labelCompleted: {
    color: '#374151',
  },
  numberedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: 4,
  },
  numberedStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 4,
  },
  numberedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberedStepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BBBBBB',
    lineHeight: 16.5,
  },
  numberedStepNumActive: {
    color: '#FFFFFF',
  },
  numberedLabel: {
    fontSize: 10,
    lineHeight: 15,
    color: '#BBBBBB',
    fontWeight: '400',
    maxWidth: 64,
  },
  numberedLabelCompleted: {
    color: '#374151',
    fontWeight: '500',
  },
  numberedLine: {
    width: 12,
    height: 1.5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 2,
  },
});
