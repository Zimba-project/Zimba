import React from 'react';
import { View, Platform } from 'react-native';
import useThemedStyles from '../../theme/useThemedStyles';

const CardContainer = ({ children, style }) => {
    const t = useThemedStyles((c) => ({
        card: {
            backgroundColor: c.surface,
            borderRadius: 16,
            margin: 16,
            overflow: 'hidden',
            ...Platform.select({ android: { elevation: 3 } }),
        },
    }));

    return (
        <View style={[t.card, style]}>
            {children}
        </View>
    );
};

export default CardContainer;
