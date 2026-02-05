import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LeftButton from './LeftButton';
import RightButton from './RightButton';
import { resolveUser, resolveActiveName } from './navigationHelpers';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';

export default function HeaderForStack({ navigation, route, back, options }) {
    const user = resolveUser(navigation, route);
    const activeName = resolveActiveName(navigation, route);
    
    // Get the deepest route and its params using same traversal as resolveActiveName
    let nestedRoute = route;
    let nestedParams = route?.params;
    try {
        let state = navigation?.getState?.();
        let current = state;
        while (current?.routes && typeof current.index === 'number') {
            const r = current.routes[current.index];
            if (!r) break;
            nestedRoute = r;
            nestedParams = r.params;
            if (r.state) current = r.state;
            else break;
        }
    } catch { }
    
    const nestedName = nestedRoute?.name;
    
    const noBackScreens = ['Main', 'GroupsList'];
    const backScreens = ['Login', 'Register', 'Discuss', 'Profile', 'Poll', 'GroupDetail', 'GroupSettings', 'CreateGroup'];
    const showBack = !noBackScreens.includes(activeName) && !noBackScreens.includes(nestedName) && (back || backScreens.includes(activeName) || backScreens.includes(nestedName));
    
    // Determine title for nested group screens
    let displayTitle = '';
    if (nestedName === 'GroupDetail') {
        displayTitle = nestedParams?.title || '';
    } else if (nestedName === 'GroupSettings') {
        displayTitle = 'Group Settings';
    } else if (nestedName === 'CreateGroup') {
        displayTitle = 'Create Group';
    } else if (activeName === 'Main' && route?.params?.screen !== 'Groups') {
        displayTitle = 'ZIMBA';
    }

    const [searching, setSearching] = useState(false);
    const [query, setQuery] = useState('');
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const backgroundColor = isDark ? '#111827' : '#ffffff';

    if (activeName === 'Login' || activeName === 'Register') {
        return (
            <SafeAreaView edges={['top']} style={{ backgroundColor }}>
                <View style={[styles.container, { backgroundColor, borderBottomColor: isDark ? '#374151' : '#e5e7eb' }]}> 
                    <View style={styles.left}><LeftButton navigation={navigation} showBack={showBack} /></View>
                </View>
            </SafeAreaView>
        );
    }

    // For group detail screens, show title in center
    if (nestedName === 'GroupDetail' || nestedName === 'GroupSettings' || nestedName === 'CreateGroup') {
        return (
            <SafeAreaView edges={['top']} style={{ backgroundColor }}>
                <View style={[styles.container, { backgroundColor, borderBottomColor: isDark ? '#374151' : '#e5e7eb' }]}> 
                    <View style={styles.left}><LeftButton navigation={navigation} showBack={true} /></View>
                    {displayTitle ? (
                        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>{displayTitle}</Text>
                    ) : null}
                    <View style={styles.right}></View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['top']} style={{ backgroundColor }}>
            <View style={[styles.container, { backgroundColor, borderBottomColor: isDark ? '#374151' : '#e5e7eb' }]}> 
                <View style={styles.left}><LeftButton navigation={navigation} showBack={showBack} /></View>
                <View style={styles.right}><RightButton navigation={navigation}user={user}searching={searching}setSearching={setSearching}query={query}setQuery={setQuery}/></View>
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