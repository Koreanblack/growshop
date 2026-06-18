import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

import { COLORS } from '../constants/colors';
import { useCart } from '../context/CartContext';
import { createCheckout } from '../api/orders';

const formatPrice = (price) =>
  '$' + Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
];

export default function CheckoutScreen({ navigation }) {
  const { items, total, clearCart } = useCart();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    address: '',
    city: '',
    province: 'Buenos Aires',
    postalCode: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showProvinces, setShowProvinces] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Requerido';
    if (!form.lastName.trim()) newErrors.lastName = 'Requerido';
    if (!form.email.trim() || !form.email.includes('@')) newErrors.email = 'Email inválido';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 8) newErrors.phone = 'Teléfono inválido';
    if (!form.dni.trim() || form.dni.replace(/\D/g, '').length < 7) newErrors.dni = 'DNI inválido';
    if (!form.address.trim()) newErrors.address = 'Requerido';
    if (!form.city.trim()) newErrors.city = 'Requerido';
    if (!form.postalCode.trim()) newErrors.postalCode = 'Requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Datos incompletos', 'Por favor, completá todos los campos requeridos.');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        customer: {
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          dni: form.dni,
        },
        shipping: {
          address: form.address,
          city: form.city,
          province: form.province,
          postal_code: form.postalCode,
        },
        items: items.map((i) => ({
          product_id: i.product_id,
          title: i.title,
          unit_price: i.unit_price,
          quantity: i.quantity,
        })),
        total,
      };

      const response = await createCheckout(orderData);

      if (response.payment_url) {
        const result = await WebBrowser.openBrowserAsync(response.payment_url);
        if (result.type === 'cancel' || result.type === 'dismiss') {
          clearCart();
          navigation.replace('PaymentSuccess', {
            orderId: response.order_id || response.id,
          });
        }
      } else if (response.order_id || response.id) {
        clearCart();
        navigation.replace('PaymentSuccess', {
          orderId: response.order_id || response.id,
        });
      }
    } catch (err) {
      Alert.alert(
        'Error al procesar',
        'No se pudo crear el pedido. Verificá tu conexión e intentá nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  function Field({ label, field, placeholder, keyboardType, maxLength }) {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={[styles.input, errors[field] && styles.inputError]}
          placeholder={placeholder || label}
          placeholderTextColor={COLORS.textMuted}
          value={form[field]}
          onChangeText={(v) => updateField(field, v)}
          keyboardType={keyboardType || 'default'}
          maxLength={maxLength}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        />
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen del pedido</Text>
            {items.map((item) => (
              <View key={item.product_id} style={styles.orderItem}>
                <Text style={styles.orderItemName} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.orderItemMeta}>x{item.quantity}</Text>
                <Text style={styles.orderItemPrice}>{formatPrice(item.unit_price * item.quantity)}</Text>
              </View>
            ))}
            <View style={styles.orderTotal}>
              <Text style={styles.orderTotalLabel}>Total</Text>
              <Text style={styles.orderTotalValue}>{formatPrice(total)}</Text>
            </View>
          </View>

          {/* Personal Data */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos personales</Text>
            <View style={styles.row}>
              <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.fieldLabel}>Nombre</Text>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  placeholder="Juan"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.firstName}
                  onChangeText={(v) => updateField('firstName', v)}
                />
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>
              <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.fieldLabel}>Apellido</Text>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  placeholder="García"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.lastName}
                  onChangeText={(v) => updateField('lastName', v)}
                />
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="juan@ejemplo.com"
                placeholderTextColor={COLORS.textMuted}
                value={form.email}
                onChangeText={(v) => updateField('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
            <View style={styles.row}>
              <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.fieldLabel}>Teléfono</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="11 1234-5678"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.phone}
                  onChangeText={(v) => updateField('phone', v)}
                  keyboardType="phone-pad"
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>
              <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.fieldLabel}>DNI</Text>
                <TextInput
                  style={[styles.input, errors.dni && styles.inputError]}
                  placeholder="12.345.678"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.dni}
                  onChangeText={(v) => updateField('dni', v)}
                  keyboardType="numeric"
                  maxLength={10}
                />
                {errors.dni && <Text style={styles.errorText}>{errors.dni}</Text>}
              </View>
            </View>
          </View>

          {/* Shipping */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos de envío</Text>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Dirección</Text>
              <TextInput
                style={[styles.input, errors.address && styles.inputError]}
                placeholder="Av. Corrientes 1234, Piso 3"
                placeholderTextColor={COLORS.textMuted}
                value={form.address}
                onChangeText={(v) => updateField('address', v)}
              />
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>
            <View style={styles.row}>
              <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.fieldLabel}>Ciudad</Text>
                <TextInput
                  style={[styles.input, errors.city && styles.inputError]}
                  placeholder="Buenos Aires"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.city}
                  onChangeText={(v) => updateField('city', v)}
                />
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
              </View>
              <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.fieldLabel}>Cód. Postal</Text>
                <TextInput
                  style={[styles.input, errors.postalCode && styles.inputError]}
                  placeholder="1001"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.postalCode}
                  onChangeText={(v) => updateField('postalCode', v)}
                  keyboardType="numeric"
                  maxLength={8}
                />
                {errors.postalCode && <Text style={styles.errorText}>{errors.postalCode}</Text>}
              </View>
            </View>
            {/* Province Selector */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Provincia</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowProvinces(!showProvinces)}
              >
                <Text style={styles.selectButtonText}>{form.province}</Text>
                <Ionicons name={showProvinces ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
              {showProvinces && (
                <View style={styles.dropdown}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {PROVINCES.map((p) => (
                      <TouchableOpacity
                        key={p}
                        style={[styles.dropdownItem, form.province === p && styles.dropdownItemActive]}
                        onPress={() => {
                          updateField('province', p);
                          setShowProvinces(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, form.province === p && styles.dropdownItemTextActive]}>
                          {p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Payment Info */}
          <View style={styles.section}>
            <View style={styles.mercadoPagoBox}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.mercadoPago} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.mpTitle}>Pago seguro con MercadoPago</Text>
                <Text style={styles.mpSubtitle}>Tarjeta de crédito, débito, transferencia o efectivo</Text>
              </View>
            </View>
          </View>

          {/* Legal */}
          <Text style={styles.legal}>
            Al continuar confirmás que tenés más de 18 años y aceptás los términos y condiciones del sitio.
          </Text>
        </ScrollView>

        {/* Submit */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Ionicons name="card-outline" size={20} color={COLORS.white} />
            <Text style={styles.submitButtonText}>
              {loading ? 'Procesando...' : `Pagar ${formatPrice(total)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingBottom: 24,
  },
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 14,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  orderItemName: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMain,
  },
  orderItemMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    width: 30,
    textAlign: 'center',
  },
  orderItemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
    width: 80,
    textAlign: 'right',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginTop: 6,
  },
  orderTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  row: {
    flexDirection: 'row',
  },
  fieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.textMain,
    backgroundColor: COLORS.background,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 11,
    color: COLORS.error,
    marginTop: 4,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: COLORS.background,
  },
  selectButtonText: {
    fontSize: 14,
    color: COLORS.textMain,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.accentSage,
  },
  dropdownItemText: {
    fontSize: 14,
    color: COLORS.textMain,
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  mercadoPagoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F4FD',
    borderRadius: 8,
    padding: 12,
  },
  mpTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.mercadoPago,
  },
  mpSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  legal: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.mercadoPago,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
