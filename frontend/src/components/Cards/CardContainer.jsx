import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';

const CardContainer = ({ children }) => (
    <Box className="bg-background-50 rounded-2xl m-4 border border-outline-100" style={styles.card}>
        {children}
    </Box>
);

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
        elevation: 3,
    },
});

export default CardContainer;
