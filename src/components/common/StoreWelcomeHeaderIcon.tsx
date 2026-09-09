/**
 * Store hub welcome header — 24h storefront illustration from design
 */

import React from 'react';
import { Image, StyleProp, View, ViewStyle } from 'react-native';

const welcomeStoreIcon = require('../../assets/images/store-hub/welcome-store-icon.png');

interface StoreWelcomeHeaderIconProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const StoreWelcomeHeaderIcon: React.FC<StoreWelcomeHeaderIconProps> = ({
  size = 56,
  style,
}) => (
  <View style={[{ width: size, height: size, borderRadius: size * 0.22, overflow: 'hidden' }, style]}>
    <Image
      source={welcomeStoreIcon}
      style={{ width: size, height: size, resizeMode: 'cover' }}
      accessibilityLabel="Store"
    />
  </View>
);
