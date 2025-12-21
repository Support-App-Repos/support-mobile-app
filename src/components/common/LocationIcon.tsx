/**
 * Location Icon Component
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface LocationIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const LocationIcon: React.FC<LocationIconProps> = ({
  size = 15,
  color = '#6B7280',
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 15 17"
      fill="none"
      style={style}
    >
      <Path
        d="M11.25 6.375C11.25 10.8472 7.5 14.875 7.5 14.875C7.5 14.875 3.75 10.8472 3.75 6.375C3.75 4.02779 5.42893 2.125 7.5 2.125C9.57107 2.125 11.25 4.02779 11.25 6.375Z"
        stroke={color}
        strokeLinejoin="round"
      />
      <Path
        d="M8.75 6.375C8.75 7.1574 8.19036 7.79167 7.5 7.79167C6.80964 7.79167 6.25 7.1574 6.25 6.375C6.25 5.5926 6.80964 4.95833 7.5 4.95833C8.19036 4.95833 8.75 5.5926 8.75 6.375Z"
        stroke={color}
        strokeLinejoin="round"
      />
    </Svg>
  );
};


