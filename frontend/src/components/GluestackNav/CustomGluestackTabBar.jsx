// components/GluestackNav/CustomGluestackTabBar.jsx

import React from 'react';
import { StyleSheet, View } from 'react-native'; 
import { DrawerActions } from '@react-navigation/native';

// TÄRKEÄÄ: Require() on pakko käyttää komponentin sisällä!
// Tämä antaa Gluestack-ui:lle viimeisen mahdollisuuden alustaa.

export default function CustomGluestackTabBar({ state, descriptors, navigation }) {
  
  // REQUIRE() KAIKILLE GLUESTACK-KOMPONENTEILLE:
  const { 
    Box, 
    Center, 
    Icon, 
    Text, 
    Pressable,
    HStack,
    VStack
  } = require('@gluestack-ui/themed'); 
  const { 
    HomeIcon, 
    MessageCircleIcon, 
    BarChartIcon 
  } = require('lucide-react-native'); 

  // Theme token fallbacks gluestackin mukaisesti
  const primary = '$indigo500'; 
  const textMuted = '$gray500';
  const bg = '$white'; 
  
  // Mappaus reitin nimestä kuvakkeeseen (lucide-react-native)
  const getIcon = (routeName, isFocused) => {
    const color = isFocused ? primary : textMuted;
    
    switch (routeName) {
      case 'Home':
        return <Icon as={HomeIcon} size="lg" color={color} />;
      case 'Discussion':
        return <Icon as={MessageCircleIcon} size="lg" color={color} />;
      case 'Polls':
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
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8, 
        borderTopWidth: 0, 
      }}
      p="$2" 
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
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
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
              
              {/* Aktiivisen tabin korostus */}
              {isFocused && (
                <Box
                  position="absolute"
                  top={0}
                  w="$1/2" 
                  h="$0.5" 
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