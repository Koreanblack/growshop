import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/colors';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/EmptyState';
import PriceText from '../components/PriceText';

const formatPrice = (price) =>
  '$' + Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function CartItem({ item, onRemove, onUpdateQty }) {
  return (
    <View style={styles.cartItem}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
      ) : (
        <View style={styles.itemImagePlaceholder}>
          <Ionicons name="leaf-outline" size={24} color={COLORS.textMuted} />
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.unit_price)}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => onUpdateQty(item.product_id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => onUpdateQty(item.product_id, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemSubtotal}>{formatPrice(item.unit_price * item.quantity)}</Text>
        <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(item.product_id)}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CartScreen({ navigation }) {
  const { items, removeItem, updateQty, clearCart, total, itemCount } = useCart();

  const handleUpdateQty = (productId, qty) => {
    if (qty <= 0) {
      removeItem(productId);
    } else {
      updateQty(productId, qty);
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon="cart-outline"
        title="Tu carrito está vacío"
        subtitle="Explorá nuestro catálogo y agregá productos para comenzar."
        buttonText="Ir al catálogo"
        onButtonPress={() => navigation.navigate('Catálogo')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.product_id)}
        renderItem={({ item }) => (
          <CartItem item={item} onRemove={removeItem} onUpdateQty={handleUpdateQty} />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</Text>
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearText}>Vaciar carrito</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(total)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>A calcular</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Ionicons name="lock-closed-outline" size={18} color={COLORS.white} />
          <Text style={styles.checkoutButtonText}>Proceder al pago</Text>
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
  list: {
    paddingBottom: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  listHeaderText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  clearText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  itemImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: COLORS.accentSage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    paddingLeft: 12,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain,
    lineHeight: 18,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    width: 36,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 8,
  },
  itemSubtotal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  removeBtn: {
    padding: 4,
  },
  summary: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
