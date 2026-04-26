/**
 * Property Listing Screen — step 1 (Details) for Properties only
 */

import React, { useState, useEffect } from 'react';
import { Snackbar } from '../components/common';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, BellIcon, AddPhotoIcon, Checkbox, GoogleLocationField } from '../components/common';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { listingService, paymentService, pickImages, uploadImages } from '../services';
import { useProfile } from '../hooks';
import { filterNumbersOnly } from '../utils/validation';
import { PROPERTY_AMENITIES, serializeAmenityIds } from '../constants/propertyAmenities';

type PropertyListingScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      categoryId?: string;
    };
  };
};

const FORM_STEPS = ['Details', 'Payment', 'Select Region', 'Confirm'];

const PURPOSE_OPTIONS = ['For Rent', 'For Sale'];
const CURRENCY_OPTIONS = ['AED', 'USD', 'EUR'];
const FURNISHING_OPTIONS = ['Furnished', 'Unfurnished', 'Semi-Furnished'];
const PROPERTY_TYPE_OPTIONS = [
  'Apartment',
  'Villa',
  'Townhouse',
  'Penthouse',
  'Studio',
  'Room',
];
const OWNERSHIP_OPTIONS = ['Freehold', 'Leasehold'];
const USAGE_OPTIONS = ['Residential', 'Commercial', 'Mixed'];

