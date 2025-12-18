/**
 * Select Event Type Screen
 * Screen for selecting an event type when creating an event listing
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
import { BackIcon, BellIcon, ForwardIcon, PartyIcon, MeetingIcon, WorkshopIcon } from '../components/common';
import { BottomNavigation, type BottomNavItem } from '../components/navigation';
import { Colors, Spacing, Typography, BorderRadius } from '../config/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2; // Account for padding and gap

type SelectEventTypeScreenProps = {
  navigation?: any;
  route?: {
    params?: {
      category?: string;
    };
  };
};

export type EventType = 'Parties' | 'Meetings' | 'Workshops';

interface EventTypeOption {
  id: EventType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const eventTypes: EventTypeOption[] = [
  {
    id: 'Parties',
    title: 'Parties',
    description: 'Parties, Meetings, Workshop',
    icon: <PartyIcon size={24} color="#FF146E" />,
  },
  {
    id: 'Meetings',
    title: 'Meetings',
    description: 'Items, gadgets, Merchandise',
    icon: <MeetingIcon size={24} />,
  },
  {
    id: 'Workshops',
    title: 'Workshops',
    description: 'Rentals, sales, sublets',
    icon: <WorkshopIcon size={24} />,
  },
];

export const SelectEventTypeScreen: React.FC<SelectEventTypeScreenProps> = ({
  navigation,
  route,
}) => {
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<BottomNavItem>('Home');

  const handleEventTypeSelect = (eventType: EventType) => {
    setSelectedEventType(eventType);
  };

  const handleContinue = () => {
    if (selectedEventType) {
      navigation?.navigate('EventListing', {
        category: 'Events',
        eventType: selectedEventType,
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
        <Text style={styles.titleText}>Select Event Type</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.eventTypesGrid}>
          {eventTypes.map((eventType) => (
            <TouchableOpacity
              key={eventType.id}
              style={[
                styles.eventTypeCard,
                selectedEventType === eventType.id && styles.eventTypeCardSelected,
              ]}
              onPress={() => handleEventTypeSelect(eventType.id)}
              activeOpacity={0.8}
            >
              <View style={styles.eventTypeIcon}>{eventType.icon}</View>
              <Text style={styles.eventTypeTitle}>{eventType.title}</Text>
              <Text style={styles.eventTypeDescription}>
                {eventType.description}
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
            !selectedEventType && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedEventType}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.continueButtonText,
              !selectedEventType && styles.continueButtonTextDisabled,
            ]}
          >
            Continue to details
          </Text>
          <ForwardIcon
            size={20}
            color={selectedEventType ? '#FFFFFF' : '#9CA3AF'}
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
  eventTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventTypeCard: {
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
  eventTypeCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F0F9FF',
  },
  eventTypeIcon: {
    marginBottom: Spacing.sm,
  },
  eventTypeTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    fontSize: 16,
    textAlign: 'left',
  },
  eventTypeDescription: {
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

