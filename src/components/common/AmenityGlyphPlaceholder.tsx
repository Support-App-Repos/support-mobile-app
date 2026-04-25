import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { ViewStyle } from 'react-native';

export interface AmenityGlyphPlaceholderProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const AmenityGlyphPlaceholder: React.FC<AmenityGlyphPlaceholderProps> = ({
  size = 24,
  color = '#9CA3AF',
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke={color} strokeWidth="1.5" />
  </Svg>
);
