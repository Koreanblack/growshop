import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createProduct, updateProduct } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const CATEGORIES = [
  { slug: 'iluminacion', name: 'Iluminación LED' },
  { slug: 'fertilizantes', name: 'Fertilizantes Premium' },
  { slug: 'sustratos', name: 'Sustratos' },
  { slug: 'macetas', name: 'Macetas' },
  { slug: 'accesorios', name: 'Accesorios' },
  { slug: 'control-plagas', name: 'Control de Plagas' },
  { slug: 'herramientas', name: 'Herramientas' },
];

export default function AdminProductFormScreen({ navigation, route }) {
  const { adminToken } = useAuth();
  const existing = route.params?.product;
  const isEdit = !!existing;

  const [form, setForm] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    price: existing?.price?.toString() || '',
    category: existing?.category || 'iluminacion',
    stock: existing?.stock?.toString() || '0',
    image: existing?.image || '',
    brand: existing?.brand || '',
    featured: existing?.featured || false,
  });
  const [loading, setLoading] = useState(false);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name || !form.price || !form.description || !form.image) {
      Alert.alert('Campos requeridos', 'Completá nombre, precio, descripción e imagen.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
      };
      if (isEdit) {
        await updateProduct(existing.id, payload, adminToken);
      } else {
        await createProduct(payload, adminToken);
      }
      Alert.alert('✓ Guardado', `Producto ${isEdit ? 'actualizado' : 'creado'} correctamente.`);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{isEdit ? 'Editar producto' : 'Nuevo producto'}</Text>

        <Field label="Nombre *">
          <TextInput style={styles.input} value={form.name} onChangeText={(v) => setField('name', v)} placeholder="Ej: Panel LED 240W" placeholderTextColor={COLORS.textMuted} />
        </Field>

        <Field label="Descripción *">
          <TextInput
            style={[styles.input, styles.inputMulti]} value={form.description}
            onChangeText={(v) => setField('description', v)}
            placeholder="Descripción del producto..." placeholderTextColor={COLORS.textMuted}
            multiline numberOfLines={4}
          />
        </Field>

        <Field label="Precio (ARS) *">
          <TextInput style={styles.input} value={form.price} onChangeText={(v) => setField('price', v)} placeholder="185000" placeholderTextColor={COLORS.textMuted} keyboardType="decimal-pad" />
        </Field>

        <Field label="Categoría">
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.slug}
                style={[styles.catChip, form.category === cat.slug && styles.catChipActive]}
                onPress={() => setField('category', cat.slug)}
              >
                <Text style={[styles.catChipText, form.category === cat.slug && styles.catChipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Stock">
          <TextInput style={styles.input} value={form.stock} onChangeText={(v) => setField('stock', v)} placeholder="0" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" />
        </Field>

        <Field label="URL de imagen *">
          <TextInput style={styles.input} value={form.image} onChangeText={(v) => setField('image', v)} placeholder="https://..." placeholderTextColor={COLORS.textMuted} autoCapitalize="none" />
        </Field>

        <Field label="Marca">
          <TextInput style={styles.input} value={form.brand} onChangeText={(v) => setField('brand', v)} placeholder="Ej: GrowLight Pro" placeholderTextColor={COLORS.textMuted} />
        </Field>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Producto destacado</Text>
          <Switch
            value={form.featured}
            onValueChange={(v) => setField('featured', v)}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>{isEdit ? 'Guardar cambios' : 'Crear producto'}</Text>
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
  title: { fontSize: 20, fontWeight: '700', color: COLORS.textMain, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15, color: COLORS.textMain,
    borderWidth: 1, borderColor: COLORS.border,
  },
  inputMulti: { height: 100, textAlignVertical: 'top' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  catChipTextActive: { color: '#fff', fontWeight: '700' },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 20,
  },
  switchLabel: { fontSize: 15, fontWeight: '600', color: COLORS.textMain },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 10, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
