/**
 * Back Icon Component using SVG
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface BackIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const BackIcon: React.FC<BackIconProps> = ({
  size = 24,
  color = '#030303',
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
        d="M15 18L9 12L15 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};


