import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import WelcomeIllustration from '../../assets/welcome.svg';
import LionMascot from '../../assets/lion2.png'; 

export default function Welcome() {
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const t = getTheme(theme);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={toggleTheme}
          style={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <View style={styles.iconWrapper}>
            <Ionicons
              name={theme === 'dark' ? 'moon' : 'moon-outline'}
              size={28}
              color={t.moonIconColor}
            />
          </View>
        </Pressable>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={[styles.header, { color: t.text }]}>Welcome!</Text>
        <WelcomeIllustration width={400} height={180} />
        <Image
          source={LionMascot}
          style={styles.lionMascot}
        />
        <Text style={[styles.appName, { color: t.moonIconGlow }]}>𝐙𝐢𝐦𝐛𝐚</Text>
        <Text style={[styles.tagline, { color: t.secondaryText }]}>
          Enhances your decisions with secure voting,{'\n'}
          powerful data insights, and AI guidance
        </Text>

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: t.accent }]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.primaryText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: t.cardBackground, borderColor: t.accent }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.secondaryText, { color: t.accent }]}>
            Already have an account
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.replace('Main')}>
        <Text style={[styles.guestText, { color: t.secondaryText }]}>
          Continue as a guest
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topBar: {
    width: '100%',
    alignItems: 'flex-end',
    paddingVertical: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    bottom: 80,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  guestText: {
    fontSize: 16,
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginBottom: 24,
  },
  lionMascot: {
    position: 'absolute',
    bottom: 448,
    right: 10,
    width: 125,
    height: 125,
    zIndex: 1,
  },
});
