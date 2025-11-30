import React, { useState } from 'react';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
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
        if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
            setError('Please fill all required fields (email is required)');
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
                // success: backend returns user
                // Inform user to verify their email and send them to Login
                const emailAddr = email || (res.body && res.body.user && (res.body.user.email || res.body.user.email_address));
                const msg = emailAddr
                  ? `Account created. We've sent a verification email to ${emailAddr}. Please check your inbox.`
                  : 'Account created. Please check your email for a verification link.';
                Alert.alert('Account created', msg, [
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

    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const backgroundColor = isDark ? '#111827' : '#f3f4f6';
    const cardColor = isDark ? '#1e293b' : '#fff';
    const textColor = isDark ? '#fff' : '#111827';
    const labelColor = isDark ? '#d1d5db' : '#6b7280';
    const inputBg = isDark ? '#1e293b' : '#fff';
    const inputText = isDark ? '#fff' : '#000';
    const borderColor = isDark ? '#374151' : '#e5e7eb';
    const accentColor = isDark ? '#2563eb' : '#2563eb';
    const placeholderColor = isDark ? '#9ca3af' : '#666';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}> 
            <ScrollView contentContainerStyle={[styles.card, { backgroundColor: cardColor, borderColor, shadowColor: isDark ? '#000' : '#000', shadowOpacity: isDark ? 0.2 : 0.04 }]}
                keyboardShouldPersistTaps="handled">
                <Text style={[styles.title, { color: textColor }]}>Create account</Text>

                {error ? <Text style={[styles.error, { color: '#ef4444' }]}>{error}</Text> : null}

                <Text style={[styles.subtitle, { color: labelColor }]}>Personal info</Text>
                <View style={styles.rowNames}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[styles.label, { color: labelColor }]}>First name</Text>
                        <TextInput placeholder="First name" placeholderTextColor={placeholderColor} value={firstName} onChangeText={setFirstName} style={[styles.input, styles.inputSmall, { backgroundColor: inputBg, color: inputText, borderColor }]} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: labelColor }]}>Last name</Text>
                        <TextInput placeholder="Last name" placeholderTextColor={placeholderColor} value={lastName} onChangeText={setLastName} style={[styles.input, styles.inputSmall, { backgroundColor: inputBg, color: inputText, borderColor }]} />
                    </View>
                </View>
                <Text style={[styles.label, { color: labelColor }]}>Email (required)</Text>
                <TextInput placeholder="Email address" placeholderTextColor={placeholderColor} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={[styles.input, { backgroundColor: inputBg, color: inputText, borderColor }]} />

                <Text style={[styles.label, { color: labelColor }]}>Phone</Text>
                <View style={[styles.phoneContainer, { backgroundColor: inputBg, borderColor }]}> 
                    <TouchableOpacity style={styles.countryButton} onPress={() => setShowCountryPicker(true)}>
                        <Text style={[styles.countryText, { color: textColor }]}>{country.flag} {country.dial_code}</Text>
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Phone number"
                        placeholderTextColor={placeholderColor}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        style={[styles.phoneInput, { color: inputText }]}
                    />
                </View>
                {showCountryPicker && (
                    <Modal visible={showCountryPicker} transparent animationType="slide" onRequestClose={() => setShowCountryPicker(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={[styles.countryModal, { backgroundColor: cardColor }]}> 
                                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: textColor }}>Select country</Text>
                                <ScrollView style={{ maxHeight: 300 }}>
                                    {COUNTRIES.map((c) => (
                                        <TouchableOpacity key={c.code} style={styles.countryRow} onPress={() => { setCountry(c); setShowCountryPicker(false); }}>
                                            <Text style={{ fontSize: 18, color: textColor }}>{c.flag}  {c.name}</Text>
                                            <Text style={{ color: labelColor }}>{c.dial_code}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <Button title="Close" onPress={() => setShowCountryPicker(false)} color={accentColor} />
                            </View>
                        </View>
                    </Modal>
                )}
                {/* Birthdate picker (open native picker when tapped) */}
                <Text style={[styles.label, { color: labelColor }]}>Birthdate</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8} style={[styles.input, styles.dateRow, { backgroundColor: inputBg, color: inputText, borderColor }]}> 
                    <Text style={birthdate ? [styles.dateText, { color: textColor }] : [styles.placeholderText, { color: placeholderColor }]}> 
                        {birthdate ? displayDate(birthdate) : 'Birthdate (YYYY-MM-DD)'}
                    </Text>
                    <Icon name="calendar" size={18} color={labelColor} />
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
                            <View style={[styles.modalContent, { backgroundColor: cardColor }]}> 
                                <DateTimePicker
                                    value={birthdate || new Date(2000, 0, 1)}
                                    mode="date"
                                    display="spinner"
                                    maximumDate={new Date()}
                                    textColor={textColor}
                                    onChange={(event, selectedDate) => {
                                        if (selectedDate) setBirthdate(selectedDate);
                                    }}
                                />
                                <View style={styles.pickerActions}>
                                    <Button title="Done" onPress={() => setShowDatePicker(false)} color={accentColor} />
                                    <Button title="Clear" onPress={() => { setBirthdate(null); setShowDatePicker(false); }} color={accentColor} />
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
                <Text style={[styles.label, { color: labelColor }]}>About (optional)</Text>
                <TextInput placeholder="About (optional)" placeholderTextColor={placeholderColor} value={about} onChangeText={setAbout} style={[styles.input, { height: 80, backgroundColor: inputBg, color: inputText, borderColor }]} multiline />

                <Text style={[styles.label, { color: labelColor }]}>Password</Text>
                <TextInput placeholder="Password" placeholderTextColor={placeholderColor} value={password} onChangeText={setPassword} secureTextEntry style={[styles.input, { backgroundColor: inputBg, color: inputText, borderColor }]} />

                <Text style={[styles.label, { color: labelColor }]}>Confirm password</Text>
                <TextInput placeholder="Confirm password" placeholderTextColor={placeholderColor} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={[styles.input, { backgroundColor: inputBg, color: inputText, borderColor }]} />

                {loading ? (
                    <ActivityIndicator color={accentColor} />
                ) : (
                    <TouchableOpacity style={[styles.registerButton, { backgroundColor: accentColor }]} onPress={handleRegister} activeOpacity={0.85}>
                        <Text style={[styles.registerText, { color: '#fff' }]}>Create account</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.loginRow}>
                    <Text style={{ color: labelColor }}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={[styles.link, { color: accentColor }]}> Sign in</Text>
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