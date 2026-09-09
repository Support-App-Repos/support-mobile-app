import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { listingService } from '../services';
import type { MyListingCardData } from '../components/listings';

type SnackbarState = {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
};

type UseMyListingActionsOptions = {
  onRefresh: () => void;
};

export function useMyListingActions({ onRefresh }: UseMyListingActionsOptions) {
  const [selectedListing, setSelectedListing] = useState<MyListingCardData | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [markSoldLoading, setMarkSoldLoading] = useState(false);
  const [listingSnackbar, setListingSnackbar] = useState<SnackbarState>({
    visible: false,
    message: '',
    type: 'success',
  });

  const openOptions = useCallback((listing: MyListingCardData) => {
    setSelectedListing(listing);
    setOptionsVisible(true);
  }, []);

  const closeOptions = useCallback(() => {
    setOptionsVisible(false);
  }, []);

  const openDeleteModal = useCallback(() => {
    setOptionsVisible(false);
    setDeleteModalVisible(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    if (!deleteLoading) {
      setDeleteModalVisible(false);
    }
  }, [deleteLoading]);

  const handleMarkAsSold = useCallback(async () => {
    if (!selectedListing || markSoldLoading) return;
    if (selectedListing.status === 'Paused') {
      closeOptions();
      return;
    }

    try {
      setMarkSoldLoading(true);
      closeOptions();
      const response = await listingService.updateOwnerListingStatus(selectedListing.id, 'Paused');
      if (response.success) {
        setListingSnackbar({
          visible: true,
          message: 'Listing marked as sold',
          type: 'success',
        });
        onRefresh();
      } else {
        Alert.alert('Error', 'Failed to mark listing as sold');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark listing as sold');
    } finally {
      setMarkSoldLoading(false);
    }
  }, [selectedListing, markSoldLoading, closeOptions, onRefresh]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedListing || deleteLoading) return;

    try {
      setDeleteLoading(true);
      await listingService.deleteListing(selectedListing.id);
      setDeleteModalVisible(false);
      setSelectedListing(null);
      setListingSnackbar({
        visible: true,
        message: 'Listing deleted successfully',
        type: 'success',
      });
      onRefresh();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete listing');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedListing, deleteLoading, onRefresh]);

  const dismissListingSnackbar = useCallback(() => {
    setListingSnackbar((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    selectedListing,
    optionsVisible,
    deleteModalVisible,
    deleteLoading,
    listingSnackbar,
    openOptions,
    closeOptions,
    openDeleteModal,
    closeDeleteModal,
    handleMarkAsSold,
    handleConfirmDelete,
    dismissListingSnackbar,
    markAsSoldDisabled: selectedListing?.status === 'Paused' || markSoldLoading,
  };
}
