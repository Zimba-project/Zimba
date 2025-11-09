import React from 'react';
import { View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import MainTabs from './MainTabs';


// Placeholder-screenit (Pitää korvata oikeilla sitte)

function LanguageScreen() { return <View style={{ flex: 1 }} />; }
function DarkmodeScreen() { return <View style={{ flex: 1 }} />; }

const Drawer = createDrawerNavigator();

export default function Sidebar({ route, navigation }) {
  React.useEffect(() => {
    // If the parent Stack passed { openDrawer: true } as a param to this screen,
    // open the drawer and then clear the param so it doesn't re-open repeatedly.
    const shouldOpen = route?.params?.openDrawer;
    if (shouldOpen) {
      // open the drawer
      try {
        navigation.openDrawer && navigation.openDrawer();
      } catch (e) {
        // ignore
      }

      // clear the param on the parent (the Stack) so this runs only once
      try {
        // navigation.getParent() should point to the Stack navigator
        const parent = navigation.getParent && navigation.getParent();
        parent && parent.setParams && parent.setParams({ openDrawer: false });
      } catch (e) {
        // ignore
      }
    }
  }, [route?.params?.openDrawer]);

  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false, drawerActiveTintColor: '#111827' }}
    >
      <Drawer.Screen
        name="Home"
        component={MainTabs}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="Language"
        component={LanguageScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="language-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Darkmode"
        component={DarkmodeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="moon-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
