// CustomTabBar.jsx
import React from 'react';
import { Platform, View } from 'react-native';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { useNavigation, useTheme } from '@react-navigation/native';
import { HomeIcon, PlusSquare, MessageCircle, } from 'lucide-react-native';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (

    <HStack
      className={`
        absolute bottom-0 justify-around items-center w-full px-12 shadow-xl bg-background-0
        ${Platform.OS === 'ios' ? 'h-24 pb-6' : 'h-16'}
      `}
      style={{ elevation: 15 }}
    >
      {state.routes.map((route, index) => {


        const descriptor = descriptors[route.key];
        if (!descriptor) return null;

        const isFocused = state.index === index;


        let IconComponent;
        if (route.name === 'Main') {
          IconComponent = isFocused ? HomeIcon : HomeIcon;
        } else if (route.name === 'NewPost') {
          IconComponent = PlusSquare;
        } else if (route.name === 'MessagesTab') {
          IconComponent = MessageCircle;
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


        const activeColor = 'text-typography-900';
        const inactiveColor = 'text-typography-500';

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
                className={isFocused ? activeColor : inactiveColor}
              />

            </VStack>
          </Pressable>
        );
      })}
    </HStack>
  );
};

export default CustomTabBar;