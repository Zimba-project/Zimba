import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MainScreen from '../screens/MainScreen';
import CreatePostScreen from '../screens/CreatePost';
import Inbox from '../screens/Inbox';
import CustomTabBar from '../components/TabsBar/CustomTabBar';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
        screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
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
          backgroundColor: '#ffffff',
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >

      {/* Home */}
      <Tab.Screen
        name="Main"
        component={MainScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
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
            <View style={[styles.addButton, { backgroundColor: focused ? '#362ddbff' : '#6366f1' }]}>
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
          tabBarIcon: ({ focused, color, size }) => (
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

