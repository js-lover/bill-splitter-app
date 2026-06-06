import { Redirect } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.container}>
        <Text style={styles.appName}>Ortak Hesap</Text>
        <Text style={styles.tagline}>Masrafları kolayca bölüştür</Text>
        <ActivityIndicator size="large" color="rgba(255,255,255,0.7)" style={{ marginTop: 32 }} />
      </LinearGradient>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(main)" />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  appName: { color: '#FFF', fontSize: 36, fontWeight: '800', letterSpacing: 0.5 },
  tagline: { color: 'rgba(255,255,255,0.65)', fontSize: 15, marginTop: 8 },
});
