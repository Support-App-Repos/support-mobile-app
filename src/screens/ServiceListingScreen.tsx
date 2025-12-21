/**
 * Service Listing Screen
 * First step of the multi-step listing creation form for Services
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, BellIcon, AddPhotoIcon } from '../components/common';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { listingService } from '../services';

type ServiceListingScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      category?: string;
      serviceType?: string;
    };
  };
};

const FORM_STEPS = ['Details', 'Payment', 'Select Region', 'Confirm'];

export const ServiceListingScreen: React.FC<ServiceListingScreenProps> = ({
  navigation,
  route,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [loading, setLoading] = useState(false);

  const currentStep = 0; // First step
  const categoryId = route?.params?.categoryId;
  const serviceTypeId = route?.params?.serviceTypeId;

  // Check if all required fields are filled
  const isFormValid =
    businessName.trim() !== '' && serviceDescription.trim() !== '';

  const handleContinue = async () => {
    if (!isFormValid) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (!categoryId) {
      Alert.alert('Error', 'Category ID is missing');
      return;
    }

    try {
      setLoading(true);

      // Create listing on backend
      const response = await listingService.createListing({
        title: businessName.trim(),
        description: serviceDescription.trim(),
        location: businessName.trim() || 'Service Location', // Use business name as location fallback
        categoryId,
        serviceTypeId: serviceTypeId || undefined,
        businessName: businessName.trim(),
        specialization: specialization || undefined,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined,
        photos: photos.length > 0 ? photos : undefined,
      });

      if (response.success) {
        const listingData = (response.data as any)?.data || response.data;
        navigation?.navigate('Payment', { listingData });
      } else {
        throw new Error(response.message || 'Failed to create listing');
      }
    } catch (error: any) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', error.message || 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation?.goBack();
  };

  const handlePhotoUpload = () => {
    // TODO: Implement photo upload functionality
    console.log('Photo upload pressed');
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
        <Text style={styles.titleText}>Listing Details</Text>
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
                  {index === currentStep && (
                    <View style={styles.progressDotActive} />
                  )}
                  {index < currentStep && (
                    <View style={styles.progressDotCompleted} />
                  )}
                  {index > currentStep && (
                    <View style={styles.progressDotInactive} />
                  )}
                </View>
                {index < FORM_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.progressLine,
                      index <= currentStep && styles.progressLineActive,
                    ]}
                  />
                )}
              </View>
              <Text style={styles.progressLabel}>{step}</Text>
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
          Add details about your business.
        </Text>

        {/* Business Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Business Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your business name"
            placeholderTextColor={Colors.light.textSecondary}
            value={businessName}
            onChangeText={setBusinessName}
          />
        </View>

        {/* Service Description Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Service Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your service in detail..."
            placeholderTextColor={Colors.light.textSecondary}
            value={serviceDescription}
            onChangeText={setServiceDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Specialization Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Specialization</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g manicure, nails"
            placeholderTextColor={Colors.light.textSecondary}
            value={specialization}
            onChangeText={setSpecialization}
          />
        </View>

        {/* Years of Experience Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Years of Experience</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g 03"
            placeholderTextColor={Colors.light.textSecondary}
            value={yearsOfExperience}
            onChangeText={setYearsOfExperience}
            keyboardType="numeric"
          />
        </View>

        {/* Photo Upload Section */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Photo</Text>
          <View style={styles.photoSection}>
            <TouchableOpacity
              style={styles.photoIconButton}
              onPress={handlePhotoUpload}
              activeOpacity={0.7}
            >
              <AddPhotoIcon size={57} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoUploadArea}
              onPress={handlePhotoUpload}
              activeOpacity={0.7}
            >
              <Text style={styles.uploadText}>
                Click to upload or drag and drop
              </Text>
              <Text style={styles.uploadSubtext}>
                SVG, PNG, JPG or GIF (max. 800x400px)
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.photoHint}>Add upto 6 photos</Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!isFormValid || loading) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isFormValid || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.continueButtonText,
                (!isFormValid || loading) && styles.continueButtonTextDisabled,
              ]}
            >
              Continue
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
  progressDotCompleted: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
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
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.body,
    color: Colors.light.text,
    fontWeight: '500',
    marginBottom: Spacing.xs,
    fontSize: 14,
  },
  required: {
    color: '#EF4444',
  },
  input: {
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
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.sm,
  },
  photoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  photoIconButton: {
    // Icon handles its own styling
  },
  photoUploadArea: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  uploadText: {
    ...Typography.body,
    color: Colors.light.primary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
    fontSize: 14,
  },
  uploadSubtext: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  photoHint: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
    fontSize: 12,
  },
  continueButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  continueButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  continueButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  continueButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

