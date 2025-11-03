import React from 'react';
import { View, StyleSheet } from 'react-native';

const CardContainer = ({ children }) => (
    <View style={styles.card}>
        {children}
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        margin: 16,
        overflow: 'hidden',
        elevation: 3,
    },
});

export default CardContainer;
