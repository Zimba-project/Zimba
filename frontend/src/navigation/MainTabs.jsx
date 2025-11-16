import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { default as HeaderForStack } from './TopBar';

// Gluestack-UI komponentit
// Olettaen, että nämä on tuotu gluestack-ui-paketista, esim. 
// import { Box, Center, Icon, Text } from '@gluestack/design-system';
// (Tarkista omat tuontipolusi!)
import { Box, Center, Icon, Text, Pressable } from '@gluestack-ui/themed';

// Ionicons-kuvakkeet, tuodaan edelleen, mutta käytetään gluestack-Iconin sisällä
import { 
  HomeIcon, 
  MessageCircleIcon, 
  BarChartIcon
} from 'lucide-react-native';; 

// Huom: gluestack-ui suosittelee yleensä lucide-react-native -kuvakkeita Ioniconsin sijaan.
// Muutin kuvakkeet vastaamaan lucidea, voit muuttaa ne takaisin Ioniconsiin, 
// jos haluat käyttää sitä gluestackin Icon-komponentin kanssa.

// Tänne kaikki näytöt sitten / All screens go here: 
import MainScreen from '../screens/MainScreen';


// Placeholder-screenit (voi korvata oikeilla, kunha vaa näyttää jotain)
function DiscussionScreen() { return <Center flex={1}><Text>Keskustelu</Text></Center>; }
function PollsScreen() { return <Center flex={1}><Text>Kyselyt</Text></Center>; }


const Tab = createBottomTabNavigator();

// --- UUSI: Mukautettu Tab-Baari gluestack-tyylillä ---
const CustomTabBar = ({ state, descriptors, navigation }) => {
  // Theme token fallbacks gluestackin mukaisesti
  const primary = '$indigo500'; // gluestack-tyylinen viittaus
  const textMuted = '$gray500';
  const bg = '$white'; // Käytetään valkoista taustaa tyylikkään varjon kanssa
  
  // Mappaus reitin nimestä kuvakkeeseen (lucide-react-native)
  const getIcon = (routeName, isFocused) => {
    const color = isFocused ? primary : textMuted;
    
    switch (routeName) {
      case 'Home':
        return <Icon as={HomeIcon} size="lg" color={color} />;
      case 'Discussion':
        return <Icon as={MessageCircleIcon} size="lg" color={color} />;
      case 'Polls':
        // Jos BarChartIconia ei ole, voit käyttää mitä tahansa tuotua Iconia
        // Täytyy tuoda BarChartIcon lucide-react-native:sta:
        return <Icon as={BarChartIcon} size="lg" color={color} />; 
      default:
        return null;
    }
  };

  return (
    // Box-komponentti taustalle ja varjolle
    <Box
      flexDirection="row"
      bg={bg}
      // Tyylikäs varjo
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8, // Android-varjo
        borderTopWidth: 0, // Poistaa reaktiivisena oletusreunan
      }}
      p="$2" // Pieni padding
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          // Pressable gluestack-tyylillä
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1 }}
          >
            <Center py="$1">
              {/* Kuvake */}
              {getIcon(route.name, isFocused)}
              
              {/* Teksti */}
              <Text 
                size="xs" 
                color={isFocused ? primary : textMuted} 
                mt="$1"
                fontWeight={isFocused ? '$bold' : '$normal'}
              >
                {label}
              </Text>
              
              {/* Aktiivisen tabin korostus (esim. pieni alaviiva) */}
              {isFocused && (
                <Box
                  position="absolute"
                  top={0}
                  w="$1/2" // 50% leveys
                  h="$0.5" // 2px korkeus
                  bg={primary}
                  borderRadius="$full"
                />
              )}

            </Center>
          </Pressable>
        );
      })}
    </Box>
  );
};
// --- UUSI LOPPUU ---

export default function MainTabs() {
  const headerForRoute = (route, navigation, back) => {
    // Use the centralized HeaderForStack from navigation/TopBar
    return <HeaderForStack navigation={navigation} route={route} back={back} />;
  };

  return (
    <Tab.Navigator
      // Kutsutaan custom-tabBar-komponenttia
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Tab.Screenin propseja ei tarvitse muuttaa */}
      <Tab.Screen name="Home" component={MainScreen} />
      <Tab.Screen name="Discussion" component={DiscussionScreen} />
      <Tab.Screen name="Polls" component={PollsScreen} />

    </Tab.Navigator>
  );
}