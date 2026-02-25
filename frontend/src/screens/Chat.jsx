import React, { useState, useRef, useEffect } from 'react';
import {
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import ChatHeader from '../components/Chat/ChatHeader';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { fetchChatAnswer } from '../api/ai';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen({ route, navigation }) {
  const { chatWith = 'Chat', avatarUrl = null, initialMessage, autoSend = false } =
    route.params || {};
  const { theme } = useTheme();
  const t = getTheme(theme);
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);
  const initialMessageSent = useRef(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const canSend = input.trim().length > 0;

  useEffect(() => {
    if (initialMessage) {
      setMessages([]);
      setInput(initialMessage);
      initialMessageSent.current = false;
      return;
    }

    setMessages([
      { id: '1', text: 'Hi there!', fromMe: false },
      { id: '2', text: 'Hello!', fromMe: true },
      { id: '3', text: 'How are you doing today?', fromMe: false },
    ]);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 50);
  }, [chatWith, initialMessage]);

  const sendMessageText = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now().toString(), text: trimmed, fromMe: true };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponse = await fetchChatAnswer(trimmed, route.params.context);
      if (aiResponse) {
        const aiMsg = { id: (Date.now() + 1).toString(), text: aiResponse, fromMe: false };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Error fetching chat answer:', err);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  };

  useEffect(() => {
    if (!initialMessage || !autoSend || initialMessageSent.current) return;
    sendMessageText(initialMessage);
    initialMessageSent.current = true;
  }, [autoSend, initialMessage]);

  const renderItem = ({ item }) => (
    <Box
      style={[
        styles.messageBubble,
        item.fromMe
          ? { backgroundColor: t.accent, alignSelf: 'flex-end' }
          : { backgroundColor: t.cardBackground, alignSelf: 'flex-start' },
      ]}
    >
      <Text style={{ color: item.fromMe ? '#fff' : t.text }}>{item.text}</Text>
    </Box>
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: t.background }}>
      <ChatHeader navigation={navigation} chatWith={chatWith} avatarUrl={avatarUrl} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
          contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
          style={{ flex: 1 }}
        />

        <Box style={[styles.inputContainer, { backgroundColor: t.cardBackground }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={t.secondaryText}
            style={[
              styles.input,
              { borderColor: t.secondaryText, color: t.text, maxHeight: 120 },
            ]}
            multiline
          />
          <TouchableOpacity
            onPress={() => canSend && sendMessageText(input)}
            style={styles.sendBtn}
          >
            <Text style={[styles.sendText, { color: t.accent }]}>Send</Text>
          </TouchableOpacity>
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageBubble: { padding: 10, borderRadius: 12, marginBottom: 8, maxWidth: '70%' },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 10, android: 6 }),
    minHeight: 44,
  },
  sendBtn: { justifyContent: 'center', alignItems: 'center', minHeight: 44, paddingHorizontal: 16 },
  sendText: { fontWeight: '600' },
});