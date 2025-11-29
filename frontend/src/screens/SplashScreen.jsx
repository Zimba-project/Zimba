import React, { useEffect } from 'react';
import { View, Image, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync(); // Keep native splash visible until we hide

export default function Splash({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync(); // Hide native splash
      onFinish(); // Continue to initial route
    }, 2000); // 2 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/splash-icon.png')} style={styles.icon} />
      <Text style={styles.text}>Zimba</Text>
      <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563eb',
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
