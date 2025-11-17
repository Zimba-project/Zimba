import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { resetPassword as resetPasswordApi } from '../api/auth';

const ResetPassword = ({ navigation, route }) => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // token could come via navigation params (app) or via query on web
    const t = route?.params?.token || (route?.params?.query?.token) || '';
    setToken(t);
    // For web, attempt to parse token from window location if available
    if (!t && typeof window !== 'undefined') {
      const qp = new URLSearchParams(window.location.search);
      const qToken = qp.get('token');
      if (qToken) setToken(qToken);
    }
  }, [route]);

  const handleReset = async () => {
    if (!token) return Alert.alert('Missing token', 'No reset token provided');
    if (!newPassword || !confirmPassword) return Alert.alert('Missing fields', 'Please enter and confirm your new password');
    if (newPassword !== confirmPassword) return Alert.alert('Mismatch', 'Passwords do not match');
    setLoading(true);
    try {
      const res = await resetPasswordApi({ token, newPassword, confirmPassword });
      if (res && res.ok) {
        Alert.alert('Password updated', 'You can now sign in with your new password', [
          { text: 'OK', onPress: () => navigation.replace('Login') },
        ]);
      } else {
        Alert.alert('Error', res.body?.message || 'Failed to update password');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={{ color: '#6b7280', marginBottom: 12 }}>Enter a new password for your account.</Text>
        <TextInput placeholder="New password" secureTextEntry style={styles.input} value={newPassword} onChangeText={setNewPassword} />
        <TextInput placeholder="Confirm password" secureTextEntry style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} />
        {loading ? (
          <ActivityIndicator />
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity style={styles.actionSmall} onPress={() => navigation.goBack()}>
              <Text style={{ color: '#111827' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionSmall, { backgroundColor: '#2563eb', marginLeft: 8 }]} onPress={handleReset}>
              <Text style={{ color: '#fff' }}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#f3f4f6' },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', padding: 10, marginBottom: 12, borderRadius: 8, color: '#000' },
  actionSmall: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }
});

export default ResetPassword;
