/**
 * Service Listing Screen
 * Figma: create service (node 1055:1277)
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
  Modal,
  Switch,
  TouchableOpacity,
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
import {
  bookingService,
  listingService,
  paymentService,
  pickImages,
  type PickedImage,
} from '../services';
import type { ServiceAddon } from '../services/bookingService';
import { resolveListingPhotoUrls, resolveListingId } from '../utils/listingPhotos';
import { useProfile } from '../hooks';
import { unwrapApiPayload } from '../utils/apiHelpers';
import { filterNumbersOnly } from '../utils/validation';

type ServiceListingScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      category?: string;
      categoryId?: string;
      serviceType?: string;
      serviceTypeId?: string;
    };
  };
};

type DraftAddon = {
  localId: string;
  id?: string;
  name: string;
  description: string;
  price: string;
  icon: string;
  isActive: boolean;
};

type DraftAddonForm = Omit<DraftAddon, 'localId' | 'id'>;

const MP = Colors.light.marketplace;
const FORM_STEPS = LISTING_FORM_STEPS;
const inputStyles = listingWizardInputStyles;
const CURRENCY_OPTIONS = ['USD', 'AED', 'EUR'];
const DURATION_OPTIONS = [
  '30 minutes',
  '45 minutes',
  '60 minutes',
  '90 minutes',
  '120 minutes',
  'Half day',
  'Full day',
];

const BEAUTY_SPECIALIZATIONS = [
  'Injection & fillers',
  'Skin care/ rejuvenation',
  'Laser',
  'Body contouring',
  'Wellness/medicine',
  'Epidermis',
  'Dermis',
  'Hypodermis',
  'Pedicure',
  'Manicure',
  'Hair',
  'Frontal',
  'Wigs',
  'Skin boosters',
  'Fat dissolving',
  'Wrinkle injections',
  'Tattoo removal',
  'Dermapen micro-needling',
  'Hydrafacial',
  'Depigmentation peel',
  'Massage',
  'Hair treatment',
  'Braiding',
  'Cornrows',
  'Body waxing',
  'Eye Brows',
  'Lashes',
  'Brow threading',
  'Brow lamination',
  'Brie tinting',
] as const;

const HOME_SERVICES_SPECIALIZATIONS = [
  'Plumber',
  'Electrician',
  'Painter',
  'Bricklayer',
  'Removals',
  'Cleaner',
  'Mechanic',
  'Plaster',
  'Gas technician',
  'Studio engineer',
] as const;

const MEDICAL_SERVICES_SPECIALIZATIONS = [
  'Teeth removal',
  'Hair transplant',
  'Dental cleaning',
  'Dental implants',
  'Teeth whitening',
  'Root canal',
  'Braces / Orthodontics',
  'General checkup',
  'Blood test',
  'Vaccination',
  'Physiotherapy',
  'Dermatology consultation',
  'ENT consultation',
  'Eye checkup',
  'Nutrition consultation',
] as const;

const PROFESSIONAL_SERVICES_SPECIALIZATIONS = [
  'IT consultant',
  'Accountant',
  'Business consultant',
  'Financial advisor',
  'Tax consultant',
  'Lawyer',
  'Legal consultant',
  'HR consultant',
  'Recruiter',
  'Marketing consultant',
  'Digital marketing',
  'Social media manager',
  'Content writer',
  'Graphic designer',
  'UI/UX designer',
  'Web developer',
  'Mobile app developer',
  'Software engineer',
  'Data analyst',
  'Project manager',
  'Product manager',
  'Architect',
  'Interior designer',
  'Translator',
  'Tutor',
] as const;

function getSpecializationOptions(serviceTypeName: string): string[] {
  const key = serviceTypeName
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (key.includes('beauty')) return [...BEAUTY_SPECIALIZATIONS];
  if (key.includes('home service') || key.includes('home services')) {
    return [...HOME_SERVICES_SPECIALIZATIONS];
  }
  if (key.includes('medical')) return [...MEDICAL_SERVICES_SPECIALIZATIONS];
  if (key.includes('professional')) return [...PROFESSIONAL_SERVICES_SPECIALIZATIONS];
  return [];
}

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

const createDraftAddonLocalId = () =>
  `addon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyAddonForm = (): DraftAddonForm => ({
  name: '',
  description: '',
  price: '',
  icon: '',
  isActive: true,
});

const toDraftAddon = (addon: ServiceAddon & { _id?: string }): DraftAddon => {
  const id = addon.id || addon._id;
  return {
    localId: id || createDraftAddonLocalId(),
    id,
    name: addon.name || '',
    description: addon.description || '',
    price: addon.price != null ? String(addon.price) : '',
    icon: addon.icon || '',
    isActive: addon.isActive !== false,
  };
};

const mapOriginalAddons = (addons: DraftAddon[]) =>
  addons.reduce<Record<string, DraftAddon>>((acc, addon) => {
    if (addon.id) acc[addon.id] = { ...addon };
    return acc;
  }, {});

const parseAddonPrice = (value: string) => parseFloat(filterNumbersOnly(value, true));

const buildAddonBody = (addon: DraftAddon) => ({
  name: addon.name.trim(),
  description: addon.description.trim(),
  price: parseAddonPrice(addon.price),
  icon: addon.icon.trim(),
  isActive: addon.isActive,
});

const hasDraftAddonChanged = (addon: DraftAddon, original?: DraftAddon) => {
  if (!original) return true;
  return (
    addon.name.trim() !== original.name.trim() ||
    addon.description.trim() !== original.description.trim() ||
    parseAddonPrice(addon.price) !== parseAddonPrice(original.price) ||
    addon.icon.trim() !== original.icon.trim() ||
    addon.isActive !== original.isActive
  );
};

export const ServiceListingScreen: React.FC<ServiceListingScreenProps> = ({
  navigation,
  route,
}) => {
  const androidInputProps = wizardAndroidInputProps;
  const androidMultilineProps = wizardAndroidMultilineProps;
  const initialListingId = resolveListingId((route?.params as any)?.listingData);
  const [title, setTitle] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [duration, setDuration] = useState('');
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
  const [listingId, setListingId] = useState<string | null>(initialListingId);
  const [draftAddons, setDraftAddons] = useState<DraftAddon[]>([]);
  const [originalAddonsById, setOriginalAddonsById] = useState<Record<string, DraftAddon>>({});
  const [deletedAddonIds, setDeletedAddonIds] = useState<string[]>([]);
  const [addonModalVisible, setAddonModalVisible] = useState(false);
  const [editingAddonLocalId, setEditingAddonLocalId] = useState<string | null>(null);
  const [addonForm, setAddonForm] = useState<DraftAddonForm>(createEmptyAddonForm);
  const { profileImageUrl } = useProfile();

  const currentStep = 0;
  const categoryId =
    route?.params?.categoryId ||
    (route?.params as any)?.listingData?.category?.id ||
    (route?.params as any)?.listingData?.categoryId;
  const serviceTypeId =
    route?.params?.serviceTypeId || (route?.params as any)?.listingData?.serviceTypeId;
  const serviceTypeName = String(route?.params?.serviceType || '').trim();
  const specializationOptions = getSpecializationOptions(serviceTypeName);
  const hasSpecializationList = specializationOptions.length > 0;

  useEffect(() => {
    const incoming = (route?.params as any)?.listingData || route?.params;
    if (!incoming) return;

    const incomingId = resolveListingId(incoming);
    if (incomingId) setListingId(incomingId);

    if (incoming.title != null) setTitle(String(incoming.title));
    if (incoming.specialization != null) setSpecialization(String(incoming.specialization));
    if (incoming.description != null) setDescription(String(incoming.description));
    if (incoming.price != null) setPrice(String(incoming.price));
    if (incoming.currency != null) setCurrency(String(incoming.currency));
    if (incoming.location != null) setLocation(String(incoming.location));
    if (incoming.duration != null) setDuration(String(incoming.duration));
    else if (incoming.tags != null && String(incoming.tags).includes('min')) {
      setDuration(String(incoming.tags));
    }

    if (Array.isArray(incoming.photos) && incoming.photos.length > 0 && photoUris.length === 0) {
      const urls = incoming.photos
        .map((p: any) => (typeof p === 'string' ? p : p?.photoUrl || p?.url))
        .filter(Boolean) as string[];
      setPhotos(urls);
      setPhotoUris(urls.map((uri) => ({ uri })));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialListingId) return;

    let cancelled = false;

    const loadAddons = async () => {
      try {
        const response = await bookingService.getAddons(initialListingId, true);
        const payload = unwrapApiPayload<ServiceAddon[]>(response);
        const addons = Array.isArray(payload) ? payload.map(toDraftAddon) : [];

        if (!cancelled) {
          setDraftAddons(addons);
          setOriginalAddonsById(mapOriginalAddons(addons));
          setDeletedAddonIds([]);
        }
      } catch (error: any) {
        if (!cancelled) {
          setSnackbarMessage(error.message || 'Failed to load optional add-ons.');
          setSnackbarType('error');
          setSnackbarVisible(true);
        }
      }
    };

    loadAddons();

    return () => {
      cancelled = true;
    };
  }, [initialListingId]);

  const isFormValid =
    title.trim() !== '' &&
    specialization.trim() !== '' &&
    duration.trim() !== '' &&
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
    } catch {
      navigation?.navigate('Payment', { listingData });
    }
  };

  const openCreateAddonModal = () => {
    setEditingAddonLocalId(null);
    setAddonForm(createEmptyAddonForm());
    setAddonModalVisible(true);
  };

  const openEditAddonModal = (addon: DraftAddon) => {
    setEditingAddonLocalId(addon.localId);
    setAddonForm({
      name: addon.name,
      description: addon.description,
      price: addon.price,
      icon: addon.icon,
      isActive: addon.isActive,
    });
    setAddonModalVisible(true);
  };

  const closeAddonModal = () => {
    setAddonModalVisible(false);
    setEditingAddonLocalId(null);
    setAddonForm(createEmptyAddonForm());
  };

  const saveDraftAddon = () => {
    const parsedPrice = parseAddonPrice(addonForm.price);
    if (!addonForm.name.trim()) {
      Alert.alert('Validation', 'Add-on name is required.');
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      Alert.alert('Validation', 'Add-on price must be 0 or greater.');
      return;
    }

    const nextAddon = {
      name: addonForm.name.trim(),
      description: addonForm.description.trim(),
      price: String(parsedPrice),
      icon: addonForm.icon.trim(),
      isActive: addonForm.isActive,
    };

    setDraftAddons((current) => {
      if (editingAddonLocalId) {
        return current.map((addon) =>
          addon.localId === editingAddonLocalId ? { ...addon, ...nextAddon } : addon,
        );
      }
      return [...current, { localId: createDraftAddonLocalId(), ...nextAddon }];
    });

    closeAddonModal();
  };

  const removeDraftAddon = (addon: DraftAddon) => {
    if (addon.id) {
      setDeletedAddonIds((current) =>
        current.includes(addon.id!) ? current : [...current, addon.id!],
      );
    }
    setDraftAddons((current) => current.filter((item) => item.localId !== addon.localId));
  };

  const syncDraftAddons = async (savedListingId: string) => {
    for (const addonId of deletedAddonIds) {
      await bookingService.deleteAddon(savedListingId, addonId);
    }

    for (const addon of draftAddons) {
      const body = buildAddonBody(addon);
      if (!addon.id) {
        await bookingService.createAddon(savedListingId, body);
      } else if (hasDraftAddonChanged(addon, originalAddonsById[addon.id])) {
        await bookingService.updateAddon(savedListingId, addon.id, body);
      }
    }
  };

  const handleSaveAndContinue = async () => {
    if (!isFormValid) {
      Alert.alert('Validation Error', 'Please fill in all required fields and upload at least one photo.');
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

      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        priceType: 'Paid' as const,
        location: location.trim(),
        categoryId,
        serviceTypeId: serviceTypeId || undefined,
        currency: currency.trim(),
        duration: duration.trim(),
        specialization: specialization.trim(),
        tags: duration.trim(),
        serviceProviderName: title.trim(),
        photos: photoUrls,
      };

      const response = listingId
        ? await listingService.updateListing(listingId, payload)
        : await listingService.createListing(payload);

      if (response.success) {
        const listingData = (response.data as any)?.data || response.data;
        const savedId = resolveListingId(listingData);
        if (!savedId && (draftAddons.length > 0 || deletedAddonIds.length > 0)) {
          throw new Error('Listing was saved, but add-ons could not be synced.');
        }
        if (savedId) {
          await syncDraftAddons(savedId);
          setListingId(savedId);
        }
        await navigateAfterSave(listingData);
      } else {
        throw new Error(response.message || 'Failed to save listing');
      }
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Failed to save listing. Please try again.');
      setSnackbarType('error');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    try {
      if (photoUris.length >= 6) {
        Alert.alert('Limit Reached', 'You can upload a maximum of 6 photos.');
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
      Alert.alert('Error', error.message || 'Failed to select photos.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBand}>
        <ListingWizardHeader
          title="Create Service"
          subtitle="Fill in the information below to list your service"
          profileImageUrl={profileImageUrl}
          onBack={() => navigation?.goBack()}
          showBell
          usePillControls
        />
        <ListingStepProgress
          currentStep={currentStep}
          steps={FORM_STEPS}
          numbered
          activeColor={MP.beautyBadge}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ListingFormField label="Service Name" required>
          <TextInput
            style={inputStyles.input}
            placeholder="e.g. Luxury Facial Treatment"
            placeholderTextColor="rgba(153,153,153,0.5)"
            value={title}
            onChangeText={setTitle}
            {...androidInputProps}
          />
        </ListingFormField>

        {hasSpecializationList ? (
          <FormSelect
            label="Category"
            required
            value={specialization}
            placeholder="Select category"
            options={specializationOptions}
            onSelect={setSpecialization}
          />
        ) : (
          <ListingFormField label="Category" required>
            <TextInput
              style={inputStyles.input}
              placeholder="e.g. manicure, nails"
              placeholderTextColor="rgba(153,153,153,0.5)"
              value={specialization}
              onChangeText={setSpecialization}
              {...androidInputProps}
            />
          </ListingFormField>
        )}

        <FormSelect
          label="Duration"
          required
          value={duration}
          placeholder="e.g. 60 minutes"
          options={DURATION_OPTIONS}
          onSelect={setDuration}
        />

        <ListingFormField label="Description" required>
          <TextInput
            style={[inputStyles.input, inputStyles.textArea]}
            placeholder="Describe your service in detail..."
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
                  placeholder="e.g. 45"
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
            placeholder="Salon or home visits?"
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
          uploadTitle="Click to upload service photos"
          uploadHint="Add up to 6 photos"
        />

        <View style={styles.addonsSection}>
          <View style={styles.addonsHeader}>
            <View style={styles.addonsHeaderText}>
              <Text style={styles.addonsTitle}>Optional add-ons</Text>
              <Text style={styles.addonsSubtitle}>
                Offer extras customers can choose while booking.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addonAddButton}
              onPress={openCreateAddonModal}
              activeOpacity={0.85}
            >
              <Text style={styles.addonAddButtonText}>Add add-on</Text>
            </TouchableOpacity>
          </View>

          {draftAddons.length === 0 ? (
            <View style={styles.addonsEmptyCard}>
              <Text style={styles.addonsEmptyText}>No optional add-ons yet.</Text>
            </View>
          ) : (
            draftAddons.map((addon) => (
              <View key={addon.localId} style={styles.addonRow}>
                <View style={styles.addonIconBubble}>
                  <Text style={styles.addonIconText}>{addon.icon || '+'}</Text>
                </View>
                <View style={styles.addonDetails}>
                  <View style={styles.addonTitleRow}>
                    <Text style={styles.addonName} numberOfLines={1}>
                      {addon.name}
                    </Text>
                    <Text style={styles.addonPrice}>+{currency} {addon.price}</Text>
                  </View>
                  {addon.description ? (
                    <Text style={styles.addonDescription} numberOfLines={2}>
                      {addon.description}
                    </Text>
                  ) : null}
                  <Text style={styles.addonStatus}>
                    {addon.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                <View style={styles.addonActions}>
                  <TouchableOpacity onPress={() => openEditAddonModal(addon)} activeOpacity={0.75}>
                    <Text style={styles.addonActionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeDraftAddon(addon)} activeOpacity={0.75}>
                    <Text style={[styles.addonActionText, styles.addonDeleteText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
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
          if (tab === 'Home') navigation?.navigate('Home');
          else if (tab === 'Store') navigation?.navigate('Store');
          else if (tab === 'Messages') {
            setSnackbarVisible(true);
            setSnackbarMessage('Coming soon feature');
            setSnackbarType('info');
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

      <Modal
        visible={addonModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeAddonModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.addonModalCard}>
            <Text style={styles.modalTitle}>
              {editingAddonLocalId ? 'Edit add-on' : 'Add optional add-on'}
            </Text>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <ListingFormField label="Name" required>
                <TextInput
                  style={inputStyles.input}
                  placeholder="e.g. Extra 30 minutes"
                  placeholderTextColor="rgba(153,153,153,0.5)"
                  value={addonForm.name}
                  onChangeText={(name) => setAddonForm((current) => ({ ...current, name }))}
                  {...androidInputProps}
                />
              </ListingFormField>

              <ListingFormField label="Description">
                <TextInput
                  style={[inputStyles.input, inputStyles.textArea]}
                  placeholder="Describe this add-on..."
                  placeholderTextColor="rgba(153,153,153,0.5)"
                  value={addonForm.description}
                  onChangeText={(nextDescription) =>
                    setAddonForm((current) => ({ ...current, description: nextDescription }))
                  }
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  {...androidMultilineProps}
                />
              </ListingFormField>

              <ListingFormField label="Price" required>
                <View style={styles.priceInputWrap}>
                  <Text style={styles.pricePrefix}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="e.g. 15"
                    placeholderTextColor="rgba(153,153,153,0.5)"
                    value={addonForm.price}
                    onChangeText={(text) =>
                      setAddonForm((current) => ({
                        ...current,
                        price: filterNumbersOnly(text, true),
                      }))
                    }
                    keyboardType="decimal-pad"
                    {...androidInputProps}
                  />
                </View>
              </ListingFormField>

              <ListingFormField label="Icon">
                <TextInput
                  style={inputStyles.input}
                  placeholder="Optional emoji"
                  placeholderTextColor="rgba(153,153,153,0.5)"
                  value={addonForm.icon}
                  onChangeText={(icon) => setAddonForm((current) => ({ ...current, icon }))}
                  maxLength={8}
                  {...androidInputProps}
                />
              </ListingFormField>

              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>Active</Text>
                  <Text style={styles.switchHint}>Show this add-on to customers</Text>
                </View>
                <Switch
                  value={addonForm.isActive}
                  onValueChange={(isActive) =>
                    setAddonForm((current) => ({ ...current, isActive }))
                  }
                  trackColor={{ false: '#D1D5DB', true: MP.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={closeAddonModal}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={saveDraftAddon}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSaveText}>Save add-on</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  fieldFlex: { flex: 1, minWidth: 0 },
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
  addonsSection: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  addonsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  addonsHeaderText: {
    flex: 1,
  },
  addonsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textHeading,
  },
  addonsSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: MP.metaText,
  },
  addonAddButton: {
    backgroundColor: MP.primary,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  addonAddButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addonsEmptyCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.light.cardBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  addonsEmptyText: {
    color: MP.metaText,
    fontSize: 13,
  },
  addonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  addonIconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
  },
  addonIconText: {
    fontSize: 16,
    color: MP.primary,
    fontWeight: '700',
  },
  addonDetails: {
    flex: 1,
  },
  addonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addonName: {
    flex: 1,
    color: Colors.light.textHeading,
    fontSize: 14,
    fontWeight: '700',
  },
  addonPrice: {
    color: MP.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  addonDescription: {
    marginTop: 4,
    color: MP.descriptionText,
    fontSize: 12,
    lineHeight: 17,
  },
  addonStatus: {
    marginTop: 4,
    color: MP.metaText,
    fontSize: 11,
    fontWeight: '600',
  },
  addonActions: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  addonActionText: {
    color: MP.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  addonDeleteText: {
    color: MP.report,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  addonModalCard: {
    maxHeight: '88%',
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalTitle: {
    color: Colors.light.textHeading,
    fontSize: 18,
    fontWeight: '800',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  switchLabel: {
    color: Colors.light.textHeading,
    fontSize: 14,
    fontWeight: '700',
  },
  switchHint: {
    marginTop: 2,
    color: MP.metaText,
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: BorderRadius.round,
    paddingVertical: Spacing.md,
  },
  modalCancelButton: {
    backgroundColor: '#F3F4F6',
  },
  modalSaveButton: {
    backgroundColor: MP.primary,
  },
  modalCancelText: {
    color: Colors.light.textHeading,
    fontSize: 14,
    fontWeight: '700',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
