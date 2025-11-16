// navigation/MainTabs.jsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { default as HeaderForStack } from './TopBar';
// Tuo standardi RN-komponentit Suspense-tukea varten
import { View, Text, ActivityIndicator } from 'react-native'; 

// 1. TÄRKEÄÄ: MÄÄRITTELE LAZY-KOMPONENTTI SUORAAN
// Tämä yksinkertaistaa latausketjua ja varmistaa, että saamme default-exportin
const CustomGluestackTabBar = React.lazy(() => 
  import('../components/GluestackNav/CustomGluestackTabBar.jsx').then(module => ({
    // Käytetään moduulin default exporttia
    default: module.default 
  }))
);

// Tänne kaikki näytöt sitten / All screens go here: 
import MainScreen from '../screens/MainScreen';


// Placeholder-screenit (Vain RN View/Text)
function DiscussionScreen() { 
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Keskustelu</Text>
    </View>
  ); 
}
function PollsScreen() { 
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Kyselyt</Text>
    </View>
  ); 
}


const Tab = createBottomTabNavigator();


export default function MainTabs() {
  const headerForRoute = (route, navigation, back) => {
    return <HeaderForStack navigation={navigation} route={route} back={back} />;
  };

  return (
    <Tab.Navigator
      // 2. KÄYTÄ SUSPENSEA JA LAZY-KOMPONENTTIA
      tabBar={props => (
        <React.Suspense 
          fallback={(
            <View style={{ height: 60, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                <ActivityIndicator size="small" color="#6366f1" />
            </View>
          )}
        >
          <CustomGluestackTabBar {...props} />
        </React.Suspense>
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={MainScreen}
        options={{
          header: ({ route, navigation, back }) => headerForRoute(route, navigation, back),
        }}
      />
      <Tab.Screen
        name="Discussion"
        component={DiscussionScreen}
        options={{
          header: ({ route, navigation, back }) => headerForRoute(route, navigation, back),
        }}
      />
      <Tab.Screen
        name="Polls"
        component={PollsScreen}
        options={{
          header: ({ route, navigation, back }) => headerForRoute(route, navigation, back),
        }}
      />
    </Tab.Navigator>
  );
}