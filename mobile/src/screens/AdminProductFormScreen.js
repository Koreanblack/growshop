import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { createProduct, updateProduct } from '../api/admin';

const CATEGORIES = [
  'Iluminación', 'Nutrición', 'Sustrato', 'Riego', 'Clima',
  'Medición', 'Estructuras', 'Accesorios',
];

export default function AdminProductFormScreen({ route, navigation }) {
  const { adminToken } = useAuth();
  const editingProduct = route.params?.product || null;
  const isEditing = editingProduct !== null;

  const [form, setForm] = useState({
    name: editingProduct?.name || '',
    brand: editingProduct?.brand || '',
    description: editingProduct?.description || '',
    price: editingProduct?.price ? String(editingProduct.price) : '',
    stock: editingProduct?.stock !== undefined ? String(editingProduct.stock) : '',
    category: editingProduct?.category || '',
    image_url: editingProduct?.image_url || '',
    slug: editingProduct?.slug || '',
    featured: editingProduct?.featured || false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Editar producto' : 'Nuevo producto' });
  }, [isEditing, navigation]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (value) => {
    updateField('name', value);
    if (!isEditing || !editingProduct?.slug) {
      updateField('slug', generateSlug(value));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Requerido';
    if (!form.price.trim() || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      e.price = 'Precio inválido';
    }
    if (!form.stock.trim() || isNaN(parseInt(form.stock)) || parseInt(form.stock) < 0) {
      e.stock = 'Stock inválido';
    }
    if (!form.category) e.category = 'Seleccioná una categoría';
    if (!form.slug.trim()) e.slug = 'Requerido';
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
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        category: form.category,
        image_url: form.image_url.trim(),
        slug: form.slug.trim(),
        featured: form.featured,
      };

      if (isEditing) {
        await updateProduct(editingProduct.id, payload, adminToken);
        Alert.alert('Éxito', 'Producto actualizado correctamente.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createProduct(payload, adminToken);
        Alert.alert('Éxito', 'Producto creado correctamente.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar el producto. Verificá los datos e intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información básica</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nombre del producto *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Ej: Lámpara LED 600W Full Spectrum"
                placeholderTextColor={COLORS.textMuted}
                value={form.name}
                onChangeText={handleNameChange}
              />
              {errors.name && <Text style={styles.err}>{errors.name}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Marca</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Mars Hydro"
                placeholderTextColor={COLORS.textMuted}
                value={form.brand}
                onChangeText={(v) => updateField('brand', v)}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Slug (URL) *</Text>
              <TextInput
                style={[styles.input, errors.slug && styles.inputError]}
                placeholder="lampara-led-600w"
                placeholderTextColor={COLORS.textMuted}
                value={form.slug}
                onChangeText={(v) => updateField('slug', v)}
                autoCapitalize="none"
              />
              {errors.slug && <Text style={styles.err}>{errors.slug}</Text>}
              <Text style={styles.hint}>Generado automáticamente del nombre. Solo letras, números y guiones.</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción detallada del producto..."
                placeholderTextColor={COLORS.textMuted}
                value={form.description}
                onChangeText={(v) => updateField('description', v)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Pricing & Stock */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Precio y stock</Text>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Precio (ARS) *</Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.price}
                  onChangeText={(v) => updateField('price', v)}
                  keyboardType="numeric"
                />
                {errors.price && <Text style={styles.err}>{errors.price}</Text>}
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Stock *</Text>
                <TextInput
                  style={[styles.input, errors.stock && styles.inputError]}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.stock}
                  onChangeText={(v) => updateField('stock', v)}
                  keyboardType="numeric"
                />
                {errors.stock && <Text style={styles.err}>{errors.stock}</Text>}
              </View>
            </View>
          </View>

          {/* Category & Image */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categoría e imagen</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Categoría *</Text>
              <TouchableOpacity
                style={[styles.input, styles.selectBtn, errors.category && styles.inputError]}
                onPress={() => setShowCategories(!showCategories)}
              >
                <Text style={form.category ? styles.selectText : styles.selectPlaceholder}>
                  {form.category || 'Seleccioná una categoría'}
                </Text>
                <Ionicons name={showCategories ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
              {errors.category && <Text style={styles.err}>{errors.category}</Text>}
              {showCategories && (
                <View style={styles.dropdown}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.dropdownItem, form.category === cat && styles.dropdownItemActive]}
                      onPress={() => {
                        updateField('category', cat);
                        setShowCategories(false);
                      }}
                    >
                      <Text style={[styles.dropdownText, form.category === cat && styles.dropdownTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>URL de imagen</Text>
              <TextInput
                style={styles.input}
                placeholder="https://ejemplo.com/imagen.jpg"
                placeholderTextColor={COLORS.textMuted}
                value={form.image_url}
                onChangeText={(v) => updateField('image_url', v)}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            {/* Featured Toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Producto destacado</Text>
                <Text style={styles.toggleDesc}>Aparece en la sección de destacados del inicio</Text>
              </View>
              <Switch
                value={form.featured}
                onValueChange={(v) => updateField('featured', v)}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Ionicons name={isEditing ? 'save-outline' : 'add-circle-outline'} size={18} color={COLORS.white} />
            <Text style={styles.saveButtonText}>
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
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
    height: 100,
    paddingTop: 11,
  },
  err: {
    fontSize: 11,
    color: COLORS.error,
    marginTop: 4,
  },
  hint: {
    fontSize: 11,
    color: COLORS.textMuted,
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  toggleDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 15,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
