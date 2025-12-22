import React, { useState, useRef, useEffect } from 'react';
import { TextInput, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatHeader from '../components/Chat/ChatHeader';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';

export default function ChatScreen({ route, navigation }) {
  const { chatWith, avatarUrl } = route.params;
  const { theme } = useTheme();
  const t = getTheme(theme);
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const canSend = input.trim().length > 0;

  useEffect(() => {
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
    // One-time scroll to bottom on initial load
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 50);
  }, [chatWith]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage = { id: Date.now().toString(), text: input, fromMe: true };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

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
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: t.background }}>
      {/* Custom Header outside KAV to avoid extra offset */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: t.background }}>
        <ChatHeader navigation={navigation} chatWith={chatWith} avatarUrl={avatarUrl} />
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
          showsVerticalScrollIndicator
          contentInsetAdjustmentBehavior={undefined}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
        />

        {/* Input */}
        <Box
          style={[
            styles.inputContainer,
            {
              backgroundColor: t.cardBackground,
              borderColor: t.secondaryText,
              paddingBottom: 8,
            },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            style={[
              styles.input,
              {
                borderColor: t.secondaryText,
                color: t.text,
                paddingVertical: Platform.select({ ios: 10, android: 6 }),
                minHeight: Platform.select({ ios: 44, android: 44 }),
                maxHeight: 120,
                textAlignVertical: Platform.select({ android: 'top' }),
              },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={t.secondaryText}
            multiline
            blurOnSubmit={false}
            returnKeyType="send"
            onSubmitEditing={() => canSend && sendMessage()}
          />
          <Pressable onPress={sendMessage} disabled={!canSend} style={[styles.sendBtn, !canSend && { opacity: 0.5 }]}>
            <Text style={[styles.sendText, { color: t.accent }]}>Send</Text>
          </Pressable>
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
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  sendBtn: { justifyContent: 'center', alignItems: 'center', minHeight: 44, paddingHorizontal: 16 },
  sendText: { fontWeight: '600' },
});
