/**
 * My Listings Icon Component
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface MyListingsIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const MyListingsIcon: React.FC<MyListingsIconProps> = ({
  size = 24,
  color = '#6B7280',
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <Path
        d="M10 8V16H14M7.5 4.21V4.22M4.21 7.5V7.51M3 12V12.01M4.21 16.5V16.51M7.5 19.79V19.8M12 21V21.01M16.5 19.79V19.8M19.79 16.5V16.51M21 12V12.01M19.79 7.5V7.51M16.5 4.21V4.22M12 3V3.01"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};


