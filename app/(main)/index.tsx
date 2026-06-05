import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/providers/AuthProvider';
import { Group, getUserGroups } from '../../src/api/groups';

export default function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await getUserGroups();
      setGroups(data);
    } catch (error) {
      console.log('Error fetching groups', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hoş Geldiniz,</Text>
        <Text style={styles.subtitle}>{user?.email}</Text>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Gruplarım</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4FACFE" />
        ) : groups.length === 0 ? (
          <Text style={styles.emptyText}>Henüz bir gruba dahil değilsiniz.</Text>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Link href={{ pathname: '/(main)/group/[id]', params: { id: item.id, name: item.name } }} asChild>
                <TouchableOpacity style={styles.groupCard}>
                  <Text style={styles.groupName}>{item.name}</Text>
                  {item.description ? <Text style={styles.groupDesc}>{item.description}</Text> : null}
                </TouchableOpacity>
              </Link>
            )}
          />
        )}
      </View>

      <View style={styles.actions}>
        <Link href="/(main)/create-group" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>+ Yeni Grup Oluştur</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity style={styles.button} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.buttonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A202C' },
  subtitle: { fontSize: 16, color: '#4A5568', marginTop: 4 },
  listContainer: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginBottom: 15 },
  emptyText: { color: '#718096', fontStyle: 'italic' },
  groupCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  groupName: { fontSize: 16, fontWeight: 'bold', color: '#1A202C' },
  groupDesc: { fontSize: 14, color: '#718096', marginTop: 4 },
  actions: { padding: 20, gap: 10 },
  primaryButton: { backgroundColor: '#4FACFE', padding: 16, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  button: { backgroundColor: '#E53E3E', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
