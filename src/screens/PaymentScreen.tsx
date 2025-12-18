/**
 * Payment Screen
 * Second step of the multi-step listing creation form
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, BellIcon, CheckedIcon, StepCompletedMarkIcon } from '../components/common';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';

type PaymentScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      listingData?: any;
    };
  };
};

const FORM_STEPS = ['Details', 'Payment', 'Select Region', 'Confirm'];

type PaymentPlan = 'monthly' | 'onetime' | null;

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan>(null);
  const [promoCode, setPromoCode] = useState('');
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');

  const currentStep = 1; // Second step (Payment)

  // Price breakdown (mock data)
  const listingFee = 1000;
  const processingFee = 1000;
  const total = listingFee + processingFee;

  const handleBack = () => {
    navigation?.goBack();
  };

  const handlePlanSelect = (plan: PaymentPlan) => {
    setSelectedPlan(plan);
  };

  const handleProceedToPayment = () => {
    if (selectedPlan) {
      const paymentData = { plan: selectedPlan, promoCode };
      navigation?.navigate('SelectRegion', {
        listingData: route?.params?.listingData,
        paymentData,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <BackIcon size={24} color="#030303" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: Navigate to notifications
              console.log('Notifications pressed');
            }}
          >
            <BellIcon size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: Navigate to profile
              console.log('Profile pressed');
            }}
          >
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>Payment Option</Text>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {FORM_STEPS.map((step, index) => (
          <React.Fragment key={step}>
            <View style={styles.progressStepContainer}>
              <View style={styles.progressCircleWrapper}>
                <View
                  style={[
                    styles.progressCircle,
                    index === currentStep && styles.progressCircleActive,
                    index < currentStep && styles.progressCircleCompleted,
                  ]}
                >
                  {index < currentStep && (
                    <StepCompletedMarkIcon size={8} />
                  )}
                  {index === currentStep && (
                    <View style={styles.progressDotActive} />
                  )}
                  {index > currentStep && (
                    <View style={styles.progressDotInactive} />
                  )}
                </View>
                {index < FORM_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.progressLine,
                      index < currentStep && styles.progressLineActive,
                    ]}
                  />
                )}
              </View>
              <Text style={styles.progressLabel}>
                {step}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.introText}>
          Choose how you'd like to pay for your listing
        </Text>

        {/* Monthly Subscription Card */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'monthly' && styles.planCardSelected,
          ]}
          onPress={() => handlePlanSelect('monthly')}
          activeOpacity={0.8}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planPrice}>$10/month</Text>
            <Text style={styles.planTitle}>Monthly Subscription</Text>
            <Text style={styles.planSubtitle}>Unlimited Listings</Text>
          </View>
          <View style={styles.planFeatures}>
            <View style={styles.featureItem}>
              <CheckedIcon size={16} />
              <Text style={styles.featureText}>Unlimited listings</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckedIcon size={16} />
              <Text style={styles.featureText}>Priority support</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckedIcon size={16} />
              <Text style={styles.featureText}>Analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckedIcon size={16} />
              <Text style={styles.featureText}>Featured placement</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.selectButton,
              selectedPlan === 'monthly' && styles.selectButtonSelected,
            ]}
            onPress={() => handlePlanSelect('monthly')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.selectButtonText,
                selectedPlan === 'monthly' && styles.selectButtonTextSelected,
              ]}
            >
              Select
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* One-time Subscription Card */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'onetime' && styles.planCardSelected,
          ]}
          onPress={() => handlePlanSelect('onetime')}
          activeOpacity={0.8}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planPrice}>$10/Listing</Text>
            <Text style={styles.planTitle}>One time Subscription</Text>
            <Text style={styles.planSubtitle}>Pay per listing</Text>
          </View>
          <View style={styles.planFeatures}>
            <View style={styles.featureItem}>
              <CheckedIcon size={16} />
              <Text style={styles.featureText}>Single listing</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckedIcon size={16} />
              <Text style={styles.featureText}>30-day visibility</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckedIcon size={16} />
              <Text style={styles.featureText}>Basic support</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.selectButton,
              selectedPlan === 'onetime' && styles.selectButtonSelected,
            ]}
            onPress={() => handlePlanSelect('onetime')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.selectButtonText,
                selectedPlan === 'onetime' && styles.selectButtonTextSelected,
              ]}
            >
              Select
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Price Breakdown */}
        <View style={styles.priceBreakdownCard}>
          <Text style={styles.priceBreakdownTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Listing Fee</Text>
            <Text style={styles.priceValue}>{listingFee}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Processing Fee</Text>
            <Text style={styles.priceValue}>{processingFee}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total}</Text>
          </View>
        </View>

        {/* Promo Code Section */}
        <View style={styles.promoSection}>
          <Text style={styles.promoLabel}>Promo code (if any)</Text>
          <TextInput
            style={styles.promoInput}
            placeholder="Enter promo code"
            placeholderTextColor={Colors.light.textSecondary}
            value={promoCode}
            onChangeText={setPromoCode}
          />
        </View>

        {/* Proceed to Payment Button */}
        <TouchableOpacity
          style={[
            styles.proceedButton,
            !selectedPlan && styles.proceedButtonDisabled,
          ]}
          onPress={handleProceedToPayment}
          disabled={!selectedPlan}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.proceedButtonText,
              !selectedPlan && styles.proceedButtonTextDisabled,
            ]}
          >
            Proceed to Payment
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'Home') {
            navigation?.navigate('Home');
          }
          // TODO: Handle other tab navigations
        }}
        onCreatePress={() => {}}
        showCreateButton={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  titleText: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  progressStepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressCircleWrapper: {
    width: '100%',
    height: 28,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  progressCircleActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.background,
  },
  progressCircleCompleted: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  progressDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
  progressDotInactive: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  progressLabel: {
    ...Typography.caption,
    color: '#374151',
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  progressLine: {
    position: 'absolute',
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E5E7EB',
    top: 13,
    zIndex: 1,
  },
  progressLineActive: {
    backgroundColor: Colors.light.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  introText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
    fontSize: 14,
  },
  planCard: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  planCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F0F9FF',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  planPrice: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 20,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  planTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  planSubtitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  planFeatures: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 14,
  },
  selectButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  selectButtonSelected: {
    backgroundColor: Colors.light.primary,
  },
  selectButtonText: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 14,
  },
  selectButtonTextSelected: {
    color: '#FFFFFF',
  },
  priceBreakdownCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  priceBreakdownTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  priceValue: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '500',
    fontSize: 14,
  },
  totalRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 16,
  },
  totalValue: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 16,
  },
  promoSection: {
    marginBottom: Spacing.lg,
  },
  promoLabel: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '500',
    marginBottom: Spacing.xs,
    fontSize: 14,
  },
  promoInput: {
    ...Typography.body,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.light.text,
    fontSize: 14,
  },
  proceedButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  proceedButtonTextDisabled: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});

