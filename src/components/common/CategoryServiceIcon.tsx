/**
 * Category Service Icon Component
 * Star icon for category selection screen
 */

import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface CategoryServiceIconProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const CategoryServiceIcon: React.FC<CategoryServiceIconProps> = ({
  size = 24,
  color = '#EA580C',
  backgroundColor = '#FFCA95',
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
        d="M11.0896 4.55198C11.4734 3.81601 12.5266 3.81601 12.9104 4.55198L14.9277 8.42007C15.0815 8.71501 15.3687 8.91716 15.6983 8.96248L20.1119 9.5694C20.9717 9.68762 21.3061 10.7529 20.6683 11.3413L17.5487 14.2189C17.2904 14.4572 17.1719 14.811 17.2345 15.1568L17.9808 19.2742C18.1315 20.1055 17.2696 20.7529 16.5131 20.3766L12.4574 18.3588C12.1693 18.2155 11.8307 18.2155 11.5426 18.3588L7.48688 20.3766C6.73042 20.7529 5.86852 20.1055 6.0192 19.2742L6.76546 15.1568C6.82813 14.811 6.70961 14.4572 6.45132 14.2189L3.33174 11.3413C2.69386 10.7529 3.02832 9.68762 3.88805 9.5694L8.30174 8.96248C8.63129 8.91716 8.91846 8.71501 9.07228 8.42007L11.0896 4.55198Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};


