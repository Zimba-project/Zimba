import { View, Text, TouchableOpacity } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';

export default function RightButton({ navigation, user, searching, setSearching, query, setQuery }) {
    const rightText = !user ? 'Login' : null;
    const onPress = () => {
        if (!user) navigation.navigate('Login');
        else navigation.navigate('Profile', { user });
    };

    if (searching)
        return (
            <TouchableOpacity
                onPress={() => {
                    setSearching(false);
                    setQuery('');
                }}
                style={{ padding: 4 }}
            >
                <Icon name="x" size={22} color="#111827" />
            </TouchableOpacity>
        );

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setSearching(true)} style={{ paddingHorizontal: 8, paddingVertical: 6, marginRight: 8 }}>
                <Icon name="search" size={20} color="#111827" />
            </TouchableOpacity>
            {user ? (
                <TouchableOpacity onPress={onPress} style={{ padding: 4 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>
                            {(user.first_name || user.firstName || '').charAt(0).toUpperCase()}
                            {(user.last_name || user.lastName || '').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                </TouchableOpacity>
            ) : rightText ? (
                <TouchableOpacity onPress={onPress} style={{ backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, minWidth: 60, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#4338ca', fontWeight: '600', fontSize: 14, letterSpacing: 0.3 }}>{rightText}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}
