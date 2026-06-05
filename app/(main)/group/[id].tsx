import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router, Link } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import { getGroupMembers, addMemberByEmail } from '../../../src/api/members';
import { calculateGroupDebts, settleDebt } from '../../../src/api/debts';
import { useAuth } from '../../../src/providers/AuthProvider';

export default function GroupDetails() {
  const { id, name } = useLocalSearchParams();
  const [members, setMembers] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('group_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `group_id=eq.${id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debts', filter: `group_id=eq.${id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${id}` }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchData = async () => {
    try {
      const [membersData, debtsData] = await Promise.all([
        getGroupMembers(id as string),
        calculateGroupDebts(id as string)
      ]);
      setMembers(membersData);
      setDebts(debtsData);
    } catch (error) {
      console.log('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async (debt: any) => {
    try {
      await settleDebt(id as string, debt.debtor_id, debt.creditor_id, debt.amount);
      Alert.alert('Başarılı', 'Borç ödendi olarak işaretlendi.');
      fetchData(); // Refresh debts
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    }
  };

  const handleAddMember = async () => {
    if (!email.trim()) {
      Alert.alert('Hata', 'Lütfen bir e-posta adresi girin');
      return;
    }
    setAdding(true);
    try {
      await addMemberByEmail(id as string, email.trim());
      Alert.alert('Başarılı', 'Kullanıcı gruba eklendi');
      setEmail('');
      fetchData();
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'< Geri'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{name}</Text>
      </View>

      <View style={styles.addSection}>
        <Text style={styles.sectionTitle}>Yeni Üye Ekle</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı E-posta adresi"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddMember} disabled={adding}>
            {adding ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.addButtonText}>Ekle</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actions}>
        <Link href={{ pathname: '/(main)/add-expense', params: { groupId: id } }} asChild>
          <TouchableOpacity style={styles.expenseButton}>
            <Text style={styles.expenseButtonText}>+ Masraf Ekle</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Hesaplaşma (Borçlar)</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4FACFE" />
        ) : debts.length === 0 ? (
          <Text style={styles.emptyText}>Grupta kimsenin kimseye borcu yok.</Text>
        ) : (
          debts.map((item, index) => (
            <View key={index} style={styles.debtCard}>
              <View style={styles.debtInfo}>
                <Text style={styles.debtText}>
                  <Text style={{fontWeight: 'bold'}}>{item.debtor_name}</Text> ödeyecek: <Text style={{fontWeight: 'bold'}}>{item.creditor_name}</Text>
                </Text>
                <Text style={styles.debtAmount}>{item.amount} ₺</Text>
              </View>
              {(user?.id === item.debtor_id || user?.id === item.creditor_id) && (
                <TouchableOpacity style={styles.settleButton} onPress={() => handleSettle(item)}>
                  <Text style={styles.settleButtonText}>Ödendi</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Grup Üyeleri ({members.length})</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4FACFE" />
        ) : members.length === 0 ? (
          <Text style={styles.emptyText}>Henüz üye yok.</Text>
        ) : (
          members.map((item) => (
            <View key={item.id} style={styles.memberCard}>
              <Text style={styles.memberName}>{item.full_name || 'İsimsiz Kullanıcı'}</Text>
              <Text style={styles.memberEmail}>{item.email}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  contentContainer: { paddingBottom: 40 },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 15 },
  backText: { color: '#4FACFE', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1A202C' },
  addSection: { padding: 20, backgroundColor: '#FFF', marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#1A202C' },
  addButton: { backgroundColor: '#4FACFE', paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  addButtonText: { color: '#FFF', fontWeight: 'bold' },
  actions: { padding: 20, paddingBottom: 0 },
  expenseButton: { backgroundColor: '#48BB78', padding: 16, borderRadius: 12, alignItems: 'center' },
  expenseButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  listContainer: { padding: 20, paddingTop: 10 },
  emptyText: { color: '#718096', fontStyle: 'italic' },
  memberCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  memberName: { fontSize: 16, fontWeight: 'bold', color: '#1A202C' },
  memberEmail: { fontSize: 14, color: '#718096', marginTop: 4 },
  debtCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderLeftWidth: 4, borderLeftColor: '#E53E3E' },
  debtInfo: { flex: 1 },
  debtText: { fontSize: 14, color: '#2D3748' },
  debtAmount: { fontSize: 18, fontWeight: 'bold', color: '#E53E3E', marginTop: 4 },
  settleButton: { backgroundColor: '#4FACFE', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  settleButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
});
