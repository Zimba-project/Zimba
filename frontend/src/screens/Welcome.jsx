import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Welcome() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <Text style={styles.header}>Welcome</Text>
                <Text style={styles.subHeader}>Login or signup to continue</Text>

                {/* Illustration */}
                <Image
                    source={require('../../assets/welcome.png')} // Replace with your illustration
                    style={styles.image}
                    resizeMode="contain"
                />

                {/* App name and tagline */}
                <Text style={styles.appName}>𝐙𝐢𝐦𝐛𝐚</Text>
                <Text style={styles.tagline}>
                    Enhances your decisions with secure voting,{'\n'}
                    powerful data insights, and AI guidance
                </Text>

                {/* Buttons */}
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.primaryText}>Create Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.secondaryText}>Already have an account</Text>
                </TouchableOpacity>
            </View>

            {/* Guest link */}
            <TouchableOpacity onPress={() => navigation.replace('Main')}>
                <Text style={styles.guestText}>Continue as a guest</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        backgroundColor: '#ffffff',
        justifyContent: 'space-between',
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 16,
    },
    subHeader: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 16,
        textAlign: 'center',
    },
    image: {
        width: '100%',
        height: 160,
        marginBottom: 16,
    },
    appName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2563eb',
        marginBottom: 4,
    },
    tagline: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    primaryButton: {
        width: '100%',
        paddingVertical: 14,
        backgroundColor: '#2563eb',
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 14,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#2563eb',
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    secondaryText: {
        color: '#2563eb',
        fontSize: 16,
        fontWeight: '600',
    },
    guestText: {
        color: '#6b7280',
        fontSize: 16,
        textDecorationLine: 'underline',
        textAlign: 'center',
        marginBottom: 24,
    },
});
