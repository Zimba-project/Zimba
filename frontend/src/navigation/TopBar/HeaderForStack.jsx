import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LeftButton from './LeftButton';
import RightButton from './RightButton';
import { resolveUser, resolveActiveName } from './navigationHelpers';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';

export default function HeaderForStack({ navigation, route, back }) {
    const user = resolveUser(navigation, route);
    const activeName = resolveActiveName(navigation, route);
    const backScreens = ['Login', 'Register', 'Discuss'];
    const showBack = back || backScreens.includes(activeName);

    const [searching, setSearching] = useState(false);
    const [query, setQuery] = useState('');
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const backgroundColor = isDark ? '#111827' : '#ffffff';
    const textColor = isDark ? '#fff' : '#000';
    const accentColor = isDark ? '#fff' : '#000';

    if (activeName === 'Login' || activeName === 'Register') {
        return (
            <SafeAreaView edges={['top']} style={{ backgroundColor }}>
                <View style={[styles.container, { backgroundColor, borderBottomColor: isDark ? '#374151' : '#e5e7eb' }]}> 
                    <View style={styles.left}><LeftButton navigation={navigation} showBack={showBack} /></View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['top']} style={{ backgroundColor }}>
            <View style={[styles.container, { backgroundColor, borderBottomColor: isDark ? '#374151' : '#e5e7eb' }]}> 
                <View style={styles.left}><LeftButton navigation={navigation} showBack={showBack} /></View>
                {searching ? (
                    <TextInput
                        style={[styles.searchInput, {
                            backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                            color: textColor,
                        }]}
                        placeholder="Search..."
                        placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                        returnKeyType="search"
                    />
                ) : (
                    <Text style={[styles.title, { color: textColor }]} numberOfLines={1}></Text>
                )}
                <View style={styles.right}>
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

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, height: 56 },
    left: { width: 40, justifyContent: 'center' },
    right: { minWidth: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
    title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', marginHorizontal: 40 },
    searchInput: { flex: 1, height: 40, borderRadius: 10, paddingHorizontal: 12, marginHorizontal: 8 },
});
