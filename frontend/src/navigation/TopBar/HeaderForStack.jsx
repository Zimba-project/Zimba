import { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import LeftButton from './LeftButton';
import RightButton from './RightButton';
import { resolveUser, resolveActiveName } from './navigationHelpers';

export default function HeaderForStack({ navigation, route, back }) {
    const user = resolveUser(navigation, route);
    const activeName = resolveActiveName(navigation, route);
    const backScreens = ['Login', 'Register', 'Discuss'];
    const showBack = back || backScreens.includes(activeName);

    const [searching, setSearching] = useState(false);
    const [query, setQuery] = useState('');

    return (
        <SafeAreaView edges={['top']} className="bg-background-0">
            <Box style={styles.container} className="bg-background-0 border-background-200">
                <Box style={styles.left}><LeftButton navigation={navigation} showBack={showBack} /></Box>
                {searching ? (
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                        returnKeyType="search"
                    />
                ) : (
                    <Text style={styles.title} numberOfLines={1}></Text>
                )}
                <Box style={styles.right}>
                    <RightButton
                        navigation={navigation}
                        user={user}
                        searching={searching}
                        setSearching={setSearching}
                        query={query}
                        setQuery={setQuery}
                    />
                </Box>
            </Box>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, height: 56 },
    left: { width: 40, justifyContent: 'center' },
    right: { minWidth: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
    title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', marginHorizontal: 40 },
    searchInput: { flex: 1, height: 40, backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 12, marginHorizontal: 8 },
});
