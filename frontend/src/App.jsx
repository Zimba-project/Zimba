import { StatusBar } from 'expo-status-bar';
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
import Poll from './screens/Poll';
import Search from './screens/Search';
import { HeaderForStack } from './navigation/TopBar';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { useColorMode } from '@gluestack-style/react';

// navigation ref so headers/components can dispatch drawer actions
export const navigationRef = createNavigationContainerRef();

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GluestackUIProvider>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            screenOptions={{ header: (props) => <HeaderForStack {...props} /> }}
          >
            <Stack.Screen name="Main" component={Sidebar} options={{ title: 'ZIMBA' }} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Discuss" component={Discuss} />
            <Stack.Screen name="Poll" component={Poll} />
            <Stack.Screen name="Search" component={Search} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}

