/**
 * Property Icon Component (Lightning bolt)
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface PropertyIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const PropertyIcon: React.FC<PropertyIconProps> = ({
  size = 14,
  color = '#828282',
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      style={style}
    >
      <Path
        d="M5.96327 8.45185L5.54846 12.6L10.9411 6.79259L8.03735 5.13333L8.45216 1.39999L3.05957 7.2074L5.96327 8.45185Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};


