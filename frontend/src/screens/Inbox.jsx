import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getInitials } from '../utils/GetInitials';
import useCurrentUser from '../utils/GetUser';

const dummyConversations = [
  { id: '1', name: 'Alice Anderson', lastMessage: 'Hey! How are you?' },
  { id: '2', name: 'Bob Brown', lastMessage: 'Did you see the new post?' },
  { id: '3', name: 'Charlie Clark', lastMessage: 'Let’s catch up tomorrow!' },
];

export default function InboxScreen() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(true);   // ⬅️ NEW
  const { user, loading: userLoading } = useCurrentUser();

  useEffect(() => {
    // simulate fetch delay
    const timer = setTimeout(() => {
      setConversations(dummyConversations);
      setInboxLoading(false);              // ⬅️ loading finished
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.row}
      className="border-b border-outline-200"
      onPress={() => navigation.navigate('Chat', { chatWith: item.name })}
    >
      <Box style={styles.avatar} className="bg-primary-600">
        <Text className="text-typography-0 font-bold">{getInitials(item.name)}</Text>
      </Box>

      <Box style={styles.messageContent}>
        <Text className="text-base text-typography-900 font-semibold">{item.name}</Text>
        <Text className="text-typography-700 mt-0.5" numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </Box>

      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
    </Pressable>
  );

  // User loading
  if (userLoading) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center">
        <ActivityIndicator size="large" />
      </Box>
    );
  }

  // No user logged in
  if (!user) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center p-5">
        <Text className="text-base text-typography-700 text-center mb-2.5">
          You need to be logged in to see your messages.
        </Text>
      </Box>
    );
  }

  // Conversations loading
  if (inboxLoading) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="text-typography-700 mt-2.5">Loading your inbox...</Text>
      </Box>
    );
  }

  // If loaded but empty
  if (conversations.length === 0) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center p-5">
        <Text className="text-base text-typography-700 text-center mb-2.5">No messages yet</Text>
      </Box>
    );
  }

  // Loaded + has conversations
  return (
    <Box className="flex-1 bg-background-0">
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  messageContent: { flex: 1 },
});
