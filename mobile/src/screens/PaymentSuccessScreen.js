import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

export default function PaymentSuccessScreen({ navigation, route }) {
  const orderId = route.params?.orderId || '';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.title}>¡Pago exitoso!</Text>
        <Text style={styles.subtitle}>Tu pedido fue procesado correctamente.</Text>
        {orderId ? (
          <View style={styles.orderBox}>
            <Text style={styles.orderLabel}>Número de pedido</Text>
            <Text style={styles.orderId}>{orderId.slice(0, 8).toUpperCase()}</Text>
          </View>
        ) : null}
        <Text style={styles.note}>
          Recibirás un email con los detalles de tu compra y el seguimiento del envío.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Inicio')}
        >
          <Text style={styles.primaryBtnText}>Seguir comprando</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Perfil')}
        >
          <Text style={styles.secondaryBtnText}>Ver mi perfil</Text>
        </TouchableOpacity>
        <Text style={styles.legal}>
          Venta exclusiva para mayores de 18 años. Cultivo responsable.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.textMain, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', marginBottom: 24 },
  orderBox: {
    backgroundColor: COLORS.accentSage, borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 20, width: '100%',
  },
  orderLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  orderId: { fontSize: 20, fontWeight: '700', color: COLORS.primary, marginTop: 4, letterSpacing: 2 },
  note: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18, marginBottom: 28 },
  primaryBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10, padding: 16,
    width: '100%', alignItems: 'center', marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 10,
    padding: 14, width: '100%', alignItems: 'center', marginBottom: 24,
  },
  secondaryBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  legal: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center' },
});
