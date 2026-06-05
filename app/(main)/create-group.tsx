import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { createGroup } from '../../src/api/groups';

export default function CreateGroup() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Grup adı boş bırakılamaz');
      return;
    }
    setLoading(true);
    try {
      await createGroup(name, description);
      Alert.alert('Başarılı', 'Grup oluşturuldu');
      router.back();
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Grup Adı</Text>
      <TextInput
        style={styles.input}
        placeholder="Örn: Ev Arkadaşları"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Açıklama (İsteğe Bağlı)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Grup hakkında kısa bilgi"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Oluştur</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F7FA' },
  label: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 14, fontSize: 16, color: '#1A202C' },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#4FACFE', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
