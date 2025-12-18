/**
 * Category Product Icon Component
 * Product/item icon for category selection screen
 */

import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface CategoryProductIconProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const CategoryProductIcon: React.FC<CategoryProductIconProps> = ({
  size = 24,
  color = '#16A34A',
  backgroundColor = '#F0FDF4',
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
        d="M10 17H7C4.79086 17 3 15.2091 3 13V7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7M3 21H10M16 21H19C20.1046 21 21 20.1046 21 19V12C21 10.8954 20.1046 10 19 10H16C14.8954 10 14 10.8954 14 12V19C14 20.1046 14.8954 21 16 21Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

