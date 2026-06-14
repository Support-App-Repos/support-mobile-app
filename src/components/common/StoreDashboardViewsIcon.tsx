/**
 * Store Dashboard — Views stat icon
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StoreDashboardViewsIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const StoreDashboardViewsIcon: React.FC<StoreDashboardViewsIconProps> = ({
  size = 34,
  color = '#A6A6A6',
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 34 34" fill="none" style={style}>
    <Path
      d="M2.91859 17.4852C2.80057 17.1673 2.80057 16.8175 2.91859 16.4996C4.06798 13.7127 6.01901 11.3297 8.52433 9.65297C11.0296 7.97619 13.9764 7.08105 16.9911 7.08105C20.0058 7.08105 22.9525 7.97619 25.4579 9.65297C27.9632 11.3297 29.9142 13.7127 31.0636 16.4996C31.1816 16.8175 31.1816 17.1673 31.0636 17.4852C29.9142 20.2721 27.9632 22.655 25.4579 24.3318C22.9525 26.0086 20.0058 26.9037 16.9911 26.9037C13.9764 26.9037 11.0296 26.0086 8.52433 24.3318C6.01901 22.655 4.06798 20.2721 2.91859 17.4852Z"
      stroke={color}
      strokeWidth={2.83206}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.9903 21.2403C19.3364 21.2403 21.2384 19.3384 21.2384 16.9922C21.2384 14.6461 19.3364 12.7441 16.9903 12.7441C14.6441 12.7441 12.7422 14.6461 12.7422 16.9922C12.7422 19.3384 14.6441 21.2403 16.9903 21.2403Z"
      stroke={color}
      strokeWidth={2.83206}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
