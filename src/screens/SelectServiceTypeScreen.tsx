/**
 * Select Service Type Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BeautyWellnessIcon,
  MedicalAestheticsIcon,
  HomeServiceIcon,
  ProfessionalServiceIcon,
  Snackbar,
} from '../components/common';
import {
  ListingWizardHeader,
  ListingTypeCard,
  ListingWizardFooter,
} from '../components/listings/wizard';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography } from '../config/theme';
import { categoryService } from '../services';
import { useProfile } from '../hooks';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 2 - Spacing.sm) / 2;

type SelectServiceTypeScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      category?: string;
      categoryId?: string;
    };
  };
};

const getServiceTypeIcon = (serviceTypeName: string) => {
  const name = serviceTypeName.toLowerCase();
  if (name.includes('beauty') || name.includes('wellness')) {
    return <BeautyWellnessIcon size={24} color="#FF146E" />;
  }
  if (name.includes('medical') || name.includes('aesthetic')) {
    return <MedicalAestheticsIcon size={24} />;
  }
  if (name.includes('home')) {
    return <HomeServiceIcon size={24} />;
  }
  if (name.includes('professional')) {
    return <ProfessionalServiceIcon size={24} />;
  }
  return <ProfessionalServiceIcon size={24} />;
};

const getServiceTypeTag = (serviceTypeName: string): string | undefined => {
  const name = serviceTypeName.toLowerCase();
  if (name.includes('beauty')) return 'Popular';
  if (name.includes('medical')) return 'Trusted';
  if (name.includes('home')) return 'Top Rated';
  if (name.includes('professional')) return 'Professional';
  return undefined;
};

export const SelectServiceTypeScreen: React.FC<SelectServiceTypeScreenProps> = ({
  navigation,
  route,
}) => {
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { profileImageUrl } = useProfile();
  const categoryId = route?.params?.categoryId;

  useEffect(() => {
    fetchServiceTypes();
  }, [categoryId]);

  const fetchServiceTypes = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getServiceTypes();
      const serviceTypesData = (response.data as any)?.data || response.data || [];

      if (response.success && Array.isArray(serviceTypesData)) {
        const byCategory = categoryId
          ? serviceTypesData.filter((st: any) => st.categoryId === categoryId)
          : serviceTypesData;
        setServiceTypes(byCategory);
      }
    } catch (error: any) {
      console.error('Error fetching service types:', error);
      Alert.alert('Error', error.message || 'Failed to load service types');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedServiceType) {
      navigation?.navigate('ServiceListing', {
        categoryId: categoryId || route?.params?.category,
        category: route?.params?.category || 'Services',
        serviceTypeId: selectedServiceType.id,
        serviceType: selectedServiceType.name || selectedServiceType.slug,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ListingWizardHeader
        eyebrow="Step 1 of 3"
        title="Select Service Type"
        subtitle="Choose the category that best fits the service you want to offer."
        profileImageUrl={profileImageUrl}
        onBack={() => navigation?.goBack()}
        onProfilePress={() => navigation?.navigate('Profile')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Loading service types...</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {serviceTypes.map((serviceType) => (
              <ListingTypeCard
                key={serviceType.id}
                style={{ width: CARD_WIDTH }}
                title={serviceType.name}
                description={serviceType.description || 'Select to create listing'}
                icon={getServiceTypeIcon(serviceType.name)}
                tag={getServiceTypeTag(serviceType.name)}
                selected={selectedServiceType?.id === serviceType.id}
                onPress={() => setSelectedServiceType(serviceType)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <ListingWizardFooter
        label="Continue to details"
        onPress={handleContinue}
        disabled={!selectedServiceType}
      />

      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          if (tab === 'Home') navigation?.navigate('Home');
          else if (tab === 'Store') navigation?.navigate('Store');
          else if (tab === 'Messages') setSnackbarVisible(true);
          else if (tab === 'Profile') navigation?.navigate('Profile');
        }}
        onCreatePress={() => {}}
        showCreateButton={false}
      />

      <Snackbar
        visible={snackbarVisible}
        message="Coming soon feature"
        type="info"
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
});
