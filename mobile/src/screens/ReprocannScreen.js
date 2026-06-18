import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { submitReprocann } from '../api/reprocann';
import { COLORS } from '../constants/colors';

export default function ReprocannScreen() {
  const [form, setForm] = useState({
    full_name: '', dni: '', email: '', phone: '', reprocann_number: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.full_name || !form.dni || !form.email || !form.phone) {
      Alert.alert('Campos incompletos', 'Completá los campos obligatorios (*).');
      return;
    }
    setLoading(true);
    try {
      await submitReprocann(form);
      setSubmitted(true);
    } catch (e) {
      Alert.alert('Error', 'No se pudo enviar el formulario. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>🏥</Text>
          <Text style={styles.successTitle}>¡Formulario enviado!</Text>
          <Text style={styles.successText}>
            Recibimos tu solicitud REPROCANN. Nos pondremos en contacto dentro de las próximas 48 horas hábiles.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Registro REPROCANN</Text>
          <Text style={styles.subtitle}>
            Solo para usuarios registrados en REPROCANN - ANMAT. Completá tus datos para acceder a beneficios exclusivos.
          </Text>
        </View>

        <Field label="Nombre completo *">
          <TextInput
            style={styles.input}
            value={form.full_name}
            onChangeText={(v) => setField('full_name', v)}
            placeholder="Juan Pérez"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="words"
          />
        </Field>

        <Field label="DNI *">
          <TextInput
            style={styles.input}
            value={form.dni}
            onChangeText={(v) => setField('dni', v)}
            placeholder="30123456"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="number-pad"
          />
        </Field>

        <Field label="Email *">
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={(v) => setField('email', v)}
            placeholder="juan@email.com"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Field>

        <Field label="Teléfono *">
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={(v) => setField('phone', v)}
            placeholder="+54 9 11 1234 5678"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
          />
        </Field>

        <Field label="Número REPROCANN (opcional)">
          <TextInput
            style={styles.input}
            value={form.reprocann_number}
            onChangeText={(v) => setField('reprocann_number', v)}
            placeholder="Ej: RP-2024-00001"
            placeholderTextColor={COLORS.textMuted}
          />
        </Field>

        <Field label="Observaciones (opcional)">
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={form.notes}
            onChangeText={(v) => setField('notes', v)}
            placeholder="Información adicional o consulta..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
          />
        </Field>

        <View style={styles.legalBox}>
          <Text style={styles.legalText}>
            🔒 Tus datos son confidenciales y serán usados exclusivamente para verificar tu registro REPROCANN - ANMAT.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Enviar formulario</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '600', color: COLORS.textMain, marginBottom: 8 },
  subtitle: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15, color: COLORS.textMain,
    borderWidth: 1, borderColor: COLORS.border,
  },
  inputMulti: { height: 100, textAlignVertical: 'top' },
  legalBox: {
    backgroundColor: COLORS.accentSage, borderRadius: 10, padding: 14,
    marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  legalText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 17 },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 10, padding: 16, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successIcon: { fontSize: 60, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textMain, marginBottom: 12, textAlign: 'center' },
  successText: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
});
