import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import MainScreen from '../screens/MainScreen';
import CreatePostScreen from '../screens/CreatePost';
import Profile from '../screens/Profile';
import CustomTabBar from '../components/TabsBar/CustomTabBar';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,       
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >

    <Tab.Screen
        name="Main"
        component={MainScreen}
        options={{ tabBarLabel: 'Koti' }} 
      />
      <Tab.Screen
        name="NewPost"
        component={CreatePostScreen}
        options={{ tabBarLabel: 'Uusi' }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ tabBarLabel: 'Profiili' }}
      />

    </Tab.Navigator>
  );
}

