/**
 * Store Dashboard — Total Listings stat icon
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StoreDashboardListingsIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const StoreDashboardListingsIcon: React.FC<StoreDashboardListingsIconProps> = ({
  size = 34,
  color = '#A6A6A6',
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 34 34" fill="none" style={style}>
    <Path
      d="M21.2404 2.83203H8.49612C7.74501 2.83203 7.02467 3.13041 6.49355 3.66152C5.96244 4.19264 5.66406 4.91298 5.66406 5.66409V28.3206C5.66406 29.0717 5.96244 29.792 6.49355 30.3231C7.02467 30.8543 7.74501 31.1526 8.49612 31.1526H25.4885C26.2396 31.1526 26.9599 30.8543 27.4911 30.3231C28.0222 29.792 28.3205 29.0717 28.3205 28.3206V9.91218L21.2404 2.83203Z"
      stroke={color}
      strokeWidth={2.83206}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.8242 2.83203V8.49615C19.8242 9.24726 20.1226 9.96761 20.6537 10.4987C21.1848 11.0298 21.9052 11.3282 22.6563 11.3282H28.3204"
      stroke={color}
      strokeWidth={2.83206}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14.1621 12.7441H11.3301"
      stroke={color}
      strokeWidth={2.83206}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22.6583 18.4082H11.3301"
      stroke={color}
      strokeWidth={2.83206}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22.6583 24.0732H11.3301"
      stroke={color}
      strokeWidth={2.83206}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
