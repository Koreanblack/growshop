import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { getAdminOrders, getProducts, deleteProduct } from '../api/admin';
import { getProducts as fetchProducts } from '../api/products';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const formatPrice = (price) =>
  '$' + Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const ORDER_STATUS_LABELS = {
  pending: 'Pendiente',
  paid: 'Pagado',
  processing: 'En proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const ORDER_STATUS_COLORS = {
  pending: COLORS.warning,
  paid: COLORS.mercadoPago,
  processing: COLORS.primaryHover,
  shipped: COLORS.primary,
  delivered: COLORS.success,
  cancelled: COLORS.error,
};

function OrderCard({ order }) {
  const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;
  const statusColor = ORDER_STATUS_COLORS[order.status] || COLORS.textMuted;

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderCardHeader}>
        <Text style={styles.orderNumber}>#{String(order.id).padStart(6, '0')}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
      <Text style={styles.orderCustomer}>
        {order.customer?.first_name} {order.customer?.last_name}
      </Text>
      <Text style={styles.orderEmail}>{order.customer?.email}</Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderDate}>
          {order.created_at ? new Date(order.created_at).toLocaleDateString('es-AR') : ''}
        </Text>
        <Text style={styles.orderTotal}>{formatPrice(order.total || 0)}</Text>
      </View>
      {order.items && (
        <Text style={styles.orderItems}>
          {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
        </Text>
      )}
    </View>
  );
}

function ProductAdminCard({ product, onEdit, onDelete }) {
  return (
    <View style={styles.productCard}>
      <View style={styles.productCardInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        {product.brand && <Text style={styles.productBrand}>{product.brand}</Text>}
        <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
        <View style={styles.productMeta}>
          {product.stock !== undefined && (
            <View style={[styles.stockBadge, { backgroundColor: product.stock > 0 ? '#E8F5E9' : '#FFEBEE' }]}>
              <Text style={[styles.stockText, { color: product.stock > 0 ? COLORS.success : COLORS.error }]}>
                Stock: {product.stock}
              </Text>
            </View>
          )}
          {product.featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Destacado</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.productCardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(product)}>
          <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(product)}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminDashboardScreen({ navigation }) {
  const { adminToken } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      if (activeTab === 'products') {
        const res = await fetchProducts({ limit: 100 });
        setProducts(Array.isArray(res) ? res : res.data || res.products || []);
      } else {
        const res = await getAdminOrders(adminToken);
        setOrders(Array.isArray(res) ? res : res.data || res.orders || []);
      }
    } catch {
      setError('No se pudo cargar la información.');
    }
  }, [activeTab, adminToken]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Eliminar producto',
      `¿Estás seguro que querés eliminar "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id, adminToken);
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el producto.');
            }
          },
        },
      ]
    );
  };

  const handleEditProduct = (product) => {
    navigation.navigate('AdminProductForm', { product });
  };

  const handleAddProduct = () => {
    navigation.navigate('AdminProductForm', { product: null });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>Productos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Pedidos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {orders.filter((o) => o.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.tabActive]}
          onPress={() => setActiveTab('products')}
        >
          <Ionicons
            name="cube-outline"
            size={16}
            color={activeTab === 'products' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
            Productos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons
            name="receipt-outline"
            size={16}
            color={activeTab === 'orders' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
            Pedidos
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={32} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : activeTab === 'products' ? (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ProductAdminCard
              product={item}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title="Sin productos"
              subtitle="No hay productos cargados todavía."
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title="Sin pedidos"
              subtitle="No hay pedidos registrados todavía."
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB for adding products */}
      {activeTab === 'products' && (
        <TouchableOpacity style={styles.fab} onPress={handleAddProduct}>
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.accentSage,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  orderCustomer: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  orderEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  orderItems: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'flex-start',
  },
  productCardInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 3,
    lineHeight: 20,
  },
  productBrand: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
  },
  featuredBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  productCardActions: {
    gap: 8,
    marginLeft: 8,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.accentSage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 32,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});