type FormSelectProps = {
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  options: string[];
  onSelect: (v: string) => void;
};

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  required,
  value,
  placeholder,
  options,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldFlex}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <TouchableOpacity style={styles.selectTrigger} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={[styles.selectText, !value && styles.selectPlaceholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Text style={styles.selectChevron}>▼</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>{label || 'Select'}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalRow, value === item && styles.modalRowActive]}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.modalRowText, value === item && styles.modalRowTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export const PropertyListingScreen: React.FC<PropertyListingScreenProps> = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [squareFeet, setSquareFeet] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [furnishing, setFurnishing] = useState('');
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [amenitiesModalOpen, setAmenitiesModalOpen] = useState(false);
  const [additionalTags, setAdditionalTags] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [ownership, setOwnership] = useState('');
  const [builtUpArea, setBuiltUpArea] = useState('');
  const [usage, setUsage] = useState('');
  const [balconySize, setBalconySize] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'error' | 'success' | 'info'>('error');
  const { profileImageUrl } = useProfile();

  const currentStep = 0;
  const categoryId = route?.params?.categoryId;
  const isForSale = purpose === 'For Sale';

  // Prefill form when editing from Review/Region flow
  useEffect(() => {
    const incoming = (route?.params as any)?.listingData || route?.params;
    if (!incoming) return;

    if (incoming.title != null) setTitle(String(incoming.title));
    if (incoming.propertyPurpose != null) setPurpose(String(incoming.propertyPurpose));
    if (incoming.price != null) setPrice(String(incoming.price));
    if (incoming.currency != null) setCurrency(String(incoming.currency));
    if (incoming.location != null) setLocation(String(incoming.location));
    if (incoming.city != null) setCity(String(incoming.city));
    if (incoming.bedrooms != null) setBedrooms(String(incoming.bedrooms));
    if (incoming.bathrooms != null) setBathrooms(String(incoming.bathrooms));
    if (incoming.squareFeet != null) setSquareFeet(String(incoming.squareFeet));
    if (incoming.referenceNo != null) setReferenceNo(String(incoming.referenceNo));
    if (incoming.furnishing != null) setFurnishing(String(incoming.furnishing));
    if (incoming.additionalTags != null) setAdditionalTags(String(incoming.additionalTags));
    if (incoming.propertyType != null) setPropertyType(String(incoming.propertyType));
    if (incoming.ownership != null) setOwnership(String(incoming.ownership));
    if (incoming.builtUpArea != null) setBuiltUpArea(String(incoming.builtUpArea));
    if (incoming.propertyUsage != null) setUsage(String(incoming.propertyUsage));
    if (incoming.balconySize != null) setBalconySize(String(incoming.balconySize));

    if (incoming.amenities != null && selectedAmenityIds.length === 0) {
      // amenities is stored as comma-separated or array of ids
      const raw = incoming.amenities;
      const ids = Array.isArray(raw)
        ? raw.map(String)
        : String(raw)
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
      setSelectedAmenityIds(ids);
    }

    if (Array.isArray(incoming.photos) && incoming.photos.length > 0 && photoUris.length === 0) {
      // For editing we keep existing URLs in preview
      const urls = incoming.photos
        .map((p: any) => (typeof p === 'string' ? p : p?.photoUrl || p?.url))
        .filter(Boolean);
      setPhotos(urls);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (purpose === 'For Rent') {
      setOwnership('');
    }
  }, [purpose]);

  const hasDetailText = selectedAmenityIds.length > 0 || additionalTags.trim() !== '';

  const isFormValid =
    title.trim() !== '' &&
    purpose.trim() !== '' &&
    price.trim() !== '' &&
    currency.trim() !== '' &&
    location.trim() !== '' &&
    city.trim() !== '' &&
    hasDetailText &&
    photoUris.length > 0;

  const handleSaveAndContinue = async () => {
    if (!isFormValid) {
      Alert.alert(
        'Validation',
        'Please complete required fields, add amenities or additional tags, and upload at least one photo.',
      );
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Category ID is missing');
      return;
    }

    try {
      setLoading(true);
      let photoUrls: string[] = [];
      if (photoUris.length > 0) {
        try {
          const uploadedImages = await uploadImages(photoUris, 'listings/');
          photoUrls = uploadedImages.map((img) => img.url);
          setPhotos(photoUrls);
        } catch (uploadError: any) {
          Alert.alert('Upload Error', uploadError.message || 'Failed to upload photos.');
          setLoading(false);
          return;
        }
      }

      const parsedPrice = parseFloat(filterNumbersOnly(price, true));
      if (Number.isNaN(parsedPrice)) {
        Alert.alert('Validation', 'Enter a valid price.');
        setLoading(false);
        return;
      }

      const response = await listingService.createListing({
        title: title.trim(),
        description: '',
        price: parsedPrice,
        priceType: 'Paid',
        location: location.trim(),
        city: city.trim(),
        categoryId,
        bedrooms: bedrooms ? parseInt(bedrooms.replace(/\D/g, ''), 10) || undefined : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms.replace(/\D/g, ''), 10) || undefined : undefined,
        squareFeet: squareFeet ? parseInt(squareFeet.replace(/\D/g, ''), 10) || undefined : undefined,
        propertyPurpose: purpose.trim(),
        currency: currency.trim(),
        referenceNo: referenceNo.trim() || undefined,
        furnishing: furnishing.trim() || undefined,
        amenities: serializeAmenityIds(selectedAmenityIds),
        additionalTags: additionalTags.trim(),
        propertyType: propertyType.trim() || undefined,
        ownership: isForSale && ownership.trim() ? ownership.trim() : undefined,
        builtUpArea: builtUpArea.trim() || undefined,
        propertyUsage: usage.trim() || undefined,
        balconySize: balconySize.trim() || undefined,
        photos: photoUrls,
      });

      if (response.success) {
        const listingData = (response.data as any)?.data || response.data;
        try {
          const subscriptionCheck = await paymentService.checkSubscriptionValidity();
          const subscriptionData = (subscriptionCheck.data as any)?.data || subscriptionCheck.data;
          if (subscriptionData?.hasValidSubscription) {
            navigation?.navigate('SelectRegion', {
              listingData,
              paymentData: {
                plan: 'monthly',
                subscription: subscriptionData.subscription,
                skipPayment: true,
              },
            });
          } else {
            navigation?.navigate('Payment', { listingData });
          }
        } catch {
          navigation?.navigate('Payment', { listingData });
        }
      } else {
        throw new Error(response.message || 'Failed to create listing');
      }
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Failed to create listing.');
      setSnackbarType('error');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    try {
      if (photoUris.length >= 6) {
        Alert.alert('Limit', 'You can upload up to 6 photos.');
        return;
      }
      const selectedUris = await pickImages();
      if (selectedUris?.length) {
        const updated = [...photoUris, ...selectedUris].slice(0, 6);
        setPhotoUris(updated);
        setPhotos(updated);
        setSnackbarMessage(`Added ${selectedUris.length} photo(s).`);
        setSnackbarType('success');
        setSnackbarVisible(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not select photos.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
          <BackIcon size={24} color="#030303" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <BellIcon size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.7}
            onPress={() => navigation?.navigate('Profile')}
          >
            <Image
              source={{ uri: profileImageUrl || 'https://i.pravatar.cc/150?img=12' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.titleText}>Listing Details</Text>
      </View>

      <View style={styles.progressContainer}>
        {FORM_STEPS.map((step, index) => (
          <View key={step} style={styles.progressStepContainer}>
            <View style={styles.progressCircleWrapper}>
              <View
                style={[
                  styles.progressCircle,
                  index === currentStep && styles.progressCircleActive,
                  index < currentStep && styles.progressCircleCompleted,
                ]}
              >
                {index === currentStep ? (
                  <View style={styles.progressDotActive} />
                ) : index < currentStep ? (
                  <View style={styles.progressDotCompleted} />
                ) : (
                  <View style={styles.progressDotInactive} />
                )}
              </View>
              {index < FORM_STEPS.length - 1 && (
                <View style={[styles.progressLine, index < currentStep && styles.progressLineActive]} />
              )}
            </View>
            <Text style={styles.progressLabel}>{step}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.introText}>Add details about your property listing</Text>

        <View style={styles.row}>
          <View style={styles.fieldFlex}>
            <Text style={styles.label}>
              Listing Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Give your listing a great title"
              placeholderTextColor={Colors.light.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>
          <FormSelect
            label="Purpose"
            required
            value={purpose}
            placeholder="Select"
            options={PURPOSE_OPTIONS}
            onSelect={setPurpose}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.fieldFlex}>
            <Text style={styles.label}>
              Price <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g 2,000,000"
              placeholderTextColor={Colors.light.textSecondary}
              value={price}
              onChangeText={(t) => setPrice(filterNumbersOnly(t, true))}
              keyboardType="decimal-pad"
            />
          </View>
          <FormSelect
            label="Currency"
            required
            value={currency}
            placeholder="AED"
            options={CURRENCY_OPTIONS}
            onSelect={setCurrency}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.fieldFlex}>
            <Text style={styles.label}>
              Location <Text style={styles.required}>*</Text>
            </Text>
            <GoogleLocationField
              label=""
              required
              value={location}
              placeholder="Search location"
              onSelect={({ location: loc, city: c }) => {
                setLocation(loc);
                if (c) setCity(c);
              }}
            />
          </View>
          <View style={styles.fieldFlex}>
            <Text style={styles.label}>
              City <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g Dubai, UAE"
              placeholderTextColor={Colors.light.textSecondary}
              value={city}
              onChangeText={setCity}
            />
          </View>
        </View>

        <View style={styles.rowTriple}>
          <View style={styles.fieldFlex}>
            <Text style={styles.label}>Bedrooms</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g 2"
              placeholderTextColor={Colors.light.textSecondary}
              value={bedrooms}
              onChangeText={(t) => setBedrooms(t.replace(/\D/g, ''))}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.fieldFlex}>
            <Text style={styles.label}>Bathrooms</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g 3"
              placeholderTextColor={Colors.light.textSecondary}
              value={bathrooms}
              onChangeText={(t) => setBathrooms(t.replace(/\D/g, ''))}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.fieldFlex}>
            <Text style={styles.label}>Area (sqft)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g 1588"
              placeholderTextColor={Colors.light.textSecondary}
              value={squareFeet}
              onChangeText={(t) => setSquareFeet(t.replace(/\D/g, ''))}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.fieldFlex}>
            <Text style={styles.label}>Reference No.</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g NABN- GQ5678"
              placeholderTextColor={Colors.light.textSecondary}
              value={referenceNo}
              onChangeText={setReferenceNo}
            />
          </View>
          <FormSelect
            label="Furnishing"
            value={furnishing}
            placeholder="Select"
            options={FURNISHING_OPTIONS}
            onSelect={setFurnishing}
          />
        </View>

        <View style={styles.fieldBlock}>
          <FormSelect
            label="Property type"
            value={propertyType}
            placeholder="e.g Apartment"
            options={PROPERTY_TYPE_OPTIONS}
            onSelect={setPropertyType}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>
            Amenities <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.selectTrigger}
            onPress={() => setAmenitiesModalOpen(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.selectText, selectedAmenityIds.length === 0 && styles.selectPlaceholder]}
              numberOfLines={2}
            >
              {selectedAmenityIds.length === 0
                ? 'Select amenities'
                : `${selectedAmenityIds.length} selected — ${PROPERTY_AMENITIES.filter((a) =>
                    selectedAmenityIds.includes(a.id),
                  )
                    .map((a) => a.label)
                    .join(', ')}`}
            </Text>
            <Text style={styles.selectChevron}>▼</Text>
          </TouchableOpacity>
          <Modal
            visible={amenitiesModalOpen}
            transparent
            animationType="slide"
            onRequestClose={() => setAmenitiesModalOpen(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setAmenitiesModalOpen(false)}
            >
              <View style={styles.amenitiesModalSheet} onStartShouldSetResponder={() => true}>
                <Text style={styles.modalTitle}>Amenities</Text>
                <FlatList
                  data={[...PROPERTY_AMENITIES]}
                  keyExtractor={(item) => item.id}
                  style={styles.amenitiesModalList}
                  renderItem={({ item }) => (
                    <Checkbox
                      checked={selectedAmenityIds.includes(item.id)}
                      onToggle={(checked) => {
                        setSelectedAmenityIds((prev) =>
                          checked
                            ? prev.includes(item.id)
                              ? prev
                              : [...prev, item.id]
                            : prev.filter((id) => id !== item.id),
                        );
                      }}
                      label={item.label}
                      containerStyle={styles.amenityCheckboxRow}
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.amenitiesDoneButton}
                  onPress={() => setAmenitiesModalOpen(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.amenitiesDoneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>
            Additional Tags <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g Luxury, Sea view, New"
            placeholderTextColor={Colors.light.textSecondary}
            value={additionalTags}
            onChangeText={setAdditionalTags}
            multiline
          />
        </View>

        <Text style={styles.optionalSectionTitle}>Validated details (optional)</Text>
        <Text style={styles.optionalHint}>
          {!purpose.trim()
            ? 'Ownership only appears when purpose is “For Sale”. For rent you will not see it and can still submit with photos.'
            : isForSale
              ? 'Ownership (freehold / leasehold) is optional and only used for sale listings.'
              : 'For “For Rent”, ownership is hidden — you can still save and upload photos without it.'}
        </Text>
        {isForSale ? (
          <View style={styles.row}>
            <FormSelect
              label="Ownership"
              value={ownership}
              placeholder="Select (optional)"
              options={OWNERSHIP_OPTIONS}
              onSelect={setOwnership}
            />
            <View style={styles.fieldFlex}>
              <Text style={styles.label}>Built-up area</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g 864 sqft"
                placeholderTextColor={Colors.light.textSecondary}
                value={builtUpArea}
                onChangeText={setBuiltUpArea}
              />
            </View>
          </View>
        ) : (
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Built-up area</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g 864 sqft"
              placeholderTextColor={Colors.light.textSecondary}
              value={builtUpArea}
              onChangeText={setBuiltUpArea}
            />
          </View>
        )}
        <View style={styles.row}>
          <FormSelect label="Usage" value={usage} placeholder="Select" options={USAGE_OPTIONS} onSelect={setUsage} />
          <View style={styles.fieldFlex}>
            <Text style={styles.label}>Balcony size</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g 132 sqft"
              placeholderTextColor={Colors.light.textSecondary}
              value={balconySize}
              onChangeText={setBalconySize}
            />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>
            Photo <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.photoSection}>
            <TouchableOpacity
              style={styles.photoIconButton}
              onPress={handlePhotoUpload}
              disabled={photoUris.length >= 6 || loading}
            >
              <AddPhotoIcon size={57} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoUploadArea}
              onPress={handlePhotoUpload}
              disabled={photoUris.length >= 6 || loading}
            >
              <Text style={styles.uploadText}>
                {photoUris.length >= 6 ? 'Maximum photos reached' : 'Click to upload'}
              </Text>
              <Text style={styles.uploadSubtext}>SVG, PNG, JPG or GIF (max. 800×400px)</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.photoHint}>Add upto 6 photos</Text>
          {photoUris.length > 0 && (
            <View style={styles.photosPreview}>
              {photoUris.map((uri, index) => {
                const imageUri =
                  uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('http')
                    ? uri
                    : `file://${uri}`;
                return (
                  <View key={`${uri}-${index}`} style={styles.photoPreviewItem}>
                    <Image source={{ uri: imageUri }} style={styles.photoPreview} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => {
                        const next = photoUris.filter((_, i) => i !== index);
                        setPhotoUris(next);
                        setPhotos(next);
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

        <TouchableOpacity
          style={[styles.saveButton, (!isFormValid || loading) && styles.saveButtonDisabled]}
          onPress={handleSaveAndContinue}
          disabled={!isFormValid || loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save & Continue</Text>}
        </TouchableOpacity>
      </ScrollView>

      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'Home') navigation?.navigate('Home');
          else if (tab === 'MyListings') navigation?.navigate('MyListings');
          else if (tab === 'Messages') {
            setSnackbarMessage('Coming soon feature');
            setSnackbarType('info');
            setSnackbarVisible(true);
          } else if (tab === 'Profile') navigation?.navigate('Profile');
        }}
        onCreatePress={() => {}}
        showCreateButton={false}
      />

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
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: { padding: Spacing.xs, marginLeft: -Spacing.xs },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconButton: { padding: Spacing.xs },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  profileImage: { width: '100%', height: '100%' },
  titleSection: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  titleText: { ...Typography.h2, color: Colors.light.text, fontWeight: '700', fontSize: 18 },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  progressStepContainer: { flex: 1, alignItems: 'center' },
  progressCircleWrapper: {
    width: '100%',
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  progressCircleActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderColor: Colors.light.primary,
  },
  progressCircleCompleted: { borderColor: Colors.light.primary, backgroundColor: Colors.light.primary },
  progressDotActive: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.light.primary },
  progressDotCompleted: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' },
  progressDotInactive: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' },
  progressLabel: { ...Typography.caption, color: '#374151', fontSize: 11, marginTop: Spacing.xs, textAlign: 'center' },
  progressLine: {
    position: 'absolute',
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E5E7EB',
    top: 13,
    zIndex: 0,
  },
  progressLineActive: { backgroundColor: Colors.light.primary },
  scrollView: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  introText: { ...Typography.body, color: Colors.light.textSecondary, marginBottom: Spacing.lg, fontSize: 14 },
  row: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  rowTriple: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  fieldFlex: { flex: 1, minWidth: 0 },
  fieldBlock: { marginBottom: Spacing.lg },
  optionalSectionTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    fontSize: 14,
  },
  optionalHint: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.md,
  },
  label: { ...Typography.body, color: Colors.light.text, fontWeight: '500', marginBottom: Spacing.xs, fontSize: 14 },
  required: { color: '#EF4444' },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.light.text,
  },
  textArea: { minHeight: 72, paddingTop: Spacing.sm, textAlignVertical: 'top' },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  selectText: { flex: 1, fontSize: 14, color: Colors.light.text },
  selectPlaceholder: { color: Colors.light.textSecondary },
  selectChevron: { fontSize: 10, color: Colors.light.textSecondary },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '55%',
    paddingBottom: Spacing.lg,
  },
  amenitiesModalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '78%',
    paddingBottom: Spacing.lg,
  },
  amenitiesModalList: { maxHeight: 420 },
  amenityCheckboxRow: { marginBottom: Spacing.sm, paddingHorizontal: Spacing.md },
  amenitiesDoneButton: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  amenitiesDoneButtonText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
  modalTitle: {
    ...Typography.h3,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalRow: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.md },
  modalRowActive: { backgroundColor: '#F3F4F6' },
  modalRowText: { fontSize: 16, color: Colors.light.text },
  modalRowTextActive: { fontWeight: '600', color: Colors.light.primary },
  photoSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.xs },
  photoIconButton: {},
  photoUploadArea: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 120,
  },
  uploadText: { ...Typography.body, color: Colors.light.primary, fontWeight: '500', marginBottom: Spacing.xs, fontSize: 14 },
  uploadSubtext: { ...Typography.caption, color: Colors.light.textSecondary, fontSize: 12, textAlign: 'center' },
  photoHint: { ...Typography.caption, color: Colors.light.textSecondary, marginTop: Spacing.xs, fontSize: 12 },
  photosPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  photoPreviewItem: { width: 100, height: 100, borderRadius: BorderRadius.md, overflow: 'hidden' },
  photoPreview: { width: '100%', height: '100%' },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  saveButtonDisabled: { backgroundColor: '#E5E7EB' },
  saveButtonText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});
