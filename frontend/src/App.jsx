import React, { useState, useEffect} from 'react';
import { StatusBar } from 'react-native';
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
import Inbox from './screens/Inbox';
import Chat from './screens/Chat';
import Welcome from './screens/Welcome';
import Splash from './screens/SplashScreen';
import { HeaderForStack } from './navigation/TopBar';
import useInitialRoute from './utils/InitialRoute';
import * as NavigationBar from 'expo-navigation-bar';
import { config } from '@/components/ui/gluestack-ui-provider/config'; 
import { ThemeProvider, useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from './utils/theme';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { loadSavedLanguage } from './utils/lang'

export const navigationRef = createNavigationContainerRef();
const Stack = createNativeStackNavigator();

const RootApp = () => {
  const { theme } = useTheme();
  const t = getTheme(theme);
  const [ready, setReady] = useState(false);
  const initialRoute = useInitialRoute();

  useEffect( ()=>
    {
      async function fetchData() {
        await loadSavedLanguage();
      }
  fetchData();
    },[]);

  useEffect(() => {
    NavigationBar.setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark');
  }, [theme]);

  if (!initialRoute || !ready) {
    return <Splash onFinish={() => setReady(true)} />;
  }
  
  return (
   <GluestackUIProvider config={config} colorMode={theme}> 
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ header: (props) => <HeaderForStack {...props} /> }}>
          <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={Sidebar} options={{ title: 'ZIMBA', headerBackVisible: false }} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
          <Stack.Screen name="Discuss" component={Discuss} />
          <Stack.Screen name="Poll" component={Poll} />
          <Stack.Screen name="Search" component={Search} />
          <Stack.Screen name="Inbox" component={Inbox} />
          <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar barStyle={t.statusBarStyle} backgroundColor={t.background} />
    </SafeAreaProvider>
  </GluestackUIProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RootApp />
    </ThemeProvider>
  );
}
