/**
 * Review Screen
 * Final step of the multi-step listing creation form
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BackIcon,
  BellIcon,
  StepCompletedMarkIcon,
  EditIcon,
  LocationIcon,
  CardIcon,
} from '../components/common';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { listingService } from '../services';

type ReviewScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      listingData?: any;
      paymentData?: any;
      regionData?: any;
    };
  };
};

const FORM_STEPS = ['Details', 'Payment', 'Select Region', 'Confirm'];

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  navigation,
  route,
}) => {
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [loading, setLoading] = useState(false);

  const currentStep = 3; // Final step (Confirm)

  // Get data from route params
  const listingData = route?.params?.listingData;
  const paymentData = route?.params?.paymentData;
  const regionData = route?.params?.regionData;

  const handleBack = () => {
    navigation?.goBack();
  };

  const handleEditDetails = () => {
    // Navigate back to ProductListingScreen with current data
    navigation?.navigate('ProductListing', {
      category: listingData.category || 'Products',
      ...listingData,
    });
  };

  const handleEditPayment = () => {
    // Navigate back to PaymentScreen with current data
    navigation?.navigate('Payment', {
      listingData,
      ...paymentData,
    });
  };

  const handleEditRegion = () => {
    // Navigate back to SelectRegionScreen with current data
    navigation?.navigate('SelectRegion', {
      listingData,
      paymentData,
      ...regionData,
    });
  };

  const handleConfirmAndPublish = async () => {
    if (!listingData?.id) {
      Alert.alert('Error', 'Listing data is missing');
      return;
    }

    try {
      setLoading(true);

      // First, update listing with regionIds if regionData is provided
      if (regionData?.id) {
        const updateResponse = await listingService.updateListing(listingData.id, {
          regionIds: [regionData.id],
        });

        if (!updateResponse.success) {
          throw new Error(updateResponse.message || 'Failed to update listing with region');
        }
      }

      // Then publish the listing
      const publishResponse = await listingService.publishListing(listingData.id);

      if (publishResponse.success) {
        // Navigate to publish success screen
        navigation?.navigate('Publish', {
          listingId: listingData.id,
        });
      } else {
        throw new Error(publishResponse.message || 'Failed to publish listing');
      }
    } catch (error: any) {
      console.error('Error publishing listing:', error);
      Alert.alert('Error', error.message || 'Failed to publish listing. Please try again.');
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
        <Text style={styles.titleText}>Review & Confirm</Text>
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
          Review your listing before publishing.
        </Text>

        {/* Preview Card */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Preview</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditDetails}
              activeOpacity={0.7}
            >
              <EditIcon size={11} color="#8E8E8E" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>{listingData?.category || 'Category'}</Text>
            </View>
            <Text style={styles.previewValue}>{listingData?.title || 'Title'}</Text>
            <Text style={styles.previewPrice}>
              {listingData?.price ? `$${listingData.price}` : 'Price'}
            </Text>
            <View style={styles.previewLocationRow}>
              <LocationIcon size={15} color="#6B7280" />
              <Text style={styles.previewLocation}>{listingData?.location || 'Location'}</Text>
              {listingData?.categoryType && (
                <Text style={styles.previewCategory}>{listingData.categoryType}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Payment Summary Card */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Payment Summary</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditPayment}
              activeOpacity={0.7}
            >
              <EditIcon size={11} color="#8E8E8E" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.paymentRow}>
              <CardIcon size={22} />
              <Text style={styles.paymentType}>
                {paymentData?.plan === 'monthly'
                  ? 'Monthly payment'
                  : 'One-time payment'}
              </Text>
            </View>
            <Text style={styles.paymentTotal}>
              {paymentData?.total ? `${paymentData.total} Total` : 'Total'}
            </Text>
          </View>
        </View>

        {/* Region Card */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Region</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditRegion}
              activeOpacity={0.7}
            >
              <EditIcon size={11} color="#8E8E8E" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.regionName}>{regionData?.name || 'Region'}</Text>
            <Text style={styles.regionDescription}>
              Your listing will appear in this region
            </Text>
          </View>
        </View>

        {/* Confirm & Publish Button */}
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
          onPress={handleConfirmAndPublish}
          disabled={loading || !listingData}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm & Publish</Text>
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
  reviewCard: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 16,
  },
  editButton: {
    padding: Spacing.xs,
  },
  cardContent: {
    // Content styles
  },
  previewRow: {
    marginBottom: Spacing.xs,
  },
  previewLabel: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 14,
  },
  previewValue: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  previewPrice: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  previewLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  previewLocation: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  previewCategory: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  paymentType: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 14,
  },
  paymentTotal: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 16,
  },
  regionName: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  regionDescription: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

