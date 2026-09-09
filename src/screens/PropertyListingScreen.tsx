/**
 * Property Listing Screen — step 1 (Details)
 * Figma: properting details (node 1055:1469)
 */

import React, { useState, useEffect } from 'react';
import { Snackbar } from '../components/common';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleLocationField, FormSelect } from '../components/common';
import {
  ListingWizardHeader,
  ListingStepProgress,
  ListingFormSection,
  ListingFormField,
  ListingPhotoUpload,
  ListingWizardFooter,
  LISTING_FORM_STEPS,
  listingWizardInputStyles,
  androidInputProps as wizardAndroidInputProps,
} from '../components/listings/wizard';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, BorderRadius } from '../config/theme';
import { listingService, paymentService, pickImages, type PickedImage } from '../services';
import { resolveListingPhotoUrls, resolveListingId } from '../utils/listingPhotos';
import { useProfile } from '../hooks';
import { filterNumbersOnly } from '../utils/validation';

type PropertyListingScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      categoryId?: string;
    };
  };
};

const MP = Colors.light.marketplace;
const FORM_STEPS = LISTING_FORM_STEPS;
const inputStyles = listingWizardInputStyles;

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

type IconInputProps = {
  icon?: string;
  prefix?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  numericOnly?: boolean;
};

const IconInput: React.FC<IconInputProps> = ({
  icon,
  prefix,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  numericOnly = false,
}) => (
  <View style={styles.iconInputWrap}>
    {icon ? <Text style={styles.fieldIcon}>{icon}</Text> : null}
    {prefix ? <Text style={styles.pricePrefix}>{prefix}</Text> : null}
    <TextInput
      style={styles.iconInput}
      placeholder={placeholder}
      placeholderTextColor="rgba(153,153,153,0.5)"
      value={value}
      onChangeText={(t) => onChangeText(numericOnly ? t.replace(/\D/g, '') : t)}
      keyboardType={keyboardType}
      {...wizardAndroidInputProps}
    />
  </View>
);

