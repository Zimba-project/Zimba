import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import WelcomeIllustration from '../../assets/welcomeMascot.png';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';

export default function Welcome() {
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const t = getTheme(theme);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <Box flex={1} px={24} justifyContent="space-between">
        {/* Top Bar */}
        <Box style={styles.topBar}>
          <Pressable onPress={toggleTheme} style={styles.iconWrapper}>
            <Ionicons
              name={theme === 'dark' ? 'moon' : 'moon-outline'}
              size={28}
              color={t.moonIconColor}
            />
          </Pressable>
        </Box>

        {/* Main Content */}
        <Box style={styles.content}>
          <Text style={[styles.header, { color: t.text }]}>Welcome!</Text>

          <Image
            source={WelcomeIllustration}
            style={styles.welcomeImage}
            resizeMode="contain"
          />

          <Text style={[styles.appName, { color: t.moonIconGlow }]}>𝐙𝐢𝐦𝐛𝐚</Text>

          <Text style={[styles.tagline, { color: t.secondaryText }]}>
            Enhances your decisions with secure voting,{'\n'}
            powerful data insights, and AI guidance
          </Text>

          {/* Buttons */}
          <Pressable
            style={[styles.primaryButton, { backgroundColor: t.accent }]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.primaryText}>Create Account</Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryButton, { backgroundColor: t.cardBackground, borderColor: t.accent }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.secondaryText, { color: t.accent }]}>Already have an account</Text>
          </Pressable>
        </Box>

        <Pressable onPress={() => navigation.replace('Main')}>
          <Text style={[styles.guestText, { color: t.secondaryText }]}>Continue as a guest</Text>
        </Pressable>
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    bottom: 40,
  },
  welcomeImage: {
    width: 420,
    height: 270,
    marginBottom: 24,
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
    width: '80%',
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
    width: '80%',
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
});
