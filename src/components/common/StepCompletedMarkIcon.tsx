/**
 * Step Completed Mark Icon Component
 * Used in progress indicators to show completed steps
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface StepCompletedMarkIconProps {
  size?: number;
  style?: ViewStyle;
}

export const StepCompletedMarkIcon: React.FC<StepCompletedMarkIconProps> = ({
  size = 5,
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 5 4"
      fill="none"
      style={style}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.0299 0.102914L1.3449 2.69416L0.632402 1.93291C0.501152 1.80916 0.294902 1.80166 0.144902 1.90666C-0.0013478 2.01541 -0.0425979 2.20666 0.0474021 2.36041L0.891152 3.73291C0.973652 3.86041 1.11615 3.93916 1.2774 3.93916C1.43115 3.93916 1.5774 3.86041 1.6599 3.73291C1.7949 3.55666 4.37115 0.485414 4.37115 0.485414C4.70865 0.140414 4.2999 -0.163336 4.0299 0.0991638V0.102914Z"
        fill="white"
      />
    </Svg>
  );
};

