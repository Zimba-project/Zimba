
import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';

const CardContainer = ({ children, style, variant = 'default' }) => {
  const { theme } = useTheme();
  const t = getTheme(theme);

  const variantStyles = {
    default: styles.cardDefault,
    outlined: styles.cardOutlined,
    elevated: styles.cardElevated,
  };

  return (
    <Box
      style={[
        styles.card,
        variantStyles[variant],
        { backgroundColor: t.cardBackground },
        style,
      ]}
    >
      {children}
    </Box>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  cardDefault: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardOutlined: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  cardElevated: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
});

export default CardContainer;