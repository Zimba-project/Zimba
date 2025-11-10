import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '../components/TopBar';
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

    const title = ""

    return (
        // Wrap TopBar in SafeAreaView so it is positioned below device notch/status bar
        <SafeAreaView edges={["top"]} style={{ backgroundColor: '#fff' }}>
            <TopBar
                title={title}
                leftIcon={showBack ? 'arrow-left' : 'menu'}
                onLeftPress={onLeftPress}
                user={user}
                rightText={rightText}
                onRightPress={onRightPress}
            />
        </SafeAreaView>
    );
}

export default TopBar;
