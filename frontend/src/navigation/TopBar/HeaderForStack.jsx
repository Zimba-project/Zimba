import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LeftButton from './LeftButton';
import RightButton from './RightButton';
import { resolveUser, resolveActiveName } from './navigationHelpers';
import useThemedStyles from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeProvider';

export default function HeaderForStack({ navigation, route, back }) {
    const user = resolveUser(navigation, route);
    const activeName = resolveActiveName(navigation, route);
    const backScreens = ['Login', 'Register', 'Discuss'];
    const showBack = back || backScreens.includes(activeName);

    const [searching, setSearching] = useState(false);
    const [query, setQuery] = useState('');

    const { colors } = useTheme();
    const t = useThemedStyles((c) => ({
        safe: { backgroundColor: c.background },
        container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: c.background, borderBottomWidth: 1, borderBottomColor: c.border, height: 56 },
        title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: c.text, marginHorizontal: 40 },
        searchInput: { flex: 1, height: 40, backgroundColor: c.surface, borderRadius: 10, paddingHorizontal: 12, marginHorizontal: 8, color: c.text },
        left: { width: 40, justifyContent: 'center' },
        right: { minWidth: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
    }));

    return (
        <SafeAreaView edges={['top']} style={t.safe}>
            <View style={t.container}>
                <View style={t.left}><LeftButton navigation={navigation} showBack={showBack} /></View>
                {searching ? (
                    <TextInput
                        style={t.searchInput}
                        placeholder="Search..."
                        placeholderTextColor={colors?.muted}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                        returnKeyType="search"
                    />
                ) : (
                    <Text style={t.title} numberOfLines={1}></Text>
                )}
                <View style={t.right}>
                    <RightButton
                        navigation={navigation}
                        user={user}
                        searching={searching}
                        setSearching={setSearching}
                        query={query}
                        setQuery={setQuery}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

