import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import MainScreen from '../screens/MainScreen';
import CreatePostScreen from '../screens/CreatePost';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 25 : 15,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: '#ffffff',
          borderRadius: 25,
          height: 70,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 5 },
          shadowRadius: 8,
          borderTopWidth: 0,
        },
      }}
    >
    <Tab.Screen
        name="Home"
        component={MainScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={26} color={focused ? '#6366f1' : '#9ca3af'}/>
              <Text style={[styles.label, { color: focused ? '#6366f1' : '#9ca3af' },]}>Home</Text>
            </View>
          ),
        }}
    />

    <Tab.Screen
        name="Community"
        component={MainScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name={focused ? 'people-circle' : 'people-circle-outline'} size={26} color={focused ? '#6366f1' : '#9ca3af'}/>
              <Text style={[styles.label, { color: focused ? '#6366f1' : '#9ca3af' },]}>Community</Text>
            </View>
          ),
        }}
      />

    <Tab.Screen
        name="NewPost"
        component={CreatePostScreen}
        options={{
            tabBarIcon: ({ focused }) => (
            <View style={[styles.addButton,{ backgroundColor: focused ? '#362ddbff' : '#6366f1' },]}>
                <Ionicons name="add" size={28} color="#fff" />
            </View>
            ),
        }}
    />

    <Tab.Screen
        name="Inbox"
        component={MainScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name={focused ? 'newspaper' : 'newspaper-outline'}size={26}color={focused ? '#6366f1' : '#9ca3af'}/>
              <Text style={[styles.label,{ color: focused ? '#6366f1' : '#9ca3af' },]}>Inbox</Text>
            </View>
          ),
        }}
      />

    <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name={focused ? 'person' : 'person-outline'}size={26}color={focused ? '#6366f1' : '#9ca3af'}/>
              <Text style={[styles.label,{ color: focused ? '#6366f1' : '#9ca3af' },]}>Profile</Text>
            </View>
          ),
        }}
    />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: 5,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
  width: 45,
  height: 45,
  borderRadius: 35,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#6366f1',
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 6,
  elevation: 10,
  borderWidth: 3,
  borderColor: '#fff',
},
});
