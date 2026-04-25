/**
 * Category Product Icon — bag (Select Category / marketing)
 * Tile: 36×36, radius 8, padding 8; glyph in 20×20 viewBox.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface CategoryProductIconProps {
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const CategoryProductIcon: React.FC<CategoryProductIconProps> = ({
  color = '#3EB177',
  backgroundColor = '#E6F7EF',
  style,
}) => (
  <View style={[styles.tile, { backgroundColor }, style]}>
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.50005 6.66667C7.50005 6.00363 7.76344 5.36774 8.23228 4.8989C8.70112 4.43006 9.33701 4.16667 10 4.16667C10.6631 4.16667 11.299 4.43006 11.7678 4.8989C12.2367 5.36774 12.5 6.00363 12.5 6.66667H7.50005ZM5.83338 6.66667C5.83338 5.5616 6.27237 4.50179 7.05377 3.72039C7.83517 2.93899 8.89498 2.5 10 2.5C11.1051 2.5 12.1649 2.93899 12.9463 3.72039C13.7277 4.50179 14.1667 5.5616 14.1667 6.66667H16.6667C16.7825 6.66666 16.897 6.69077 17.0029 6.73747C17.1088 6.78416 17.2039 6.85241 17.2819 6.93787C17.36 7.02333 17.4195 7.12412 17.4564 7.23381C17.4934 7.34351 17.5071 7.45971 17.4967 7.575L16.8009 15.2267C16.7443 15.8478 16.4576 16.4254 15.9971 16.846C15.5366 17.2666 14.9354 17.4999 14.3117 17.5H5.68838C5.06467 17.4999 4.46354 17.2666 4.003 16.846C3.54245 16.4254 3.25576 15.8478 3.19922 15.2267L2.50338 7.575C2.49296 7.45971 2.50668 7.34351 2.54366 7.23381C2.58063 7.12412 2.64006 7.02333 2.71815 6.93787C2.79624 6.85241 2.89127 6.78416 2.9972 6.73747C3.10313 6.69077 3.21762 6.66666 3.33338 6.66667H5.83338Z"
        fill={color}
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  tile: {
    width: 36,
    height: 36,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
  },
});
