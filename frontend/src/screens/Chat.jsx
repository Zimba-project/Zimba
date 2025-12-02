import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
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
    <View
      style={[
        styles.messageBubble,
        item.fromMe
          ? { backgroundColor: t.accent, alignSelf: 'flex-end' }
          : { backgroundColor: t.cardBackground, alignSelf: 'flex-start' },
      ]}
    >
      <Text style={{ color: item.fromMe ? '#fff' : t.text }}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Custom Header */}
          <ChatHeader navigation={navigation} chatWith={chatWith} avatarUrl={avatarUrl} />

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 70 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Input */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: t.cardBackground,
                borderColor: t.secondaryText,
                paddingBottom: insets.bottom,
              },
            ]}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              style={[styles.input, { borderColor: t.secondaryText, color: t.text }]}
              placeholder="Type a message..."
              placeholderTextColor={t.secondaryText}
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
              <Text style={[styles.sendText, { color: t.accent }]}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  sendBtn: { justifyContent: 'center', paddingHorizontal: 16 },
  sendText: { fontWeight: '600' },
});
