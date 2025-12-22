import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';

const CardContainer = ({ children, style }) => {
  const { theme } = useTheme();
  const t = getTheme(theme);

  return (
    <Box style={[styles.card, { backgroundColor: t.cardBackground }, style]}>
      {children}
    </Box>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default CardContainer;
