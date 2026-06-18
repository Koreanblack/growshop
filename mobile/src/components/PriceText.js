import React from 'react';
import { Text } from 'react-native';
import { COLORS } from '../constants/colors';

const formatPrice = (price) =>
  '$' + Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export default function PriceText({ price, style }) {
  return (
    <Text style={[{ color: COLORS.textMain, fontWeight: '700', fontSize: 16 }, style]}>
      {formatPrice(price)}
    </Text>
  );
}
