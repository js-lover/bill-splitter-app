import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createGroup } from '../../src/api/groups';

const CATEGORIES = [
  { id: 'tatil', label: 'Tatil', icon: '✈️' },
  { id: 'ev', label: 'Ev', icon: '🏠' },
  { id: 'yemek', label: 'Yemek', icon: '🍽️' },
  { id: 'alisveris', label: 'Alışveriş', icon: '🛍️' },
  { id: 'etkinlik', label: 'Etkinlik', icon: '🎉' },
  { id: 'spor', label: 'Spor', icon: '⚽' },
  { id: 'ulasim', label: 'Ulaşım', icon: '🚗' },
  { id: 'diger', label: 'Diğer', icon: '📦' },
];

export default function CreateGroup() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Grup adı boş bırakılamaz.');
      return;
    }
    setLoading(true);
    try {
      await createGroup(name.trim(), description.trim());
      router.back();
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Yeni Grup</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.label}>Grup Adı *</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Antalya Tatili"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={[styles.label, { marginTop: 20 }]}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Grup hakkında kısa bir not..."
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catBtn, category === cat.id && styles.catBtnActive]}
                onPress={() => setCategory(cat.id === category ? '' : cat.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={[styles.catLabel, category === cat.id && styles.catLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleCreate}
          disabled={loading}
          style={styles.submitWrapper}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.submitBtn}>
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.submitText}>Grubu Oluştur</Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F4FF' },
  header: { paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { color: '#FFF', fontSize: 34, lineHeight: 40 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  body: { flex: 1, paddingTop: 20 },
  card: {
    backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 20,
    padding: 20, marginBottom: 16,
    shadowColor: '#6366F1', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  label: {
    fontSize: 12, fontWeight: '700', color: '#64748B',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 14, fontSize: 15, color: '#1E293B',
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F8FAFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  catBtnActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  catIcon: { fontSize: 18 },
  catLabel: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  catLabelActive: { color: '#4F46E5' },
  submitWrapper: { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden' },
  submitBtn: { padding: 17, alignItems: 'center' },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
