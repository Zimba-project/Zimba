import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Feather as Icon, FontAwesome } from '@expo/vector-icons';
import { login as loginApi } from '../api/auth';

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
                    // Reset navigation stack to make 'Main' the only route so there
                    // is no back history and the header won't show a back button.
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main', params: { user: res.body.user } }],
                    });
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Login</Text>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TextInput
                    placeholder="Phone"
                    placeholderTextColor="#666"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    style={styles.input}
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                />

                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <>
                        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                            <Icon name="log-in" size={16} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.loginText}>Login</Text>
                        </TouchableOpacity>
                        <View style={{ height: 12 }} />

                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={() => Alert.alert('Not implemented', 'Google sign-in is decorative only')}
                        >
                            <FontAwesome name="google" size={18} color="#DB4437" style={{ marginRight: 10 }} />
                            <Text style={[styles.socialText, { color: '#111827' }]}>Sign in with Google</Text>
                        </TouchableOpacity>

                        <View style={{ height: 8 }} />

                        <TouchableOpacity
                            style={styles.facebookButton}
                            onPress={() => Alert.alert('Not implemented', 'Facebook sign-in is decorative only')}
                        >
                            <FontAwesome name="facebook" size={18} color="#1877F2" style={{ marginRight: 10 }} />
                            <Text style={[styles.socialText, { color: '#111827' }]}>Sign in with Facebook</Text>
                        </TouchableOpacity>
                    </>
                )}

                <View style={styles.row}>
                    <Text style={styles.rowText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.link}> Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#f3f4f6' },
    card: { width: '100%', maxWidth: 420, backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    title: { fontSize: 22, fontWeight: '600', marginBottom: 12, color: '#111827' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', padding: 10, marginBottom: 12, borderRadius: 8, color: '#000' },
    row: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
    rowText: { color: '#374151' },
    link: { color: '#2563eb' },
    error: { color: 'red', marginBottom: 8 },
    googleButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    facebookButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    socialText: { color: '#111827', fontWeight: '600' },
    loginButton: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    loginText: { color: '#fff', fontWeight: '700' }
});

export default Login;
