/**
 * Event Listing Screen
 * First step of the multi-step listing creation form for Events
 */

import React, { useState } from 'react';
import { Snackbar } from '../components/common';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, BellIcon, AddPhotoIcon, PriceTypeDropdown, type PriceType } from '../components/common';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { listingService, paymentService, pickImages, uploadImages } from '../services';
import { useProfile } from '../hooks';

const { width } = Dimensions.get('window');

type EventListingScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      category?: string;
      categoryId?: string;
      eventType?: string;
      eventTypeId?: string;
    };
  };
};

const FORM_STEPS = ['Details', 'Payment', 'Select Region', 'Confirm'];

export const EventListingScreen: React.FC<EventListingScreenProps> = ({
  navigation,
  route,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceType, setPriceType] = useState<PriceType | null>(null);
  const [price, setPrice] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [duration, setDuration] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerContact, setOrganizerContact] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [tags, setTags] = useState('');
  const [photos, setPhotos] = useState<string[]>([]); // Store local URIs first
  const [photoUris, setPhotoUris] = useState<string[]>([]); // Store local URIs for upload
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'error' | 'success' | 'info'>('error');
  const { profileImageUrl } = useProfile();

  const currentStep = 0; // First step
  const categoryId = route?.params?.categoryId;
  const eventTypeId = route?.params?.eventTypeId;

  // Check if all required fields are filled
  const isFormValid = title.trim() !== '' && 
                      description.trim() !== '' && 
                      priceType !== null &&
                      (priceType === 'Free' || price.trim() !== '') &&
                      venue.trim() !== '' && 
                      city.trim() !== '' &&
                      organizerName.trim() !== '' &&
                      organizerContact.trim() !== '' &&
                      organizerEmail.trim() !== '' &&
                      photoUris.length > 0;

  const handleSaveAndContinue = async () => {
    if (!isFormValid) {
      Alert.alert('Validation Error', 'Please fill in all required fields and upload at least one photo');
      return;
    }

    if (!categoryId) {
      Alert.alert('Error', 'Category ID is missing');
      return;
    }

    try {
      setLoading(true);

      // Upload images first if any are selected
      let photoUrls: string[] = [];
      if (photoUris.length > 0) {
        try {
          const uploadedImages = await uploadImages(photoUris, 'listings/');
          photoUrls = uploadedImages.map((img) => img.url);
          setPhotos(photoUrls);
        } catch (uploadError: any) {
          console.error('Error uploading photos:', uploadError);
          Alert.alert('Upload Error', uploadError.message || 'Failed to upload photos. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Create listing on backend with uploaded photo URLs
      const response = await listingService.createListing({
        title: title.trim(),
        description: description.trim(),
        price: priceType === 'Free' ? 0 : parseFloat(price),
        priceType: priceType || 'Paid',
        location: venue.trim(),
        city: city.trim(),
        venue: venue.trim(),
        categoryId,
        eventTypeId: eventTypeId || undefined,
        eventDate: eventDate || undefined,
        eventTime: eventTime || undefined,
        duration: duration || undefined,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
        organizerName: organizerName.trim(),
        organizerContact: organizerContact.trim(),
        organizerEmail: organizerEmail.trim(),
        tags: tags || undefined,
        photos: photoUrls,
      });

      if (response.success) {
        const listingData = (response.data as any)?.data || response.data;
        
        // Check if user has a valid subscription
        try {
          const subscriptionCheck = await paymentService.checkSubscriptionValidity();
          const subscriptionData = (subscriptionCheck.data as any)?.data || subscriptionCheck.data;
          
          if (subscriptionData?.hasValidSubscription) {
            // User has valid subscription - skip payment and go directly to region selection
            navigation?.navigate('SelectRegion', {
              listingData,
              paymentData: {
                plan: 'monthly',
                subscription: subscriptionData.subscription,
                skipPayment: true, // Flag to indicate payment was skipped
              },
            });
          } else {
            // No valid subscription - proceed to payment screen
            navigation?.navigate('Payment', { listingData });
          }
        } catch (subscriptionError: any) {
          console.error('Error checking subscription:', subscriptionError);
          // If subscription check fails, default to payment screen
          navigation?.navigate('Payment', { listingData });
        }
      } else {
        throw new Error(response.message || 'Failed to create listing');
      }
    } catch (error: any) {
      console.error('Error creating listing:', error);
      // Show server error in snackbar
      setSnackbarMessage(error.message || 'Failed to create listing. Please try again.');
      setSnackbarType('error');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation?.goBack();
  };

  const handlePhotoUpload = async () => {
    try {
      if (photoUris.length >= 6) {
        Alert.alert('Limit Reached', 'You can upload a maximum of 6 photos.');
        return;
      }

      const selectedUris = await pickImages();

      if (selectedUris && selectedUris.length > 0) {
        const updatedUris = [...photoUris, ...selectedUris].slice(0, 6);
        setPhotoUris(updatedUris);
        setPhotos(updatedUris);
        setSnackbarMessage(`Added ${selectedUris.length} photo(s).`);
        setSnackbarType('success');
        setSnackbarVisible(true);
      }
    } catch (error: any) {
      console.error('Error picking photos:', error);
      Alert.alert('Error', error.message || 'Failed to select photos. Please try again.');
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
              source={{ uri: profileImageUrl || 'https://i.pravatar.cc/150?img=12' }}
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
          Add details about your {route?.params?.eventType?.toLowerCase() || 'event'} event.
        </Text>

        {/* Event Title Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Event Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Give your listing a great title."
            placeholderTextColor={Colors.light.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your event in detail..."
            placeholderTextColor={Colors.light.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Price Type and Price Row */}
        <View style={styles.rowContainer}>
          <View style={[styles.fieldContainer, styles.halfWidth]}>
            <Text style={styles.label}>
              Price Type <Text style={styles.required}>*</Text>
            </Text>
            <PriceTypeDropdown
              value={priceType}
              onSelect={setPriceType}
            />
          </View>
          <View style={[styles.fieldContainer, styles.halfWidth]}>
            <Text style={styles.label}>
              Price <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                (priceType === 'Free' || priceType === null) && styles.inputDisabled,
              ]}
              placeholder="0.00"
              placeholderTextColor={Colors.light.textSecondary}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              editable={priceType !== 'Free' && priceType !== null}
            />
          </View>
        </View>

        {/* Venue/Location and City Row */}
        <View style={styles.rowContainer}>
          <View style={[styles.fieldContainer, styles.halfWidth]}>
            <Text style={styles.label}>
              Venue/Location <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Venue name"
              placeholderTextColor={Colors.light.textSecondary}
              value={venue}
              onChangeText={setVenue}
            />
          </View>
          <View style={[styles.fieldContainer, styles.halfWidth]}>
            <Text style={styles.label}>
              City <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="City, State"
              placeholderTextColor={Colors.light.textSecondary}
              value={city}
              onChangeText={setCity}
            />
          </View>
        </View>

        {/* Event Date and Time Row */}
        <View style={styles.rowContainer}>
          <View style={[styles.fieldContainer, styles.halfWidth]}>
            <Text style={styles.label}>Event Date</Text>
            <TextInput
              style={styles.input}
              placeholder="mm/dd/yy"
              placeholderTextColor={Colors.light.textSecondary}
              value={eventDate}
              onChangeText={setEventDate}
            />
          </View>
          <View style={[styles.fieldContainer, styles.halfWidth]}>
            <Text style={styles.label}>Event Time</Text>
            <TextInput
              style={styles.input}
              placeholder="00:00:00"
              placeholderTextColor={Colors.light.textSecondary}
              value={eventTime}
              onChangeText={setEventTime}
            />
          </View>
        </View>

        {/* Duration and Max Capacity Row */}
        <View style={styles.rowContainer}>
          <View style={[styles.fieldContainer, styles.halfWidth]}>
            <Text style={styles.label}>Duration (hours)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g 2"
              placeholderTextColor={Colors.light.textSecondary}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.fieldContainer, styles.halfWidth]}>
            <Text style={styles.label}>Max Capacity</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g 50"
              placeholderTextColor={Colors.light.textSecondary}
              value={maxCapacity}
              onChangeText={setMaxCapacity}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Host/Organizer Details */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Host/Organizer details <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.marginBottom]}
            placeholder="Name *"
            placeholderTextColor={Colors.light.textSecondary}
            value={organizerName}
            onChangeText={setOrganizerName}
          />
          <TextInput
            style={[styles.input, styles.marginBottom]}
            placeholder="Contact *"
            placeholderTextColor={Colors.light.textSecondary}
            value={organizerContact}
            onChangeText={setOrganizerContact}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Email *"
            placeholderTextColor={Colors.light.textSecondary}
            value={organizerEmail}
            onChangeText={setOrganizerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Additional Tags */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Additional Tags</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g Networking, Training"
            placeholderTextColor={Colors.light.textSecondary}
            value={tags}
            onChangeText={setTags}
          />
        </View>

        {/* Photo Upload Section */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Photo <Text style={styles.required}>*</Text></Text>
          <View style={styles.photoSection}>
            <TouchableOpacity
              style={styles.photoIconButton}
              onPress={handlePhotoUpload}
              activeOpacity={0.7}
              disabled={photoUris.length >= 6 || loading}
            >
              <AddPhotoIcon size={57} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoUploadArea}
              onPress={handlePhotoUpload}
              activeOpacity={0.7}
              disabled={photoUris.length >= 6 || loading}
            >
              <Text style={styles.uploadText}>
                {photoUris.length >= 6
                  ? 'Maximum photos reached'
                  : 'Click to select photos'}
              </Text>
              <Text style={styles.uploadSubtext}>
                (SVG, PNG, JPG or GIF, max. 10MB per file)
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.photoHint}>
            {photoUris.length > 0
              ? `${photoUris.length}/6 photos selected (will upload on save)`
              : 'Add up to 6 photos'}
          </Text>
          {photoUris.length > 0 && (
            <View style={styles.photosPreview}>
              {photoUris.map((photoUri, index) => {
                // Ensure URI is properly formatted for React Native Image
                const imageUri = photoUri.startsWith('file://') || photoUri.startsWith('content://') || photoUri.startsWith('http')
                  ? photoUri
                  : `file://${photoUri}`;
                
                return (
                  <View key={`photo-${index}-${photoUri}`} style={styles.photoPreviewItem}>
                    <Image 
                      source={{ uri: imageUri }} 
                      style={styles.photoPreview}
                      onError={(error) => {
                        console.error(`[Image Preview] Error loading image ${index}:`, error.nativeEvent.error);
                      }}
                    />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => {
                        const updatedUris = photoUris.filter((_, i) => i !== index);
                        setPhotoUris(updatedUris);
                        setPhotos(updatedUris);
                      }}
                    >
                      <Text style={styles.removePhotoText}>×</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Save & Continue Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isFormValid || loading) && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveAndContinue}
          disabled={!isFormValid || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.saveButtonText,
                (!isFormValid || loading) && styles.saveButtonTextDisabled,
              ]}
            >
              Save & Continue
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
            // Show coming soon snackbar
            setSnackbarVisible(true);
            setSnackbarMessage('Coming soon feature');
            setSnackbarType('info');
          } else if (tab === 'Profile') {
            navigation?.navigate('Profile');
          }
        }}
        onCreatePress={() => {}}
        showCreateButton={false}
      />

      {/* Snackbar for messages */}
      <Snackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        type={snackbarType}
        onDismiss={() => setSnackbarVisible(false)}
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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
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
  inputDisabled: {
    backgroundColor: '#F9FAFB',
    color: Colors.light.textSecondary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.sm,
  },
  marginBottom: {
    marginBottom: Spacing.sm,
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
  photosPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  photoPreviewItem: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  saveButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  saveButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

