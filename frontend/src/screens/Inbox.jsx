import React, { useState, useEffect } from 'react'; 
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { getInitials } from '../utils/GetInitials'; 
import useCurrentUser from '../utils/GetUser';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';

const dummyConversations = [
  {
    id: '1',
    name: 'Nokia',
    lastMessage: 'We have a new device launch coming soon!',
    avatarUrl: 'https://oulu.com/ictoulu/wp-content/uploads/2022/06/nokia_logo.jpg',
    verified: true,
  },
  {
    id: '2',
    name: 'Matti Vanhanen',
    lastMessage: 'Shall we schedule a meeting next week?',
    avatarUrl: 'https://images.sanoma-sndp.fi/59984293bbf9bbf064d42dc0f8c3d81f/normal/658.avif',
    verified: true,
  },
  {
    id: '3',
    name: 'Liike Nyt',
    lastMessage: 'Join our upcoming event in Helsinki!',
    avatarUrl: 'https://images.squarespace-cdn.com/content/v1/62ea267df0374c0e9a9a47ff/91a17c9b-f9d1-4f64-b15d-5aff60c7402a/liikenyt_logo.png',
    verified: true,
  },
    {
    id: '4',
    name: 'Zimba',
    lastMessage: 'Did you know we peronalize your feed that interests you!',
    avatarUrl: 'https://i.imgur.com/ttazXQd.jpeg',
    verified: true,
    bot: true,
  },
];

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
      onPress={() => navigation.navigate('Chat', { chatWith: item.name, avatarUrl: item.avatarUrl })}
    >
      <View style={[styles.avatar, { backgroundColor: t.avatarBackground }]}>
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        )}
      </View>

      <View style={styles.messageContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.name, { color: t.text }]}>{item.name}</Text>
          {item.verified && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color="#1DA1F2"
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
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
