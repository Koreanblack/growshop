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

import { COLORS } from '../constants/colors';
import { submitReprocann } from '../api/reprocann';

const CULTIVATION_PURPOSES = [
  'Uso personal medicinal',
  'Uso personal recreativo',
  'Cuidado de familiar',
  'Investigación',
];

export default function ReprocannScreen({ navigation }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    email: '',
    phone: '',
    registrationNumber: '',
    cultivationPurpose: '',
    plantCount: '',
    address: '',
    city: '',
    province: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPurposes, setShowPurposes] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Requerido';
    if (!form.lastName.trim()) e.lastName = 'Requerido';
    if (!form.dni.trim() || form.dni.replace(/\D/g, '').length < 7) e.dni = 'DNI inválido';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email inválido';
    if (!form.phone.trim()) e.phone = 'Requerido';
    if (!form.registrationNumber.trim()) e.registrationNumber = 'Requerido';
    if (!form.cultivationPurpose) e.cultivationPurpose = 'Seleccioná una opción';
    if (!form.plantCount.trim() || isNaN(Number(form.plantCount))) e.plantCount = 'Número inválido';
    if (!form.address.trim()) e.address = 'Requerido';
    if (!form.city.trim()) e.city = 'Requerido';
    if (!form.province.trim()) e.province = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Datos incompletos', 'Por favor, completá todos los campos requeridos.');
      return;
    }
    setLoading(true);
    try {
      await submitReprocann({
        ...form,
        plant_count: Number(form.plantCount),
      });
      setSubmitted(true);
    } catch (err) {
      Alert.alert(
        'Error',
        'No se pudo enviar el formulario. Verificá tu conexión e intentá nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={72} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>¡Formulario enviado!</Text>
          <Text style={styles.successSubtitle}>
            Tu solicitud REPROCANN fue registrada. Nos comunicaremos dentro de los próximos 3 días hábiles.
          </Text>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Conservá tu número de registro REPROCANN y documentación actualizada.
            </Text>
          </View>
          <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
            <Text style={styles.doneButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header Info */}
          <View style={styles.infoBanner}>
            <Ionicons name="leaf" size={20} color={COLORS.primary} />
            <Text style={styles.infoBannerText}>
              Completá tus datos de registro REPROCANN para acceso a productos especializados.
            </Text>
          </View>

          {/* Personal Data */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos personales</Text>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  placeholder="Juan"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.firstName}
                  onChangeText={(v) => updateField('firstName', v)}
                />
                {errors.firstName && <Text style={styles.err}>{errors.firstName}</Text>}
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Apellido *</Text>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  placeholder="García"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.lastName}
                  onChangeText={(v) => updateField('lastName', v)}
                />
                {errors.lastName && <Text style={styles.err}>{errors.lastName}</Text>}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>DNI *</Text>
              <TextInput
                style={[styles.input, errors.dni && styles.inputError]}
                placeholder="12.345.678"
                placeholderTextColor={COLORS.textMuted}
                value={form.dni}
                onChangeText={(v) => updateField('dni', v)}
                keyboardType="numeric"
                maxLength={10}
              />
              {errors.dni && <Text style={styles.err}>{errors.dni}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="juan@ejemplo.com"
                placeholderTextColor={COLORS.textMuted}
                value={form.email}
                onChangeText={(v) => updateField('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.err}>{errors.email}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Teléfono *</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="11 1234-5678"
                placeholderTextColor={COLORS.textMuted}
                value={form.phone}
                onChangeText={(v) => updateField('phone', v)}
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.err}>{errors.phone}</Text>}
            </View>
          </View>

          {/* REPROCANN Data */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos REPROCANN</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nro. de Registro REPROCANN *</Text>
              <TextInput
                style={[styles.input, errors.registrationNumber && styles.inputError]}
                placeholder="REP-0000000"
                placeholderTextColor={COLORS.textMuted}
                value={form.registrationNumber}
                onChangeText={(v) => updateField('registrationNumber', v)}
                autoCapitalize="characters"
              />
              {errors.registrationNumber && <Text style={styles.err}>{errors.registrationNumber}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Finalidad del cultivo *</Text>
              <TouchableOpacity
                style={[styles.input, styles.selectBtn, errors.cultivationPurpose && styles.inputError]}
                onPress={() => setShowPurposes(!showPurposes)}
              >
                <Text style={form.cultivationPurpose ? styles.selectText : styles.selectPlaceholder}>
                  {form.cultivationPurpose || 'Seleccioná una opción'}
                </Text>
                <Ionicons name={showPurposes ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
              {errors.cultivationPurpose && <Text style={styles.err}>{errors.cultivationPurpose}</Text>}
              {showPurposes && (
                <View style={styles.dropdown}>
                  {CULTIVATION_PURPOSES.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.dropdownItem, form.cultivationPurpose === p && styles.dropdownItemActive]}
                      onPress={() => {
                        updateField('cultivationPurpose', p);
                        setShowPurposes(false);
                      }}
                    >
                      <Text style={[styles.dropdownText, form.cultivationPurpose === p && styles.dropdownTextActive]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Cantidad de plantas *</Text>
              <TextInput
                style={[styles.input, errors.plantCount && styles.inputError]}
                placeholder="Ej: 6"
                placeholderTextColor={COLORS.textMuted}
                value={form.plantCount}
                onChangeText={(v) => updateField('plantCount', v)}
                keyboardType="numeric"
                maxLength={3}
              />
              {errors.plantCount && <Text style={styles.err}>{errors.plantCount}</Text>}
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación del cultivo</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Dirección *</Text>
              <TextInput
                style={[styles.input, errors.address && styles.inputError]}
                placeholder="Calle y número"
                placeholderTextColor={COLORS.textMuted}
                value={form.address}
                onChangeText={(v) => updateField('address', v)}
              />
              {errors.address && <Text style={styles.err}>{errors.address}</Text>}
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Ciudad *</Text>
                <TextInput
                  style={[styles.input, errors.city && styles.inputError]}
                  placeholder="Ciudad"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.city}
                  onChangeText={(v) => updateField('city', v)}
                />
                {errors.city && <Text style={styles.err}>{errors.city}</Text>}
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Provincia *</Text>
                <TextInput
                  style={[styles.input, errors.province && styles.inputError]}
                  placeholder="Provincia"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.province}
                  onChangeText={(v) => updateField('province', v)}
                />
                {errors.province && <Text style={styles.err}>{errors.province}</Text>}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Notas adicionales</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Información adicional relevante..."
                placeholderTextColor={COLORS.textMuted}
                value={form.notes}
                onChangeText={(v) => updateField('notes', v)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Legal */}
          <Text style={styles.legalText}>
            La información proporcionada es confidencial y será utilizada únicamente para verificar tu registro
            en el programa REPROCANN del ANMAT. Al enviar confirmás que los datos son verídicos.
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Ionicons name="send-outline" size={18} color={COLORS.white} />
            <Text style={styles.submitText}>{loading ? 'Enviando...' : 'Enviar formulario'}</Text>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.accentSage,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMain,
    lineHeight: 20,
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
  row: {
    flexDirection: 'row',
  },
  field: {
    marginBottom: 12,
  },
  label: {
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
  textArea: {
    height: 90,
    paddingTop: 11,
  },
  err: {
    fontSize: 11,
    color: COLORS.error,
    marginTop: 4,
  },
  selectBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 14,
    color: COLORS.textMain,
  },
  selectPlaceholder: {
    fontSize: 14,
    color: COLORS.textMuted,
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
  dropdownText: {
    fontSize: 14,
    color: COLORS.textMain,
  },
  dropdownTextActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  legalText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
    lineHeight: 17,
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
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.accentSage,
    borderRadius: 10,
    padding: 14,
    marginBottom: 28,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMain,
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 10,
  },
  doneButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
