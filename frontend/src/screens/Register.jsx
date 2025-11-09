import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ScrollView, Alert, TouchableOpacity, Platform, Modal } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { register as registerApi } from '../api/auth';
import DateTimePicker from '@react-native-community/datetimepicker';

function pad(n){ return n<10? '0'+n : ''+n }
function formatDate(d){
    if(!d) return '';
    const year = d.getFullYear();
    const month = pad(d.getMonth()+1);
    const day = pad(d.getDate());
    return `${year}-${month}-${day}`;
}
function displayDate(d){
    if(!d) return '';
    try{ return d.toLocaleDateString(); }catch(e){ return formatDate(d); }
}

const COUNTRIES = [
    { name: 'United States', dial_code: '+1', code: 'US', flag: '🇺🇸' },
    { name: 'United Kingdom', dial_code: '+44', code: 'GB', flag: '🇬🇧' },
    { name: 'India', dial_code: '+91', code: 'IN', flag: '🇮🇳' },
    { name: 'Pakistan', dial_code: '+92', code: 'PK', flag: '🇵🇰' },
    { name: 'Canada', dial_code: '+1', code: 'CA', flag: '🇨🇦' },
    { name: 'Australia', dial_code: '+61', code: 'AU', flag: '🇦🇺' },
    { name: 'Finland', dial_code: '+358', code: 'FI', flag: '🇫🇮' },
];

