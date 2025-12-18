/**
 * Properties Icon Component
 */

import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface PropertiesIconProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const PropertiesIcon: React.FC<PropertiesIconProps> = ({
  size = 24,
  color = '#9333EA',
  backgroundColor = '#FAD8FF',
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
      <Rect width="24" height="24" rx="6" fill={backgroundColor} />
      <Path
        d="M5 10V21H19V4H16V7M21 12L12 3L3 12M3 21H21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

