// CustomTabBar.jsx
import React from 'react';
import { Platform, View } from 'react-native';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { HomeIcon, PlusSquare, User, } from 'lucide-react-native'; 

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#111827' : '#ffffff';
  const activeColor = isDark ? '#fff' : '#000';
  const inactiveColor = isDark ? '#a1a1aa' : '#6b7280';

  return (
    <HStack
      className={`absolute bottom-0 justify-around items-center w-full px-12 shadow-xl ${Platform.OS === 'ios' ? 'h-24 pb-6' : 'h-16'}`}
      style={{ elevation: 15, backgroundColor }}
    >
      {state.routes.map((route, index) => {
        const descriptor = descriptors[route.key];
        if (!descriptor) return null;

        const isFocused = state.index === index;

        let IconComponent;
        if (route.name === 'Main') {
          IconComponent = HomeIcon;
        } else if (route.name === 'NewPost') {
          IconComponent = PlusSquare;
        } else if (route.name === 'Profile') {
          IconComponent = User;
        } else {
          return null;
        }

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

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center' }}
            className="pt-1"
          >
            <VStack className="items-center justify-center">
              <Icon
                as={IconComponent}
                size="2xl"
                color={isFocused ? activeColor : inactiveColor}
              />
            </VStack>
          </Pressable>
        );
      })}
    </HStack>
  );
};

export default CustomTabBar;