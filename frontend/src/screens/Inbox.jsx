import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getInitials } from '../utils/GetInitials';
import useCurrentUser from '../utils/GetUser';

const dummyConversations = [
  { id: '1', name: 'Alice Anderson', lastMessage: 'Hey! How are you?' },
  { id: '2', name: 'Bob Brown', lastMessage: 'Did you see the new post?' },
  { id: '3', name: 'Charlie Clark', lastMessage: 'Let’s catch up tomorrow!' },
];

export default function InboxScreen({ navigation }) {
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
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('Chat', { chatWith: item.name })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>

      <View style={styles.messageContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
    </TouchableOpacity>
  );

  // User loading
  if (userLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // No user logged in
  if (!user) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>You need to be logged in to see your messages.</Text>
      </View>
    );
  }

  // Conversations loading
  if (inboxLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 10, color: '#6b7280' }}>Loading your inbox...</Text>
      </View>
    );
  }

  // If loaded but empty
  if (conversations.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No messages yet</Text>
      </View>
    );
  }

  // Loaded + has conversations
  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: '700' },
  messageContent: { flex: 1 },
  name: { fontWeight: '600', fontSize: 16, color: '#111827' },
  lastMessage: { color: '#6b7280', marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#6b7280', fontSize: 16, textAlign: 'center', marginBottom: 10 },
});
