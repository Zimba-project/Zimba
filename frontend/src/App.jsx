import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Sidebar from './navigation/Sidebar';

export default function App() {
  return (
    <View style={styles.container}>
      <Sidebar />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,          // riittää — poista alignItems ja justifyContent!
  },
});
