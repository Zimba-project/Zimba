import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { navigationRef } from '../App';

export function HeaderForStack({ navigation, route, back, options }) {
    // Try to resolve the current user from route params or from the active nested route's params.
    // When we use a single header for a Stack that contains a Drawer/Tab navigator, the
    // active screen's params may live in a nested navigator. We traverse the navigation
    // state to find the deepest active route and read its params.user if available.
    const resolveUserFromNavigation = () => {
        if (route?.params?.user) return route.params.user;
        try {
            const state = navigation && navigation.getState && navigation.getState();
            let current = state;
            while (current && current.routes && typeof current.index === 'number') {
                const r = current.routes[current.index];
                if (!r) break;
                if (r.params && r.params.user) return r.params.user;
                // some navigators (navigate('Main', { screen, params })) keep nested params under r.params.params
                if (r.params && r.params.params && r.params.params.user) return r.params.params.user;
                // dive into nested state if present
                if (r.state) current = r.state;
                else break;
            }
        } catch (e) {
            // ignore and fallback to route params
        }
        return null;
    };

    const user = resolveUserFromNavigation() || null;
    // compute rightText only when there's no user (quick shortcut)
    // Do not show the 'Login' button when we're already on the Login screen
    const rightText = (!user && route?.name !== 'Login') ? 'Login' : null;

    // Determine whether this screen should show a back button instead of the drawer menu.
    const resolveActiveRouteName = () => {
        try {
            const state = navigation && navigation.getState && navigation.getState();
            let current = state;
            let name = route?.name;
            while (current && current.routes && typeof current.index === 'number') {
                const r = current.routes[current.index];
                if (!r) break;
                name = r.name || name;
                if (r.state) current = r.state;
                else break;
            }
            return name;
        } catch (e) {
            return route?.name;
        }
    };

    const activeName = resolveActiveRouteName();
    const backScreens = ['Login', 'Register', 'Discuss'];
    const showBack = back || backScreens.includes(activeName);

    const onLeftPress = () => {
        // Prefer back when requested and available
        if (showBack) {
            if (navigation && navigation.canGoBack && navigation.canGoBack()) {
                navigation.goBack && navigation.goBack();
            }
            return;
        }
        // Try to find the nearest parent navigator that can open the drawer and call it.
        try {
            let parentNav = navigation;
            // Climb up parent navigators to find one that exposes openDrawer()
            while (parentNav && !parentNav.openDrawer && parentNav.getParent) {
                parentNav = parentNav.getParent();
            }
            if (parentNav && parentNav.openDrawer) {
                parentNav.openDrawer();
                return;
            }
        } catch (e) {
            // ignore and try other fallbacks
        }

        // Prefer using the root navigation ref to dispatch DrawerActions.openDrawer()
        try {
            if (navigationRef && navigationRef.isReady && navigationRef.isReady()) {
                navigationRef.dispatch && navigationRef.dispatch(DrawerActions.openDrawer());
                return;
            }
        } catch (e) {
            // ignore
        }

        // Final fallback: navigate to the Drawer screen and request it to open
        if (navigation && navigation.navigate) {
            try {
                navigation.navigate('Main', { screen: 'Home', params: { openDrawer: true } });
                return;
            } catch (e) {
                // ignore
            }
        }

        // As last resort, go back only if possible
        if (navigation && navigation.canGoBack && navigation.canGoBack()) {
            navigation.goBack && navigation.goBack();
        }
    };

    const onRightPress = () => {
        if (!user) navigation.navigate && navigation.navigate('Login');
        else navigation.navigate && navigation.navigate('Profile', { user });
    };

    const title = "";

    // Local search state moved from component TopBar
    const [searching, setSearching] = React.useState(false);
    const [query, setQuery] = React.useState('');

    return (
        // Wrap TopBar in SafeAreaView so it is positioned below device notch/status bar
        <SafeAreaView edges={["top"]} style={{ backgroundColor: '#fff' }}>
            <View style={styles.container}>
                {/* LEFT */}
                <View style={styles.left}>
                    <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
                        <Icon name={showBack ? 'arrow-left' : 'menu'} size={24} color="#111827" />
                    </TouchableOpacity>
                </View>

                {/* CENTER: title or search input when active */}
                {searching ? (
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                        returnKeyType="search"
                        onSubmitEditing={() => {
                            // no-op: integrate onSearch behavior later if needed
                        }}
                    />
                ) : (
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                )}

                {/* RIGHT */}
                <View style={styles.right}>
                    {searching ? (
                        <TouchableOpacity
                            onPress={() => {
                                setSearching(false);
                                setQuery('');
                            }}
                            style={styles.iconButton}
                        >
                            <Icon name="x" size={22} color="#111827" />
                        </TouchableOpacity>
                    ) : null}

                    {/* Render search icon to the left of the login/avatar control */}
                    {!searching && (
                        <TouchableOpacity onPress={() => setSearching(true)} style={styles.searchIconButton}>
                            <Icon name="search" size={20} color="#111827" />
                        </TouchableOpacity>
                    )}

                    {user ? (
                        <TouchableOpacity onPress={onRightPress} style={styles.avatarButton}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>{(user.first_name || user.firstName || '').charAt(0).toUpperCase()}{(user.last_name || user.lastName || '').charAt(0).toUpperCase()}</Text>
                            </View>
                        </TouchableOpacity>
                    ) : rightText ? (
                        <TouchableOpacity onPress={onRightPress} style={styles.textButton} activeOpacity={0.7}>
                            <Text style={styles.rightText}>{rightText}</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        </SafeAreaView>
    );
}

export default HeaderForStack;

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
    right: { minWidth: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
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
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginHorizontal: 8,
    },
    searchIconButton: { paddingHorizontal: 8, paddingVertical: 6, marginRight: 8 },
});
