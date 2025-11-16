import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
import MainScreen from './screens/MainScreen';
import Login from './screens/Login';
import Register from './screens/Register';
import Profile from './screens/Profile';
import Discuss from './screens/Discuss';
import Sidebar from './navigation/Sidebar';
import { HeaderForStack } from './navigation/TopBar';

import { GluestackUIProvider } from '@gluestack-ui/themed';
import '@/global.css';

// navigation ref so headers/components can dispatch drawer actions
export const navigationRef = createNavigationContainerRef();

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GluestackUIProvider>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator>
            <Stack.Screen name="Main"
              component={Sidebar}
              options={{
                title: 'ZIMBA',
                header: (props) => <HeaderForStack {...props} />,
              }}
              />
          <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Discuss" component={Discuss} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}

