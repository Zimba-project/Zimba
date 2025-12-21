import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, StyleSheet, ActivityIndicator,
  ScrollView, Alert, TouchableOpacity, Modal
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { register as registerApi } from '../api/auth';
import GoogleLogo from '../../assets/google.svg';
import AppleLogo from '../../assets/apple.svg';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';

const COUNTRIES = [
  { name: 'Finland', dial_code: '+358', code: 'FI', flag: '🇫🇮' },
  { name: 'United States', dial_code: '+1', code: 'US', flag: '🇺🇸' },
  { name: 'United Kingdom', dial_code: '+44', code: 'GB', flag: '🇬🇧' },
  { name: 'Sweden', dial_code: '+46', code: 'SE', flag: '🇸🇪' },
  { name: 'Germany', dial_code: '+49', code: 'DE', flag: '🇩🇪' },
  { name: 'France', dial_code: '+33', code: 'FR', flag: '🇫🇷' },
  { name: 'Norway', dial_code: '+47', code: 'NO', flag: '🇳🇴' },
];

export default function RegisterScreen({ navigation }) {
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

  const { theme } = useTheme();
  const t = getTheme(theme);

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
        setError(res?.body?.message || `Registration failed (${res?.status ?? 'unknown'})`);
      }
    } catch (e) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background, paddingTop: 20}]}edges={[]}>
      <ScrollView contentContainerStyle={[styles.card, { backgroundColor: t.background }]}>
        <Text style={[styles.title, { color: t.text }]}>Create Account</Text>
        {error && <Text style={[styles.error, { color: t.error }]}>{error}</Text>}

        <Text style={[styles.sectionTitle, { color: t.text }]}>Personal Info</Text>
        <View style={styles.row}>
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                marginRight: 8,
                backgroundColor: t.inputBackground,
                borderColor: t.inputBorder,
                color: t.text
              }
            ]}
            placeholder="First name"
            placeholderTextColor={t.placeholder}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                backgroundColor: t.inputBackground,
                borderColor: t.inputBorder,
                color: t.text
              }
            ]}
            placeholder="Last name"
            placeholderTextColor={t.placeholder}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: t.inputBackground,
              borderColor: t.inputBorder,
              color: t.text
            }
          ]}
          placeholder="Email address"
          placeholderTextColor={t.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Phone */}
        <View style={[styles.phoneContainer, { backgroundColor: t.inputBackground, borderColor: t.inputBorder }]}>
          <TouchableOpacity
            style={[styles.countryButton, { borderRightColor: t.inputBorder }]}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text style={[styles.countryText, { color: t.text }]}>{country.flag} {country.dial_code}</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.phoneInput, { color: t.text }]}
            placeholder="Phone number"
            placeholderTextColor={t.placeholder}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* Country Picker Modal */}
        {showCountryPicker && (
          <Modal visible={showCountryPicker} transparent animationType="slide" onRequestClose={() => setShowCountryPicker(false)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: t.cardBackground }]}>
                <Text style={[{ fontSize: 18, fontWeight: '600', marginBottom: 12 }, { color: t.text }]}>Select Country</Text>
                {COUNTRIES.map(c => (
                  <TouchableOpacity
                    key={c.code}
                    style={{ paddingVertical: 10 }}
                    onPress={() => { setCountry(c); setShowCountryPicker(false); }}
                  >
                    <Text style={{ fontSize: 16, color: t.text }}>{c.flag} {c.name} ({c.dial_code})</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                  <Text style={{ color: t.accent, marginTop: 12, textAlign: 'center' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Birthdate */}
        <TouchableOpacity
          style={[
            styles.input,
            styles.dateRow,
            { backgroundColor: t.inputBackground, borderColor: t.inputBorder }
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={birthdate ? [styles.dateText, { color: t.text }] : [styles.placeholderText, { color: t.placeholder }]}>
            {birthdate ? birthdate.toLocaleDateString() : 'Birthdate (YYYY-MM-DD)'}
          </Text>
          <Icon name="calendar" size={18} color={t.placeholder} />
        </TouchableOpacity>

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
            themeVariant={theme === 'dark' ? 'dark' : 'light'}
          />
        )}

        <Text style={[styles.sectionTitle, { color: t.text }]}>Security</Text>
        <TextInput
          style={[styles.input, { backgroundColor: t.inputBackground, borderColor: t.inputBorder, color: t.text }]}
          placeholder="Password"
          placeholderTextColor={t.placeholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={[styles.input, { backgroundColor: t.inputBackground, borderColor: t.inputBorder, color: t.text }]}
          placeholder="Confirm password"
          placeholderTextColor={t.placeholder}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {loading ? (
          <ActivityIndicator color={t.accent} />
        ) : (
          <TouchableOpacity style={[styles.registerButton, { backgroundColor: t.accent }]} onPress={handleRegister}>
            <Text style={styles.registerText}>Sign Up</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.orText, { color: t.secondaryText }]}>or sign up with</Text>
        <View style={styles.socialContainer}>
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: t.inputBackground, borderColor: t.inputBorder }]}>
            <GoogleLogo width={22} height={22} />
            <Text style={[styles.socialText, { color: t.text }]}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: t.inputBackground, borderColor: t.inputBorder }]}>
            <AppleLogo width={22} height={22} />
            <Text style={[styles.socialText, { color: t.text }]}>Apple</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={{ color: t.secondaryText }}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.link, { color: t.accent }]}> Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  card: {
    paddingBottom: 60,
    width: '100%',
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, alignSelf: 'flex-start' },
  error: { marginBottom: 12 },
  row: { flexDirection: 'row', width: '100%' },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 14,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  countryButton: {
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
    minWidth: 92,
    alignItems: 'center',
    borderRightWidth: 1,
  },
  countryText: {},
  phoneInput: { flex: 1, height: 44, paddingHorizontal: 12 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: {},
  placeholderText: {},
  registerButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  orText: { textAlign: 'center', marginBottom: 16 },
  socialContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 4,
  },
  icon: { marginRight: 6 },
  socialText: { fontSize: 14, marginLeft: 6 },
  loginRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { fontWeight: '600' },
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
