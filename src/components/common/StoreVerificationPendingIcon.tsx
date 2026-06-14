/**
 * Illustration for store verification pending / under review state
 */

import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StoreVerificationPendingIconProps {
  size?: number;
  style?: ViewStyle;
}

export const StoreVerificationPendingIcon: React.FC<StoreVerificationPendingIconProps> = ({
  size = 140,
  style,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 140 140" fill="none" style={style}>
      <Circle cx="70" cy="70" r="58" fill="#1A6B5A14" />
      <Circle cx="70" cy="70" r="44" fill="#1A6B5A0F" />

      <Rect x="38" y="34" width="52" height="66" rx="8" fill="#FFFFFF" stroke="#1A6B5A" strokeWidth="2.5" />
      <Path
        d="M50 52H78"
        stroke="#1A6B5A"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={0.55}
      />
      <Path
        d="M50 62H74"
        stroke="#1A6B5A"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={0.45}
      />
      <Path
        d="M50 72H70"
        stroke="#1A6B5A"
        strokeWidth="2"
        strokeLinecap="round"
        opacity={0.35}
      />

      <Circle cx="92" cy="88" r="24" fill="#FFFFFF" stroke="#D97706" strokeWidth="2.5" />
      <Circle cx="92" cy="88" r="2.5" fill="#D97706" />
      <Path
        d="M92 88V76"
        stroke="#D97706"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Path
        d="M92 88L100 92"
        stroke="#D97706"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <Path
        d="M52 34V28C52 25.7909 53.7909 24 56 24H72C74.2091 24 76 25.7909 76 28V34"
        stroke="#1A6B5A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <Circle cx="98" cy="42" r="14" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <Path
        d="M98 36V42L102 44"
        stroke="#D97706"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
