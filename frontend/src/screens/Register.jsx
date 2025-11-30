import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Modal
} from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Feather as Icon } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { register as registerApi } from '../api/auth';
import { useNavigation } from '@react-navigation/native';

const GoogleIcon = require('../../assets/google.png');
const AppleIcon = require('../../assets/apple.png');

const COUNTRIES = [
  { name: 'Finland', dial_code: '+358', code: 'FI', flag: '🇫🇮' },
  { name: 'United States', dial_code: '+1', code: 'US', flag: '🇺🇸' },
  { name: 'United Kingdom', dial_code: '+44', code: 'GB', flag: '🇬🇧' },
  { name: 'Sweden', dial_code: '+46', code: 'SE', flag: '🇸🇪' },
  { name: 'Germany', dial_code: '+49', code: 'DE', flag: '🇩🇪' },
  { name: 'France', dial_code: '+33', code: 'FR', flag: '🇫🇷' },
  { name: 'Norway', dial_code: '+47', code: 'NO', flag: '🇳🇴' },
];

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [birthdate, setBirthdate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    setError(null);
    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
      setError('Please fill all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `${country.dial_code}${phone}`;
      const payload = { firstName, lastName, email, phone: fullPhone, birthdate, password, confirmPassword };
      const res = await registerApi(payload);
      if (res?.ok) {
        Alert.alert('Account created', 'Please check your email for verification.', [
          { text: 'OK', onPress: () => navigation.replace('Login', { phone: fullPhone }) }
        ]);
      } else {
        setError(res?.body?.message || `Registration failed (${res.status})`);
      }
    } catch (e) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Box style={styles.container}>
          <Text className="text-3xl text-typography-900 font-bold mb-3">Create Account</Text>
          {error && <Text className="text-sm text-error-500 mb-2.5">{error}</Text>}

          <Text className="text-base text-typography-900 font-semibold mb-3">Personal Info</Text>
          <Box className="flex-row w-full mb-4">
            <Box className="flex-1 mr-2 border border-outline-200 rounded-lg bg-background-50">
              <TextInput
                className="px-4 py-4 text-typography-900"
                placeholder="First name"
                placeholderTextColor="#9ca3af"
                value={firstName}
                onChangeText={setFirstName}
              />
            </Box>
            <Box className="flex-1 border border-outline-200 rounded-lg bg-background-50">
              <TextInput
                className="px-4 py-4 text-typography-900"
                placeholder="Last name"
                placeholderTextColor="#9ca3af"
                value={lastName}
                onChangeText={setLastName}
              />
            </Box>
          </Box>

          <Box className="border border-outline-200 rounded-lg mb-4 bg-background-50">
            <TextInput
              className="px-4 py-4 text-typography-900"
              placeholder="Email address"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </Box>

          {/* Phone */}
          <Box className="flex-row items-center w-full mb-4 border border-outline-200 rounded-lg bg-background-50">
            <Pressable
              style={styles.countryButton}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text className="text-typography-900">{country.flag} {country.dial_code}</Text>
            </Pressable>
            <TextInput
              className="flex-1 px-4 py-4 text-typography-900"
              placeholder="Phone number"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </Box>

          {/* Country Picker Modal */}
          {showCountryPicker && (
            <Modal visible={showCountryPicker} transparent animationType="slide" onRequestClose={() => setShowCountryPicker(false)}>
              <Box style={styles.modalOverlay}>
                <Box style={styles.modalContent} className="bg-background-0">
                  <Text className="text-lg text-typography-900 font-semibold mb-3">Select Country</Text>
                  {COUNTRIES.map(c => (
                    <Pressable
                      key={c.code}
                      style={{ paddingVertical: 10 }}
                      onPress={() => { setCountry(c); setShowCountryPicker(false); }}
                    >
                      <Text className="text-base text-typography-900">{c.flag} {c.name} ({c.dial_code})</Text>
                    </Pressable>
                  ))}
                  <Pressable onPress={() => setShowCountryPicker(false)}>
                    <Text className="text-primary-600 mt-3 text-center">Close</Text>
                  </Pressable>
                </Box>
              </Box>
            </Modal>
          )}

          {/* Birthdate */}
          <Pressable
            style={styles.dateRow}
            className="border border-outline-200 rounded-lg mb-4 bg-background-50 px-4 py-4"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className={birthdate ? "text-typography-900" : "text-typography-500"}>
              {birthdate ? birthdate.toLocaleDateString() : 'Birthdate (YYYY-MM-DD)'}
            </Text>
            <Icon name="calendar" size={18} color="#6b7280" />
          </Pressable>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={birthdate || new Date(2000, 0, 1)}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setBirthdate(selectedDate);
              }}
            />
          )}

          <Text className="text-base text-typography-900 font-semibold mb-3">Security</Text>
          <Box className="border border-outline-200 rounded-lg mb-4 bg-background-50">
            <TextInput
              className="px-4 py-4 text-typography-900"
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </Box>
          <Box className="border border-outline-200 rounded-lg mb-4 bg-background-50">
            <TextInput
              className="px-4 py-4 text-typography-900"
              placeholder="Confirm password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </Box>

          {loading ? (
            <Box className="items-center mb-6">
              <ActivityIndicator />
            </Box>
          ) : (
            <Pressable onPress={handleRegister}>
              <Box className="w-full bg-primary-600 py-3.5 rounded-lg items-center mb-6">
                <Text className="text-typography-0 text-base font-bold">Sign Up</Text>
              </Box>
            </Pressable>
          )}

          <Text className="text-center text-typography-700 mb-4">or sign up with</Text>

          <Box className="flex-row mb-4">
            <Pressable onPress={() => Alert.alert('Not implemented')} style={{ flex: 1, marginHorizontal: 4 }}>
              <Box className="flex-row items-center justify-center border border-outline-200 rounded-lg py-2.5 px-2.5 bg-background-0">
                <Image source={GoogleIcon} style={{ width: 22, height: 22 }} />
                <Text className="text-sm text-typography-700 ml-1.5">Google</Text>
              </Box>
            </Pressable>

            <Pressable onPress={() => Alert.alert('Not implemented')} style={{ flex: 1, marginHorizontal: 4 }}>
              <Box className="flex-row items-center justify-center border border-outline-200 rounded-lg py-2.5 px-2.5 bg-background-0">
                <Image source={AppleIcon} style={{ width: 22, height: 22 }} />
                <Text className="text-sm text-typography-700 ml-1.5">Apple</Text>
              </Box>
            </Pressable>
          </Box>

          <Box className="flex-row mt-3 items-center justify-center">
            <Text className="text-typography-700">Already have an account?</Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text className="text-primary-600 font-semibold ml-1"> Login</Text>
            </Pressable>
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  countryButton: {
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
    minWidth: 92,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 16,
    borderRadius: 12,
    width: '90%',
  },
});