import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, Button, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Feather as Icon, FontAwesome } from '@expo/vector-icons';
import { login as loginApi } from '../api/auth';
import { sessionStorage } from '../utils/Storage';
import useThemedStyles from '../theme/useThemedStyles';
import { useTheme } from '../theme/ThemeProvider';

const Login = ({ navigation, route }) => {
    const initialPhone = route && route.params && route.params.phone ? route.params.phone : '';
    const [phone, setPhone] = useState(initialPhone);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const { colors } = useTheme();
    const t = useThemedStyles((c) => ({
        container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: c.background },
        card: { width: '100%', maxWidth: 420, backgroundColor: c.surface, padding: 20, borderRadius: 12, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: c.border },
        title: { fontSize: 22, fontWeight: '600', marginBottom: 12, color: c.text },
        input: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, padding: 10, marginBottom: 12, borderRadius: 8, color: c.text },
        row: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
        rowText: { color: c.text },
        link: { color: c.primary },
        error: { color: c.danger, marginBottom: 8 },
        googleButton: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, paddingVertical: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
        facebookButton: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, paddingVertical: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
        socialText: { color: c.text, fontWeight: '600' },
        loginButton: { backgroundColor: c.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
        loginText: { color: c.onPrimary, fontWeight: '700' }
    }));

    return (
        <SafeAreaView style={t.container}>
            <View style={t.card}>
                <Text style={t.title}>Login</Text>

                {error ? <Text style={t.error}>{error}</Text> : null}

                <TextInput
                    placeholder="Phone"
                    placeholderTextColor={colors?.muted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    style={t.input}
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor={colors?.muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={t.input}
                />

                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <>
                        <TouchableOpacity style={t.loginButton} onPress={handleLogin}>
                            <Icon name="log-in" size={16} color={colors?.onPrimary} style={{ marginRight: 8 }} />
                            <Text style={t.loginText}>Login</Text>
                        </TouchableOpacity>
                        <View style={{ height: 12 }} />

                        <TouchableOpacity
                            style={t.googleButton}
                            onPress={() => Alert.alert('Not implemented', 'Google sign-in is decorative only')}
                        >
                            <FontAwesome name="google" size={18} color={colors?.primary} style={{ marginRight: 10 }} />
                            <Text style={t.socialText}>Sign in with Google</Text>
                        </TouchableOpacity>

                        <View style={{ height: 8 }} />

                        <TouchableOpacity
                            style={t.facebookButton}
                            onPress={() => Alert.alert('Not implemented', 'Facebook sign-in is decorative only')}
                        >
                            <FontAwesome name="facebook" size={18} color={colors?.primary} style={{ marginRight: 10 }} />
                            <Text style={t.socialText}>Sign in with Facebook</Text>
                        </TouchableOpacity>
                    </>
                )}

                <View style={t.row}>
                    <Text style={t.rowText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={t.link}> Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

// styles moved to `useThemedStyles` (variable `t`)

export default Login;
