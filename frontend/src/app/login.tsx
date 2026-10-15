import { useState } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { request } from '@/lib/api';
import { showError } from '@/lib/dialogs';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitch from '@/components/LanguageSwitch';

export default function LoginScreen() {
  const { token, login } = useAuth();
  const { t, errorText } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (token) return <Redirect href="/" />;
  async function handleLogin() {
    if (busy) return;
    if (!username.trim() || !password) { setError('Please enter your username and password.'); showError(t('loginRequired'), t('errorTitle')); return; }
    setBusy(true); setError('');
    try {
      const data = await request<{ success: boolean; token: string }>('/api/login', null, {
        method: 'POST', body: JSON.stringify({ username: username.trim(), password }),
      });
      login(data.token);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      setError(message); showError(errorText(message), t('errorTitle'));
    } finally { setBusy(false); }
  }
  return <SafeAreaView style={s.page}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={s.center} keyboardShouldPersistTaps="handled">
      <View style={s.topBar}><View style={s.brand}><View style={s.logo}><Feather name="users" size={24} color="#fff" /></View><Text style={s.brandText}>people<Text style={{ color: '#6558db' }}>.</Text></Text></View><LanguageSwitch /></View>
      <View style={s.card}>
        <Text style={s.eyebrow}>{t('loginEyebrow')}</Text>
        <Text style={s.title}>{t('loginTitle')}</Text>
        <Text style={s.subtitle}>{t('loginSubtitle')}</Text>
        <Text style={s.label}>{t('username')}</Text><TextInput accessibilityLabel={t('username')} style={s.input} placeholder={t('usernamePlaceholder')} placeholderTextColor="#8a90a0" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} editable={!busy} />
        <Text style={s.label}>{t('password')}</Text><TextInput accessibilityLabel={t('password')} style={s.input} placeholder={t('passwordPlaceholder')} placeholderTextColor="#8a90a0" value={password} onChangeText={setPassword} secureTextEntry editable={!busy} onSubmitEditing={handleLogin} />
        {!!error && <Text accessibilityRole="alert" style={s.error}>{errorText(error)}</Text>}
        <Pressable accessibilityRole="button" disabled={busy} onPress={handleLogin} style={[s.button, busy && { opacity: 0.6 }]}>{busy ? <ActivityIndicator color="#fff" /> : <><Text style={s.buttonText}>{t('signIn')}</Text><Feather name="arrow-right" size={18} color="#fff" /></>}</Pressable>
        <View style={s.hint}><Feather name="info" size={16} color="#6558db" /><Text style={s.hintText}>{t('accountHint')}</Text></View>
      </View><Text style={s.footer}>{t('appName')}</Text>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f4f5fa' }, center: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  topBar: { width: '100%', maxWidth: 460, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 }, logo: { backgroundColor: '#6558db', padding: 10, borderRadius: 12 }, brandText: { fontSize: 30, fontWeight: '800', color: '#20243b' },
  card: { width: '100%', maxWidth: 460, backgroundColor: '#fff', borderRadius: 24, padding: 28, borderWidth: 1, borderColor: '#e6e8f0' },
  eyebrow: { color: '#6558db', fontWeight: '700', fontSize: 11, letterSpacing: 2 }, title: { color: '#20243b', fontSize: 34, lineHeight: 42, fontWeight: '800', marginTop: 16 },
  subtitle: { color: '#71778b', fontSize: 14, lineHeight: 22, marginTop: 12, marginBottom: 24 }, label: { color: '#34394e', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#fafbfe', borderColor: '#dfe2ec', borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15, color: '#20243b', marginBottom: 18 },
  button: { padding: 16, backgroundColor: '#6558db', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', gap: 12, alignItems: 'center', marginTop: 6 }, buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  hint: { backgroundColor: '#f2f0ff', borderRadius: 10, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 20 }, hintText: { color: '#615a8c', fontSize: 12, flexShrink: 1 },
  error: { color: '#b9384f', marginBottom: 12, lineHeight: 20 }, footer: { color: '#8a90a0', fontSize: 12, marginTop: 24 },
});
