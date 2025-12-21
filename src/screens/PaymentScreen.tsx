/**
 * Payment Screen
 * Second step of the multi-step listing creation form
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStripe } from '@stripe/stripe-react-native';
import { BackIcon, BellIcon, CheckedIcon, StepCompletedMarkIcon } from '../components/common';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { paymentService } from '../services/paymentService';

type PaymentScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      listingData?: any;
    };
  };
};

const FORM_STEPS = ['Details', 'Payment', 'Select Region', 'Confirm'];

interface PaymentPlan {
  id: string;
  name: string;
  type: 'monthly' | 'onetime';
  price: number;
  listingFee: number;
  processingFee: number;
  features?: string[];
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  navigation,
  route,
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [validatedPromoCode, setValidatedPromoCode] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const currentStep = 1; // Second step (Payment)
  const listingData = route?.params?.listingData;

  // Fetch payment plans on mount
  useEffect(() => {
    fetchPaymentPlans();
  }, []);

  const fetchPaymentPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await paymentService.getPaymentPlans();
      // Backend returns { success: true, data: [...] }
      // ApiService.get extracts response.data, so we get { success, data: { success, data: [...] } }
      const plans = (response.data as any)?.data || response.data || [];
      if (response.success && Array.isArray(plans) && plans.length > 0) {
        setPaymentPlans(plans);
      }
    } catch (error: any) {
      console.error('Error fetching payment plans:', error);
      Alert.alert('Error', error.message || 'Failed to load payment plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleValidatePromoCode = async () => {
    if (!promoCode.trim()) {
      setValidatedPromoCode(null);
      return;
    }

    try {
      const response = await paymentService.validatePromoCode(promoCode);
      // Backend returns { success: true, data: {...} }
      const promoData = (response.data as any)?.data || response.data;
      if (response.success && promoData) {
        setValidatedPromoCode(promoData);
        Alert.alert('Success', 'Promo code applied successfully!');
      }
    } catch (error: any) {
      console.error('Error validating promo code:', error);
      Alert.alert('Error', error.message || 'Invalid promo code');
      setValidatedPromoCode(null);
    }
  };

  // Calculate total amount
  const calculateTotal = () => {
    if (!selectedPlan) return 0;
    let total = selectedPlan.price + selectedPlan.listingFee + selectedPlan.processingFee;
    
    // Apply promo code discount if validated
    if (validatedPromoCode) {
      if (validatedPromoCode.discountType === 'percentage') {
        total = total - (total * validatedPromoCode.discountValue / 100);
      } else {
        total = total - validatedPromoCode.discountValue;
      }
    }
    
    return Math.max(0, total);
  };

  const listingFee = selectedPlan?.listingFee || 0;
  const processingFee = selectedPlan?.processingFee || 0;
  const total = calculateTotal();

  const handleBack = () => {
    navigation?.goBack();
  };

  const handlePlanSelect = (plan: PaymentPlan) => {
    setSelectedPlan(plan);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPlan || !listingData?.id) {
      Alert.alert('Error', 'Please select a payment plan and ensure listing data is available');
      return;
    }

    try {
      setLoading(true);

      // 1. Create payment intent on backend
      const createResponse = await paymentService.createPaymentIntent({
        listingId: listingData.id,
        paymentPlanId: selectedPlan.id,
        promoCodeId: validatedPromoCode?.id,
      });

      if (!createResponse.success) {
        throw new Error(createResponse.message || 'Failed to create payment intent');
      }

      // Backend returns { success: true, data: {...} }
      const paymentData = (createResponse.data as any)?.data || createResponse.data;
      if (!paymentData) {
        throw new Error('Invalid payment intent response');
      }

      const { clientSecret, paymentIntentId, subscriptionId } = paymentData;

      // 2. Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Marketplace',
        allowsDelayedPaymentMethods: true,
      });

      if (initError) {
        console.error('Payment sheet initialization error:', initError);
        Alert.alert('Error', initError.message || 'Failed to initialize payment');
        return;
      }

      // 3. Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          console.error('Payment sheet error:', presentError);
          Alert.alert('Error', presentError.message || 'Payment failed');
        }
        // User canceled - don't show error
        return;
      }

      // 4. Payment succeeded - confirm on backend
      const confirmResponse = await paymentService.confirmPayment({
        paymentIntentId,
        subscriptionId,
      });

      if (confirmResponse.success) {
        // Backend returns { success: true, data: {...} }
        const subscriptionData = (confirmResponse.data as any)?.data || confirmResponse.data;
        
        // Navigate to next step with payment data
        const paymentData = {
          plan: selectedPlan,
          promoCode: validatedPromoCode,
          subscription: subscriptionData,
        };
        
        navigation?.navigate('SelectRegion', {
          listingData,
          paymentData,
        });
      } else {
        throw new Error(confirmResponse.message || 'Payment confirmation failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert('Error', error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
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

        {/* Loading state */}
        {loadingPlans ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Loading payment plans...</Text>
          </View>
        ) : (
          <>
            {/* Payment Plan Cards */}
            {paymentPlans.map((plan) => (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan?.id === plan.id && styles.planCardSelected,
                ]}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planPrice}>
                    ${plan.price.toFixed(2)}
                    {plan.type === 'monthly' ? '/month' : '/listing'}
                  </Text>
                  <Text style={styles.planTitle}>{plan.name}</Text>
                  <Text style={styles.planSubtitle}>
                    {plan.type === 'monthly' ? 'Unlimited Listings' : 'Pay per listing'}
                  </Text>
                </View>
                {plan.features && Array.isArray(plan.features) && (
                  <View style={styles.planFeatures}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <CheckedIcon size={16} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    selectedPlan?.id === plan.id && styles.selectButtonSelected,
                  ]}
                  onPress={() => handlePlanSelect(plan)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.selectButtonText,
                      selectedPlan?.id === plan.id && styles.selectButtonTextSelected,
                    ]}
                  >
                    Select
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Price Breakdown */}
        {selectedPlan && (
          <View style={styles.priceBreakdownCard}>
            <Text style={styles.priceBreakdownTitle}>Price Breakdown</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Plan Price</Text>
              <Text style={styles.priceValue}>${selectedPlan.price.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Listing Fee</Text>
              <Text style={styles.priceValue}>${listingFee.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Processing Fee</Text>
              <Text style={styles.priceValue}>${processingFee.toFixed(2)}</Text>
            </View>
            {validatedPromoCode && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Discount</Text>
                <Text style={[styles.priceValue, styles.discountValue]}>
                  -$
                  {validatedPromoCode.discountType === 'percentage'
                    ? ((selectedPlan.price + listingFee + processingFee) * validatedPromoCode.discountValue / 100).toFixed(2)
                    : validatedPromoCode.discountValue.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Promo Code Section */}
        <View style={styles.promoSection}>
          <Text style={styles.promoLabel}>Promo code (if any)</Text>
          <View style={styles.promoInputContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter promo code"
              placeholderTextColor={Colors.light.textSecondary}
              value={promoCode}
              onChangeText={setPromoCode}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.validateButton}
              onPress={handleValidatePromoCode}
              disabled={!promoCode.trim() || loading}
              activeOpacity={0.7}
            >
              <Text style={styles.validateButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {validatedPromoCode && (
            <Text style={styles.promoSuccessText}>
              ✓ Promo code applied: {validatedPromoCode.code}
            </Text>
          )}
        </View>

        {/* Proceed to Payment Button */}
        <TouchableOpacity
          style={[
            styles.proceedButton,
            (!selectedPlan || loading || loadingPlans) && styles.proceedButtonDisabled,
          ]}
          onPress={handleProceedToPayment}
          disabled={!selectedPlan || loading || loadingPlans}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.proceedButtonText,
                (!selectedPlan || loading || loadingPlans) && styles.proceedButtonTextDisabled,
              ]}
            >
              Proceed to Payment
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'Home') {
            navigation?.navigate('Home');
          } else if (tab === 'MyListings') {
            navigation?.navigate('MyListings');
          } else if (tab === 'Messages') {
            // TODO: Navigate to Messages screen when implemented
            console.log('Messages screen not yet implemented');
          } else if (tab === 'Profile') {
            navigation?.navigate('Profile');
          }
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
  discountValue: {
    color: '#10B981',
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
  promoInputContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  promoInput: {
    ...Typography.body,
    flex: 1,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.light.text,
    fontSize: 14,
  },
  validateButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validateButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  promoSuccessText: {
    ...Typography.caption,
    color: '#10B981',
    marginTop: Spacing.xs,
    fontSize: 12,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
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

