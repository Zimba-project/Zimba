import React, { useState, useMemo } from 'react';
import { TextInput, StyleSheet, ActivityIndicator, Alert, View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useNavigation, useRoute } from '@react-navigation/native';
import { login as loginApi } from '../api/auth';
import { sessionStorage } from '../utils/Storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COUNTRIES } from '../utils/countries';

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const initialPhone = route?.params?.phone ?? '';
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { theme } = useTheme();
  const t = useMemo(() => getTheme(theme), [theme]);

  const isDark = theme === 'dark';
  const accentColor = useMemo(() => t.accent, [t.accent]);

  // Gradient colors based on theme
  const gradientColors = useMemo(() =>
    isDark
      ? ['#111827', '#1e40af', '#1f2937']
      : ['#f5f7fa', '#dbeafe', '#bfdbfe'],
    [isDark]
  );

  const phone = `${selectedCountry.dial_code}${phoneInput}`;

  const handleLogin = async () => {
    setError(null);

    if (!phoneInput || !password) {
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
    <View style={[styles.containerWrapper, { backgroundColor: t.background }]} key={`login-${theme}`}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.safeAreaContainer, { backgroundColor: 'transparent' }]}>
        <View style={styles.mainContainer}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: t.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: t.secondaryText }]}>Sign in to your account</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Error Message */}
            {error && (
              <View style={[styles.errorBox, { backgroundColor: isDark ? 'rgba(248, 113, 113, 0.1)' : 'rgba(248, 113, 113, 0.08)' }]}>
                <Ionicons name="alert-circle" size={16} color={t.error} style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={[styles.errorText, { color: t.error }]}>{error}</Text>
              </View>
            )}

            {/* Phone Input with Country Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: t.text }]}>Mobile Number</Text>
              <View style={[styles.phoneInputContainer, { borderColor: t.inputBorder, backgroundColor: t.inputBackground }]}>
                <TouchableOpacity
                  style={styles.dialCodeButton}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={[styles.dialCodeText, { color: t.text }]}>
                    {selectedCountry.flag} {selectedCountry.dial_code}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={t.secondaryText} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
                <View style={[styles.dividerLine, { backgroundColor: t.inputBorder }]} />
                <TextInput
                  style={[
                    styles.phoneInput,
                    {
                      color: t.text,
                    }
                  ]}
                  placeholder="123456789"
                  placeholderTextColor={t.placeholder}
                  keyboardType="phone-pad"
                  value={phoneInput}
                  onChangeText={setPhoneInput}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Country Picker Modal */}
            <Modal
              visible={showCountryPicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowCountryPicker(false)}
            >
              <View style={[styles.modalContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)' }]}>
                <View style={[styles.modalContent, { backgroundColor: t.background }]}>
                  <View style={styles.modalHeader}>
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
                            backgroundColor: selectedCountry.code === item.code ? (isDark ? 'rgba(37, 99, 235, 0.1)' : 'rgba(59, 130, 246, 0.08)') : 'transparent'
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

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: t.text }]}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: t.inputBackground,
                    borderColor: t.inputBorder,
                    color: t.text,
                  }
                ]}
                placeholder="Enter password"
                placeholderTextColor={t.placeholder}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>

            {/* Keep Logged In Checkbox */}
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={keepLoggedIn}
                onValueChange={setKeepLoggedIn}
                color={keepLoggedIn ? accentColor : undefined}
                disabled={loading}
              />
              <Text style={[styles.checkboxLabel, { color: t.text }]}>Keep me logged in</Text>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: accentColor, opacity: loading ? 0.7 : 1 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size={18} />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: t.inputBorder }]} />
              <Text style={[styles.dividerText, { color: t.secondaryText }]}>or continue with</Text>
              <View style={[styles.divider, { backgroundColor: t.inputBorder }]} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  {
                    borderColor: t.inputBorder,
                    backgroundColor: t.inputBackground,
                  }
                ]}
                onPress={() => Alert.alert('Coming Soon', 'Google login will be implemented soon')}
                activeOpacity={0.75}
              >
                <Ionicons name="logo-google" size={18} color={accentColor} />
                <Text style={[styles.socialButtonText, { color: t.text }]}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.socialButton,
                  {
                    borderColor: t.inputBorder,
                    backgroundColor: t.inputBackground,
                  }
                ]}
                onPress={() => Alert.alert('Coming Soon', 'Apple login will be implemented soon')}
                activeOpacity={0.75}
              >
                <Ionicons name="logo-apple" size={18} color={isDark ? '#fff' : '#000'} />
                <Text style={[styles.socialButtonText, { color: t.text }]}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: t.secondaryText }]}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
              <Text style={[styles.signupLink, { color: accentColor }]}>Sign Up</Text>
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
    position: 'relative',
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
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  formContainer: {
    marginTop: 20,
    flex: 1,
  },
  errorBox: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  phoneInputContainer: {
    borderWidth: 1.5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  dialCodeButton: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dialCodeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dividerLine: {
    width: 1,
    height: 24,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontSize: 14,
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
  input: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 14,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
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
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: 10,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  signupText: {
    fontSize: 13,
    fontWeight: '400',
  },
  signupLink: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 3,
  },
});