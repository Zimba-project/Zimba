import React, { useState, useEffect } from 'react'; 
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { getInitials } from '../utils/GetInitials'; 
import useCurrentUser from '../utils/GetUser';

import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';

const dummyConversations = [ { id: '1', name: 'Alice Anderson', lastMessage: 'Hey! How are you?' }, { id: '2', name: 'Bob Brown', lastMessage: 'Did you see the new post?' }, { id: '3', name: 'Charlie Clark', lastMessage: 'Let’s catch up tomorrow!' }, ];

export default function InboxScreen({ navigation }) {
  const { theme } = useTheme();
  const t = getTheme(theme);

  const [conversations, setConversations] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(true);
  const { user, loading: userLoading } = useCurrentUser();

  useEffect(() => { 
    const timer = setTimeout(() => { 
      setConversations(dummyConversations); 
      setInboxLoading(false); 
    }, 1000); 
    return () => clearTimeout(timer); 
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: t.rowBackground, borderBottomColor: t.rowBorder }]}
      onPress={() => navigation.navigate('Chat', { chatWith: item.name })}
    >
      <View style={[styles.avatar, { backgroundColor: t.avatarBackground }]}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>

      <View style={styles.messageContent}>
        <Text style={[styles.name, { color: t.text }]}>{item.name}</Text>
        <Text style={[styles.lastMessage, { color: t.secondaryText }]} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={t.secondaryText} />
    </TouchableOpacity>
  );

  if (userLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.empty, { backgroundColor: t.emptyBackground }]}>
        <Text style={[styles.emptyText, { color: t.secondaryText }]}>
          You need to be logged in to see your messages.
        </Text>
      </View>
    );
  }

  if (inboxLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={{ marginTop: 10, color: t.secondaryText }}>Loading your inbox...</Text>
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: t.emptyBackground }]}>
        <Text style={[styles.emptyText, { color: t.secondaryText }]}>No messages yet</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
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
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: '700' },
  messageContent: { flex: 1 },
  name: { fontWeight: '600', fontSize: 16 },
  lastMessage: { marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, textAlign: 'center', marginBottom: 10 },
});