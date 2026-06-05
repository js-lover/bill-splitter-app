import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { addExpense, SplitType, ParticipantSplit } from '../../src/api/expenses';
import { getGroupMembers } from '../../src/api/members';
import { useAuth } from '../../src/providers/AuthProvider';

export default function AddExpense() {
  const { groupId } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // selected values for exact/percentage
  const [splitValues, setSplitValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  const fetchMembers = async () => {
    try {
      const data = await getGroupMembers(groupId as string);
      setMembers(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim() || !amount.trim()) {
      Alert.alert('Hata', 'Lütfen açıklama ve tutarı girin.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin.');
      return;
    }

    const participants: ParticipantSplit[] = members.map(m => ({
      user_id: m.id,
      value: splitType === 'EQUAL' ? undefined : parseFloat(splitValues[m.id] || '0')
    }));

    setSubmitting(true);
    try {
      await addExpense(groupId as string, user!.id, numAmount, description, splitType, participants);
      Alert.alert('Başarılı', 'Masraf eklendi.');
      router.back();
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSplitValueChange = (userId: string, val: string) => {
    setSplitValues(prev => ({ ...prev, [userId]: val }));
  };

  if (loading) return <ActivityIndicator size="large" color="#4FACFE" style={{ marginTop: 50 }} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'< İptal'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Masraf Ekle</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Açıklama</Text>
        <TextInput style={styles.input} placeholder="Örn: Akşam Yemeği" value={description} onChangeText={setDescription} />

        <Text style={styles.label}>Tutar (TRY)</Text>
        <TextInput style={styles.input} placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="numeric" />

        <Text style={styles.label}>Bölüştürme Tipi</Text>
        <View style={styles.splitTypes}>
          {(['EQUAL', 'PERCENTAGE', 'EXACT'] as SplitType[]).map(type => (
            <TouchableOpacity 
              key={type} 
              style={[styles.typeButton, splitType === type && styles.typeButtonActive]}
              onPress={() => setSplitType(type)}
            >
              <Text style={[styles.typeText, splitType === type && styles.typeTextActive]}>
                {type === 'EQUAL' ? 'Eşit' : type === 'PERCENTAGE' ? 'Yüzde (%)' : 'Tutar'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Katılımcılar</Text>
        {members.map(m => (
          <View key={m.id} style={styles.memberRow}>
            <Text style={styles.memberName}>{m.full_name || m.email}</Text>
            {splitType !== 'EQUAL' && (
              <TextInput
                style={styles.splitInput}
                placeholder={splitType === 'PERCENTAGE' ? '%' : '₺'}
                keyboardType="numeric"
                value={splitValues[m.id] || ''}
                onChangeText={(val) => handleSplitValueChange(m.id, val)}
              />
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Kaydet</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 15 },
  backText: { color: '#E53E3E', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1A202C' },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 14, fontSize: 16, color: '#1A202C' },
  splitTypes: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  typeButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#EDF2F7', alignItems: 'center' },
  typeButtonActive: { backgroundColor: '#4FACFE' },
  typeText: { fontWeight: 'bold', color: '#4A5568' },
  typeTextActive: { color: '#FFF' },
  memberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#FFF', borderRadius: 8, marginBottom: 10 },
  memberName: { fontSize: 16, color: '#2D3748' },
  splitInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, padding: 8, width: 80, textAlign: 'center' },
  submitButton: { backgroundColor: '#4FACFE', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  submitText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
