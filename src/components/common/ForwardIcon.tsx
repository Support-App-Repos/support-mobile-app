/**
 * Forward Icon Component
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface ForwardIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const ForwardIcon: React.FC<ForwardIconProps> = ({
  size = 24,
  color = '#111827',
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
        d="M9 18L15 12L9 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

