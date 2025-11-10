import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { default as HeaderForStack } from './TopBar';

//Tänne kaikki näytöt sitten / All screens go here: 
import MainScreen from '../screens/MainScreen';


// Placeholder-screenit (voi korvata oikeilla, kunha vaa näyttää jotain)
function DiscussionScreen() { return <View style={{ flex: 1 }} />; }
function PollsScreen() { return <View style={{ flex: 1 }} />; }


const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const headerForRoute = (route, navigation, back) => {
    // Use the centralized HeaderForStack from navigation/TopBar
    return <HeaderForStack navigation={navigation} route={route} back={back} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#111827',
        tabBarIcon: ({ color, size }) => {
          const name =
            route.name === 'Home' ? 'home-outline' :
              route.name === 'Discussion' ? 'chatbox-outline' :
                route.name === 'Polls' ? 'stats-chart-outline' : '';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={MainScreen} />
      <Tab.Screen name="Discussion" component={DiscussionScreen} />
      <Tab.Screen name="Polls" component={PollsScreen} />

    </Tab.Navigator>
  );
}
