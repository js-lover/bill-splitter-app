import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, StatusBar,
} from 'react-native';
import { useLocalSearchParams, router, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../src/lib/supabase';
import { getGroupMembers, addMemberByEmail } from '../../../src/api/members';
import { calculateGroupDebts, settleDebt } from '../../../src/api/debts';
import { useAuth } from '../../../src/providers/AuthProvider';

export default function GroupDetails() {
  const { id, name } = useLocalSearchParams();
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [membersData, debtsData] = await Promise.all([
        getGroupMembers(id as string),
        calculateGroupDebts(id as string),
      ]);
      setMembers(membersData);
      setDebts(debtsData);
    } catch (err) {
      console.log('fetchData error', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`group_${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `group_id=eq.${id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debts', filter: `group_id=eq.${id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${id}` }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, fetchData]);

  const handleSettle = (debt: any) => {
    Alert.alert(
      'Ödeme Onayla',
      `${debt.debtor_name} → ${debt.creditor_name}\n${debt.amount.toFixed(2)} ₺ ödendi olarak işaretlensin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Ödendi ✓',
          onPress: async () => {
            try {
              await settleDebt(id as string, debt.debtor_id, debt.creditor_id, debt.amount);
              fetchData();
            } catch (err: any) {
              Alert.alert('Hata', err.message);
            }
          },
        },
      ]
    );
  };

  const handleAddMember = async () => {
    if (!email.trim()) return;
    setAdding(true);
    try {
      await addMemberByEmail(id as string, email.trim());
      setEmail('');
      setShowAddMember(false);
      fetchData();
    } catch (err: any) {
      Alert.alert('Hata', err.message);
    } finally {
      setAdding(false);
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
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
              <Text style={styles.headerSub}>{members.length} üye</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Add Expense CTA */}
        <Link href={{ pathname: '/(main)/add-expense', params: { groupId: id } }} asChild>
          <TouchableOpacity style={styles.expenseCta} activeOpacity={0.85}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.expenseCtaGrad}>
              <Text style={styles.expenseCtaText}>+ Masraf Ekle</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Link>

        {/* Debts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💸 Hesaplaşma</Text>

          {loading ? (
            <ActivityIndicator color="#4F46E5" style={{ paddingVertical: 24 }} />
          ) : debts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyText}>Kimsenin kimseye borcu yok!</Text>
            </View>
          ) : (
            debts.map((debt, i) => (
              <View key={i} style={styles.debtCard}>
                <View style={styles.debtAvatarWrap}>
                  <Text style={styles.debtAvatarChar}>{debt.debtor_name?.[0]?.toUpperCase() || '?'}</Text>
                </View>
                <View style={styles.debtMid}>
                  <Text style={styles.debtNames}>
                    <Text style={{ fontWeight: '700' }}>{debt.debtor_name}</Text>
                    {'  →  '}
                    <Text style={{ fontWeight: '700' }}>{debt.creditor_name}</Text>
                  </Text>
                  <Text style={styles.debtAmt}>{debt.amount.toFixed(2)} ₺</Text>
                </View>
                {(user?.id === debt.debtor_id || user?.id === debt.creditor_id) && (
                  <TouchableOpacity style={styles.settleBtn} onPress={() => handleSettle(debt)} activeOpacity={0.8}>
                    <Text style={styles.settleBtnText}>Ödendi</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {/* Members */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>👥 Üyeler</Text>
            <TouchableOpacity
              style={[styles.toggleBtn, showAddMember && styles.toggleBtnCancel]}
              onPress={() => setShowAddMember(v => !v)}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleBtnText, showAddMember && styles.toggleBtnTextCancel]}>
                {showAddMember ? 'İptal' : '+ Ekle'}
              </Text>
            </TouchableOpacity>
          </View>

          {showAddMember && (
            <View style={styles.addMemberRow}>
              <TextInput
                style={styles.memberInput}
                placeholder="E-posta adresi"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
              <TouchableOpacity style={styles.addMemberBtn} onPress={handleAddMember} disabled={adding} activeOpacity={0.8}>
                {adding
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Text style={styles.addMemberBtnText}>Ekle</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            <ActivityIndicator color="#4F46E5" style={{ paddingVertical: 24 }} />
          ) : members.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Henüz üye eklenmedi.</Text>
            </View>
          ) : (
            members.map((m) => (
              <View key={m.id} style={styles.memberCard}>
                <View style={styles.memberAvatarWrap}>
                  <Text style={styles.memberAvatarChar}>
                    {(m.full_name || m.email)?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{m.full_name || 'İsimsiz'}</Text>
                  <Text style={styles.memberEmail}>{m.email}</Text>
                </View>
                {m.id === user?.id && (
                  <View style={styles.youBadge}>
                    <Text style={styles.youBadgeText}>Sen</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F4FF' },
  header: { paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { color: '#FFF', fontSize: 34, lineHeight: 40 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  body: { flex: 1 },
  expenseCta: { marginHorizontal: 20, marginTop: 20, borderRadius: 16, overflow: 'hidden' },
  expenseCtaGrad: { padding: 17, alignItems: 'center' },
  expenseCtaText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  section: { marginHorizontal: 20, marginTop: 24 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  emptyCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  debtCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    borderLeftWidth: 4, borderLeftColor: '#EF4444',
    shadowColor: '#EF4444', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  debtAvatarWrap: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  debtAvatarChar: { color: '#EF4444', fontWeight: '800', fontSize: 16 },
  debtMid: { flex: 1 },
  debtNames: { fontSize: 14, color: '#334155' },
  debtAmt: { fontSize: 20, fontWeight: '800', color: '#EF4444', marginTop: 4 },
  settleBtn: {
    backgroundColor: '#10B981', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 10,
  },
  settleBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  toggleBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  toggleBtnCancel: { backgroundColor: '#FEE2E2' },
  toggleBtnText: { color: '#4F46E5', fontWeight: '700', fontSize: 13 },
  toggleBtnTextCancel: { color: '#EF4444' },
  addMemberRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  memberInput: {
    flex: 1, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 13, fontSize: 14, color: '#1E293B',
  },
  addMemberBtn: {
    backgroundColor: '#4F46E5', paddingHorizontal: 18,
    justifyContent: 'center', borderRadius: 12,
  },
  addMemberBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  memberCard: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 14,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  memberAvatarWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  memberAvatarChar: { color: '#4F46E5', fontWeight: '800', fontSize: 16 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  memberEmail: { fontSize: 12, color: '#64748B', marginTop: 2 },
  youBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  youBadgeText: { color: '#4F46E5', fontSize: 11, fontWeight: '700' },
});
