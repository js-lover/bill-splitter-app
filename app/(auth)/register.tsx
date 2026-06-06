import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp() {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Hata', 'Tüm alanları doldurunuz.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (error) {
      Alert.alert('Kayıt Başarısız', error.message);
    } else {
      Alert.alert('Başarılı! 🎉', 'E-posta adresinize doğrulama linki gönderildi. Linke tıkladıktan sonra giriş yapabilirsiniz.');
    }
    setLoading(false);
  }

  return (
    <LinearGradient colors={['#312E81', '#4338CA', '#6D28D9']} style={styles.bg}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.topSection}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>₺</Text>
              </View>
              <Text style={styles.appName}>Ortak Hesap</Text>
              <Text style={styles.appTagline}>Hesabınızı oluşturun</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Kayıt Ol</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ad Soyad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Adınız ve soyadınız"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-posta</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ornek@mail.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Şifre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="En az 6 karakter"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.btnWrapper} onPress={signUp} disabled={loading} activeOpacity={0.85}>
                <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.btn}>
                  {loading
                    ? <ActivityIndicator color="#FFF" />
                    : <Text style={styles.btnText}>Hesap Oluştur</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>

              <Link href="/(auth)/login" asChild>
                <TouchableOpacity style={styles.link}>
                  <Text style={styles.linkText}>Zaten hesabınız var mı? <Text style={styles.linkBold}>Giriş Yapın</Text></Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  topSection: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  logoText: { color: '#FFF', fontSize: 32, fontWeight: '800' },
  appName: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  appTagline: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 6 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24, padding: 28,
    shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 24, shadowOffset: { width: 0, height: 12 },
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    backgroundColor: '#F8FAFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 14, fontSize: 15, color: '#1E293B',
  },
  btnWrapper: { marginTop: 8, borderRadius: 14, overflow: 'hidden' },
  btn: { padding: 16, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#64748B', fontSize: 14 },
  linkBold: { color: '#4F46E5', fontWeight: '700' },
});
