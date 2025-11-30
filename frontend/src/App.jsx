import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ThemeProvider, useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import '@/global.css';

import MainScreen from './screens/MainScreen';
import Login from './screens/Login';
import Register from './screens/Register';
import Profile from './screens/Profile';
import Discuss from './screens/Discuss';
import Sidebar from './navigation/Sidebar';
import Poll from './screens/Poll';
import Search from './screens/Search';
import Inbox from './screens/Inbox';
import Chat from './screens/Chat';
import Welcome from './screens/Welcome';
import Splash from './screens/SplashScreen';
import { HeaderForStack } from './navigation/TopBar';
import useInitialRoute from './utils/InitialRoute';

export const navigationRef = createNavigationContainerRef();
const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);
  const initialRoute = useInitialRoute();

  if (!initialRoute || !ready) {
    return <Splash onFinish={() => setReady(true)} />;
  }

  return (
    <ThemeProvider>
      <InnerApp />
    </ThemeProvider>
  );
}

function InnerApp() {
  const initialRoute = useInitialRoute();
  const { theme } = useTheme();

  return (
    <GluestackUIProvider mode={theme}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ header: (props) => <HeaderForStack {...props} /> }}
          >
            <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
            <Stack.Screen name="Main" component={Sidebar} options={{ title: 'ZIMBA', headerBackVisible: false }} />
            <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
            <Stack.Screen name="Register" component={Register} options={{ title: 'Register' }} />
            <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
            <Stack.Screen name="Discuss" component={Discuss} />
            <Stack.Screen name="Poll" component={Poll} />
            <Stack.Screen name="Search" component={Search} />
            <Stack.Screen name="Inbox" component={Inbox} />
            <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}