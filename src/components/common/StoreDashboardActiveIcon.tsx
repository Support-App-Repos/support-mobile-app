/**
 * Store Dashboard — Active stat icon
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StoreDashboardActiveIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const StoreDashboardActiveIcon: React.FC<StoreDashboardActiveIconProps> = ({
  size = 34,
  color = '#A6A6A6',
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 34 34" fill="none" style={style}>
    <Path
      d="M16.9904 31.1526C24.8109 31.1526 31.1507 24.8129 31.1507 16.9923C31.1507 9.17181 24.8109 2.83203 16.9904 2.83203C9.16986 2.83203 2.83008 9.17181 2.83008 16.9923C2.83008 24.8129 9.16986 31.1526 16.9904 31.1526Z"
      stroke={color}
      strokeWidth={2.83206}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12.7422 16.9932L15.5742 19.8253L21.2384 14.1611"
      stroke={color}
      strokeWidth={2.83206}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
