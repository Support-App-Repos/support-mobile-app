/**
 * Select Region Screen
 * Third step of the multi-step listing creation form
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, BellIcon, StepCompletedMarkIcon, SimpleSearchIcon } from '../components/common';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';

type SelectRegionScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      listingData?: any;
      paymentData?: any;
    };
  };
};

const FORM_STEPS = ['Details', 'Payment', 'Select Region', 'Confirm'];

interface Region {
  id: string;
  name: string;
  country: string;
}

// Mock data for regions
const ALL_REGIONS: Region[] = [
  { id: '1', name: 'New York', country: 'United States' },
  { id: '2', name: 'Los Angeles', country: 'United States' },
  { id: '3', name: 'Chicago', country: 'United States' },
  { id: '4', name: 'Houston', country: 'United States' },
  { id: '5', name: 'Phoenix', country: 'United States' },
  { id: '6', name: 'Philadelphia', country: 'United States' },
  { id: '7', name: 'San Antonio', country: 'United States' },
  { id: '8', name: 'San Diego', country: 'United States' },
];

// Mock recent regions
const RECENT_REGIONS = ['New York', 'Los Angeles'];

export const SelectRegionScreen: React.FC<SelectRegionScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');

  const currentStep = 2; // Third step (Select Region)

  // Filter regions based on search query
  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) {
      return ALL_REGIONS;
    }
    const query = searchQuery.toLowerCase();
    return ALL_REGIONS.filter(
      (region) =>
        region.name.toLowerCase().includes(query) ||
        region.country.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleBack = () => {
    navigation?.goBack();
  };

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
  };

  const handleRecentSelect = (regionName: string) => {
    const region = ALL_REGIONS.find((r) => r.name === regionName);
    if (region) {
      setSelectedRegion(region);
    }
  };

  const handleConfirmRegion = () => {
    if (selectedRegion) {
      const regionData = { name: selectedRegion.name, id: selectedRegion.id };
      navigation?.navigate('Review', {
        listingData: route?.params?.listingData,
        paymentData: route?.params?.paymentData,
        regionData,
      });
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
              source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>Select Region</Text>
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
                  {index < currentStep && (
                    <StepCompletedMarkIcon size={8} />
                  )}
                  {index === currentStep && (
                    <View style={styles.progressDotActive} />
                  )}
                  {index > currentStep && (
                    <View style={styles.progressDotInactive} />
                  )}
                </View>
                {index < FORM_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.progressLine,
                      index < currentStep && styles.progressLineActive,
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
          Choose where your listing should appear
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SimpleSearchIcon size={18} color="#667085" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Regions..."
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Recents Section */}
        {RECENT_REGIONS.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recents</Text>
            <View style={styles.recentsContainer}>
              {RECENT_REGIONS.map((regionName) => (
                <TouchableOpacity
                  key={regionName}
                  style={[
                    styles.recentPill,
                    selectedRegion?.name === regionName && styles.recentPillSelected,
                  ]}
                  onPress={() => handleRecentSelect(regionName)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.recentPillText,
                      selectedRegion?.name === regionName && styles.recentPillTextSelected,
                    ]}
                  >
                    {regionName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* All Regions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Regions</Text>
          {filteredRegions.map((region) => (
            <TouchableOpacity
              key={region.id}
              style={[
                styles.regionCard,
                selectedRegion?.id === region.id && styles.regionCardSelected,
              ]}
              onPress={() => handleRegionSelect(region)}
              activeOpacity={0.8}
            >
              <View style={styles.regionInfo}>
                <Text style={styles.regionName}>{region.name}</Text>
                <Text style={styles.regionCountry}>{region.country}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirm Region Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedRegion && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmRegion}
          disabled={!selectedRegion}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.confirmButtonText,
              !selectedRegion && styles.confirmButtonTextDisabled,
            ]}
          >
            Confirm Region
          </Text>
        </TouchableOpacity>
      </ScrollView>

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.light.text,
    fontSize: 14,
    padding: 0,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  recentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  recentPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 9999, // Pill shape
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.background,
  },
  recentPillSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: Colors.light.primary,
  },
  recentPillText: {
    ...Typography.body,
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  recentPillTextSelected: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  regionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  regionCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F0F9FF',
  },
  regionInfo: {
    flex: 1,
  },
  regionName: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  regionCountry: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  confirmButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});

