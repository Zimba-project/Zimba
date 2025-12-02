import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import GoogleLogo from '../../assets/google.svg';
import AppleLogo from '../../assets/apple.svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { login as loginApi } from '../api/auth';
import { sessionStorage } from '../utils/Storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme'; // centralized theme

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const initialPhone = route?.params?.phone ?? '';
  const [phone, setPhone] = useState(initialPhone);
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { theme } = useTheme();
  const t = getTheme(theme); // centralized theme object

  const handleLogin = async () => {
    setError(null);

    if (!phone || !password) {
      setError('Please enter phone and password');
      return;
    }

    setLoading(true);
    try {
      const res = await loginApi({ phone, password });

      if (res && res.ok) {
        if (res.body?.token) {
          sessionStorage.setItem('authToken', res.body.token);

          if (keepLoggedIn) {
            await AsyncStorage.setItem('authToken', res.body.token);
          } else {
            await AsyncStorage.removeItem('authToken');
          }

          navigation.replace('Main', { user: res.body.user });
        } else {
          setError('Login succeeded but no token returned');
        }
      } else if (res) {
        const msg = res.body?.message || `Login failed (${res.status})`;
        setError(msg);
      } else {
        setError('Unexpected server response');
      }
    } catch (e) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: t.background, paddingTop: 60 }]}>
        <Text style={[styles.title, { color: t.text }]}>Login Account</Text>

        {error && <Text style={{ color: t.error, marginBottom: 10 }}>{error}</Text>}

        {/* Phone */}
        <Text style={[styles.label, { color: t.text }]}>Mobile Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: t.inputBackground, borderColor: t.inputBorder, color: t.text }]}
          placeholder="Enter mobile number"
          placeholderTextColor={t.placeholder}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        {/* Password */}
        <Text style={[styles.label, { color: t.text }]}>Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: t.inputBackground, borderColor: t.inputBorder, color: t.text }]}
          placeholder="Enter password"
          placeholderTextColor={t.placeholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Keep me logged in */}
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={keepLoggedIn}
            onValueChange={setKeepLoggedIn}
            color={keepLoggedIn ? t.accent : undefined}
          />
          <Text style={[styles.checkboxLabel, { color: t.text }]}>Keep me logged in</Text>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: t.accent }]}
          onPress={handleLogin}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Social Login */}
        <Text style={[styles.orText, { color: t.text }]}>or sign in with</Text>
        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={[styles.socialButton, { borderColor: t.inputBorder, backgroundColor: t.inputBackground }]}
            onPress={() => Alert.alert('Not implemented')}
          >
            <GoogleLogo width={22} height={22} />
            <Text style={[styles.socialText, { color: t.text }]}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, { borderColor: t.inputBorder, backgroundColor: t.inputBackground }]}
            onPress={() => Alert.alert('Not implemented')}
          >
            <AppleLogo width={22} height={22} />
            <Text style={[styles.socialText, { color: t.text }]}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.signupText, { color: t.text }]}>
            Don’t have an account?{' '}
            <Text style={{ color: t.accent, fontWeight: '600' }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24},
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  checkboxLabel: { marginLeft: 8, fontSize: 14 },
  loginButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24
  },
  loginText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  orText: { textAlign: 'center', marginBottom: 16 },
  socialContainer: { gap: 12 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12
  },
  socialText: { fontSize: 14, marginLeft: 8 },
  signupText: { textAlign: 'center', fontSize: 14, marginTop: 32 }
});
