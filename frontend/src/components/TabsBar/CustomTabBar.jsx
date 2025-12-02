// CustomTabBar.jsx
import React from 'react';
import { Platform } from 'react-native';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomTabBar = ({ state, navigation, theme }) => {
  const insets = useSafeAreaInsets();

    return (
    <HStack
      style={{
        paddingBottom: insets.bottom,
        height: Platform.OS === 'ios' ? 24 + insets.bottom : 45 + insets.bottom,
        backgroundColor: theme.background, // <-- dynamic
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        let iconName;
        if (route.name === 'Main') iconName = isFocused ? 'home' : 'home-outline';
        else if (route.name === 'NewPost') iconName = isFocused ? 'add-circle' : 'add-circle-outline';
        else if (route.name === 'Inbox') iconName = isFocused ? 'mail' : 'mail-outline';
        else if (route.name === 'Profile') iconName = isFocused ? 'person' : 'person-outline';
        else return null;

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{ flex: 1, alignItems: 'center', paddingTop: 5 }}
          >
            <VStack className="items-center justify-center">
              <Ionicons
                name={iconName}
                size={28}
                color={isFocused ? theme.accent : theme.secondaryText} // <-- dynamic
              />
            </VStack>
          </Pressable>
        );
      })}
    </HStack>
  );
};

export default CustomTabBar;
