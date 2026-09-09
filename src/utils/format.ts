/**
 * Formatting utility functions
 */

/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format phone number
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Home / feed card location: city + country from listing address fields.
 * Does not use marketplace region names (e.g. "Chicago").
 */
export const formatListingCardLocation = (listing: {
  city?: string | null;
  location?: string | null;
  regions?: Array<{ name?: string | null; country?: string | null } | null> | null;
  region?: { name?: string | null; country?: string | null } | null;
}): string | undefined => {
  const cityField = typeof listing.city === 'string' ? listing.city.trim() : '';
  const country =
    (listing.regions || [])
      .map((r) => (typeof r?.country === 'string' ? r.country.trim() : ''))
      .find(Boolean) ||
    (typeof listing.region?.country === 'string' ? listing.region.country.trim() : '') ||
    '';

  // GoogleLocationField often stores "City, CC" in city
  if (cityField.includes(',')) {
    return cityField;
  }
  if (cityField && country) {
    return `${cityField}, ${country}`;
  }
  if (cityField) {
    return cityField;
  }

  const address = typeof listing.location === 'string' ? listing.location.trim() : '';
  if (address) {
    const parts = address
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
    }
    if (country) {
      return `${address}, ${country}`;
    }
    return address;
  }

  return country || undefined;
};



