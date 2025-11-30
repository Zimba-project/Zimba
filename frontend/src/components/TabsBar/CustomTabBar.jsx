// CustomTabBar.jsx
import React from 'react';
import { Platform } from 'react-native';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <HStack
      className="absolute bottom-0 justify-around items-center w-full px-12 bg-white shadow-xl"
      style={{
        paddingBottom: insets.bottom,
        height: Platform.OS === 'ios' ? 24 + insets.bottom : 45 + insets.bottom,
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
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1, alignItems: 'center' }}
            className="pt-1"
          >
            <VStack className="items-center justify-center">
              <Ionicons
                name={iconName}
                size={28}
                color={isFocused ? '#6366f1' : '#6b7280'}
              />
            </VStack>
          </Pressable>
        );
      })}
    </HStack>
  );
};

export default CustomTabBar;
