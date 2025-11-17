import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { default as HeaderForStack } from './TopBar';
import { useTheme } from '../theme';
import useThemedStyles from '../theme/useThemedStyles';

//Tänne kaikki näytöt sitten / All screens go here: 
import MainScreen from '../screens/MainScreen';


// Placeholder-screenit (voi korvata oikeilla, kunha vaa näyttää jotain)
function DiscussionScreen() { return <View style={{ flex: 1 }} />; }
function PollsScreen() { return <View style={{ flex: 1 }} />; }


const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { colors } = useTheme();

  const headerForRoute = (route, navigation, back) => {
    // Use the centralized HeaderForStack from navigation/TopBar
    return <HeaderForStack navigation={navigation} route={route} back={back} />;
  };

  const t = useThemedStyles((c) => ({
    tabBar: {
      backgroundColor: c.surface || c.background,
      borderTopColor: c.border,
      borderTopWidth: 1,
      height: 60,
    },
  }));

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: t.tabBar,
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
