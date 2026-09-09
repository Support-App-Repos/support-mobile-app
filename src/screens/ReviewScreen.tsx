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
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  EditIcon,
  CardIcon,
} from '../components/common';
import {
  ListingWizardHeader,
  ListingStepProgress,
  ListingWizardFooter,
  PreviewListingCard,
  LISTING_FORM_STEPS,
} from '../components/listings/wizard';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { listingService } from '../services';
import { useProfile } from '../hooks';
import { resolveListingId } from '../utils/listingPhotos';

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

const FORM_STEPS = LISTING_FORM_STEPS;

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  navigation,
  route,
}) => {
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [loading, setLoading] = useState(false);
  const { profileImageUrl } = useProfile();

  const currentStep = 3; // Final step (Confirm)

  // Get data from route params
  const listingData = route?.params?.listingData;
  const paymentData = route?.params?.paymentData;
  const regionData = route?.params?.regionData;

  const handleBack = () => {
    navigation?.goBack();
  };

  const handleEditDetails = () => {
    const listingId = resolveListingId(listingData);
    if (!listingId) {
      Alert.alert('Error', 'Cannot edit this listing because its id is missing.');
      return;
    }

    const categoryName =
      listingData?.category?.name ||
      (typeof listingData?.category === 'string' ? listingData.category : '');
    const categorySlug =
      listingData?.category?.slug ||
      (typeof listingData?.category === 'string' ? listingData.category : '');
    const normalized = `${categoryName} ${categorySlug}`.toLowerCase();

    const params = {
      category: categoryName,
      categoryId: listingData?.category?.id || listingData?.categoryId,
      listingData: { ...listingData, id: listingId },
      paymentData,
      regionData,
    };

    if (normalized.includes('propert')) {
      navigation?.push('PropertyListing', params);
    } else if (normalized.includes('service')) {
      navigation?.push('ServiceListing', params);
    } else if (normalized.includes('event')) {
      navigation?.push('EventListing', params);
    } else {
      navigation?.push('ProductListing', params);
    }
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

      // Region already saved on Select Region confirm; keep update for edits / older flows
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

  const resolvePhotoUri = (photo: unknown): string | null => {
    if (!photo) return null;
    if (typeof photo === 'string' && photo.trim()) return photo.trim();
    if (typeof photo === 'object') {
      const p = photo as Record<string, unknown>;
      const candidate = p.photoUrl ?? p.url ?? p.uri;
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
    return null;
  };

  const previewImageUri =
    resolvePhotoUri(listingData?.photos?.[0]) ||
    resolvePhotoUri(listingData?.images?.[0]) ||
    resolvePhotoUri(
      Array.isArray(listingData?.photoUrls) ? listingData.photoUrls[0] : null
    );

  const categoryLabel =
    listingData?.category?.name ||
    (typeof listingData?.category === 'string' ? listingData.category : 'Category');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ListingWizardHeader
        title="Preview Listing"
        subtitle="This is how your listing will appear"
        profileImageUrl={profileImageUrl}
        onBack={handleBack}
        showBell={false}
        usePillControls
      />
      <ListingStepProgress currentStep={currentStep} steps={FORM_STEPS} numbered />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PreviewListingCard
          title={listingData?.title}
          categoryLabel={categoryLabel}
          price={listingData?.price}
          currency={listingData?.currency}
          priceType={listingData?.priceType}
          location={listingData?.location}
          imageUri={previewImageUri}
          showEdit
          onEdit={handleEditDetails}
        />

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
            {paymentData?.skipPayment ? (
              <>
                <View style={styles.paymentRow}>
                  <CardIcon size={22} />
                  <Text style={styles.paymentType}>
                    Active Subscription
                  </Text>
                </View>
              </>
            ) : (
              <>
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
              </>
            )}
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

      </ScrollView>

      <ListingWizardFooter
        label="Confirm & Publish"
        onPress={handleConfirmAndPublish}
        disabled={!listingData}
        loading={loading}
        showArrow={false}
      />

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'Home') {
            navigation?.navigate('Home');
          } else if (tab === 'Store') {
            navigation?.navigate('Store');
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

