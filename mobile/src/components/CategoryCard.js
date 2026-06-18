import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const CATEGORY_COLORS = {
  iluminacion: '#2E7D32',
  nutricion: '#1565C0',
  sustrato: '#5D4037',
  riego: '#00838F',
  clima: '#6A1B9A',
  medicion: '#E65100',
  default: '#37474F',
};

export default function CategoryCard({ category, onPress, isSelected }) {
  const bgColor =
    CATEGORY_COLORS[category.slug] || CATEGORY_COLORS[category.name?.toLowerCase()] || CATEGORY_COLORS.default;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: bgColor },
        isSelected && styles.selected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.text} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 90,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
  },
  selected: {
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  text: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
});
