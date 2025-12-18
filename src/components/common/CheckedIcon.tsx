/**
 * Checked Icon Component
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface CheckedIconProps {
  size?: number;
  style?: ViewStyle;
}

export const CheckedIcon: React.FC<CheckedIconProps> = ({
  size = 12,
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      style={style}
    >
      <Path
        d="M0 5.87755C0 2.63147 2.63147 0 5.87755 0C9.12363 0 11.7551 2.63147 11.7551 5.87755C11.7551 9.12363 9.12363 11.7551 5.87755 11.7551C2.63147 11.7551 0 9.12363 0 5.87755Z"
        fill="#DCFAE6"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.3739 3.61953L4.86696 7.00402L3.93635 6.00973C3.76492 5.8481 3.49553 5.8383 3.29961 5.97544C3.10859 6.11748 3.05471 6.36728 3.17226 6.5681L4.27431 8.36075C4.38206 8.52728 4.56818 8.63014 4.7788 8.63014C4.97961 8.63014 5.17063 8.52728 5.27839 8.36075C5.45471 8.13055 8.81961 4.11912 8.81961 4.11912C9.26043 3.6685 8.72655 3.27177 8.3739 3.61463V3.61953Z"
        fill="#079455"
      />
    </Svg>
  );
};

