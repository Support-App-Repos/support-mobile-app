import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

export interface AmenityCentralAcAndHeatingIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const AmenityCentralAcAndHeatingIcon: React.FC<AmenityCentralAcAndHeatingIconProps> = ({
  size = 24,
  color = '#D13A3F',
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 22 20" fill="none" style={style}>
    <Path d="M5.75 9.75H15.75M14.75 0.75C17.089 0.75 18.258 0.75 19.112 1.286C19.5575 1.56584 19.9342 1.94251 20.214 2.388C20.75 3.242 20.75 4.41 20.75 6.75C20.75 9.09 20.75 10.258 20.213 11.112C19.9336 11.5569 19.5577 11.9332 19.113 12.213C18.257 12.75 17.088 12.75 14.75 12.75H6.75C4.411 12.75 3.242 12.75 2.388 12.213C1.94273 11.9337 1.56608 11.5578 1.286 11.113C0.75 10.257 0.75 9.088 0.75 6.75C0.75 4.412 0.75 3.242 1.286 2.388C1.56584 1.94251 1.94251 1.56584 2.388 1.286C3.242 0.75 4.41 0.75 6.75 0.75H14.75Z" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <Path d="M16.75 4.75H16.759" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M5.55 15.75C5.55 15.75 6.35 17.625 4.75 18.75M15.95 15.75C15.95 15.75 15.15 17.625 16.75 18.75M10.75 15.75V18.75" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
