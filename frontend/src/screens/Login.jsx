import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Feather as Icon, FontAwesome } from '@expo/vector-icons';
import { login as loginApi } from '../api/auth';
import { sessionStorage } from '../utils/Storage';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';

const Login = ({ navigation, route }) => {
    const initialPhone = route && route.params && route.params.phone ? route.params.phone : '';
    const [phone, setPhone] = useState(initialPhone);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

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
                if (res.body && res.body.token) {
                    // TODO: persist token (AsyncStorage / SecureStore) later
                    // pass user to Main so top bar can show initials
                    sessionStorage.setItem('authToken', res.body.token);
                    navigation.replace('Main', { user: res.body.user });
                } else {
                    setError('Login succeeded but no token returned');
                }
            } else if (res) {
                const msg = (res.body && res.body.message) || `Login failed (${res.status})`;
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

    const backgroundColor = isDark ? '#111827' : '#ffffff';
    const textColor = isDark ? '#fff' : '#000';
    const accentColor = isDark ? '#fff' : '#000';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}> 
            <View style={[styles.card, { backgroundColor, borderColor: isDark ? '#374151' : '#e5e7eb', shadowColor: isDark ? '#000' : '#000', shadowOpacity: isDark ? 0.2 : 0.05 }]}> 
                <Text style={[styles.title, { color: textColor }]}>Login</Text>

                {error ? <Text style={[styles.error, { color: '#ef4444' }]}>{error}</Text> : null}

                <TextInput
                    placeholder="Phone"
                    placeholderTextColor={isDark ? '#fff' : '#000'}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#fff', color: textColor, borderColor: isDark ? '#374151' : '#e5e7eb' }]}
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor={isDark ? '#fff' : '#000'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={[styles.input, { backgroundColor: isDark ? '#1e293b' : '#fff', color: textColor, borderColor: isDark ? '#374151' : '#e5e7eb' }]}
                />

                {loading ? (
                    <ActivityIndicator color={accentColor} />
                ) : (
                    <>
                        <TouchableOpacity style={[styles.loginButton, { backgroundColor: accentColor }]} onPress={handleLogin}>
                            <Icon name="log-in" size={16} color={isDark ? '#fff' : '#000'} style={{ marginRight: 8 }} />
                            <Text style={[styles.loginText, { color: isDark ? '#fff' : '#000' }]}>Login</Text>
                        </TouchableOpacity>
                        <View style={{ height: 12 }} />

                        <TouchableOpacity
                            style={[styles.googleButton, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}
                            onPress={() => Alert.alert('Not implemented', 'Google sign-in is decorative only')}
                        >
                            <FontAwesome name="google" size={18} color="#DB4437" style={{ marginRight: 10 }} />
                            <Text style={[styles.socialText, { color: textColor }]}>Sign in with Google</Text>
                        </TouchableOpacity>

                        <View style={{ height: 8 }} />

                        <TouchableOpacity
                            style={[styles.facebookButton, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb' }]}
                            onPress={() => Alert.alert('Not implemented', 'Facebook sign-in is decorative only')}
                        >
                            <FontAwesome name="facebook" size={18} color="#1877F2" style={{ marginRight: 10 }} />
                            <Text style={[styles.socialText, { color: textColor }]}>Sign in with Facebook</Text>
                        </TouchableOpacity>
                    </>
                )}

                <View style={styles.row}>
                    <Text style={[styles.rowText, { color: textColor }]}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={[styles.link, { color: accentColor }]}> Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
    card: { width: '100%', maxWidth: 420, padding: 20, borderRadius: 12, shadowRadius: 10, elevation: 3, borderWidth: 1 },
    title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
    input: { borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 8 },
    row: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
    rowText: {},
    link: { fontWeight: 'bold' },
    error: { marginBottom: 8 },
    googleButton: { borderWidth: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    facebookButton: { borderWidth: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    socialText: { fontWeight: '600' },
    loginButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    loginText: { color: '#fff', fontWeight: '700' }
});

export default Login;
