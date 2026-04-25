/**
 * Category Event Icon — calendar (Select Category / marketing)
 * Tile: 36×36, radius 8, padding 8; glyph in 20×20 viewBox.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface CategoryEventIconProps {
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const CategoryEventIcon: React.FC<CategoryEventIconProps> = ({
  color = '#3B75E1',
  backgroundColor = '#E0ECFC',
  style,
}) => (
  <View style={[styles.tile, { backgroundColor }, style]}>
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M1.66699 15.8337C1.66699 17.2503 2.75033 18.3337 4.16699 18.3337H15.8337C17.2503 18.3337 18.3337 17.2503 18.3337 15.8337V9.16699H1.66699V15.8337ZM15.8337 3.33366H14.167V2.50033C14.167 2.00033 13.8337 1.66699 13.3337 1.66699C12.8337 1.66699 12.5003 2.00033 12.5003 2.50033V3.33366H7.50032V2.50033C7.50032 2.00033 7.16699 1.66699 6.66699 1.66699C6.16699 1.66699 5.83366 2.00033 5.83366 2.50033V3.33366H4.16699C2.75033 3.33366 1.66699 4.41699 1.66699 5.83366V7.50032H18.3337V5.83366C18.3337 4.41699 17.2503 3.33366 15.8337 3.33366Z"
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
