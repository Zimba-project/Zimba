import React, { useState } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Image
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { login as loginApi } from '../api/auth';
import { sessionStorage } from '../utils/Storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GoogleIcon = require('../../assets/google.png');
const AppleIcon = require('../../assets/apple.png');

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
    <Box className="flex-1 bg-background-0">
      <Box style={styles.container}>
        <Text className="text-3xl text-typography-900 font-bold mb-3">Login Account</Text>

        {error ? <Text className="text-sm text-error-500 mb-2.5">{error}</Text> : null}

        {/* Phone */}
        <Text className="text-sm text-typography-700 mb-1.5">Mobile Number</Text>
        <Box className="border border-outline-200 rounded-lg mb-4 bg-background-50">
          <TextInput
            className="px-4 py-4 text-typography-900"
            placeholder="Enter mobile number"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </Box>

        {/* Password */}
        <Text className="text-sm text-typography-700 mb-1.5">Password</Text>
        <Box className="border border-outline-200 rounded-lg mb-4 bg-background-50">
          <TextInput
            className="px-4 py-4 text-typography-900"
            placeholder="Enter password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </Box>

        {/* Keep me logged in */}
        <Box className="flex-row items-center mb-3">
          <Checkbox
            value={keepLoggedIn}
            onValueChange={setKeepLoggedIn}
            color={keepLoggedIn ? '#818cf8' : undefined}
          />
          <Text className="text-sm text-typography-700 ml-2">Keep me logged in</Text>
        </Box>

        {/* Login Button */}
        <Pressable onPress={handleLogin}>
          <Box className="bg-primary-500 py-3.5 rounded-lg items-center mb-6">
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-base text-typography-0 font-bold">Login</Text>
            )}
          </Box>
        </Pressable>

        {/* Social Login */}
        <Text className="text-sm text-center text-typography-600 mb-4">or sign in with</Text>
        <Box className="mb-3">
          <Pressable onPress={() => Alert.alert('Not implemented')}>
            <Box className="flex-row items-center border border-outline-200 rounded-lg py-3 px-4 bg-background-0 mb-3">
              <Image source={GoogleIcon} style={{ width: 20, height: 20 }} />
              <Text className="text-sm text-typography-700 ml-2">Continue with Google</Text>
            </Box>
          </Pressable>

          <Pressable onPress={() => Alert.alert('Not implemented')}>
            <Box className="flex-row items-center border border-outline-200 rounded-lg py-3 px-4 bg-background-0 mb-3">
              <Image source={AppleIcon} style={{ width: 20, height: 20 }} />
              <Text className="text-sm text-typography-700 ml-2">Continue with Apple</Text>
            </Box>
          </Pressable>
        </Box>

        {/* Sign Up */}
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text className="text-sm text-center text-typography-600 mt-8">
            Don't have an account?{' '}
            <Text className="text-primary-500 font-semibold">Sign Up</Text>
          </Text>
        </Pressable>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14
  }
});
