import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, StatusBar, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/providers/AuthProvider';
import { Group, getUserGroups } from '../../src/api/groups';

const GROUP_COLORS = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981', '#0EA5E9'];

function groupColor(name: string) {
  return GROUP_COLORS[name.charCodeAt(0) % GROUP_COLORS.length];
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const data = await getUserGroups();
      setGroups(data);
    } catch (err) {
      console.log('fetchGroups error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    if (!user?.id) return;

    const channel = supabase
      .channel(`dashboard_${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'group_members', filter: `user_id=eq.${user.id}` },
        () => fetchGroups()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'groups' },
        () => fetchGroups()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchGroups]);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Kullanıcı';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Merhaba,</Text>
              <Text style={styles.userName}>{firstName} 👋</Text>
            </View>
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={() => supabase.auth.signOut()}
              activeOpacity={0.7}
            >
              <Text style={styles.signOutText}>Çıkış</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statNum}>{groups.length}</Text>
              <Text style={styles.statLabel}>Grup</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Gruplarım</Text>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => router.push('/(main)/create-group')}
            activeOpacity={0.7}
          >
            <Text style={styles.newBtnText}>+ Yeni</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 48 }} />
        ) : groups.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🏠</Text>
            <Text style={styles.emptyTitle}>Henüz grubunuz yok</Text>
            <Text style={styles.emptyDesc}>Ortak masrafları takip etmek için yeni bir grup oluşturun</Text>
            <TouchableOpacity
              style={styles.emptyAction}
              onPress={() => router.push('/(main)/create-group')}
            >
              <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.emptyActionGrad}>
                <Text style={styles.emptyActionText}>İlk Grubu Oluştur</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 110 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); fetchGroups(); }}
                tintColor="#4F46E5"
                colors={['#4F46E5']}
              />
            }
            renderItem={({ item }) => {
              const color = groupColor(item.name);
              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => router.push({ pathname: '/(main)/group/[id]', params: { id: item.id, name: item.name } })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.avatar, { backgroundColor: color + '18', borderColor: color + '35' }]}>
                    <Text style={[styles.avatarText, { color }]}>{initials(item.name)}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    {item.description ? <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text> : null}
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(main)/create-group')}
        activeOpacity={0.85}
      >
        <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.fabGrad}>
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F4FF' },
  header: { paddingBottom: 20 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 12,
  },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  userName: { color: '#FFF', fontSize: 22, fontWeight: '800', marginTop: 2 },
  signOutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  signOutText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 18, gap: 10 },
  statPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, paddingHorizontal: 22, paddingVertical: 12,
    alignItems: 'center', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statNum: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 1 },
  body: { flex: 1, paddingTop: 22 },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  newBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  newBtnText: { color: '#4F46E5', fontWeight: '700', fontSize: 13 },
  card: {
    backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 10,
    borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#6366F1', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, marginRight: 14,
  },
  avatarText: { fontSize: 18, fontWeight: '800' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  cardDesc: { fontSize: 13, color: '#64748B', marginTop: 3 },
  chevron: { color: '#CBD5E1', fontSize: 26, fontWeight: '300' },
  empty: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  emptyAction: { marginTop: 24, borderRadius: 14, overflow: 'hidden' },
  emptyActionGrad: { paddingHorizontal: 28, paddingVertical: 14 },
  emptyActionText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  fab: {
    position: 'absolute', bottom: 30, right: 24,
    borderRadius: 30, shadowColor: '#4F46E5',
    shadowOpacity: 0.45, shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 }, elevation: 10,
  },
  fabGrad: { width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#FFF', fontSize: 30, lineHeight: 34, fontWeight: '300' },
});
