/**
 * Share Icon Component using SVG
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface ShareIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const ShareIcon: React.FC<ShareIconProps> = ({
  size = 24,
  color = '#FFFFFF',
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 15 15"
      fill="none"
      style={style}
    >
      <Path
        d="M3.61111 6.72222C2.8878 6.72222 2.52614 6.72222 2.22942 6.80173C1.42421 7.01749 0.795263 7.64643 0.579506 8.45164C0.5 8.74837 0.5 9.11002 0.5 9.83333V10.7667C0.5 12.0735 0.5 12.7269 0.754318 13.226C0.978023 13.665 1.33498 14.022 1.77402 14.2457C2.27315 14.5 2.92654 14.5 4.23333 14.5H10.7667C12.0735 14.5 12.7269 14.5 13.226 14.2457C13.665 14.022 14.022 13.665 14.2457 13.226C14.5 12.7269 14.5 12.0735 14.5 10.7667V9.83333C14.5 9.11002 14.5 8.74837 14.4205 8.45164C14.2047 7.64643 13.5758 7.01749 12.7706 6.80173C12.4739 6.72222 12.1122 6.72222 11.3889 6.72222M10.6111 3.61111L7.5 0.5M7.5 0.5L4.38889 3.61111M7.5 0.5V9.83333"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

