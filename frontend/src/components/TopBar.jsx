import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';

const TopBar = ({
    title = '',
    leftIcon,
    onLeftPress,
    rightIcon,
    rightText,
    rightAvatar,
    user,
    onRightPress,
    logo,
}) => {
    // compute initials from user when provided
    let initials = null;
    if (user) {
        const first = (user.first_name || user.firstName || '') || '';
        const last = (user.last_name || user.lastName || '') || '';
        const computed = `${(first.charAt(0) || '')}${(last.charAt(0) || '')}`.toUpperCase();
        initials = computed || null;
    }

    return (
        <View style={styles.container}>
            {/* LEFT */}
            <View style={styles.left}>
                {leftIcon ? (
                    <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
                        <Icon name={leftIcon} size={24} color="#111827" />
                    </TouchableOpacity>
                ) : logo ? (
                    <Image source={logo} style={styles.logo} resizeMode="contain" />
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>

            {/* CENTER TITLE */}
            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>

            {/* RIGHT */}
            <View style={styles.right}>
                {initials ? (
                    <TouchableOpacity onPress={onRightPress} style={styles.avatarButton}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                    </TouchableOpacity>
                ) : rightAvatar ? (
                    <TouchableOpacity onPress={onRightPress} style={styles.avatarButton}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{rightAvatar}</Text>
                        </View>
                    </TouchableOpacity>
                ) : rightText ? (
                    <TouchableOpacity
                        onPress={onRightPress}
                        style={styles.textButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.rightText}>{rightText}</Text>
                    </TouchableOpacity>
                ) : (
                    rightIcon && (
                        <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
                            <Icon name={rightIcon} size={24} color="#111827" />
                        </TouchableOpacity>
                    )
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        height: 56,
    },
    left: { width: 40, justifyContent: 'center' },
    right: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
    iconButton: { padding: 4 },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginHorizontal: 40,
    },
    logo: { width: 32, height: 32 },

    // NEW: Text as button
    textButton: {
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    rightText: {
        color: '#4338ca',
        fontWeight: '600',
        fontSize: 14,
        letterSpacing: 0.3,
    },
    avatarButton: { padding: 4 },
    avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontWeight: '700' },
});

export default TopBar;