import React, { useState } from 'react';
import {
  View, TextInput, StyleSheet, ActivityIndicator,
  ScrollView, Alert, TouchableOpacity, Modal, Platform
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { register as registerApi } from '../api/auth';
import GoogleLogo from '../../assets/google.svg';
import AppleLogo from '../../assets/apple.svg';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { BirthdatePicker } from '@/src/components/DatePicker/BirthdatePicker.jsx';
import { COUNTRIES } from '@/src/utils/CountryAreaCodes';

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
    <SafeAreaView edges={["left", "right", "bottom"]} style={[styles.container, { backgroundColor: t.background, paddingTop: 16 }]}>
      <ScrollView contentContainerStyle={[styles.card, { backgroundColor: t.background }]}>
        <Text className="text-2xl font-bold text-center" style={{ color: t.text, marginBottom: 12 }}>Create Account</Text>
        {error && <Text style={{ color: t.error, marginBottom: 12 }}>{error}</Text>}

        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: t.text }}>Personal Info</Text>
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
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: t.text }}>Select Country</Text>
                {COUNTRIES.map(c => (
                  <TouchableOpacity
                    key={c.code}
                    style={{ paddingVertical: 10 }}
                    onPress={() => { setCountry(c); setShowCountryPicker(false); }}
                  >
                    <Text style={{ fontSize: 16, color: t.text }}>{c.flag} {c.name} ({c.dial_code})</Text>
                  </TouchableOpacity>
                ))}
                <Button variant="link" action="primary" onPress={() => setShowCountryPicker(false)} className="items-center">
                  <Text style={{ color: t.accent, marginTop: 12 }}>Close</Text>
                </Button>
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
        <BirthdatePicker
          visible={showDatePicker}
          value={birthdate}
          theme={theme}
          t={t}
          onConfirm={(date, { close }) => {
            setBirthdate(date);
            if (close) setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
        />

        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: t.text }}>Security</Text>
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
          <Button action="primary" variant="solid" onPress={handleRegister} className="h-11 mb-6" style={{ backgroundColor: t.accent, borderRadius: 8 }}>
            <ButtonText>Sign Up</ButtonText>
          </Button>
        )}

        <Text style={{ textAlign: 'center', marginBottom: 16, color: t.secondaryText }}>or sign up with</Text>
        <View style={styles.socialContainer}>
          <Button variant="outline" action="secondary" className="flex-1 flex-row items-center justify-center h-11" style={{ backgroundColor: t.inputBackground, borderColor: t.inputBorder, borderRadius: 8 }}>
            <GoogleLogo width={22} height={22} />
            <Text style={{ color: t.text, marginLeft: 6 }}>Google</Text>
          </Button>
          <Button variant="outline" action="secondary" className="flex-1 flex-row items-center justify-center h-11" style={{ backgroundColor: t.inputBackground, borderColor: t.inputBorder, borderRadius: 8 }}>
            <AppleLogo width={22} height={22} />
            <Text style={{ color: t.text, marginLeft: 6 }}>Apple</Text>
          </Button>
        </View>

        <View style={styles.loginRow}>
          <HStack className="items-center" style={{ gap: 4 }}>
            <Text style={{ color: t.secondaryText }}>Already have an account?</Text>
            <Button variant="link" action="primary" onPress={() => navigation.navigate('Login')} style={{ borderRadius: 8 }}>
              <Text style={{ color: t.accent, fontWeight: '600' }}> Login</Text>
            </Button>
          </HStack>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  card: {
    paddingBottom: 40,
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
