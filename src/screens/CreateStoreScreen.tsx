/**
 * Create Store Screen - 3-step wizard
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Button, BackIcon, StepCompletedMarkIcon, FormSelect } from '../components/common';
import { StoreLogoUploadIcon } from '../components/common/StoreLogoUploadIcon';
import { VerificationInfoIcon } from '../components/common/VerificationInfoIcon';
import { GoogleLocationField } from '../components/common/GoogleLocationField';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { storeService } from '../services';
import { pickSingleImage, uploadImages, type PickedImage } from '../services/uploadService';
import { useStore, useProfile } from '../hooks';
import type { StoreWorkingHours } from '../types';

const STEPS = ['Basic Info', 'Business Details', 'Verify'];
const CATEGORIES = ['Product', 'Service', 'Property', 'Event', 'Mixed'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const MAX_DOCUMENTS = 5;

export const CreateStoreScreen: React.FC<{ navigation?: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const { store, refreshStore } = useStore();
  const { user } = useProfile();
  const isEdit = route?.params?.edit || !!store;

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [logoImage, setLogoImage] = useState<PickedImage | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<PickedImage | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [businessCategory, setBusinessCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('18:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [documents, setDocuments] = useState<PickedImage[]>([]);

  useEffect(() => {
    if (store) {
      setName(store.name || '');
      setLogoUrl(store.logoUrl || null);
      setCoverUrl(store.coverImageUrl || null);
      setBusinessCategory(store.businessCategory || '');
      setDescription(store.description || '');
      setAddress(store.address || store.location || '');
      if (store.workingHours) {
        setOpenTime(store.workingHours.open || '09:00');
        setCloseTime(store.workingHours.close || '18:00');
        setSelectedDays(store.workingHours.days || []);
      }
      if (isEdit && store.verificationStatus === 'verified') {
        setStep(0);
      } else if (isEdit && store.verificationStatus !== 'unverified') {
        setStep(2);
      }
    }
  }, [store, isEdit]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const pickLogo = async () => {
    const image = await pickSingleImage();
    if (image) {
      setLogoImage(image);
      setLogoUrl(null);
    }
  };

  const pickCover = async () => {
    const image = await pickSingleImage();
    if (image) {
      setCoverImage(image);
      setCoverUrl(null);
    }
  };

  const pickDocument = async () => {
    if (documents.length >= MAX_DOCUMENTS) {
      Alert.alert('Limit reached', `You can upload up to ${MAX_DOCUMENTS} documents.`);
      return;
    }
    const image = await pickSingleImage();
    if (image) {
      setDocuments((prev) => [...prev, image]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadIfNeeded = async (
    picked: PickedImage | null,
    existing: string | null,
    folder: string,
    label: string
  ) => {
    if (!picked?.uri) return existing;
    try {
      const uploaded = await uploadImages([picked], folder);
      return uploaded[0]?.url || existing;
    } catch (err: any) {
      throw new Error(err.message || `Failed to upload ${label}`);
    }
  };

  const handleSaveStep1 = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Store name is required');
      return;
    }
    if (!businessCategory) {
      Alert.alert('Error', 'Please select a business category');
      return;
    }

    try {
      setSaving(true);
      const uploadedLogo = await uploadIfNeeded(logoImage, logoUrl, 'stores/', 'store logo');
      const uploadedCover = await uploadIfNeeded(coverImage, coverUrl, 'stores/', 'cover photo');

      const payload = {
        name: name.trim(),
        logoUrl: uploadedLogo,
        coverImageUrl: uploadedCover,
        businessCategory,
        contactEmail: user?.email || undefined,
        contactPhone: user?.phoneNumber || undefined,
      };

      if (store) {
        await storeService.updateStore(store.id, payload);
      } else {
        await storeService.createStore(payload);
      }
      await refreshStore();
      setStep(1);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save store');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStep2 = async () => {
    if (!store) return;
    try {
      setSaving(true);
      const workingHours: StoreWorkingHours = {
        days: selectedDays,
        open: openTime,
        close: closeTime,
      };
      await storeService.updateStore(store.id, {
        description: description.trim(),
        address: address.trim(),
        location: address.trim(),
        workingHours,
      });
      await refreshStore();
      setStep(2);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save details');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!store) return;
    if (documents.length === 0) {
      Alert.alert('Error', 'Please upload at least one business document');
      return;
    }
    try {
      setSaving(true);
      const uploaded = await uploadImages(documents, 'stores/documents/');
      const response = await storeService.submitVerification(
        store.id,
        uploaded.map((doc) => ({
          documentUrl: doc.url,
          documentType: 'business_license',
        }))
      );
      await refreshStore();
      const updated = (response.data as any)?.data || response.data;
      if (updated?.isVerified) {
        navigation?.replace('StoreVerifiedSuccess', { storeName: updated.name });
      } else {
        Alert.alert(
          'Submitted',
          'Your verification is under review. You will be notified once approved.',
          [{ text: 'OK', onPress: () => navigation?.navigate('Store') }]
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit verification');
    } finally {
      setSaving(false);
    }
  };

  const renderStepper = () => (
    <View style={styles.progressContainer}>
      {STEPS.map((label, index) => (
        <View key={label} style={styles.progressStepContainer}>
          <View style={styles.progressCircleWrapper}>
            <View
              style={[
                styles.progressCircle,
                index === step && styles.progressCircleActive,
                index < step && styles.progressCircleCompleted,
              ]}
            >
              {index < step && <StepCompletedMarkIcon size={8} />}
              {index === step && <View style={styles.progressDotActive} />}
              {index > step && <View style={styles.progressDotInactive} />}
            </View>
            {index < STEPS.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  index < step && styles.progressLineActive,
                ]}
              />
            )}
          </View>
          <Text
            style={[
              styles.progressLabel,
              index === step && styles.progressLabelActive,
            ]}
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <BackIcon size={24} color="#030303" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 0 ? 'Create Your Store' : step === 1 ? 'Business Details' : 'Verify Store'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {renderStepper()}

      {step === 2 && (
        <View style={styles.verificationInfoBanner}>
          <View style={styles.verificationInfoIconWrap}>
            <VerificationInfoIcon size={16} color="#1A6B5A" />
          </View>
          <Text style={styles.verificationInfoText}>
            Verification helps build trust with buyers. Upload your business documents.
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <View style={styles.card}>
            <Input label="Store Name" value={name} onChangeText={setName} placeholder="Enter your store name" />
            <Text style={styles.label}>Store Logo</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={pickLogo}>
              {logoImage?.uri || logoUrl ? (
                <Image source={{ uri: logoImage?.uri || logoUrl! }} style={styles.logoPreview} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <StoreLogoUploadIcon size={34} />
                  <Text style={styles.uploadText}>Upload Logo</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.label}>Cover Image</Text>
            <TouchableOpacity style={styles.coverBox} onPress={pickCover}>
              {coverImage?.uri || coverUrl ? (
                <Image source={{ uri: coverImage?.uri || coverUrl! }} style={styles.coverPreview} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <StoreLogoUploadIcon size={34} />
                  <Text style={styles.uploadText}>Upload Cover Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <FormSelect
              label="Business Category"
              required
              value={businessCategory}
              placeholder="Select category"
              options={CATEGORIES}
              onSelect={setBusinessCategory}
              containerStyle={{ marginBottom: Spacing.md }}
            />
            <Button title="Save & Continue" onPress={handleSaveStep1} loading={saving} />
          </View>
        )}

        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.label}>Business Description</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Tell customers about your store..."
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <GoogleLocationField
              label="Store Address"
              value={address}
              placeholder="City, State or full address"
              onSelect={({ location, city }) => {
                setAddress(location);
              }}
            />
            <Text style={styles.label}>Working Hours</Text>
            <View style={styles.hoursRow}>
              <Input label="Opens" value={openTime} onChangeText={setOpenTime} containerStyle={{ flex: 1 }} />
              <Input label="Closes" value={closeTime} onChangeText={setCloseTime} containerStyle={{ flex: 1 }} />
            </View>
            <Text style={styles.label}>Working Days</Text>
            <View style={styles.daysRow}>
              {DAYS.map((d, i) => (
                <TouchableOpacity
                  key={`${d}-${i}`}
                  style={[
                    styles.dayCircle,
                    selectedDays.includes(DAY_KEYS[i]) && styles.dayActive,
                  ]}
                  onPress={() => toggleDay(DAY_KEYS[i])}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDays.includes(DAY_KEYS[i]) && styles.dayTextActive,
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Save & Continue" onPress={handleSaveStep2} loading={saving} />
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(0)}>
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.verifyTitle}>Upload Business Documents</Text>
            <Text style={styles.verifySubtitle}>
              Upload your business license or registration document for verification.
            </Text>
            {documents.length === 0 ? (
              <TouchableOpacity style={styles.coverBox} onPress={pickDocument}>
                <View style={styles.uploadPlaceholder}>
                  <StoreLogoUploadIcon size={34} />
                  <Text style={styles.uploadText}>Upload Document</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.documentsPreview}>
                  {documents.map((doc, index) => (
                    <View key={`${doc.uri}-${index}`} style={styles.documentPreviewItem}>
                      <Image source={{ uri: doc.uri }} style={styles.documentPreview} />
                      {store?.verificationStatus !== 'pending' && (
                        <TouchableOpacity
                          style={styles.removeDocumentButton}
                          onPress={() => removeDocument(index)}
                        >
                          <Text style={styles.removeDocumentText}>×</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
                {store?.verificationStatus !== 'pending' && documents.length < MAX_DOCUMENTS && (
                  <Button
                    title="Upload More Documents"
                    variant="outline"
                    onPress={pickDocument}
                    style={styles.uploadMoreButton}
                  />
                )}
              </>
            )}
            {documents.length > 0 && store?.verificationStatus !== 'pending' && (
              <Text style={styles.documentHint}>
                {documents.length} of {MAX_DOCUMENTS} documents added
              </Text>
            )}
            {store?.verificationStatus === 'pending' && (
              <View style={styles.pendingBox}>
                <Text style={styles.pendingText}>Verification is under review</Text>
              </View>
            )}
            <Button
              title={store?.verificationStatus === 'pending' ? 'Submitted' : 'Submit for Verification'}
              onPress={handleSubmitVerification}
              loading={saving}
              disabled={store?.verificationStatus === 'pending' || documents.length === 0}
            />
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  headerTitle: { ...Typography.h3, color: Colors.light.text },
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
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: Colors.light.primary,
    fontWeight: '600',
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
  verificationInfoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1A6B5A1A',
    borderWidth: 1.18,
    borderColor: '#1A6B5A33',
  },
  verificationInfoIconWrap: {
    marginTop: 2,
  },
  verificationInfoText: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.caption,
    fontSize: 13,
    lineHeight: 20,
    color: '#1A6B5A',
  },
  form: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  label: { ...Typography.caption, fontWeight: '600', color: Colors.light.text, marginBottom: Spacing.xs, marginTop: Spacing.sm },
  uploadBox: {
    height: 120,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  coverBox: {
    height: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoPreview: { width: 80, height: 80, borderRadius: 40 },
  coverPreview: { width: '100%', height: '100%', borderRadius: BorderRadius.md },
  uploadText: { color: Colors.light.textSecondary, fontSize: 13 },
  textArea: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 100,
    marginBottom: Spacing.sm,
    color: Colors.light.text,
  },
  hoursRow: { flexDirection: 'row', gap: Spacing.sm },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayActive: { backgroundColor: Colors.light.primary },
  dayText: { fontWeight: '600', color: '#6B7280' },
  dayTextActive: { color: '#fff' },
  backBtn: { alignItems: 'center', marginTop: Spacing.md },
  backBtnText: { color: Colors.light.textSecondary },
  verifyTitle: { ...Typography.h3, marginBottom: Spacing.xs },
  verifySubtitle: { ...Typography.caption, color: Colors.light.textSecondary, marginBottom: Spacing.md },
  documentsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  documentPreviewItem: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  documentPreview: { width: '100%', height: '100%' },
  removeDocumentButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeDocumentText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', lineHeight: 18 },
  uploadMoreButton: { marginBottom: Spacing.sm },
  documentHint: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  pendingBox: { backgroundColor: '#FEF3C7', padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  pendingText: { color: '#92400E' },
});
