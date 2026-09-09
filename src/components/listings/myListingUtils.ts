/**
 * Shared badge helpers for my listing cards and options sheet
 */

import { MyListingCardData } from './MyListingCard';

const MP = {
  eventBadge: '#7B2D8B',
  productBadge: '#1B6CA8',
  beautyBadge: '#E91E8C',
  primary: '#1B4F72',
};

export function getListingBadgeLabel(listing: Pick<MyListingCardData, 'category' | 'propertyPurpose' | 'serviceType'>): string {
  const cat = `${listing.category?.name || ''} ${listing.category?.slug || ''}`.toLowerCase();
  if (cat.includes('propert')) {
    const purpose = (listing.propertyPurpose || '').toLowerCase();
    if (purpose.includes('rent')) return 'For Rent';
    if (purpose.includes('sale')) return 'For Sale';
    return 'Property';
  }
  if (cat.includes('event')) return 'Event';
  if (cat.includes('product')) return 'Product';
  if (cat.includes('service')) {
    const st = (listing.serviceType?.name || '').toLowerCase();
    if (st.includes('beauty') || st.includes('medical') || st.includes('aesthetic')) return 'Beauty';
    return 'Service';
  }
  return listing.category?.name || 'Listing';
}

export function getListingBadgeColor(listing: Pick<MyListingCardData, 'category' | 'propertyPurpose'>): string {
  const label = getListingBadgeLabel(listing).toLowerCase();
  if (label.includes('event')) return MP.eventBadge;
  if (label.includes('product')) return MP.productBadge;
  if (label.includes('beauty') || label.includes('service')) return MP.beautyBadge;
  if (label.includes('rent')) return MP.primary;
  if (label.includes('sale')) return '#E99132';
  return MP.primary;
}

export function getListingStatusStyle(status: string): { bg: string; color: string; label: string } {
  const label = status === 'Paused' ? 'Sold' : status;
  switch (status) {
    case 'Active':
      return { bg: '#EAFAF1', color: '#27AE60', label };
    case 'Pending':
      return { bg: '#FEF5EC', color: '#E67E22', label };
    case 'Paused':
      return { bg: '#F3F4F6', color: '#6B7280', label };
    case 'Expired':
    case 'Rejected':
      return { bg: '#FEE2E2', color: '#EF4444', label };
    default:
      return { bg: '#F5F5F5', color: '#888888', label };
  }
}
