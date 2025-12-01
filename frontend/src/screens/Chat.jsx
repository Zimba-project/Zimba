import React, { useState, useEffect } from 'react';
import {
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { useRoute, useNavigation } from '@react-navigation/native';
import ChatHeader from '../components/Chat/ChatHeader';

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { chatWith, avatarUrl } = route.params || {}; // Pass avatarUrl if available
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // simulate fetching chat messages
    setMessages([
      { id: '1', text: 'Hi there!', fromMe: false },
      { id: '2', text: 'Hello!', fromMe: true },
      { id: '3', text: 'How are you doing today?', fromMe: false },
      { id: '4', text: 'I’m good, thanks! Just working on a project.', fromMe: true },
      { id: '5', text: 'That sounds interesting! What project?', fromMe: false },
      { id: '6', text: 'It’s a mobile app for chatting. 🚀', fromMe: true },
      { id: '7', text: 'Nice! Are you using React Native?', fromMe: false },
      { id: '8', text: 'Yes, exactly. Trying to make it look really smooth.', fromMe: true },
      { id: '9', text: 'Cool 😎. Can’t wait to see it!', fromMe: false },
      { id: '10', text: 'I’ll share a demo soon.', fromMe: true },
      { id: '11', text: 'Awesome! By the way, did you grab lunch?', fromMe: false },
      { id: '12', text: 'Not yet. Thinking of ordering something.', fromMe: true },
      { id: '13', text: 'Same here! Maybe pizza? 🍕', fromMe: false },
      { id: '14', text: 'Perfect choice 😋', fromMe: true },
      { id: '15', text: 'Alright, let’s catch up later!', fromMe: false },
      { id: '16', text: 'Sure, talk soon!', fromMe: true },
    ]);
  }, [chatWith]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage = { id: Date.now().toString(), text: input, fromMe: true };
    setMessages([...messages, newMessage]);
    setInput('');

    // TODO: send to backend or websocket
  };

  const renderItem = ({ item }) => (
    <Box style={[styles.messageBubble, item.fromMe ? styles.myMessage : styles.theirMessage]}
      className={item.fromMe ? "bg-primary-600" : "bg-background-100"}>
      <Text className={item.fromMe ? "text-typography-0" : "text-typography-900"}>{item.text}</Text>
    </Box>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      className="bg-background-0"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* HEADER */}
      <ChatHeader navigation={navigation} chatWith={chatWith} avatarUrl={avatarUrl} />

      {/* CHAT MESSAGES */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
      // inverted
      />

      {/* MESSAGE INPUT */}
      <Box
        style={[styles.inputContainer, { paddingBottom: 10 + insets.bottom }]}
        className="border-t border-outline-200 bg-background-0"
      >
        <Box className="flex-1 border border-outline-200 rounded-full bg-background-50">
          <TextInput
            value={input}
            onChangeText={setInput}
            className="px-4 py-2 text-typography-900"
            placeholder="Type a message..."
            placeholderTextColor="#9ca3af"
          />
        </Box>
        <Pressable onPress={sendMessage} style={styles.sendBtn}>
          <Text className="text-primary-600 font-semibold">Send</Text>
        </Pressable>
      </Box>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageBubble: { padding: 10, borderRadius: 12, marginBottom: 8, maxWidth: '70%' },
  myMessage: { alignSelf: 'flex-end' },
  theirMessage: { alignSelf: 'flex-start' },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  sendBtn: { justifyContent: 'center', paddingHorizontal: 16 },
});