function buildPropertyDescription(params: {
  title: string;
  purpose: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  furnishing: string;
  city: string;
}): string {
  const parts = [
    params.purpose,
    params.propertyType,
    params.bedrooms ? `${params.bedrooms} bed` : '',
    params.bathrooms ? `${params.bathrooms} bath` : '',
    params.squareFeet ? `${params.squareFeet} sqft` : '',
    params.furnishing,
    params.city,
  ].filter(Boolean);
  return parts.join(' · ') || params.title;
}

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
  const [propertyType, setPropertyType] = useState('');
  const [, setPhotos] = useState<string[]>([]);
  const [photoUris, setPhotoUris] = useState<PickedImage[]>([]);
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'error' | 'success' | 'info'>('error');
  const [listingId, setListingId] = useState<string | null>(
    resolveListingId((route?.params as any)?.listingData),
  );
  const { profileImageUrl } = useProfile();

  const currentStep = 0;
  const categoryId =
    route?.params?.categoryId ||
    (route?.params as any)?.listingData?.category?.id ||
    (route?.params as any)?.listingData?.categoryId;

  useEffect(() => {
    const incoming = (route?.params as any)?.listingData || route?.params;
    if (!incoming) return;

    const incomingId = resolveListingId(incoming);
    if (incomingId) setListingId(incomingId);

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
    if (incoming.propertyType != null) setPropertyType(String(incoming.propertyType));

    if (Array.isArray(incoming.photos) && incoming.photos.length > 0 && photoUris.length === 0) {
      const urls = incoming.photos
        .map((p: any) => (typeof p === 'string' ? p : p?.photoUrl || p?.url))
        .filter(Boolean) as string[];
      setPhotos(urls);
      setPhotoUris(urls.map((uri) => ({ uri })));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFormValid =
    title.trim() !== '' &&
    purpose.trim() !== '' &&
    price.trim() !== '' &&
    currency.trim() !== '' &&
    location.trim() !== '' &&
    city.trim() !== '' &&
    photoUris.length > 0;

  const navigateAfterSave = async (listingData: any) => {
    const existingPayment = (route?.params as any)?.paymentData;
    const existingRegion = (route?.params as any)?.regionData;
    if (existingPayment && existingRegion) {
      navigation?.navigate('Review', {
        listingData,
        paymentData: existingPayment,
        regionData: existingRegion,
      });
      return;
    }
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
  };

  const handleSaveAndContinue = async () => {
    if (!isFormValid) {
      Alert.alert('Validation', 'Please complete all required fields and upload at least one photo.');
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
          photoUrls = await resolveListingPhotoUrls(photoUris, 'listings/');
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

      const description = buildPropertyDescription({
        title: title.trim(),
        purpose: purpose.trim(),
        propertyType: propertyType.trim(),
        bedrooms,
        bathrooms,
        squareFeet,
        furnishing: furnishing.trim(),
        city: city.trim(),
      });

      const additionalTags = [propertyType.trim(), furnishing.trim()].filter(Boolean).join(', ');

      const payload = {
        title: title.trim(),
        description,
        price: parsedPrice,
        priceType: 'Paid' as const,
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
        additionalTags: additionalTags || undefined,
        propertyType: propertyType.trim() || undefined,
        photos: photoUrls,
      };

      const response = listingId
        ? await listingService.updateListing(listingId, payload)
        : await listingService.createListing(payload);

      if (response.success) {
        const listingData = (response.data as any)?.data || response.data;
        const savedId = resolveListingId(listingData);
        if (savedId) setListingId(savedId);
        await navigateAfterSave(listingData);
      } else {
        throw new Error(response.message || 'Failed to save listing');
      }
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Failed to save listing.');
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
      const selected = await pickImages();
      if (selected?.length) {
        const updated = [...photoUris, ...selected].slice(0, 6);
        setPhotoUris(updated);
        setPhotos(updated.map((p) => p.uri));
        setSnackbarMessage(`Added ${selected.length} photo(s).`);
        setSnackbarType('success');
        setSnackbarVisible(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not select photos.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBand}>
        <ListingWizardHeader
          title="Listing Details"
          subtitle="Add details about your property listing"
          profileImageUrl={profileImageUrl}
          onBack={() => navigation?.goBack()}
          showBell
          usePillControls
        />
        <ListingStepProgress
          currentStep={currentStep}
          steps={FORM_STEPS}
          numbered
          activeColor={MP.primary}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ListingFormSection title="Basic Information" variant="card">
          <View style={inputStyles.row}>
            <View style={styles.fieldFlex}>
              <ListingFormField label="Listing Title" required>
                <IconInput
                  icon="🏠"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Modern Downtown Apartment"
                />
              </ListingFormField>
            </View>
            <FormSelect
              label="Purpose"
              required
              value={purpose}
              placeholder="Select purpose"
              options={PURPOSE_OPTIONS}
              onSelect={setPurpose}
            />
          </View>

          <View style={inputStyles.row}>
            <View style={styles.fieldFlex}>
              <ListingFormField label="Price">
                <IconInput
                  prefix="$"
                  value={price}
                  onChangeText={(t) => setPrice(filterNumbersOnly(t, true))}
                  placeholder="e.g. 2,000,000"
                  keyboardType="decimal-pad"
                />
              </ListingFormField>
            </View>
            <FormSelect
              label="Currency"
              value={currency}
              placeholder="AED"
              options={CURRENCY_OPTIONS}
              onSelect={setCurrency}
              leadingIcon="💱"
            />
          </View>
        </ListingFormSection>

        <ListingFormSection title="Location" variant="card">
          <View style={inputStyles.row}>
            <View style={styles.fieldFlex}>
              <ListingFormField label="Location">
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
              </ListingFormField>
            </View>
            <View style={styles.fieldFlex}>
              <ListingFormField label="City">
                <IconInput
                  icon="🏙️"
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Dubai, UAE"
                />
              </ListingFormField>
            </View>
          </View>
        </ListingFormSection>

        <ListingFormSection title="Property Details" variant="card">
          <View style={styles.rowTriple}>
            <View style={styles.fieldThird}>
              <ListingFormField label="Bedrooms">
                <IconInput
                  icon="🛏"
                  value={bedrooms}
                  onChangeText={setBedrooms}
                  placeholder="e.g. 2"
                  keyboardType="number-pad"
                  numericOnly
                />
              </ListingFormField>
            </View>
            <View style={styles.fieldThird}>
              <ListingFormField label="Bathrooms">
                <IconInput
                  icon="🛁"
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  placeholder="e.g. 1"
                  keyboardType="number-pad"
                  numericOnly
                />
              </ListingFormField>
            </View>
            <View style={styles.fieldThird}>
              <ListingFormField label="Area (sqft)">
                <IconInput
                  value={squareFeet}
                  onChangeText={setSquareFeet}
                  placeholder="e.g. 1500"
                  keyboardType="number-pad"
                  numericOnly
                />
              </ListingFormField>
            </View>
          </View>

          <View style={inputStyles.row}>
            <View style={styles.fieldFlex}>
              <ListingFormField label="Reference No.">
                <IconInput
                  value={referenceNo}
                  onChangeText={setReferenceNo}
                  placeholder="e.g. NABR-G00A-78"
                />
              </ListingFormField>
            </View>
            <FormSelect
              label="Furnishing"
              value={furnishing}
              placeholder="Select furnishing"
              options={FURNISHING_OPTIONS}
              onSelect={setFurnishing}
            />
          </View>

          <FormSelect
            label="Property Type"
            value={propertyType}
            placeholder="Select property type"
            options={PROPERTY_TYPE_OPTIONS}
            onSelect={setPropertyType}
          />
        </ListingFormSection>

        <ListingPhotoUpload
          photos={photoUris.map((p) => ({ uri: p.uri }))}
          onAdd={handlePhotoUpload}
          onRemove={(index) => {
            const next = photoUris.filter((_, i) => i !== index);
            setPhotoUris(next);
            setPhotos(next.map((p) => p.uri));
          }}
          uploading={loading}
        />
      </ScrollView>

      <ListingWizardFooter
        label="Save & Continue"
        onPress={handleSaveAndContinue}
        disabled={!isFormValid}
        loading={loading}
        showArrow={false}
      />

      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'Home') navigation?.navigate('Home');
          else if (tab === 'Store') navigation?.navigate('Store');
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
  container: {
    flex: 1,
    backgroundColor: MP.screenSurface,
  },
  headerBand: {
    backgroundColor: Colors.light.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
    paddingBottom: Spacing.sm,
  },
  scrollView: { flex: 1 },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  fieldFlex: { flex: 1, minWidth: 0 },
  fieldThird: { flex: 1, minWidth: 0 },
  rowTriple: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  iconInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  fieldIcon: {
    fontSize: 12,
    marginRight: Spacing.xs,
  },
  pricePrefix: {
    fontSize: 12,
    color: '#BBBBBB',
    marginRight: Spacing.xs,
  },
  iconInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textHeading,
    paddingVertical: Platform.OS === 'android' ? Spacing.sm - 2 : Spacing.sm,
  },
});
