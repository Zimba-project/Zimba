import { View, Text, TouchableOpacity } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';

export default function RightButton({ navigation, user, searching, setSearching, query, setQuery }) {
    const { colors } = useTheme();
    const route = useRoute();

    // Hide the right-side header button on authentication screens
    if (route?.name === 'Login' || route?.name === 'Register') return null;

    // Use a strong purple for the login pill in both modes (prefer theme primary)
    const btnBg = colors?.primary || '#6366f1';
    const btnTextColor = colors?.onPrimary || '#ffffff';

    const rightText = !user ? 'Login' : null;
    const onPress = () => {
        if (!user) navigation.navigate('Login');
        else navigation.navigate('Profile', { user });
    };

    if (searching) {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 4 }}>
                <TouchableOpacity
                    onPress={() => {
                        setSearching(false);
                        setQuery('');
                    }}
                    style={{ padding: 4 }}
                >
                    <Icon name="x" size={22} color={colors?.text || '#111827'} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setSearching(true)}
                    style={{ paddingHorizontal: 8, paddingVertical: 6, marginRight: 8 }}
                >
                    <Icon name="search" size={20} color={colors?.text} />
                </TouchableOpacity>

                <Icon name="search" size={20} color={colors?.text || '#111827'} />
            </View>
        );
    }

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Search button: opens the header search input */}
            <TouchableOpacity onPress={() => setSearching(true)} style={{ padding: 6, marginRight: 8 }}>
                <Icon name="search" size={20} color={colors?.text || '#111827'} />
            </TouchableOpacity>

            {user ? (
                <TouchableOpacity onPress={onPress} style={{ padding: 4 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors?.primary, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: colors?.onPrimary, fontWeight: '700' }}>
                            {(user.first_name || user.firstName || '').charAt(0).toUpperCase()}
                            {(user.last_name || user.lastName || '').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                </TouchableOpacity>
            ) : rightText ? (
                <TouchableOpacity onPress={onPress} style={{ backgroundColor: btnBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, minWidth: 60, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: btnTextColor, fontWeight: '600', fontSize: 14, letterSpacing: 0.3 }}>{rightText}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}
