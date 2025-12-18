/**
 * Help/Support Icon Component
 */

import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface HelpIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const HelpIcon: React.FC<HelpIconProps> = ({
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
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="16" r="1" fill={color} />
      <Path
        d="M9.5 9.4C9.5 8.07452 10.6193 7 12 7C13.3807 7 14.5 8.07452 14.5 9.4C14.5 10.7255 13.3807 11.8 12 11.8V13"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

