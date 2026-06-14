/**
 * Store Dashboard — Edit Store quick action icon
 */

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';
import { Colors } from '../../config/theme';

interface StoreQuickActionEditIconProps {
  size?: number;
  style?: ViewStyle;
}

const CIRCLE_CX = 25.4836;
const CIRCLE_CY = 25.4836;
const CIRCLE_R = 25.4836;

export const StoreQuickActionEditIcon: React.FC<StoreQuickActionEditIconProps> = ({
  size = 51,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 51 51" fill="none" style={style}>
    <Circle cx={CIRCLE_CX} cy={CIRCLE_CY} r={CIRCLE_R} fill={Colors.light.primary} />
    <Path
      d="M35.2166 19.9751C35.778 19.4139 36.0935 18.6526 36.0936 17.8587C36.0937 17.0649 35.7784 16.3036 35.2172 15.7422C34.6559 15.1808 33.8946 14.8653 33.1008 14.8652C32.307 14.8651 31.5456 15.1804 30.9842 15.7416L16.8132 29.9158C16.5667 30.1616 16.3844 30.4643 16.2823 30.7971L14.8797 35.4182C14.8522 35.51 14.8501 35.6075 14.8737 35.7005C14.8972 35.7934 14.9454 35.8782 15.0132 35.9459C15.081 36.0136 15.1659 36.0617 15.2589 36.0851C15.3518 36.1084 15.4494 36.1062 15.5412 36.0786L20.1633 34.677C20.4958 34.5759 20.7984 34.3947 21.0446 34.1493L35.2166 19.9751Z"
      stroke="white"
      strokeWidth={2.12363}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
