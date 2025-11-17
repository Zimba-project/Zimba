import React from 'react';
import { Image, View } from 'react-native';
import avatar from '../../assets/avatar.jpg';
import useThemedStyles from '../../theme/useThemedStyles';

const sizes = { sm: 32, md: 40, lg: 56 };

const Avatar = ({ uri, size = 'md' }) => {
    const dim = sizes[size];
    const t = useThemedStyles((c) => ({
        container: {
            borderRadius: 999,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: c.surface,
        },
        image: { width: '100%', height: '100%' },
    }));

    return (
        <View style={[t.container, { width: dim, height: dim }]}>
            <Image
                source={uri ? { uri } : avatar}
                style={[t.image, { width: dim, height: dim }]}
                resizeMode="cover"
            />
        </View>
    );
};

export default Avatar;