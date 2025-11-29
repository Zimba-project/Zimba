import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, StyleSheet, ActivityIndicator,
  ScrollView, Alert, TouchableOpacity, Modal
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { register as registerApi } from '../api/auth';
import GoogleLogo from '../assets/google.svg';
import AppleLogo from '../assets/apple.svg';

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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        {error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.sectionTitle}>Personal Info</Text>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="First name" value={firstName} onChangeText={setFirstName} />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Last name" value={lastName} onChangeText={setLastName} />
        </View>
        <TextInput style={styles.input} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

        {/* Phone */}
        <View style={styles.phoneContainer}>
          <TouchableOpacity style={styles.countryButton} onPress={() => setShowCountryPicker(true)}>
            <Text style={styles.countryText}>{country.flag} {country.dial_code}</Text>
          </TouchableOpacity>
          <TextInput style={styles.phoneInput} placeholder="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        </View>

        {/* Country Picker Modal */}
        {showCountryPicker && (
          <Modal visible={showCountryPicker} transparent animationType="slide" onRequestClose={() => setShowCountryPicker(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Select Country</Text>
                {COUNTRIES.map(c => (
                  <TouchableOpacity
                    key={c.code}
                    style={{ paddingVertical: 10 }}
                    onPress={() => { setCountry(c); setShowCountryPicker(false); }}
                  >
                    <Text style={{ fontSize: 16 }}>{c.flag} {c.name} ({c.dial_code})</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                  <Text style={{ color: '#2563eb', marginTop: 12, textAlign: 'center' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Birthdate */}
        <TouchableOpacity style={[styles.input, styles.dateRow]} onPress={() => setShowDatePicker(true)}>
          <Text style={birthdate ? styles.dateText : styles.placeholderText}>
            {birthdate ? birthdate.toLocaleDateString() : 'Birthdate (YYYY-MM-DD)'}
          </Text>
          <Icon name="calendar" size={18} color="#6b7280" />
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
          />
        )}

        <Text style={styles.sectionTitle}>Security</Text>
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <TextInput style={styles.input} placeholder="Confirm password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

        {loading ? (
          <ActivityIndicator />
        ) : (
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerText}>Sign Up</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.orText}>or sign up with</Text>
        <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton}>
            <GoogleLogo width={22} height={22} />
            <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
            <AppleLogo width={22} height={22} />
            <Text style={styles.socialText}>Apple</Text>
        </TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={{ color: '#6b7280' }}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}> Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff' },
  card: { padding: 24, width: '100%', backgroundColor: '#fff', borderRadius: 12, marginVertical: 16, alignSelf: 'stretch' },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 12, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12, alignSelf: 'flex-start' },
  error: { color: 'red', marginBottom: 12 },
  row: { flexDirection: 'row', width: '100%' },
  input: { backgroundColor: '#fff', width: '100%', borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, borderRadius: 8, fontSize: 14 },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
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
  countryText: { color: '#111827' },
  phoneInput: { flex: 1, height: 44, paddingHorizontal: 12 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { color: '#111827' },
  placeholderText: { color: '#666' },
  registerButton: {
    width: '100%',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  orText: { textAlign: 'center', color: '#6b7280', marginBottom: 16 },
  socialContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    flex: 1,                  
    marginHorizontal: 4,        
  },
  icon: { marginRight: 6 },
  socialText: { fontSize: 14, color: '#374151', marginLeft: 6 },
  loginRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { color: '#2563eb', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '90%',
  },
});