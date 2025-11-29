import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import Checkbox from 'expo-checkbox';
import GoogleLogo from '../../assets/google.svg';
import AppleLogo from '../../assets/apple.svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { login as loginApi } from '../api/auth';
import { sessionStorage } from '../utils/Storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const initialPhone =
    route?.params?.phone ? route.params.phone : '';

  const [phone, setPhone] = useState(initialPhone);
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------------------------
  // 🔐 LOGIN LOGIC (your logic)
  // ---------------------------
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
          // Save always to sessionStorage
          sessionStorage.setItem('authToken', res.body.token);

          // Save persistently only if keepLoggedIn = true
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login Account</Text>

      {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}

      {/* Phone */}
      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter mobile number"
        placeholderTextColor="#666"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Keep me logged in */}
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={keepLoggedIn}
          onValueChange={setKeepLoggedIn}
          color={keepLoggedIn ? '#2563eb' : undefined}
        />
        <Text style={styles.checkboxLabel}>Keep me logged in</Text>
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginText}>Login</Text>
        )}
      </TouchableOpacity>

      {/* Social Login */}
      <Text style={styles.orText}>or sign in with</Text>
      <View style={styles.socialContainer}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => Alert.alert('Not implemented')}
        >
          <GoogleLogo width={22} height={22} />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => Alert.alert('Not implemented')}
        >
          <AppleLogo width={22} height={22} />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.signupText}>
          Don’t have an account?{' '}
          <Text style={styles.signupLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#ffffff' },
  title: { fontSize: 28, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  label: { fontSize: 14, color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: '#f9fafb'
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151'
  },
  loginButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24
  },
  loginText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  orText: { textAlign: 'center', color: '#6b7280', marginBottom: 16 },
  socialContainer: { gap: 12 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    marginBottom: 12
  },
  socialText: { fontSize: 14, color: '#374151', marginLeft: 8 },
  signupText: { textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 32 },
  signupLink: { color: '#2563eb', fontWeight: '600' }
});
