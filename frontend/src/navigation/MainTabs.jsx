import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MainScreen from '../screens/MainScreen';
import CreatePostScreen from '../screens/CreatePost';
import Inbox from '../screens/Inbox';
import CustomTabBar from '../components/TabsBar/CustomTabBar';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme(); // get current theme
  const t = getTheme(theme); // get theme colors

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.secondaryText,
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
        },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 40 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : insets.bottom,
          paddingTop: 5,
          borderTopWidth: 0,
          elevation: 10,
          backgroundColor: t.background,
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} theme={t} />}
    >

      {/* Home */}
      <Tab.Screen
        name="Main"
        component={MainScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* New Post */}
      <Tab.Screen
        name="NewPost"
        component={CreatePostScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.addButton,
                {
                  backgroundColor: focused ? t.accent : t.secondaryText,
                },
              ]}
            >
              <Ionicons name="add" size={26} color="#fff" />
            </View>
          ),
        }}
      />

      {/* Inbox */}
      <Tab.Screen
        name="Inbox"
        component={Inbox}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: { alignItems: 'center', justifyContent: 'center' },
  addButton: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
});