const Register = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    // country picker
    const [country, setCountry] = useState({ name: 'United States', dial_code: '+1', code: 'US', flag: '🇺🇸' });
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    // store birthdate as Date (or null)
    const [birthdate, setBirthdate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
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
            // build full phone with country code
            const fullPhone = `${country.dial_code}${phone}`;
            const payload = { firstName, lastName, email: email || null, phone: fullPhone, birthdate: birthdate ? formatDate(birthdate) : null, password, confirmPassword, about };
            const res = await registerApi(payload);
            if (res && res.ok) {
                // success: backend returns token and user
                const firstNameFromRes = (res.body && res.body.user && (res.body.user.first_name || res.body.user.firstName)) || firstName;
                const welcome = `Welcome to Zimba, ${firstNameFromRes || 'friend'}!`;
                // show sweet message then navigate on OK
                // After registration, show welcome message and send user to Login (do NOT auto-login)
                Alert.alert('Account created', welcome, [
                    { text: 'OK', onPress: () => {
                        // navigate to Login and prefill phone so user can easily sign in
                        navigation.replace('Login', { phone: fullPhone });
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

                <Text style={styles.subtitle}>Personal info</Text>
                <View style={styles.rowNames}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.label}>First name</Text>
                        <TextInput placeholder="First name" placeholderTextColor="#666" value={firstName} onChangeText={setFirstName} style={[styles.input, styles.inputSmall]} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Last name</Text>
                        <TextInput placeholder="Last name" placeholderTextColor="#666" value={lastName} onChangeText={setLastName} style={[styles.input, styles.inputSmall]} />
                    </View>
                </View>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.label}>Email (optional)</Text>
                <TextInput placeholder="Email address" placeholderTextColor="#666" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />

                <Text style={styles.label}>Phone</Text>
                <View style={styles.phoneContainer}>
                    <TouchableOpacity style={styles.countryButton} onPress={() => setShowCountryPicker(true)}>
                        <Text style={styles.countryText}>{country.flag} {country.dial_code}</Text>
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Phone number"
                        placeholderTextColor="#666"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        style={styles.phoneInput}
                    />
                </View>
                {showCountryPicker && (
                    <Modal visible={showCountryPicker} transparent animationType="slide" onRequestClose={() => setShowCountryPicker(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.countryModal}>
                                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Select country</Text>
                                <ScrollView style={{ maxHeight: 300 }}>
                                    {COUNTRIES.map((c) => (
                                        <TouchableOpacity key={c.code} style={styles.countryRow} onPress={() => { setCountry(c); setShowCountryPicker(false); }}>
                                            <Text style={{ fontSize: 18 }}>{c.flag}  {c.name}</Text>
                                            <Text style={{ color: '#374151' }}>{c.dial_code}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <Button title="Close" onPress={() => setShowCountryPicker(false)} />
                            </View>
                        </View>
                    </Modal>
                )}
                {/* Birthdate picker (open native picker when tapped) */}
                <Text style={styles.label}>Birthdate</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8} style={[styles.input, styles.dateRow]}>
                    <Text style={birthdate ? styles.dateText : styles.placeholderText}>
                        {birthdate ? displayDate(birthdate) : 'Birthdate (YYYY-MM-DD)'}
                    </Text>
                    <Icon name="calendar" size={18} color="#6b7280" />
                </TouchableOpacity>

                {/* Native picker: Android shows modal, iOS can render inline spinner inside a styled box */}
                {showDatePicker && Platform.OS === 'ios' && (
                    <Modal
                        visible={showDatePicker}
                        animationType="fade"
                        transparent={true}
                        onRequestClose={() => setShowDatePicker(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <DateTimePicker
                                    value={birthdate || new Date(2000, 0, 1)}
                                    mode="date"
                                    display="spinner"
                                    maximumDate={new Date()}
                                    textColor="#111827"
                                    onChange={(event, selectedDate) => {
                                        if (selectedDate) setBirthdate(selectedDate);
                                    }}
                                />
                                <View style={styles.pickerActions}>
                                    <Button title="Done" onPress={() => setShowDatePicker(false)} />
                                    <Button title="Clear" onPress={() => { setBirthdate(null); setShowDatePicker(false); }} />
                                </View>
                            </View>
                        </View>
                    </Modal>
                )}
                {showDatePicker && Platform.OS === 'android' && (
                    <DateTimePicker
                        value={birthdate || new Date(2000, 0, 1)}
                        mode="date"
                        display="default"
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            // Android: event may be 'dismissed'
                            if (!selectedDate) return;
                            setBirthdate(selectedDate);
                        }}
                    />
                )}
                <Text style={styles.label}>About (optional)</Text>
                <TextInput placeholder="About (optional)" placeholderTextColor="#666" value={about} onChangeText={setAbout} style={[styles.input, { height: 80 }]} multiline />

                <Text style={styles.label}>Password</Text>
                <TextInput placeholder="Password" placeholderTextColor="#666" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

                <Text style={styles.label}>Confirm password</Text>
                <TextInput placeholder="Confirm password" placeholderTextColor="#666" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={styles.input} />

                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={0.85}>
                        <Text style={styles.registerText}>Create account</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.loginRow}>
                    <Text style={{ color: '#6b7280' }}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.link}> Sign in</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    card: { padding: 20, alignItems: 'center', width: '100%', maxWidth: 460, backgroundColor: '#fff', borderRadius: 12, margin: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    title: { fontSize: 22, fontWeight: '600', marginBottom: 12, color: '#111827' },
    input: { backgroundColor: '#fff', width: '100%', borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, borderRadius: 8, color: '#000', height: 44 },
    dateRow: { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', paddingRight: 10 },
    dateInput: { justifyContent: 'center' },
    dateText: { color: '#111827' },
    placeholderText: { color: '#666' },
    pickerContainer: { backgroundColor: '#fff', marginTop: 8, borderRadius: 12, padding: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 4 },
    pickerActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', padding: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12 },
    phoneContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, backgroundColor: '#fff', overflow: 'hidden' },
    countryButton: { paddingHorizontal: 12, backgroundColor: 'transparent', height: 44, justifyContent: 'center', minWidth: 92, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
    countryText: { color: '#111827' },
    phoneInput: { flex: 1, height: 44, paddingHorizontal: 12, paddingVertical: 0, color: '#000' },
    countryModal: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 12 },
    countryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    error: { color: 'red', marginBottom: 8 }
    ,
    subtitle: { width: '100%', fontSize: 14, color: '#374151', marginTop: 8, marginBottom: 6 },
    label: { width: '100%', color: '#6b7280', marginBottom: 6, fontSize: 13 },
    rowNames: { flexDirection: 'row', width: '100%', marginBottom: 12 },
    inputSmall: { height: 44 },
    registerButton: { width: '100%', backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 6 },
    registerText: { color: '#fff', fontWeight: '700' },
    loginRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' }
});

export default Register;
