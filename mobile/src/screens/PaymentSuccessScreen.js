import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/colors';

export default function PaymentSuccessScreen({ route, navigation }) {
  const orderId = route.params?.orderId;

  const handleContinueShopping = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CartMain' }],
    });
    navigation.navigate('Inicio');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={56} color={COLORS.white} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>¡Pago exitoso!</Text>
        <Text style={styles.subtitle}>
          Tu pedido fue recibido y está siendo procesado.
        </Text>

        {/* Order ID */}
        {orderId && (
          <View style={styles.orderCard}>
            <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
            <View style={styles.orderInfo}>
              <Text style={styles.orderLabel}>Número de pedido</Text>
              <Text style={styles.orderNumber}>#{String(orderId).padStart(6, '0')}</Text>
            </View>
          </View>
        )}

        {/* Steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>¿Qué pasa ahora?</Text>
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Confirmación por email</Text>
              <Text style={styles.stepDesc}>Recibirás un email con los detalles de tu pedido.</Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="cube-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Preparación</Text>
              <Text style={styles.stepDesc}>Tu pedido será preparado en 24-48hs hábiles.</Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="car-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Envío</Text>
              <Text style={styles.stepDesc}>Te enviaremos el tracking cuando despachemos tu pedido.</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinueShopping}>
          <Ionicons name="storefront-outline" size={18} color={COLORS.white} />
          <Text style={styles.primaryButtonText}>Seguir comprando</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Perfil')}
        >
          <Text style={styles.secondaryButtonText}>Ver mis pedidos</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    gap: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  stepsCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 28,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 14,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accentSage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  stepDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    gap: 10,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
