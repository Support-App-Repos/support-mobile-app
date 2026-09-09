import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ListingWizardHeader,
} from './ListingWizardHeader';
import { ListingStepProgress } from './ListingStepProgress';
import { ListingWizardFooter } from './ListingWizardFooter';
import { LISTING_FORM_STEPS } from './constants';
import { Colors, Spacing } from '../../../config/theme';

type ListingWizardShellProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  currentStep?: number;
  profileImageUrl?: string | null;
  onBack: () => void;
  onProfilePress?: () => void;
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
  footerLabel?: string;
  onFooterPress: () => void;
  footerDisabled?: boolean;
  footerLoading?: boolean;
  showFooterArrow?: boolean;
  scrollKeyboardPersist?: boolean;
};

export const ListingWizardShell: React.FC<ListingWizardShellProps> = ({
  title,
  subtitle,
  eyebrow,
  currentStep = 0,
  profileImageUrl,
  onBack,
  onProfilePress,
  children,
  contentContainerStyle,
  footerLabel = 'Save & Continue',
  onFooterPress,
  footerDisabled,
  footerLoading,
  showFooterArrow = false,
  scrollKeyboardPersist,
}) => (
  <SafeAreaView style={styles.container} edges={['top']}>
    <ListingWizardHeader
      title={title}
      subtitle={subtitle}
      eyebrow={eyebrow}
      profileImageUrl={profileImageUrl}
      onBack={onBack}
      onProfilePress={onProfilePress}
    />
    <ListingStepProgress currentStep={currentStep} steps={LISTING_FORM_STEPS} />
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={scrollKeyboardPersist ? 'handled' : undefined}
    >
      {children}
    </ScrollView>
    <ListingWizardFooter
      label={footerLabel}
      onPress={onFooterPress}
      disabled={footerDisabled}
      loading={footerLoading}
      showArrow={showFooterArrow}
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});
