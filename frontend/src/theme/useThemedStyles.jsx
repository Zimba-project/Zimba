import { StyleSheet } from 'react-native';
import React from 'react';
import { useTheme } from '.';

export default function useThemedStyles(factory) {
  const { colors } = useTheme();
  return React.useMemo(() => StyleSheet.create(factory(colors || {})), [colors]);
}
