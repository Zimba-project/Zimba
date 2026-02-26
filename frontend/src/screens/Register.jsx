import React, { useState, useMemo } from 'react';
import { TextInput, StyleSheet, ActivityIndicator, Alert, View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { register as registerApi } from '../api/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COUNTRIES } from '../utils/countries';

export default function RegisterScreen() {
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { theme } = useTheme();
  const t = useMemo(() => getTheme(theme), [theme]);

  const isDark = theme === 'dark';
  const accentColor = useMemo(() => t.accent, [t.accent]);

  const gradientColors = useMemo(
    () =>
      isDark
        ? ['#111827', '#1e40af', '#1f2937']
        : ['#f5f7fa', '#dbeafe', '#bfdbfe'],
    [isDark]
  );

  const phone = `${selectedCountry.dial_code}${phoneInput}`;

  const handleRegister = async () => {
    setError(null);

    if (!firstName || !lastName || !phoneInput || !email || !password || !confirmPassword) {
      setError('Please fill all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword
      };

      const res = await registerApi(payload);

      if (res?.ok) {
        Alert.alert('Account created', 'Please check your email for verification.', [
          { text: 'OK', onPress: () => navigation.replace('Login', { phone }) }
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
    <View style={[styles.containerWrapper, { backgroundColor: t.background }]} key={`register-${theme}`}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.safeAreaContainer, { backgroundColor: 'transparent' }]}>
        <View style={styles.mainContainer}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: t.text }]}>Create Account</Text>
          </View>

          <View style={styles.formContainer}>
            {error && (
              <View style={[styles.errorBox, { backgroundColor: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(248,113,113,0.08)' }]}>
                <Ionicons name="alert-circle" size={14} color={t.error} style={{ marginRight: 6 }} />
                <Text style={[styles.errorText, { color: t.error }]}>{error}</Text>
              </View>
            )}

            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <TextInput
                  style={[styles.input, { backgroundColor: t.inputBackground, borderColor: t.inputBorder, color: t.text }]}
                  placeholder="First name"
                  placeholderTextColor={t.placeholder}
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={!loading}
                />
              </View>
              <View style={styles.halfInput}>
                <TextInput
                  style={[styles.input, { backgroundColor: t.inputBackground, borderColor: t.inputBorder, color: t.text }]}
                  placeholder="Last name"
                  placeholderTextColor={t.placeholder}
                  value={lastName}
                  onChangeText={setLastName}
                  editable={!loading}
                />
              </View>
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: t.inputBackground, borderColor: t.inputBorder, color: t.text }]}
              placeholder="Email"
              placeholderTextColor={t.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />

            <Text style={[styles.inputLabel, { color: t.text }]}>Mobile Number</Text>

            <View style={[styles.phoneInputContainer, { borderColor: t.inputBorder, backgroundColor: t.inputBackground }]}>
              <TouchableOpacity
                style={styles.dialCodeButton}
                onPress={() => setShowCountryPicker(true)}
                disabled={loading}
              >
                <Text style={[styles.dialCodeText, { color: t.text }]}>
                  {selectedCountry.flag} {selectedCountry.dial_code}
                </Text>
                <Ionicons name="chevron-down" size={16} color={t.secondaryText} style={{ marginLeft: 4 }} />
              </TouchableOpacity>

              <View style={[styles.dividerLine, { backgroundColor: t.inputBorder }]} />

              <TextInput
                style={[styles.phoneInput, { color: t.text }]}
                placeholder="Phone"
                placeholderTextColor={t.placeholder}
                keyboardType="phone-pad"
                value={phoneInput}
                onChangeText={setPhoneInput}
                editable={!loading}
              />
            </View>

            <Modal
              visible={showCountryPicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowCountryPicker(false)}
            >
              <View
                style={[
                  styles.modalContainer,
                  { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)' }
                ]}
              >
                <View style={[styles.modalContent, { backgroundColor: t.background }]}>
                  <View style={[styles.modalHeader, { borderBottomColor: t.inputBorder }]}>
                    <Text style={[styles.modalTitle, { color: t.text }]}>Select Country</Text>
                    <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                      <Ionicons name="close" size={24} color={t.text} />
                    </TouchableOpacity>
                  </View>

                  <FlatList
                    data={COUNTRIES}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.countryOption,
                          {
                            borderBottomColor: t.inputBorder,
                            backgroundColor:
                              selectedCountry.code === item.code
                                ? isDark
                                  ? 'rgba(37, 99, 235, 0.1)'
                                  : 'rgba(59, 130, 246, 0.08)'
                                : 'transparent'
                          }
                        ]}
                        onPress={() => {
                          setSelectedCountry(item);
                          setShowCountryPicker(false);
                        }}
                      >
                        <Text style={[styles.countryOptionText, { color: t.text }]}>
                          {item.flag} {item.name} ({item.dial_code})
                        </Text>

                        {selectedCountry.code === item.code && (
                          <Ionicons name="checkmark" size={20} color={accentColor} />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>

            <TextInput
              style={[styles.input, { backgroundColor: t.inputBackground, borderColor: t.inputBorder, color: t.text }]}
              placeholder="Password"
              placeholderTextColor={t.placeholder}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            <TextInput
              style={[styles.input, { backgroundColor: t.inputBackground, borderColor: t.inputBorder, color: t.text }]}
              placeholder="Confirm password"
              placeholderTextColor={t.placeholder}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.signupButton, { backgroundColor: accentColor, opacity: loading ? 0.7 : 1 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size={16} />
              ) : (
                <>
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                  <Ionicons name="arrow-forward" size={14} color="#fff" style={{ marginLeft: 5 }} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: t.secondaryText }]}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={[styles.loginLink, { color: accentColor }]}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeAreaContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  errorBox: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
    lineHeight: 14,
  },
  formContainer: {
    marginTop: 12,
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 11,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.4,
    paddingLeft: 4,
  },
  phoneInputContainer: {
    borderWidth: 1.5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  dialCodeButton: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dialCodeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dividerLine: {
    width: 1,
    height: 20,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  countryOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomContainer: {
    marginTop: 16,
    gap: 6,
  },
  signupButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  divider: {
    flex: 1,
    height: 0.8,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  socialButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loginText: {
    fontSize: 12,
    fontWeight: '400',
  },
  loginLink: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 2,
  },
});