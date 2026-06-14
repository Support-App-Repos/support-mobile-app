/**
 * Verification info icon for store verify step
 */

import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface VerificationInfoIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const VerificationInfoIcon: React.FC<VerificationInfoIconProps> = ({
  size = 16,
  color = '#0A0A0A',
  style,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={style}>
      <G clipPath="url(#verificationInfoClip)">
        <Path
          d="M7.99399 14.6559C11.6733 14.6559 14.6559 11.6733 14.6559 7.99399C14.6559 4.31469 11.6733 1.33203 7.99399 1.33203C4.31469 1.33203 1.33203 4.31469 1.33203 7.99399C1.33203 11.6733 4.31469 14.6559 7.99399 14.6559Z"
          stroke={color}
          strokeWidth={1.33239}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7.99414 5.3291V7.99388"
          stroke={color}
          strokeWidth={1.33239}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7.99414 10.6592H8.0008"
          stroke={color}
          strokeWidth={1.33239}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="verificationInfoClip">
          <Rect width={15.9887} height={15.9887} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
