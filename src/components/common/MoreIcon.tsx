/**
 * More/Menu Icon Component (Three Dots)
 */

import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface MoreIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const MoreIcon: React.FC<MoreIconProps> = ({
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
      <Circle cx="12" cy="5" r="2" fill={color} />
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Circle cx="12" cy="19" r="2" fill={color} />
    </Svg>
  );
};


