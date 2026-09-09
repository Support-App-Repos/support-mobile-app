/**
 * Event Listing Screen
 * Figma: create event (node 1054:525)
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
import {
  PriceTypeDropdown,
  type PriceType,
  GoogleLocationField,
} from '../components/common';
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
import { resolveListingPhotoUrls, resolveListingId } from '../utils/listingPhotos';
import { useProfile } from '../hooks';
import { filterNumbersOnly, filterLettersOnly } from '../utils/validation';

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

const MP = Colors.light.marketplace;
const FORM_STEPS = LISTING_FORM_STEPS;
const inputStyles = listingWizardInputStyles;
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

export const EventListingScreen: React.FC<EventListingScreenProps> = ({
  navigation,
  route,
}) => {
  const androidInputProps = wizardAndroidInputProps;
  const androidMultilineProps = wizardAndroidMultilineProps;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceType, setPriceType] = useState<PriceType | null>('Per Seat');
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
  const eventTypeId = route?.params?.eventTypeId || (route?.params as any)?.listingData?.eventTypeId;
  const eventTypeName = route?.params?.eventType || '';

  useEffect(() => {
    const incoming = (route?.params as any)?.listingData || route?.params;
    if (!incoming) return;

    const incomingId = resolveListingId(incoming);
    if (incomingId) setListingId(incomingId);

    if (incoming.title != null) setTitle(String(incoming.title));
    if (incoming.description != null) setDescription(String(incoming.description));
    if (incoming.priceType != null) setPriceType(incoming.priceType);
    if (incoming.price != null) setPrice(String(incoming.price));
    if (incoming.venue != null) setVenue(String(incoming.venue));
    if (incoming.city != null) setCity(String(incoming.city));
    if (incoming.eventDate != null) setEventDate(String(incoming.eventDate));
    if (incoming.eventTime != null) setEventTime(String(incoming.eventTime));
    if (incoming.duration != null) setDuration(String(incoming.duration));
    if (incoming.maxCapacity != null) setMaxCapacity(String(incoming.maxCapacity));
    if (incoming.organizerName != null) setOrganizerName(String(incoming.organizerName));
    if (incoming.organizerContact != null) setOrganizerContact(String(incoming.organizerContact));
    if (incoming.organizerEmail != null) setOrganizerEmail(String(incoming.organizerEmail));
    if (incoming.tags != null) setTags(String(incoming.tags));

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
    description.trim() !== '' &&
    priceType !== null &&
    (priceType === 'Free' || price.trim() !== '') &&
    venue.trim() !== '' &&
    city.trim() !== '' &&
    organizerName.trim() !== '' &&
    organizerContact.trim() !== '' &&
    organizerEmail.trim() !== '';

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
      Alert.alert('Validation Error', 'Please fill in all required fields.');
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

      const payload = {
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
        maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : undefined,
        organizerName: organizerName.trim(),
        organizerContact: organizerContact.trim(),
        organizerEmail: organizerEmail.trim(),
        tags: tags || undefined,
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
          title="Create Event"
          subtitle="Fill in the information below to list your event."
          profileImageUrl={profileImageUrl}
          onBack={() => navigation?.goBack()}
          showBell
          usePillControls
        />
        <ListingStepProgress
          currentStep={currentStep}
          steps={FORM_STEPS}
          numbered
          activeColor={MP.eventBadge}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ListingFormField label="Event Title" required>
          <TextInput
            style={inputStyles.input}
            placeholder="Give your event a great title"
            placeholderTextColor="rgba(153,153,153,0.5)"
            value={title}
            onChangeText={setTitle}
            {...androidInputProps}
          />
        </ListingFormField>

        <View style={inputStyles.row}>
          <View style={styles.fieldFlex}>
            <ListingFormField label="Event Type" required>
              <TextInput
                style={[inputStyles.input, styles.readOnlyInput]}
                value={eventTypeName || 'Select type'}
                editable={false}
                {...androidInputProps}
              />
            </ListingFormField>
          </View>
          <View style={styles.fieldFlex}>
            <ListingFormField label="Price">
              <View style={styles.priceInputWrap}>
                <Text style={styles.pricePrefix}>$</Text>
                <TextInput
                  style={[
                    styles.priceInput,
                    (priceType === 'Free' || priceType === null) && styles.inputDisabled,
                  ]}
                  placeholder="e.g. $20"
                  placeholderTextColor="rgba(153,153,153,0.5)"
                  value={price}
                  onChangeText={(text) => setPrice(filterNumbersOnly(text, true))}
                  keyboardType="decimal-pad"
                  editable={priceType !== 'Free' && priceType !== null}
                  {...androidInputProps}
                />
              </View>
            </ListingFormField>
          </View>
        </View>

        <ListingFormField label="Price Type">
          <PriceTypeDropdown value={priceType} onSelect={setPriceType} />
        </ListingFormField>

        <ListingFormField label="Description" required>
          <TextInput
            style={[inputStyles.input, inputStyles.textArea]}
            placeholder="Describe your event in detail..."
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
            <ListingFormField label="Venue / Location">
              <GoogleLocationField
                label=""
                required
                value={venue}
                placeholder="Venue name"
                onSelect={({ location: loc, city: c }) => {
                  setVenue(loc);
                  if (c) setCity(c);
                }}
              />
            </ListingFormField>
          </View>
          <View style={styles.fieldFlex}>
            <ListingFormField label="City">
              <TextInput
                style={inputStyles.input}
                placeholder="City, State"
                placeholderTextColor="rgba(153,153,153,0.5)"
                value={city}
                onChangeText={setCity}
                {...androidInputProps}
              />
            </ListingFormField>
          </View>
        </View>

        <View style={inputStyles.row}>
          <View style={styles.fieldFlex}>
            <ListingFormField label="Event Date">
              <TextInput
                style={inputStyles.input}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="rgba(153,153,153,0.5)"
                value={eventDate}
                onChangeText={setEventDate}
                {...androidInputProps}
              />
            </ListingFormField>
          </View>
          <View style={styles.fieldFlex}>
            <ListingFormField label="Event Time">
              <TextInput
                style={inputStyles.input}
                placeholder="00:00 AM"
                placeholderTextColor="rgba(153,153,153,0.5)"
                value={eventTime}
                onChangeText={setEventTime}
                {...androidInputProps}
              />
            </ListingFormField>
          </View>
        </View>

        <View style={inputStyles.row}>
          <View style={styles.fieldFlex}>
            <ListingFormField label="Duration (hrs)">
              <TextInput
                style={inputStyles.input}
                placeholder="e.g. 2"
                placeholderTextColor="rgba(153,153,153,0.5)"
                value={duration}
                onChangeText={(text) => setDuration(filterNumbersOnly(text, true))}
                keyboardType="numeric"
                {...androidInputProps}
              />
            </ListingFormField>
          </View>
          <View style={styles.fieldFlex}>
            <ListingFormField label="Max Capacity">
              <TextInput
                style={inputStyles.input}
                placeholder="e.g. 100"
                placeholderTextColor="rgba(153,153,153,0.5)"
                value={maxCapacity}
                onChangeText={(text) => setMaxCapacity(filterNumbersOnly(text, false))}
                keyboardType="numeric"
                {...androidInputProps}
              />
            </ListingFormField>
          </View>
        </View>

        <ListingFormField label="Host/Organizer details">
          <TextInput
            style={[inputStyles.input, styles.stackField]}
            placeholder="Name"
            placeholderTextColor="rgba(153,153,153,0.5)"
            value={organizerName}
            onChangeText={(text) => setOrganizerName(filterLettersOnly(text))}
            {...androidInputProps}
          />
          <TextInput
            style={[inputStyles.input, styles.stackField]}
            placeholder="Contact"
            placeholderTextColor="rgba(153,153,153,0.5)"
            value={organizerContact}
            onChangeText={(text) => setOrganizerContact(filterNumbersOnly(text, false))}
            keyboardType="phone-pad"
            {...androidInputProps}
          />
          <TextInput
            style={inputStyles.input}
            placeholder="Email"
            placeholderTextColor="rgba(153,153,153,0.5)"
            value={organizerEmail}
            onChangeText={setOrganizerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            {...androidInputProps}
          />
        </ListingFormField>

        <ListingPhotoUpload
          label="Photo (optional)"
          required={false}
          photos={photoUris.map((p) => ({ uri: p.uri }))}
          onAdd={handlePhotoUpload}
          onRemove={(index) => {
            const updated = photoUris.filter((_, i) => i !== index);
            setPhotoUris(updated);
            setPhotos(updated.map((p) => p.uri));
          }}
          uploading={loading}
          uploadHint="PNG, JPG or GIF (max 10MB)"
        />

        <ListingFormField label="Additional Tags">
          <TextInput
            style={inputStyles.input}
            placeholder="e.g Networking, Training"
            placeholderTextColor="rgba(153,153,153,0.5)"
            value={tags}
            onChangeText={setTags}
            {...androidInputProps}
          />
        </ListingFormField>
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
  inputDisabled: {
    opacity: 0.5,
  },
  stackField: {
    marginBottom: Spacing.sm,
  },
  readOnlyInput: {
    color: Colors.light.textHeading,
    backgroundColor: '#FAFAFA',
  },
});
