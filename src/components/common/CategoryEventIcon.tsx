/**
 * Category Event Icon Component
 * Calendar icon for category selection screen
 */

import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface CategoryEventIconProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const CategoryEventIcon: React.FC<CategoryEventIconProps> = ({
  size = 24,
  color = '#2563EB',
  backgroundColor = '#E0ECFC',
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
        d="M7.5 4H7C4.79086 4 3 5.79086 3 8M7.5 4V2M7.5 4H16.5M16.5 4H17C19.2091 4 21 5.79086 21 8M16.5 4V2M3 8V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V8M3 8H21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};


