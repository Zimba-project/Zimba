import React, { useState, useEffect, Suspense } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';

const Login = React.lazy(() => import('./screens/Login'));
const Register = React.lazy(() => import('./screens/Register'));
const Profile = React.lazy(() => import('./screens/Profile'));
const Discuss = React.lazy(() => import('./screens/Discuss'));
const Poll = React.lazy(() => import('./screens/Poll'));
const Search = React.lazy(() => import('./screens/Search'));
const Inbox = React.lazy(() => import('./screens/Inbox'));
const Chat = React.lazy(() => import('./screens/Chat'));
const Welcome = React.lazy(() => import('./screens/Welcome'));
const Splash = React.lazy(() => import('./screens/SplashScreen'));

import Sidebar from './navigation/Sidebar';
import { HeaderForStack } from './navigation/TopBar';
import useInitialRoute from './utils/InitialRoute';
import * as NavigationBar from 'expo-navigation-bar';
import { config } from '@/components/ui/gluestack-ui-provider/config';
import { ThemeProvider, useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from './utils/theme';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

import '@/global.css';

export const navigationRef = createNavigationContainerRef();
const Stack = createNativeStackNavigator();

const RootApp = () => {
  const { theme } = useTheme();
  const t = getTheme(theme);
  const [ready, setReady] = useState(false);
  const initialRoute = useInitialRoute();

  useEffect(() => {
    NavigationBar.setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark');
  }, [theme]);

  useEffect(() => {
    const boot = async () => {
      if (initialRoute) {
        setReady(true);
      }
    };
    boot();
  }, [initialRoute]);

  if (!initialRoute || !ready) {
    return (
      <Suspense fallback={null}>
        <Splash onFinish={() => setReady(true)} />
      </Suspense>
    );
  }

  const linking = {
  prefixes: ["zimbapp://"],
  config: {
    screens: {
      Welcome: "welcome",
      Main: "main",
      Login: "login",
      Register: "register",
      Profile: "profile/:id",
      Discuss: "discuss/:id",
      Poll: "post/:id",
      Search: "search",
      Inbox: "inbox",
      Chat: "chat/:id",
    },
  },
};


  return (
    <GluestackUIProvider config={config} colorMode={theme}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} linking={linking}>
          <Suspense fallback={<Splash />}>
            <Stack.Navigator initialRouteName={initialRoute}screenOptions={{header: (props) => <HeaderForStack {...props} />,}}>
              <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
              <Stack.Screen name="Main" component={Sidebar} options={{ title: 'ZIMBA', headerBackVisible: false }}/>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Register" component={Register} />
              <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
              <Stack.Screen name="Discuss" component={Discuss} />
              <Stack.Screen name="Poll" component={Poll} />
              <Stack.Screen name="Search" component={Search} />
              <Stack.Screen name="Inbox" component={Inbox} />
              <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
            </Stack.Navigator>
          </Suspense>
        </NavigationContainer>
        <StatusBar barStyle={t.statusBarStyle} backgroundColor={t.background} />
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <RootApp />
    </ThemeProvider>
  );
}
