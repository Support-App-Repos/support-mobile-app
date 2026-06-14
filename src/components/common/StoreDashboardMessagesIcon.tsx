/**
 * Store Dashboard — Messages stat icon
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StoreDashboardMessagesIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const StoreDashboardMessagesIcon: React.FC<StoreDashboardMessagesIconProps> = ({
  size = 34,
  color = '#A6A6A6',
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 34 34" fill="none" style={style}>
    <Path
      d="M11.1866 28.3209C13.8892 29.7073 16.9981 30.0828 19.9531 29.3798C22.9081 28.6768 25.5148 26.9415 27.3035 24.4866C29.0922 22.0317 29.9454 19.0186 29.7091 15.9904C29.4729 12.9621 28.1628 10.1178 26.015 7.97003C23.8672 5.82223 21.0229 4.51217 17.9947 4.27593C14.9664 4.03968 11.9534 4.89279 9.49845 6.68152C7.04354 8.47025 5.30823 11.077 4.60522 14.0319C3.9022 16.9869 4.27772 20.0958 5.66409 22.7984L2.83203 31.153L11.1866 28.3209Z"
      stroke={color}
      strokeWidth={2.83206}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
