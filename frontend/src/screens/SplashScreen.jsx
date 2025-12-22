import React, { useEffect } from 'react';
import { Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function Splash({ onFinish }) {
  const { theme } = useTheme();
  const t = getTheme(theme);
  useEffect(() => {
    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
      onFinish();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box style={[styles.container, { backgroundColor: t.accent }]}>
      <Image source={require('../../assets/splash-icon.png')} style={styles.icon} />
      <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 20
  },
  text: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700'
  }
});
