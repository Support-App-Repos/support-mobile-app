/**
 * Select Service Type Screen
 * Screen for selecting a service type when creating a service listing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BackIcon,
  BellIcon,
  ForwardIcon,
  BeautyWellnessIcon,
  MedicalAestheticsIcon,
  HomeServiceIcon,
  ProfessionalServiceIcon,
} from '../components/common';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2; // Account for padding and gap

type SelectServiceTypeScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      category?: string;
    };
  };
};

export type ServiceType =
  | 'Beauty & Wellness'
  | 'Medical Aesthetics'
  | 'Home Services'
  | 'Professional Services';

interface ServiceTypeOption {
  id: ServiceType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const serviceTypes: ServiceTypeOption[] = [
  {
    id: 'Beauty & Wellness',
    title: 'Beauty & Wellness',
    description: 'Nail, Hair, spa, Massage',
    icon: <BeautyWellnessIcon size={24} color="#FF146E" />,
  },
  {
    id: 'Medical Aesthetics',
    title: 'Medical Aesthetics',
    description: 'Botox, fillers',
    icon: <MedicalAestheticsIcon size={24} />,
  },
  {
    id: 'Home Services',
    title: 'Home services',
    description: 'Painting, Plumbing, Electrical',
    icon: <HomeServiceIcon size={24} />,
  },
  {
    id: 'Professional Services',
    title: 'Professional Services',
    description: 'Legal, Consulting, Accountings',
    icon: <ProfessionalServiceIcon size={24} />,
  },
];

export const SelectServiceTypeScreen: React.FC<SelectServiceTypeScreenProps> =
  ({ navigation, route }) => {
    const [selectedServiceType, setSelectedServiceType] =
      useState<ServiceType | null>(null);
    const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');

    const handleServiceTypeSelect = (serviceType: ServiceType) => {
      setSelectedServiceType(serviceType);
    };

    const handleContinue = () => {
      if (selectedServiceType) {
        navigation?.navigate('ServiceListing', {
          category: 'Services',
          serviceType: selectedServiceType,
        });
      }
    };

    const handleBack = () => {
      navigation?.goBack();
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
          <Text style={styles.titleText}>Select Service Type</Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.serviceTypesGrid}>
            {serviceTypes.map((serviceType) => (
              <TouchableOpacity
                key={serviceType.id}
                style={[
                  styles.serviceTypeCard,
                  selectedServiceType === serviceType.id &&
                    styles.serviceTypeCardSelected,
                ]}
                onPress={() => handleServiceTypeSelect(serviceType.id)}
                activeOpacity={0.8}
              >
                <View style={styles.serviceTypeIcon}>
                  {serviceType.icon}
                </View>
                <Text style={styles.serviceTypeTitle}>
                  {serviceType.title}
                </Text>
                <Text style={styles.serviceTypeDescription}>
                  {serviceType.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedServiceType && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedServiceType}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.continueButtonText,
                !selectedServiceType && styles.continueButtonTextDisabled,
              ]}
            >
              Continue to details
            </Text>
            <ForwardIcon
              size={20}
              color={selectedServiceType ? '#FFFFFF' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onTabPress={(tab) => {
            setActiveTab(tab);
            if (tab === 'Home') {
              navigation?.navigate('Home');
            }
            // TODO: Handle other tab navigations
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
    paddingVertical: Spacing.md,
  },
  titleText: {
    ...Typography.h2,
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  serviceTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceTypeCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minHeight: 160,
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  serviceTypeCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F0F9FF',
  },
  serviceTypeIcon: {
    marginBottom: Spacing.sm,
  },
  serviceTypeTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    fontSize: 16,
    textAlign: 'left',
  },
  serviceTypeDescription: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    textAlign: 'left',
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.background,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 9999, // Pill shape
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
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

