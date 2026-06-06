import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, StatusBar,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addExpense, SplitType, ParticipantSplit } from '../../src/api/expenses';
import { getGroupMembers } from '../../src/api/members';
import { useAuth } from '../../src/providers/AuthProvider';

const SPLIT_LABELS: Record<SplitType, string> = {
  EQUAL: 'Eşit',
  PERCENTAGE: 'Yüzde %',
  EXACT: 'Tutar ₺',
};

export default function AddExpense() {
  const { groupId } = useLocalSearchParams();
  const { user } = useAuth();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [members, setMembers] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [splitValues, setSplitValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const data = await getGroupMembers(groupId as string);
      setMembers(data);
      setSelected(new Set(data.map((m: any) => m.id)));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const toggleMember = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalSplit = () => {
    if (splitType === 'EQUAL') return null;
    const sum = members.reduce((acc, m) => acc + parseFloat(splitValues[m.id] || '0'), 0);
    return parseFloat(sum.toFixed(2));
  };

  const splitHint = () => {
    const t = totalSplit();
    if (t === null) return null;
    const target = splitType === 'PERCENTAGE' ? 100 : parseFloat(amount || '0');
    const diff = parseFloat((target - t).toFixed(2));
    if (Math.abs(diff) < 0.01) return { ok: true, text: '✓ Toplam eşleşiyor' };
    return { ok: false, text: `${diff > 0 ? '+' : ''}${diff} ${splitType === 'PERCENTAGE' ? '%' : '₺'} fark` };
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Hata', 'Lütfen açıklama girin.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin.');
      return;
    }

    const activeMemberIds = splitType === 'EQUAL'
      ? members.filter(m => selected.has(m.id)).map(m => m.id)
      : members.map(m => m.id);

    if (activeMemberIds.length === 0) {
      Alert.alert('Hata', 'En az bir katılımcı seçin.');
      return;
    }

    const participants: ParticipantSplit[] = activeMemberIds.map(uid => ({
      user_id: uid,
      value: splitType === 'EQUAL' ? undefined : parseFloat(splitValues[uid] || '0'),
    }));

    setSubmitting(true);
    try {
      await addExpense(groupId as string, user!.id, numAmount, description, splitType, participants);
      router.back();
    } catch (err: any) {
      Alert.alert('Hata', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const hint = splitHint();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Masraf Ekle</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        {/* Amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>TUTAR (TRY)</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySign}>₺</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#CBD5E1"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              autoFocus
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Akşam Yemeği"
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Split Type */}
        <View style={styles.card}>
          <Text style={styles.label}>Bölüştürme Yöntemi</Text>
          <View style={styles.splitTabs}>
            {(Object.keys(SPLIT_LABELS) as SplitType[]).map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.splitTab, splitType === type && styles.splitTabActive]}
                onPress={() => setSplitType(type)}
                activeOpacity={0.7}
              >
                <Text style={[styles.splitTabText, splitType === type && styles.splitTabTextActive]}>
                  {SPLIT_LABELS[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {hint && (
            <View style={[styles.hintBox, hint.ok ? styles.hintOk : styles.hintWarn]}>
              <Text style={[styles.hintText, hint.ok ? styles.hintTextOk : styles.hintTextWarn]}>
                {hint.text}
              </Text>
            </View>
          )}
        </View>

        {/* Participants */}
        <View style={styles.card}>
          <Text style={styles.label}>
            Katılımcılar
            {splitType === 'EQUAL' && (
              <Text style={styles.labelHint}> — seçilenlere eşit bölünür</Text>
            )}
          </Text>

          {members.map(m => {
            const isActive = splitType === 'EQUAL' ? selected.has(m.id) : true;
            return (
              <View key={m.id} style={[styles.memberRow, !isActive && styles.memberRowInactive]}>
                {splitType === 'EQUAL' ? (
                  <TouchableOpacity
                    style={[styles.checkbox, selected.has(m.id) && styles.checkboxActive]}
                    onPress={() => toggleMember(m.id)}
                    activeOpacity={0.7}
                  >
                    {selected.has(m.id) && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.checkboxPlaceholder} />
                )}

                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {(m.full_name || m.email)?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>

                <Text style={styles.memberName} numberOfLines={1}>
                  {m.full_name || m.email}
                  {m.id === user?.id ? ' (Sen)' : ''}
                </Text>

                {splitType !== 'EQUAL' && (
                  <TextInput
                    style={styles.splitInput}
                    placeholder={splitType === 'PERCENTAGE' ? '0' : '0.00'}
                    placeholderTextColor="#94A3B8"
                    value={splitValues[m.id] || ''}
                    onChangeText={val => setSplitValues(p => ({ ...p, [m.id]: val }))}
                    keyboardType="numeric"
                  />
                )}

                {splitType === 'EQUAL' && selected.has(m.id) && parseFloat(amount) > 0 && (
                  <Text style={styles.equalAmt}>
                    {(parseFloat(amount) / selected.size).toFixed(2)} ₺
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.submitWrapper}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#10B981', '#059669']} style={styles.submitBtn}>
            {submitting
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.submitText}>Masrafı Kaydet</Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F4FF' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4FF' },
  header: { paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { color: '#FFF', fontSize: 34, lineHeight: 40 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  body: { flex: 1, paddingTop: 20 },
  amountCard: {
    backgroundColor: '#4F46E5', marginHorizontal: 20, borderRadius: 20,
    padding: 24, marginBottom: 16, alignItems: 'center',
    shadowColor: '#4F46E5', shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
  },
  amountLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  currencySign: { color: 'rgba(255,255,255,0.7)', fontSize: 28, fontWeight: '700' },
  amountInput: { color: '#FFF', fontSize: 48, fontWeight: '800', minWidth: 120, textAlign: 'center' },
  card: {
    backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 20,
    padding: 20, marginBottom: 16,
    shadowColor: '#6366F1', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  label: {
    fontSize: 12, fontWeight: '700', color: '#64748B',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
  },
  labelHint: { textTransform: 'none', letterSpacing: 0, fontWeight: '400', fontSize: 12 },
  input: {
    backgroundColor: '#F8FAFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 14, fontSize: 15, color: '#1E293B',
  },
  splitTabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  splitTab: {
    flex: 1, paddingVertical: 11, borderRadius: 12,
    backgroundColor: '#F8FAFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  splitTabActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  splitTabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  splitTabTextActive: { color: '#4F46E5' },
  hintBox: { borderRadius: 10, padding: 10, marginTop: 4 },
  hintOk: { backgroundColor: '#D1FAE5' },
  hintWarn: { backgroundColor: '#FEF3C7' },
  hintText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  hintTextOk: { color: '#065F46' },
  hintTextWarn: { color: '#92400E' },
  memberRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  memberRowInactive: { opacity: 0.45 },
  checkbox: {
    width: 24, height: 24, borderRadius: 7,
    borderWidth: 2, borderColor: '#CBD5E1',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  checkmark: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  checkboxPlaceholder: { width: 24 },
  memberAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center',
  },
  memberAvatarText: { color: '#4F46E5', fontWeight: '700', fontSize: 14 },
  memberName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  splitInput: {
    width: 76, backgroundColor: '#F8FAFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 10, padding: 9, textAlign: 'center', fontSize: 14, color: '#1E293B',
  },
  equalAmt: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },
  submitWrapper: { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden' },
  submitBtn: { padding: 17, alignItems: 'center' },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
