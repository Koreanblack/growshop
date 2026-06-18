import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/colors';
import { getProductBySlug } from '../api/products';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import PriceText from '../components/PriceText';

export default function ProductDetailScreen({ route, navigation }) {
  const { slug } = route.params;
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProductBySlug(slug)
      .then((data) => setProduct(data))
      .catch(() => setError('No se pudo cargar el producto.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const incrementQty = () => setQuantity((q) => q + 1);
  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));

  if (loading) return <LoadingSpinner />;

  if (error || !product) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>Producto no encontrado</Text>
          <Text style={styles.errorSubtitle}>{error || 'El producto no está disponible.'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="leaf-outline" size={60} color={COLORS.textMuted} />
          </View>
        )}

        <View style={styles.content}>
          {/* Brand */}
          {product.brand && (
            <View style={styles.brandBadge}>
              <Text style={styles.brandText}>{product.brand}</Text>
            </View>
          )}

          {/* Name */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Price */}
          <PriceText price={product.price} style={styles.price} />

          {/* Stock */}
          {product.stock !== undefined && (
            <View style={styles.stockRow}>
              <View style={[styles.stockDot, { backgroundColor: product.stock > 0 ? COLORS.success : COLORS.error }]} />
              <Text style={styles.stockText}>
                {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
              </Text>
            </View>
          )}

          {/* Category */}
          {product.category && (
            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.infoText}>{product.category}</Text>
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Descripción</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.qtySection}>
            <Text style={styles.qtyLabel}>Cantidad</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyButton} onPress={decrementQty}>
                <Ionicons name="remove" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyButton} onPress={incrementQty}>
                <Ionicons name="add" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <PriceText price={product.price * quantity} style={styles.footerTotalPrice} />
        </View>
        <TouchableOpacity
          style={[styles.addButton, added && styles.addButtonSuccess]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Ionicons name={added ? 'checkmark' : 'cart-outline'} size={20} color={COLORS.white} />
          <Text style={styles.addButtonText}>
            {product.stock === 0 ? 'Sin stock' : added ? 'Agregado' : 'Agregar al Carrito'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  image: {
    width: '100%',
    height: 280,
  },
  imagePlaceholder: {
    width: '100%',
    height: 280,
    backgroundColor: COLORS.accentSage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  brandBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentSage,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  brandText: {
    fontSize: 12,
    color: COLORS.textMain,
    fontWeight: '600',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 10,
    lineHeight: 30,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 12,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  descriptionContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  descriptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  qtySection: {
    marginTop: 20,
  },
  qtyLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 10,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  qtyButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  qtyValue: {
    width: 56,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  footerTotal: {
    flex: 1,
  },
  footerTotalLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  footerTotalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    flex: 1.5,
    justifyContent: 'center',
  },
  addButtonSuccess: {
    backgroundColor: COLORS.success,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMain,
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
