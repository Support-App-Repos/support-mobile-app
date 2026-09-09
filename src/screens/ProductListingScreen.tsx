/**
 * Product Listing Screen
 * Figma: List Product (node 1055:997) — Details step with full form
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
  ListingFormField,
  ListingPhotoUpload,
  ListingWizardFooter,
  listingWizardInputStyles,
  androidInputProps as wizardAndroidInputProps,
  androidMultilineProps as wizardAndroidMultilineProps,
  LISTING_FORM_STEPS,
} from '../components/listings/wizard';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, BorderRadius } from '../config/theme';
import { listingService, paymentService, pickImages, type PickedImage } from '../services';
import { useProfile } from '../hooks';
import { filterNumbersOnly } from '../utils/validation';
import { resolveListingPhotoUrls, resolveListingId } from '../utils/listingPhotos';

type ProductListingScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      category?: string;
      categoryId?: string;
    };
  };
};

const MP = Colors.light.marketplace;
const FORM_STEPS = LISTING_FORM_STEPS;
const inputStyles = listingWizardInputStyles;

const PRODUCT_CATEGORY_OPTIONS = [
  'Electronics',
  'Clothing',
  'Furniture',
  'Home & Garden',
  'Sports & Outdoors',
  'Books & Media',
  'Other',
];
const CONDITION_OPTIONS = ['New', 'Used'];
const CURRENCY_OPTIONS = ['USD', 'AED', 'EUR'];

const DESCRIPTION_WORD_LIMIT = 500;
function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}
function clampWords(text: string, limit: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(' ') + ' ';
}

export const ProductListingScreen: React.FC<ProductListingScreenProps> = ({
  navigation,
  route,
}) => {
  const androidInputProps = wizardAndroidInputProps;
  const androidMultilineProps = wizardAndroidMultilineProps;
  const [title, setTitle] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [brand, setBrand] = useState('');
  const [warranty, setWarranty] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [location, setLocation] = useState('');
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
    if (incoming.description != null) setDescription(String(incoming.description));
    if (incoming.price != null) setPrice(String(incoming.price));
    if (incoming.location != null) setLocation(String(incoming.location));
    if (incoming.currency != null) setCurrency(String(incoming.currency));
    if (incoming.productCategory != null) setProductCategory(String(incoming.productCategory));
    if (incoming.condition != null) setCondition(String(incoming.condition));
    if (incoming.brand != null) setBrand(String(incoming.brand));
    if (incoming.warranty != null) setWarranty(String(incoming.warranty));

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
    productCategory.trim() !== '' &&
    condition.trim() !== '' &&
    description.trim() !== '' &&
    price.trim() !== '' &&
    currency.trim() !== '' &&
    location.trim() !== '' &&
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
    } catch (subscriptionError: any) {
      console.error('Error checking subscription:', subscriptionError);
      navigation?.navigate('Payment', { listingData });
    }
  };

  const handleSaveAndContinue = async () => {
    if (!isFormValid) {
      Alert.alert(
        'Validation Error',
        'Please fill in all required fields and upload at least one photo.',
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
          photoUrls = await resolveListingPhotoUrls(photoUris, 'listings/');
          setPhotos(photoUrls);
        } catch (uploadError: any) {
          console.error('Error uploading photos:', uploadError);
          Alert.alert('Upload Error', uploadError.message || 'Failed to upload photos. Please try again.');
          setLoading(false);
          return;
        }
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        priceType: 'Paid' as const,
        location: location.trim(),
        categoryId,
        currency: currency.trim(),
        productCategory: productCategory.trim(),
        condition: condition.trim(),
        brand: brand.trim() || undefined,
        warranty: warranty.trim() || undefined,
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
      console.error('Error saving listing:', error);
      setSnackbarMessage(error.message || 'Failed to save listing. Please try again.');
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

      const selected = await pickImages();

      if (selected && selected.length > 0) {
        const updated = [...photoUris, ...selected].slice(0, 6);
        setPhotoUris(updated);
        setPhotos(updated.map((p) => p.uri));
        setSnackbarMessage(`Added ${selected.length} photo(s).`);
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
      <View style={styles.headerBand}>
        <ListingWizardHeader
          title="List Product"
          subtitle="Add details about your product listing."
          profileImageUrl={profileImageUrl}
          onBack={handleBack}
          showBell
          usePillControls
        />
        <ListingStepProgress
          currentStep={currentStep}
          steps={FORM_STEPS}
          numbered
          activeColor={MP.detailProductBadge}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ListingFormField label="Product Name" required>
          <TextInput
            style={inputStyles.input}
            placeholder="e.g. iPhone 14 Pro 256GB"
            placeholderTextColor="rgba(153,153,153,0.5)"
            value={title}
            onChangeText={setTitle}
            {...androidInputProps}
          />
        </ListingFormField>

        <View style={inputStyles.row}>
          <FormSelect
            label="Category"
            required
            value={productCategory}
            placeholder="Select category"
            options={PRODUCT_CATEGORY_OPTIONS}
            onSelect={setProductCategory}
          />
          <FormSelect
            label="Condition"
            required
            value={condition}
            placeholder="New / Used"
            options={CONDITION_OPTIONS}
            onSelect={setCondition}
          />
        </View>

        <View style={inputStyles.row}>
          <View style={styles.fieldFlex}>
            <ListingFormField label="Brand">
              <TextInput
                style={inputStyles.input}
                placeholder="e.g. Apple"
                placeholderTextColor="rgba(153,153,153,0.5)"
                value={brand}
                onChangeText={setBrand}
                {...androidInputProps}
              />
            </ListingFormField>
          </View>
          <View style={styles.fieldFlex}>
            <ListingFormField label="Warranty">
              <TextInput
                style={inputStyles.input}
                placeholder="e.g. 1 year"
                placeholderTextColor="rgba(153,153,153,0.5)"
                value={warranty}
                onChangeText={setWarranty}
                {...androidInputProps}
              />
            </ListingFormField>
          </View>
        </View>

        <ListingFormField label="Description" required>
          <TextInput
            style={[inputStyles.input, inputStyles.textArea]}
            placeholder="Describe your product in detail..."
            placeholderTextColor="rgba(153,153,153,0.5)"
            value={description}
            onChangeText={(t) => setDescription(clampWords(t, DESCRIPTION_WORD_LIMIT))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            {...androidMultilineProps}
          />
          <Text style={inputStyles.wordCount}>
            {countWords(description)}/{DESCRIPTION_WORD_LIMIT} words
          </Text>
        </ListingFormField>

        <View style={inputStyles.row}>
          <View style={styles.fieldFlex}>
            <ListingFormField label="Price" required>
              <View style={styles.priceInputWrap}>
                <Text style={styles.pricePrefix}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="e.g. 999"
                  placeholderTextColor="rgba(153,153,153,0.5)"
                  value={price}
                  onChangeText={(text) => setPrice(filterNumbersOnly(text, true))}
                  keyboardType="decimal-pad"
                  {...androidInputProps}
                />
              </View>
            </ListingFormField>
          </View>
          <FormSelect
            label="Currency"
            value={currency}
            placeholder="USD"
            options={CURRENCY_OPTIONS}
            onSelect={setCurrency}
          />
        </View>

        <ListingFormField label="Location" required>
          <GoogleLocationField
            label=""
            required
            value={location}
            placeholder="Search location"
            onSelect={({ location: loc }) => setLocation(loc)}
          />
        </ListingFormField>

        <ListingPhotoUpload
          photos={photoUris.map((p) => ({ uri: p.uri }))}
          onAdd={handlePhotoUpload}
          onRemove={(index) => {
            const updated = photoUris.filter((_, i) => i !== index);
            setPhotoUris(updated);
            setPhotos(updated.map((p) => p.uri));
          }}
          uploading={loading}
        />
      </ScrollView>

      <ListingWizardFooter
        label="Next"
        onPress={handleSaveAndContinue}
        disabled={!isFormValid}
        loading={loading}
        showArrow
      />

      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'Home') {
            navigation?.navigate('Home');
          } else if (tab === 'Store') {
            navigation?.navigate('Store');
          } else if (tab === 'Messages') {
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  fieldFlex: {
    flex: 1,
    minWidth: 0,
  },
  priceInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  pricePrefix: {
    fontSize: 12,
    color: '#BBBBBB',
    marginRight: Spacing.xs,
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textHeading,
    paddingVertical: Platform.OS === 'android' ? Spacing.sm - 2 : Spacing.sm,
  },
});
