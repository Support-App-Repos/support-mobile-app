/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate phone number
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Check if string is not empty
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Filter to allow only numbers (including decimals for prices)
 * @param text Input text
 * @param allowDecimal Whether to allow decimal point
 * @returns Filtered text with only numbers
 */
export const filterNumbersOnly = (text: string, allowDecimal: boolean = true): string => {
  if (allowDecimal) {
    // Allow numbers and one decimal point
    const parts = text.split('.');
    if (parts.length > 2) {
      // More than one decimal point, keep only first
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return text.replace(/[^\d.]/g, '');
  }
  return text.replace(/\D/g, '');
};

/**
 * Filter to allow only letters and spaces (for names)
 * @param text Input text
 * @returns Filtered text with only letters and spaces
 */
export const filterLettersOnly = (text: string): string => {
  // Allow letters, spaces, hyphens, and apostrophes (for names like O'Brien, Mary-Jane)
  return text.replace(/[^a-zA-Z\s'-]/g, '');
};

/**
 * Filter to allow only alphanumeric characters (for tags, etc.)
 * @param text Input text
 * @returns Filtered text with only letters, numbers, and spaces
 */
export const filterAlphanumeric = (text: string): string => {
  return text.replace(/[^a-zA-Z0-9\s]/g, '');
};



