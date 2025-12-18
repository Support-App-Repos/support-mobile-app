/**
 * Sign Out Icon Component
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface SignOutIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const SignOutIcon: React.FC<SignOutIconProps> = ({
  size = 24,
  color = '#B7B7B7',
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
        d="M16 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21072 18.5304 4 18 4H16M8 16L4 12M4 12L8 8M4 12H16"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

