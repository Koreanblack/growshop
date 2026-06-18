import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { createCheckout } from '../api/orders';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../components/PriceText';
import { COLORS } from '../constants/colors';

export default function CheckoutScreen({ navigation }) {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.address) {
      Alert.alert('Campos incompletos', 'Por favor completá todos los campos.');
      return;
    }
    setLoading(true);
    try {
      const data = await createCheckout({
        items: items.map((i) => ({
          product_id: i.product_id,
          title: i.title,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
        payer_email: form.email,
        payer_name: form.name,
        shipping_address: form.address,
        phone: form.phone,
      });

      const url = data.init_point || data.sandbox_init_point;
      if (url) {
        const result = await WebBrowser.openBrowserAsync(url);
        clearCart();
        navigation.replace('PaymentSuccess', { orderId: data.order_id });
      } else {
        Alert.alert('Error', 'No se pudo obtener el link de pago.');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo procesar el pedido. Intentá de nuevo.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Datos de envío</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(v) => setField('name', v)}
            placeholder="Juan Pérez"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={(v) => setField('email', v)}
            placeholder="juan@email.com"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Teléfono *</Text>
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={(v) => setField('phone', v)}
            placeholder="+54 9 11 1234 5678"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Dirección de envío *</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={form.address}
            onChangeText={(v) => setField('address', v)}
            placeholder="Calle, número, localidad, provincia"
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Order summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen del pedido</Text>
          {items.map((i) => (
            <View key={i.product_id} style={styles.summaryRow}>
              <Text style={styles.summaryItem} numberOfLines={1}>
                {i.quantity}x {i.title}
              </Text>
              <Text style={styles.summaryPrice}>{formatPrice(i.unit_price * i.quantity)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Total</Text>
            <Text style={styles.summaryTotalPrice}>{formatPrice(total)}</Text>
          </View>
        </View>

        <Text style={styles.legal}>
          Venta exclusiva para mayores de 18 años. Cultivo responsable.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.mpBtn, loading && styles.mpBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.mpBtnText}>Pagar con Mercado Pago</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '600', color: COLORS.textMain, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15, color: COLORS.textMain,
    borderWidth: 1, borderColor: COLORS.border,
  },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  summary: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginTop: 8, marginBottom: 16,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textMain, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryItem: { fontSize: 13, color: COLORS.textMuted, flex: 1, marginRight: 8 },
  summaryPrice: { fontSize: 13, fontWeight: '600', color: COLORS.textMain },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  summaryTotal: { fontSize: 15, fontWeight: '700', color: COLORS.textMain },
  summaryTotalPrice: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  legal: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', lineHeight: 16 },
  footer: { padding: 16, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  mpBtn: { backgroundColor: COLORS.mercadopagoBlue, borderRadius: 10, padding: 16, alignItems: 'center' },
  mpBtnDisabled: { opacity: 0.6 },
  mpBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
