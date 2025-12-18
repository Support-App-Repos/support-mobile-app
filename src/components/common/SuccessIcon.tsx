/**
 * Success Icon Component
 */

import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface SuccessIconProps {
  size?: number;
  style?: ViewStyle;
}

export const SuccessIcon: React.FC<SuccessIconProps> = ({
  size = 70,
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 70 70"
      fill="none"
      style={style}
    >
      <Circle cx="35" cy="35" r="35" fill="#DCFAE6" />
      <Path
        d="M28.4378 34.9998L32.8128 39.3748L41.5628 30.6248M49.5837 34.9998C49.5837 43.054 43.0545 49.5832 35.0003 49.5832C26.9462 49.5832 20.417 43.054 20.417 34.9998C20.417 26.9457 26.9462 20.4165 35.0003 20.4165C43.0545 20.4165 49.5837 26.9457 49.5837 34.9998Z"
        stroke="#079455"
        strokeWidth="2.91667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

