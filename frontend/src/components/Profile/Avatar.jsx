import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import avatar from '../../../assets/avatar.jpg';

const sizes = { sm: 32, md: 40, lg: 56 };

const Avatar = ({ uri, size = 'md' }) => {
    const dim = sizes[size];
    const fullUri = uri?.startsWith('http') ? uri : `https://your-backend.com${uri}`;

    return (
        <Box style={[styles.container, { width: dim, height: dim }]}>
            <Image
                source={uri ? { uri: fullUri } : avatar}
                style={[styles.image, { width: dim, height: dim }]}
                resizeMode="cover"
            />
        </Box>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 999,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#fff',
    },
    image: { width: '100%', height: '100%' },
});

export default Avatar;