import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

export default function ProfileScreen({ navigation }) {
  const { adminToken, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Ingresá email y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      Alert.alert('Error', 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  if (adminToken) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.adminHeader}>
            <Text style={styles.adminIcon}>🌿</Text>
            <Text style={styles.adminTitle}>Panel de Administración</Text>
            <Text style={styles.adminSubtitle}>GrowShop Premium</Text>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminDashboard')}
          >
            <Text style={styles.menuItemIcon}>📦</Text>
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>Gestionar Productos</Text>
              <Text style={styles.menuItemDesc}>Agregar, editar y eliminar del catálogo</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminOrders')}
          >
            <Text style={styles.menuItemIcon}>🧾</Text>
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>Ver Pedidos</Text>
              <Text style={styles.menuItemDesc}>Historial y estado de órdenes</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminReprocann')}
          >
            <Text style={styles.menuItemIcon}>🏥</Text>
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>Solicitudes REPROCANN</Text>
              <Text style={styles.menuItemDesc}>Revisá formularios enviados</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.infoIcon}>🌿</Text>
          <Text style={styles.infoTitle}>GrowShop Premium</Text>
          <Text style={styles.infoText}>
            Equipamiento profesional para cultivadores en Argentina. Todo el catálogo sin semillas.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.reprocannBtn}
          onPress={() => navigation.navigate('Reprocann')}
        >
          <Text style={styles.reprocannBtnTitle}>🏥 Registro REPROCANN</Text>
          <Text style={styles.reprocannBtnText}>Registrate y accedé a beneficios exclusivos</Text>
        </TouchableOpacity>

        <View style={styles.divider} />
        <Text style={styles.adminLabel}>Acceso Administrador</Text>

        <View style={styles.loginForm}>
          <TextInput
            style={styles.input}
            placeholder="Email admin"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginBtnText}>Ingresar</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.legal}>
          Venta exclusiva para mayores de 18 años.{'\n'}Cultivo responsable.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  infoSection: { alignItems: 'center', marginBottom: 24 },
  infoIcon: { fontSize: 48, marginBottom: 8 },
  infoTitle: { fontSize: 22, fontWeight: '600', color: COLORS.textMain, marginBottom: 6 },
  infoText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
  reprocannBtn: {
    backgroundColor: COLORS.accentSage, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 24,
  },
  reprocannBtnTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  reprocannBtnText: { fontSize: 12, color: COLORS.textMuted },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 16 },
  adminLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 },
  loginForm: { gap: 10 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15, color: COLORS.textMain,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  loginBtn: { backgroundColor: COLORS.primary, borderRadius: 10, padding: 14, alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  adminHeader: { alignItems: 'center', marginBottom: 28 },
  adminIcon: { fontSize: 48, marginBottom: 8 },
  adminTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textMain },
  adminSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  menuItemIcon: { fontSize: 24, marginRight: 12 },
  menuItemText: { flex: 1 },
  menuItemTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textMain },
  menuItemDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  menuItemArrow: { fontSize: 22, color: COLORS.textMuted },
  logoutBtn: {
    marginTop: 16, borderWidth: 1.5, borderColor: COLORS.accentEarth,
    borderRadius: 10, padding: 14, alignItems: 'center',
  },
  logoutBtnText: { color: COLORS.accentEarth, fontWeight: '600', fontSize: 15 },
  legal: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', lineHeight: 16, marginTop: 24 },
});
