import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import avatar from '../../../assets/avatar.jpg';
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

const sizes = { sm: 32, md: 40, lg: 56 };

const Avatar = ({ uri, size = 'md' }) => {
    const dim = sizes[size];
    const fullUri = uri?.startsWith('http') ? uri : uri ? `${API_BASE}/${uri}` : null;

    return (
        <View style={[styles.container, { width: dim, height: dim }]}>
            <Image
                source={uri ? { uri: fullUri } : avatar}
                style={[styles.image, { width: dim, height: dim }]}
                resizeMode="cover"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 999,
        overflow: 'hidden',
        borderWidth: 0,
        borderColor: '#fff',
    },
    image: { width: '100%', height: '100%', alignSelf: 'center' },
});

export default Avatar;