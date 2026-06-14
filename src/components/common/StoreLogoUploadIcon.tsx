/**
 * Store image upload placeholder icon
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StoreLogoUploadIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const StoreLogoUploadIcon: React.FC<StoreLogoUploadIconProps> = ({
  size = 34,
  color = '#717182',
  style,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 34 34" fill="none" style={style}>
      <Path
        d="M29.7385 21.2402V26.9044C29.7385 27.6555 29.4402 28.3758 28.9091 28.9069C28.3779 29.438 27.6576 29.7364 26.9065 29.7364H7.08206C6.33095 29.7364 5.61061 29.438 5.07949 28.9069C4.54838 28.3758 4.25 27.6555 4.25 26.9044V21.2402"
        stroke={color}
        strokeWidth={2.83206}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M24.0724 11.3282L16.9923 4.24805L9.91211 11.3282"
        stroke={color}
        strokeWidth={2.83206}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.9922 4.24805V21.2404"
        stroke={color}
        strokeWidth={2.83206}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
