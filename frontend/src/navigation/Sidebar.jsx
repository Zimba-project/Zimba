import React from 'react';
import { View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import MainTabs from './MainTabs';


// Placeholder-screenit (Pitää korvata oikeilla sitte)

function LanguageScreen() { return <View style={{ flex:1 }} />; }
function DarkmodeScreen() { return <View style={{ flex:1 }} />; }

const Drawer = createDrawerNavigator();

export default function Sidebar() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false, drawerActiveTintColor: '#111827' }}
    >
      <Drawer.Screen
        name="Home"
        component={MainTabs}
        options={{
          drawerItemStyle: { display: 'none'},
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
