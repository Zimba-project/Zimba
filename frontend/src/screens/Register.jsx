import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, Button, ActivityIndicator, ScrollView, Alert, TouchableOpacity, Platform, Modal } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { register as registerApi } from '../api/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import useThemedStyles from '../theme/useThemedStyles';
import { useTheme } from '../theme/ThemeProvider';

function pad(n) { return n < 10 ? '0' + n : '' + n }
function formatDate(d) {
    if (!d) return '';
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return `${year}-${month}-${day}`;
}
function displayDate(d) {
    if (!d) return '';
    try { return d.toLocaleDateString(); } catch (e) { return formatDate(d); }
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
                    {
                        text: 'OK', onPress: () => {
                            // navigate to Login and prefill phone so user can easily sign in
                            navigation.replace('Login', { phone: fullPhone });
                        }
                    }
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

    const { colors } = useTheme();
    const bgRgb = (colors?.background || '').replace(/^rgb\(|\)$/g, '') || '0,0,0';
    const overlayColor = `rgba(${bgRgb},0.35)`;
    const t = useThemedStyles((c) => ({
        container: { flex: 1, backgroundColor: c.background },
        card: { padding: 20, alignItems: 'center', width: '100%', maxWidth: 460, backgroundColor: c.surface, borderRadius: 12, margin: 16, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: c.border },
        title: { fontSize: 22, fontWeight: '600', marginBottom: 12, color: c.text },
        error: { color: c.danger, marginBottom: 8 },
        subtitle: { width: '100%', fontSize: 14, color: c.text, marginTop: 8, marginBottom: 6 },
        label: { width: '100%', color: c.muted, marginBottom: 6, fontSize: 13 },
        rowNames: { flexDirection: 'row', width: '100%', marginBottom: 12 },
        input: { backgroundColor: c.surface, width: '100%', borderWidth: 1, borderColor: c.border, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, borderRadius: 8, color: c.text, height: 44 },
        inputSmall: { height: 44 },
        phoneContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12, borderWidth: 1, borderColor: c.border, borderRadius: 8, backgroundColor: c.surface, overflow: 'hidden' },
        countryButton: { paddingHorizontal: 12, backgroundColor: 'transparent', height: 44, justifyContent: 'center', minWidth: 92, alignItems: 'center', borderRightWidth: 1, borderRightColor: c.border },
        countryText: { color: c.text },
        phoneInput: { flex: 1, height: 44, paddingHorizontal: 12, paddingVertical: 0, color: c.text },
        modalOverlay: { flex: 1, backgroundColor: overlayColor, justifyContent: 'flex-end' },
        modalContent: { backgroundColor: c.surface, padding: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
        dateRow: { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', paddingRight: 10 },
        dateText: { color: c.text },
        placeholderText: { color: c.muted },
        pickerContainer: { backgroundColor: c.surface, marginTop: 8, borderRadius: 12, padding: 8, shadowOpacity: 0.06, shadowRadius: 8, elevation: 4 },
        countryModal: { backgroundColor: c.surface, margin: 16, borderRadius: 12, padding: 12 },
        countryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border },
        registerButton: { width: '100%', backgroundColor: c.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 6 },
        registerText: { color: c.onPrimary, fontWeight: '700' },
        loginRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
        link: { color: c.primary },
        pickerActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }
    }));

    return (
        <SafeAreaView style={t.container}>
            <ScrollView contentContainerStyle={t.card} keyboardShouldPersistTaps="handled">
                <Text style={t.title}>Create account</Text>

                {error ? <Text style={t.error}>{error}</Text> : null}

                <Text style={t.subtitle}>Personal info</Text>
                <View style={t.rowNames}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={t.label}>First name</Text>
                        <TextInput placeholder="First name" placeholderTextColor={t.placeholderText.color} value={firstName} onChangeText={setFirstName} style={[t.input, t.inputSmall]} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={t.label}>Last name</Text>
                        <TextInput placeholder="Last name" placeholderTextColor={t.placeholderText.color} value={lastName} onChangeText={setLastName} style={[t.input, t.inputSmall]} />
                    </View>
                </View>
                <Text style={t.label}>Email (required)</Text>
                <TextInput placeholder="Email address" placeholderTextColor={t.placeholderText.color} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={t.input} />

                <Text style={t.label}>Phone</Text>
                <View style={t.phoneContainer}>
                    <TouchableOpacity style={t.countryButton} onPress={() => setShowCountryPicker(true)}>
                        <Text style={t.countryText}>{country.flag} {country.dial_code}</Text>
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Phone number"
                        placeholderTextColor={t.placeholderText.color}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        style={t.phoneInput}
                    />
                </View>
                {showCountryPicker && (
                    <Modal visible={showCountryPicker} transparent animationType="slide" onRequestClose={() => setShowCountryPicker(false)}>
                        <View style={t.modalOverlay}>
                            <View style={t.countryModal}>
                                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: colors?.text }}>Select country</Text>
                                <ScrollView style={{ maxHeight: 300 }}>
                                    {COUNTRIES.map((cItem) => (
                                        <TouchableOpacity key={cItem.code} style={t.countryRow} onPress={() => { setCountry(cItem); setShowCountryPicker(false); }}>
                                            <Text style={{ fontSize: 18, color: colors?.text }}>{cItem.flag}  {cItem.name}</Text>
                                            <Text style={{ color: colors?.muted }}>{cItem.dial_code}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <Button title="Close" onPress={() => setShowCountryPicker(false)} />
                            </View>
                        </View>
                    </Modal>
                )}
                {/* Birthdate picker (open native picker when tapped) */}
                <Text style={t.label}>Birthdate</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8} style={[t.input, t.dateRow]}>
                    <Text style={birthdate ? t.dateText : t.placeholderText}>
                        {birthdate ? displayDate(birthdate) : 'Birthdate (YYYY-MM-DD)'}
                    </Text>
                    <Icon name="calendar" size={18} color={colors?.muted} />
                </TouchableOpacity>

                {/* Native picker: Android shows modal, iOS can render inline spinner inside a styled box */}
                {showDatePicker && Platform.OS === 'ios' && (
                    <Modal
                        visible={showDatePicker}
                        animationType="fade"
                        transparent={true}
                        onRequestClose={() => setShowDatePicker(false)}
                    >
                        <View style={t.modalOverlay}>
                            <View style={t.modalContent}>
                                <DateTimePicker
                                    value={birthdate || new Date(2000, 0, 1)}
                                    mode="date"
                                    display="spinner"
                                    maximumDate={new Date()}
                                    textColor={colors?.text}
                                    onChange={(event, selectedDate) => {
                                        if (selectedDate) setBirthdate(selectedDate);
                                    }}
                                />
                                <View style={t.pickerActions}>
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
                <Text style={t.label}>About (optional)</Text>
                <TextInput placeholder="About (optional)" placeholderTextColor={t.placeholderText.color || colors?.muted} value={about} onChangeText={setAbout} style={[t.input, { height: 80 }]} multiline />

                <Text style={t.label}>Password</Text>
                <TextInput placeholder="Password" placeholderTextColor={t.placeholderText.color || colors?.muted} value={password} onChangeText={setPassword} secureTextEntry style={t.input} />

                <Text style={t.label}>Confirm password</Text>
                <TextInput placeholder="Confirm password" placeholderTextColor={t.placeholderText.color || colors?.muted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={t.input} />

                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <TouchableOpacity style={t.registerButton} onPress={handleRegister} activeOpacity={0.85}>
                        <Text style={t.registerText}>Create account</Text>
                    </TouchableOpacity>
                )}

                <View style={t.loginRow}>
                    <Text style={{ color: colors?.muted }}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={t.link}> Sign in</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// styles moved to `useThemedStyles` (variable `t`)

export default Register;