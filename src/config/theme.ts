/**
 * Application theme configuration
 */

export const Colors = {
  light: {
    primary: '#0D475C',
    secondary: '#72EF36',
    background: '#FFFFFF',
    surface: '#F7F7F7',
    text: '#1B1B1B',
    textSecondary: '#645B67',
    border: '#C6C6C8',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    /** Marketplace hero CTA / highlights (yellow, design mock) */
    bannerAccent: '#FACC15',
    /** Listing wizard headings (Figma) */
    textHeading: '#2C2C2C',
    /** Muted helper / step labels */
    textMuted: '#6B7280',
    /** Wizard card borders */
    cardBorder: '#E8E8ED',
    /** Selected type card background */
    cardSelectedBg: '#F0F9FF',
    /** Marketplace home + listing detail (Figma) */
    marketplace: {
      primary: '#1B4F72',
      primaryDark: '#153D5A',
      screenBg: '#F5F5F5',
      headerBg: '#FFFFFF',
      searchBg: '#F5F5F5',
      searchBorder: '#E5E7EB',
      searchPlaceholder: 'rgba(26,26,46,0.5)',
      titleText: '#1A1A2E',
      chipInactiveText: '#888888',
      ctaGreen: '#27AE60',
      eventBadge: '#7B2D8B',
      productBadge: '#1B4F72',
      detailProductBadge: '#1B6CA8',
      beautyBadge: '#E91E8C',
      cardBorder: '#F0F0F0',
      locationText: '#999999',
      metaText: '#888888',
      metaMuted: '#999999',
      logoGold: '#F4B942',
      notificationDot: '#EF4444',
      report: '#E74C3C',
      descriptionText: '#666666',
      divider: '#F0F0F0',
      screenSurface: '#FCFCFC',
      bottomBarBorder: '#EEEEEE',
    },
  },
  dark: {
    primary: '#0D475C',
    secondary: '#72EF36',
    background: '#1B1B1B',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#645B67',
    border: '#38383A',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
    bannerAccent: '#FACC15',
    textHeading: '#2C2C2C',
    textMuted: '#9CA3AF',
    cardBorder: '#38383A',
    cardSelectedBg: '#1C1C1E',
    marketplace: {
      primary: '#1B4F72',
      primaryDark: '#153D5A',
      screenBg: '#1B1B1B',
      headerBg: '#1C1C1E',
      searchBg: '#2C2C2E',
      searchBorder: '#38383A',
      searchPlaceholder: 'rgba(255,255,255,0.5)',
      titleText: '#FFFFFF',
      chipInactiveText: '#9CA3AF',
      ctaGreen: '#27AE60',
      eventBadge: '#7B2D8B',
      productBadge: '#1B4F72',
      detailProductBadge: '#1B6CA8',
      beautyBadge: '#E91E8C',
      cardBorder: '#38383A',
      locationText: '#9CA3AF',
      metaText: '#9CA3AF',
      metaMuted: '#6B7280',
      logoGold: '#F4B942',
      notificationDot: '#EF4444',
      report: '#E74C3C',
      descriptionText: '#9CA3AF',
      divider: '#38383A',
      screenSurface: '#1C1C1E',
      bottomBarBorder: '#38383A',
    },
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  listingTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    lineHeight: 33,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  stepEyebrow: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 17,
    letterSpacing: 0.5,
  },
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
} as const;

