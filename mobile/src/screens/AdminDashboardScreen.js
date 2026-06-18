import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAdminOrders, deleteProduct } from '../api/admin';
import { getProducts } from '../api/products';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatPrice } from '../components/PriceText';
import { COLORS } from '../constants/colors';

const STATUS_COLORS = {
  pending: { bg: '#FEF9C3', text: '#92400E' },
  paid: { bg: '#D1FAE5', text: '#065F46' },
  failed: { bg: '#FEE2E2', text: '#991B1B' },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{status?.toUpperCase()}</Text>
    </View>
  );
}

export default function AdminDashboardScreen({ navigation }) {
  const { adminToken } = useAuth();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      if (tab === 'products') {
        const data = await getProducts();
        setProducts(data);
      } else {
        const data = await getAdminOrders(adminToken);
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab, adminToken]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const handleDelete = (product) => {
    Alert.alert('Eliminar producto', `¿Eliminar "${product.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(product.id, adminToken);
            setProducts((p) => p.filter((x) => x.id !== product.id));
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el producto.');
          }
        },
      },
    ]);
  };

  const onRefresh = () => { setRefreshing(true); load(); };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'products', label: 'Productos' },
          { key: 'orders', label: 'Pedidos' },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : tab === 'products' ? (
        <>
          <FlatList
            data={products}
            keyExtractor={(p) => p.id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            ListEmptyComponent={<EmptyState icon="📦" title="Sin productos" subtitle="Añadí tu primer producto" />}
            renderItem={({ item }) => (
              <View style={styles.productRow}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.productMeta}>{item.category} · Stock: {item.stock}</Text>
                  <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => navigation.navigate('AdminProductForm', { product: item })}
                  >
                    <Text style={styles.editBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('AdminProductForm', { product: null })}
          >
            <Text style={styles.fabText}>+ Nuevo</Text>
          </TouchableOpacity>
        </>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.order_id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<EmptyState icon="🧾" title="Sin pedidos" subtitle="Los pedidos aparecerán aquí" />}
          renderItem={({ item }) => (
            <View style={styles.orderRow}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>#{item.order_id?.slice(0, 8).toUpperCase()}</Text>
                <Text style={styles.orderMeta}>{item.payer_name}</Text>
                <Text style={styles.orderDate}>{item.created_at?.slice(0, 10)}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderTotal}>{formatPrice(item.total)}</Text>
                <StatusBadge status={item.status} />
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary },
  list: { padding: 16, paddingBottom: 80 },
  productRow: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 10,
    padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: COLORS.textMain, marginBottom: 2 },
  productMeta: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
  productPrice: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  productActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editBtn: {
    backgroundColor: COLORS.accentSage, borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  editBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  deleteBtn: {
    backgroundColor: '#FEE2E2', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.error },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  orderRow: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 10,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  orderInfo: { flex: 1 },
  orderId: { fontSize: 14, fontWeight: '700', color: COLORS.textMain },
  orderMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  orderDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  orderRight: { alignItems: 'flex-end' },
  orderTotal: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700' },
});
