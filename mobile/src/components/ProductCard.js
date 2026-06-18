import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useCart } from '../context/CartContext';

const formatPrice = (price) =>
  '$' + Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export default function ProductCard({ product, onPress }) {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(product, 1);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="leaf-outline" size={40} color={COLORS.textMuted} />
        </View>
      )}
      <View style={styles.body}>
        {product.brand && (
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>{product.brand}</Text>
          </View>
        )}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    margin: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.accentSage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 10,
  },
  brandBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentSage,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  brandText: {
    fontSize: 11,
    color: COLORS.textMain,
    fontWeight: '600',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 6,
    lineHeight: 18,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 13,
  },
});
