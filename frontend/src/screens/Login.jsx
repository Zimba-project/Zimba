import React, { useState } from 'react';
import { StatusBar, View, TextInput, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import Checkbox from 'expo-checkbox';
import GoogleLogo from '../../assets/google.svg';
import AppleLogo from '../../assets/apple.svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { login as loginApi } from '../api/auth';
import { sessionStorage } from '../utils/Storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme'; // centralized theme
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';

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
    <SafeAreaView edges={["left", "right", "bottom"]} style={[styles.container, { backgroundColor: t.background, paddingTop: 16 }]}>
      <Text className="text-2xl font-bold" style={{ color: t.text, marginBottom: 12 }}>Login Account</Text>

      {error && <Text style={{ color: t.error, marginBottom: 10 }}>{error}</Text>}

      {/* Phone */}
      <Text style={{ color: t.text, marginBottom: 6, fontSize: 14, fontWeight: '500' }}>Mobile Number</Text>
      <TextInput
        style={[styles.input, { backgroundColor: t.inputBackground, borderColor: t.inputBorder, color: t.text }]}
        placeholder="Enter mobile number"
        placeholderTextColor={t.placeholder}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Password */}
      <Text style={{ color: t.text, marginBottom: 6, fontSize: 14, fontWeight: '500' }}>Password</Text>
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
        <Text style={{ color: t.text, marginLeft: 8 }}>Keep me logged in</Text>
      </View>

      {/* Login Button */}
      <Button action="primary" variant="solid" onPress={handleLogin} className="h-11 mb-6" style={{ backgroundColor: t.accent, borderRadius: 8 }}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ButtonText>Login</ButtonText>
        )}
      </Button>

      {/* Social Login */}
      <Text style={{ textAlign: 'center', marginBottom: 16, color: t.text }}>or sign in with</Text>
      <View style={styles.socialContainer}>
        <Button variant="outline" action="secondary" onPress={() => Alert.alert('Not implemented')} className="flex-row items-center justify-center h-11 mb-3" style={{ borderColor: t.inputBorder, backgroundColor: t.inputBackground, borderRadius: 8 }}>
          <GoogleLogo width={22} height={22} />
          <Text style={{ color: t.text, marginLeft: 8 }}>Continue with Google</Text>
        </Button>

        <Button variant="outline" action="secondary" onPress={() => Alert.alert('Not implemented')} className="flex-row items-center justify-center h-11" style={{ borderColor: t.inputBorder, backgroundColor: t.inputBackground, borderRadius: 8 }}>
          <AppleLogo width={22} height={22} />
          <Text style={{ color: t.text, marginLeft: 8 }}>Continue with Apple</Text>
        </Button>
      </View>

      {/* Sign Up */}
      <HStack className="items-center justify-center" style={{ marginTop: 12 }}>
        <Text style={{ color: t.text }}>Don’t have an account?</Text>
        <Button variant="link" action="primary" onPress={() => navigation.navigate('Register')} style={{ borderRadius: 8 }}>
          <Text style={{ color: t.accent, fontWeight: '600' }}> Sign Up</Text>
        </Button>
      </HStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
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
  socialContainer: { gap: 12 },
  socialButton: {},
  socialText: {},
  signupText: {}
});
