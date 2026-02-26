import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import WelcomeIllustration from '../../assets/welcomeMascot.png';
import { LinearGradient } from 'expo-linear-gradient';

export default function Welcome() {
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const t = useMemo(() => getTheme(theme), [theme]);

  const isDark = theme === 'dark';
  const accentColor = useMemo(() => t.accent, [t.accent]);
  
  // Gradient colors based on theme - white/blue at top, more blue in middle
  const gradientColors = useMemo(() => 
    isDark 
      ? ['#111827', '#1e40af', '#1f2937']
      : ['#f5f7fa', '#dbeafe', '#bfdbfe'],
    [isDark]
  );

  return (
    <View style={styles.containerWrapper} key={`welcome-${theme}`}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={[styles.safeAreaContainer, { backgroundColor: 'transparent' }]}>
        <View style={styles.mainContainer}>
          {/* Header with Theme Toggle */}
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
              <View style={[styles.themeButtonInner, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <Ionicons
                  name={theme === 'dark' ? 'moon' : 'sunny'}
                  size={20}
                  color={isDark ? '#fbbf24' : '#f59e0b'}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Center Content */}
          <View style={styles.centerContent}>
            {/* Brand Name */}
            <View style={styles.brandContainer}>
              <Text style={[styles.brandName, { color: accentColor }]}>
                Zimba
              </Text>
              <View style={[styles.brandUnderline, { backgroundColor: accentColor }]} />
            </View>

            {/* Illustration */}
            <Image
              source={WelcomeIllustration}
              style={styles.welcomeImage}
              resizeMode="contain"
            />

            {/* Headline */}
            <Text style={[styles.headline, { color: t.text }]}>
              Make Smarter Decisions Together
            </Text>

            {/* Subtitle */}
            <Text style={[styles.subtitle, { color: t.secondaryText }]}>
              Secure voting, real-time insights, and AI-powered guidance to help your group decide with confidence
            </Text>
          </View>

          {/* Bottom Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: accentColor }]}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Create Account</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton, 
                { 
                  borderColor: accentColor,
                  backgroundColor: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.08)'
                }
              ]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryButtonText, { color: accentColor }]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.replace('Main')}
              style={styles.guestButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.guestText, { color: t.secondaryText }]}>
                Continue as guest
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeAreaContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'flex-end',
    height: 50,
  },
  themeButton: {
    padding: 8,
  },
  themeButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  brandName: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 4,
  },
  brandUnderline: {
    height: 3,
    width: 70,
    borderRadius: 2,
  },
  welcomeImage: {
    width: 280,
    height: 240,
    marginBottom: 16,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 4,
    fontWeight: '400',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: 'transparent',
    elevation: 0,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  guestButton: {
    paddingVertical: 8,
  },
  guestText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});