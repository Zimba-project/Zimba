import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MainScreen from '../screens/MainScreen';
import CreatePostScreen from '../screens/CreatePost';
import Inbox from '../screens/Inbox';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, navigation, theme, insets }) => {
  return (
    <HStack
      style={{
        paddingBottom: insets.bottom,
        height: 44 + insets.bottom,
        backgroundColor: theme.background,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 0.5,
        borderTopColor: theme.gray,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        let iconName;
        if (route.name === 'Main') iconName = isFocused ? 'home' : 'home-outline';
        else if (route.name === 'NewPost') iconName = isFocused ? 'add-circle' : 'add-circle-outline';
        else if (route.name === 'Inbox') iconName = isFocused ? 'mail' : 'mail-outline';
        else return null;

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons
              name={iconName}
              size={26}
              color={isFocused ? theme.accent : theme.secondaryText}
            />
          </Pressable>
        );
      })}
    </HStack>
  );
};

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const t = getTheme(theme);
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.secondaryText,
        tabBarStyle: {
          height: 44 + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 0,
          borderTopWidth: 1,
          borderTopColor: t.placeholder,
          elevation: 0,
          backgroundColor: t.background,
        },
        tabBarHideOnKeyboard: true,
      }}
      
      tabBar={(props) => <CustomTabBar {...props} theme={t} insets={insets} />}
      
    >
      <Tab.Screen
        name="Main"
        component={MainScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="NewPost"
        component={CreatePostScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Box
              style={[
                styles.addButton,
                {
                  backgroundColor: focused ? t.accent : t.secondaryText,
                },
              ]}
            >
              <Ionicons name="add" size={26} color="#fff" />

            </Box>
          ),
        }}
      />

      <Tab.Screen
        name="Inbox"
        component={Inbox}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'mail' : 'mail-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  addButton: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
});