/**
 * Edit Profile Screen
 * Allows users to update their profile information
 */

import React, { useState, useEffect } from 'react';
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
import { BackIcon } from '../components/common';
import { profileService, pickImages, uploadImages } from '../services';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';
import { useProfileContext } from '../contexts/ProfileContext';

type EditProfileScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      user?: any;
    };
  };
};

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  navigation,
  route,
}) => {
  const { user: contextUser, refreshProfile } = useProfileContext();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null); // Local URI before upload
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Store original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    profileImageUrl: null as string | null,
  });

  // Use user from route params if available, otherwise use context user
  const user = route?.params?.user || contextUser;

  useEffect(() => {
    if (user) {
      // Parse fullName into firstName and lastName
      const fullName = user.fullName || user.name || '';
      const nameParts = fullName.trim().split(/\s+/);
      const firstNameValue = user.firstName || nameParts[0] || '';
      const lastNameValue = user.lastName || nameParts.slice(1).join(' ') || '';
      const emailValue = user.email || '';
      const phoneNumberValue = user.phoneNumber || user.phone || '';
      const profileImageUrlValue = user.profileImageUrl || user.profileImage || user.avatar || null;
      
      setFirstName(firstNameValue);
      setLastName(lastNameValue);
      setEmail(emailValue);
      setPhoneNumber(phoneNumberValue);
      setProfileImageUrl(profileImageUrlValue);

      // Store original values
      setOriginalValues({
        firstName: firstNameValue,
        lastName: lastNameValue,
        email: emailValue,
        phoneNumber: phoneNumberValue,
        profileImageUrl: profileImageUrlValue,
      });
    }
  }, [user]);

  const handleBack = () => {
    navigation?.goBack();
  };

  const handlePickProfileImage = async () => {
    try {
      setUploadingImage(true);
      const selectedUris = await pickImages();
      
      if (selectedUris && selectedUris.length > 0) {
        // Set local URI for preview
        setProfileImageUri(selectedUris[0]);
        
        // Upload image
        const uploadedImages = await uploadImages(selectedUris, 'profiles/');
        if (uploadedImages && uploadedImages.length > 0) {
          setProfileImageUrl(uploadedImages[0].url);
          setProfileImageUri(null); // Clear local URI after upload
          Alert.alert('Success', 'Profile picture uploaded successfully');
        }
      }
    } catch (error: any) {
      console.error('Error picking/uploading profile image:', error);
      Alert.alert('Error', error.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'Please enter your first name');
      return;
    }

    if (!lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter your last name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      const updatePayload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      };

      if (phoneNumber.trim()) {
        updatePayload.phoneNumber = phoneNumber.trim();
      }

      if (profileImageUrl) {
        updatePayload.profileImage = profileImageUrl;
      }

      console.log('[EditProfile] Sending update:', updatePayload);

      const response = await profileService.updateProfile(updatePayload);

      if (response.success) {
        // Refresh profile data globally
        await refreshProfile();
        
        // Navigate back to Profile screen
        Alert.alert('Success', 'Profile updated successfully', [
          {
            text: 'OK',
            onPress: () => {
              navigation?.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayImage = profileImageUri || profileImageUrl;

  // Check if any changes have been made
  const hasChanges = 
    firstName.trim() !== originalValues.firstName.trim() ||
    lastName.trim() !== originalValues.lastName.trim() ||
    email.trim() !== originalValues.email.trim() ||
    phoneNumber.trim() !== (originalValues.phoneNumber || '').trim() ||
    profileImageUrl !== originalValues.profileImageUrl;

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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profileImageContainer}>
            {displayImage ? (
              <Image
                source={{ uri: displayImage }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {firstName.charAt(0).toUpperCase() || lastName.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={handlePickProfileImage}
            activeOpacity={0.7}
            disabled={uploadingImage}
          >
            <Text style={styles.changePhotoButtonText}>
              {uploadingImage ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor={Colors.light.textSecondary}
              autoCapitalize="words"
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor={Colors.light.textSecondary}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={Colors.light.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              placeholderTextColor={Colors.light.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton, 
            (!hasChanges || loading) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          activeOpacity={0.7}
          disabled={!hasChanges || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.saveButtonText,
              !hasChanges && styles.saveButtonTextDisabled
            ]}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.surface,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    ...Typography.h1,
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '600',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  changePhotoButtonText: {
    ...Typography.body,
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  formSection: {
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  input: {
    ...Typography.body,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.light.text,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#FFFFFF',
    opacity: 0.6,
  },
});

