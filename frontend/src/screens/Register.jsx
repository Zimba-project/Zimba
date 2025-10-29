import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { register as registerApi } from '../api/auth';

const Register = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [about, setAbout] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRegister = async () => {
        setError(null);
        if (!firstName || !lastName || !phone || !password || !confirmPassword) {
            setError('Please fill all required fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const payload = { firstName, lastName, phone, birthdate, password, confirmPassword, about };
            const res = await registerApi(payload);
            if (res && res.ok) {
                // success: backend returns token and user
                const firstNameFromRes = (res.body && res.body.user && (res.body.user.first_name || res.body.user.firstName)) || firstName;
                const welcome = `Welcome to Zimba, ${firstNameFromRes || 'friend'}!`;
                // show sweet message then navigate on OK
                Alert.alert('Account created', welcome, [
                    { text: 'OK', onPress: () => {
                        if (res.body && res.body.token) navigation.replace('Main');
                        else navigation.replace('Login');
                    } }
                ]);
            } else if (res) {
                // show server-provided message when possible (e.g., 409)
                const msg = (res.body && res.body.message) || `Registration failed (${res.status})`;
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
            <ScrollView contentContainerStyle={styles.card} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Create account</Text>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TextInput placeholder="First name" placeholderTextColor="#666" value={firstName} onChangeText={setFirstName} style={styles.input} />
                <TextInput placeholder="Last name" placeholderTextColor="#666" value={lastName} onChangeText={setLastName} style={styles.input} />
                <TextInput placeholder="Phone" placeholderTextColor="#666" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
                <TextInput placeholder="Birthdate (YYYY-MM-DD)" placeholderTextColor="#666" value={birthdate} onChangeText={setBirthdate} style={styles.input} />
                <TextInput placeholder="About (optional)" placeholderTextColor="#666" value={about} onChangeText={setAbout} style={[styles.input, { height: 80 }]} multiline />
                <TextInput placeholder="Password" placeholderTextColor="#666" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
                <TextInput placeholder="Confirm password" placeholderTextColor="#666" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={styles.input} />

                {loading ? <ActivityIndicator /> : <Button title="Register" onPress={handleRegister} />}

                <View style={{ marginTop: 12 }}>
                    <Text>Already have an account?</Text>
                    <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    card: { padding: 20, alignItems: 'center', width: '100%', maxWidth: 460, backgroundColor: '#fff', borderRadius: 12, margin: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    title: { fontSize: 22, fontWeight: '600', marginBottom: 12, color: '#111827' },
    input: { backgroundColor: '#fff', width: '100%', borderWidth: 1, borderColor: '#e5e7eb', padding: 10, marginBottom: 12, borderRadius: 8, color: '#000' },
    error: { color: 'red', marginBottom: 8 }
});

export default Register;
