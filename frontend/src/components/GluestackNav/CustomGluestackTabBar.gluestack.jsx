import React from 'react';
import { VStack, HStack, Pressable, Text, Box } from '@gluestack-ui/themed';
import { HomeIcon, MessageCircleIcon, BarChartIcon } from 'lucide-react-native';
import { StyledProvider } from '@gluestack-style/react';

export default function CustomGluestackTabBar({ state, descriptors, navigation }) {
  return (
    <Box bg="$white" py="$2" borderTopWidth={0}>
      <HStack space="md" px="$0">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

          return (
            <Pressable key={route.key} flex={1} onPress={onPress} onLongPress={onLongPress} alignItems="center" justifyContent="center" py="$3" position="relative">
              <VStack alignItems="center" space="xs">
                {getIcon(route.name, isFocused ? '#6366f1' : '#9ca3af')}
                <Text size="xs" bold={isFocused} color={isFocused ? '$indigo500' : '$gray400'}>
                  {label}
                </Text>
              </VStack>
              {isFocused && <Box position="absolute" top="$2" width="$6" h="$1" bg="$indigo500" rounded="$full" />}
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
}

function getIcon(routeName, color) {
  const size = 20;
  switch (routeName) {
    case 'Home':
      return <HomeIcon color={color} size={size} />;
    case 'Discussion':
      return <MessageCircleIcon color={color} size={size} />;
    case 'Polls':
      return <BarChartIcon color={color} size={size} />;
    default:
      return null;
  }
}
