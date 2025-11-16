import React, { useState } from 'react';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { VStack, HStack, Pressable, Text, Divider } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { TOPIC_COLORS } from '../utils/TopicColors';

export default function CustomDrawerContentGluestack({ navigation }) {
  const topics = Object.keys(TOPIC_COLORS || {});
  const [topicsOpen, setTopicsOpen] = useState(false);

  const handleTopicsPress = () => {
    console.log('Topics pressed, toggling from:', topicsOpen);
    setTopicsOpen(!topicsOpen);
  };

  return (
    <DrawerContentScrollView>
      <VStack space="lg" p="$4">
        <Text size="lg" bold>
          Menu
        </Text>

        <Pressable onPress={handleTopicsPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <HStack space="sm" justifyContent="space-between" alignItems="center" w="$full">
            <HStack space="sm" alignItems="center">
              <Ionicons name="list-outline" size={20} color="#374151" />
              <Text bold>Topics</Text>
            </HStack>
            <Ionicons
              name={topicsOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#6b7280"
            />
          </HStack>
        </Pressable>

        {topicsOpen && (
          <VStack space="sm" pl="$4">
            {topics.map((topic) => (
              <Pressable
                key={topic}
                onPress={() => {
                  console.log('Topic pressed:', topic);
                  navigation.closeDrawer?.();
                  navigation.navigate('Root', { screen: 'Home', params: { topic } });
                }}
              >
                <Text size="sm" color="$gray600">
                  {topic}
                </Text>
              </Pressable>
            ))}
          </VStack>
        )}

        <Divider />

        <Pressable onPress={() => navigation.navigate('Language')}>
          <HStack space="sm" alignItems="center">
            <Ionicons name="language-outline" size={20} color="#374151" />
            <Text bold>Language</Text>
          </HStack>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Darkmode')}>
          <HStack space="sm" alignItems="center">
            <Ionicons name="moon-outline" size={20} color="#374151" />
            <Text bold>Dark Mode</Text>
          </HStack>
        </Pressable>
      </VStack>
    </DrawerContentScrollView>
  );
}
