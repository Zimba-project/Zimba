import React, { useState } from 'react';
import { TextInput, StyleSheet, ActivityIndicator, Alert, LayoutAnimation, Platform, UIManager, Image, ScrollView, Modal, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createPost, getAllPosts } from '../api/postService';
import { DatePickerModal } from '@/src/components/DatePicker/DatePickerModal.jsx';
import useCurrentUser from '../utils/GetUser';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { TOPIC_COLORS } from '../utils/TopicColors';
import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function CreatePostScreen({ navigation, route }) {
  const [type, setType] = useState('discussion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [image, setImage] = useState('');
  const [endTime, setEndTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Multi-question poll state
  const [questions, setQuestions] = useState([
    { id: 1, text: '', options: [{ id: 1, text: '' }, { id: 2, text: '' }], allowMultiple: false },
  ]);

  const { user, loading: userLoading, getUserId } = useCurrentUser(route);
  const { theme } = useTheme();
  const t = getTheme(theme);

  const handleTypeToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setType(prev => (prev === 'discussion' ? 'poll' : 'discussion'));
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your media library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Multi-question poll functions
  const addQuestion = () => {
    const newId = questions.length ? Math.max(...questions.map(q => q.id)) + 1 : 1;
    setQuestions([...questions, { id: newId, text: '', options: [{ id: 1, text: '' }, { id: 2, text: '' }], allowMultiple: false }]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestionText = (id, text) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const addOptionToQuestion = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptionId = q.options.length ? Math.max(...q.options.map(o => o.id)) + 1 : 1;
        return { ...q, options: [...q.options, { id: newOptionId, text: '' }] };
      }
      return q;
    }));
  };

  const removeOptionFromQuestion = (questionId, optionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: q.options.filter(o => o.id !== optionId) };
      }
      return q;
    }));
  };

  const updateOptionText = (questionId, optionId, text) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: q.options.map(o => o.id === optionId ? { ...o, text } : o) };
      }
      return q;
    }));
  };

  const uploadImage = async (imageUri) => {
    if (!imageUri) return null;
    try {
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('file', { uri: imageUri, type, name: filename });

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload failed: ${response.status} ${text}`);
      }

      const json = await response.json();
      return json.url;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  };

  const handleSubmit = async () => {
    const userId = user?.id || getUserId();
    if (!userId) {
      Alert.alert('Error', 'No logged-in user found!');
      return;
    }
    if (!title.trim() || !description.trim() || !topic.trim()) {
      Alert.alert('Missing fields', 'Please fill in title, topic and description.');
      return;
    }
    if (type === 'poll' && questions.some(q => !q.text.trim() || q.options.some(o => !o.text.trim()))) {
      Alert.alert('Invalid options', 'Please fill in all poll questions and options.');
      return;
    }

    try {
      setLoading(true);
      let imageUrl = null;
      if (image) imageUrl = await uploadImage(image);

      const data = {
        type,
        topic,
        title,
        description,
        image: imageUrl,
        end_time: type === 'poll' && endTime ? endTime.toISOString() : null,
        author_id: userId,
        options: type === 'poll' ? questions.map(q => ({
          text: q.text,
          allowMultiple: q.allowMultiple,
          options: q.options.map(o => ({ text: o.text }))
        })) : undefined
      };

      const response = await createPost(data);
      const newId = response?.postId;
      let createdPost = null;
      try {
        const all = await getAllPosts();
        createdPost = (all || []).find(p => p.id === newId) || null;
      } catch (e) {
        console.warn('Could not fetch posts to locate the new post:', e?.message);
      }

      Alert.alert('Success', 'Your post has been created successfully!', [
        {
          text: 'View Post',
          onPress: () => {
            if (createdPost) {
              if (createdPost.type === 'poll') navigation.navigate('Poll', { postData: createdPost });
              else navigation.navigate('Discuss', { postData: createdPost });
            } else navigation.navigate('Main');
          }
        }
      ]);

      // Reset form
      setTitle('');
      setDescription('');
      setTopic('');
      setImage('');
      setEndTime(null);
      setQuestions([{ id: 1, text: '', options: [{ id: 1, text: '' }, { id: 2, text: '' }], allowMultiple: false }]);
    } catch (error) {
      console.error('Error creating post:', error.message);
      Alert.alert('Error', error.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={[styles.container, { backgroundColor: t.background, paddingTop: 16 }]}>
      <Text style={[styles.header, { color: t.text }]}>
        Create a {type === 'poll' ? 'Poll' : 'Discussion'}
      </Text>

      <Pressable style={[styles.toggle, { backgroundColor: t.cardBackground, borderColor: t.secondaryText, borderWidth: 1 }]} onPress={handleTypeToggle}>
        <Ionicons name={type === 'poll' ? 'stats-chart' : 'chatbox'} size={20} color={t.accent} />
        <Text style={[styles.toggleText, { color: t.accent, fontWeight: '700' }]}>
          Switch to {type === 'poll' ? 'Discussion' : 'Poll'}
        </Text>
      </Pressable>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 10 }} keyboardShouldPersistTaps="handled">
          <Box style={styles.form}>
            <Text style={[styles.label, { color: t.text }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.inputBackground, borderColor: focusedField === 'title' ? t.accent : t.inputBorder, color: t.text, borderRadius: 8 }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter a title"
              placeholderTextColor={t.secondaryText}
              onFocus={() => setFocusedField('title')}
              onBlur={() => setFocusedField(null)}
            />

            <Text style={[styles.label, { color: t.text }]}>Topic</Text>
            <Pressable
              style={[styles.input, { backgroundColor: t.inputBackground, borderColor: showTopicPicker ? t.accent : t.inputBorder, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
              onPress={() => setShowTopicPicker(true)}
            >
              {topic ? (
                <Text style={{ color: t.text, fontWeight: '600' }}>{topic}</Text>
              ) : (
                <Text style={{ color: t.secondaryText }}>Select topic</Text>
              )}
              <Ionicons name={showTopicPicker ? 'chevron-up' : 'chevron-down'} size={18} color={t.secondaryText} />
            </Pressable>

            {showTopicPicker && (
              <Modal visible transparent animationType="slide" onRequestClose={() => setShowTopicPicker(false)}>
                <Box style={styles.modalOverlay}>
                  <Pressable style={styles.backdrop} onPress={() => setShowTopicPicker(false)} />
                  <Box style={[styles.modalContent, { backgroundColor: t.cardBackground, borderColor: t.secondaryText }]}>
                    <Box style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
                      <Text style={{ color: t.text, fontWeight: '600' }}>Select Topic</Text>
                    </Box>
                    <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
                      {Object.keys(TOPIC_COLORS || {}).map((name) => (
                        <Pressable key={name} style={{ paddingVertical: 10 }} onPress={() => { setTopic(name); setShowTopicPicker(false); }}>
                          <Text style={{ fontSize: 16, color: t.text }}>{name}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                    <Button variant="link" action="primary" onPress={() => setShowTopicPicker(false)} className="items-center" style={{ alignSelf: 'center', marginVertical: 8 }}>
                      <Text style={{ color: t.accent }}>Close</Text>
                    </Button>
                  </Box>
                </Box>
              </Modal>
            )}

            <Text style={[styles.label, { color: t.text }]}>Description</Text>
            <Textarea variant="default" style={{ borderColor: focusedField === 'description' ? t.accent : t.inputBorder, borderWidth: 1, borderRadius: 8, backgroundColor: t.inputBackground, marginBottom: 16 }}>
              <TextareaInput
                value={description}
                onChangeText={setDescription}
                placeholder="Write your post content..."
                placeholderTextColor={t.secondaryText}
                style={{ color: t.text }}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
              />
            </Textarea>

            <Text style={[styles.label, { color: t.text }]}>Image (optional)</Text>
            {image ? (
              <Box style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.preview} />
                <Pressable style={styles.removeOverlay} onPress={() => setImage('')}>
                  <Ionicons name="close-circle" size={18} color={t.error || '#dc2626'} />
                </Pressable>
              </Box>
            ) : (
              <Button
                variant="outline"
                action="secondary"
                onPress={pickImage}
                className="flex-row items-center justify-center h-11"
                style={{ backgroundColor: t.cardBackground, borderRadius: 8, borderColor: t.secondaryText, marginBottom: 16 }}
              >
                <Ionicons name="image" size={20} color={t.accent} />
                <Text style={{ color: t.accent, marginLeft: 8, fontSize: 14, fontWeight: '500' }}>Upload from device</Text>
              </Button>
            )}

            {type === 'poll' && (
              <>
                {/* Date Picker */}
                <Pressable style={[styles.input, { backgroundColor: t.inputBackground, borderColor: t.inputBorder, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]} onPress={() => setShowDatePicker(true)}>
                  <Text style={{ color: endTime ? t.text : t.secondaryText }}>{endTime ? endTime.toLocaleDateString() : 'Select end date'}</Text>
                  <Ionicons name="calendar" size={18} color={t.secondaryText} />
                </Pressable>

                <DatePickerModal
                  visible={showDatePicker}
                  value={endTime}
                  theme={theme}
                  t={t}
                  mode="date"
                  title="Select End Date"
                  minimumDate={new Date()}
                  onConfirm={(date, { close }) => { setEndTime(date); if (close) setShowDatePicker(false); }}
                  onCancel={() => setShowDatePicker(false)}
                />

                {/* Questions */}
                {questions.map((q, qIndex) => (
                  <Box key={q.id} style={{ marginBottom: 24, borderWidth: 1, borderColor: t.inputBorder, borderRadius: 12, padding: 12, backgroundColor: t.cardBackground }}>
                    <HStack style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      {/* Left: Question title */}
                      <Text style={{ color: t.text, fontWeight: '600', fontSize: 16 }}>Question {qIndex + 1}</Text>

                      {/* Right: Multi-choice toggle + Trash */}
                      <HStack style={{ alignItems: 'center', gap: 12 }}>
                        <Pressable 
                          onPress={() => setQuestions(questions.map(qq => qq.id === q.id ? { ...qq, allowMultiple: !qq.allowMultiple } : qq))} 
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                        >
                          <Ionicons name={q.allowMultiple ? 'checkbox' : 'square-outline'} size={22} color={t.accent} />
                          <Text style={{ color: t.accent, fontSize: 14 }}>Allow multiple choices</Text>
                        </Pressable>

                        {questions.length > 1 && (
                          <Pressable onPress={() => removeQuestion(q.id)}>
                            <Ionicons name="trash" size={22} color={t.error || '#dc2626'} />
                          </Pressable>
                        )}
                      </HStack>
                    </HStack>

                    <TextInput
                      style={[styles.input, { backgroundColor: t.inputBackground, borderColor: focusedField === `question_${q.id}` ? t.accent : t.inputBorder, marginBottom: 12 }]}
                      placeholder="Enter question text"
                      placeholderTextColor={t.secondaryText}
                      value={q.text}
                      onChangeText={(text) => updateQuestionText(q.id, text)}
                      onFocus={() => setFocusedField(`question_${q.id}`)}
                      onBlur={() => setFocusedField(null)}
                    />

                    <Text style={{ color: t.text, fontWeight: '500', marginBottom: 6 }}>Options</Text>
                    {q.options.map((opt, oIndex) => (
                      <HStack key={opt.id} style={{ alignItems: 'center', marginBottom: 8, gap: 8 }}>
                        <TextInput
                          style={[styles.input, { flex: 1, backgroundColor: t.inputBackground, borderColor: focusedField === `option_${opt.id}` ? t.accent : t.inputBorder }]}
                          placeholder={`Option ${oIndex + 1}`}
                          placeholderTextColor={t.secondaryText}
                          value={opt.text}
                          onChangeText={(text) => updateOptionText(q.id, opt.id, text)}
                          onFocus={() => setFocusedField(`option_${opt.id}`)}
                          onBlur={() => setFocusedField(null)}
                        />
                        {q.options.length > 2 && (
                          <Pressable onPress={() => removeOptionFromQuestion(q.id, opt.id)}>
                            <Ionicons name="trash" size={22} color={t.error || '#dc2626'} />
                          </Pressable>
                        )}
                      </HStack>
                    ))}
                    <Button variant="link" action="primary" onPress={() => addOptionToQuestion(q.id)} className="flex-row items-center" style={{ marginTop: 4 }}>
                      <Ionicons name="add-circle" size={20} color={t.accent} />
                      <Text style={{ marginLeft: 6, color: t.accent, fontWeight: '500' }}>Add Option</Text>
                    </Button>
                  </Box>
                ))}

                <Button variant="link" action="primary" onPress={addQuestion} className="flex-row items-center" style={{ marginBottom: 16 }}>
                  <Ionicons name="add-circle" size={20} color={t.accent} />
                  <Text style={{ marginLeft: 6, color: t.accent, fontWeight: '500' }}>Add Question</Text>
                </Button>
              </>
            )}

            <Button
              action="primary"
              variant="solid"
              onPress={handleSubmit}
              className="h-11"
              style={{ backgroundColor: t.accent, borderRadius: 8, opacity: (loading || userLoading) ? 0.6 : 1, marginTop: 12 }}
              disabled={loading || userLoading}
            >
              {(loading || userLoading) ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <HStack className="items-center" style={{ gap: 8 }}>
                  <Ionicons name="send" size={20} color="#fff" />
                  <ButtonText>Post</ButtonText>
                </HStack>
              )}
            </Button>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 12, marginTop: Platform.OS === 'ios' ? 6 : 0, lineHeight: 28 },
  toggle: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)', gap: 6 },
  toggleText: { fontSize: 14, fontWeight: '600' },
  form: {},
  label: { fontWeight: '500', fontSize: 14, marginBottom: 6 },
  input: { borderRadius: 8, padding: 12, fontSize: 15, borderWidth: 1, marginBottom: 16 },
  imageWrapper: { position: 'relative', marginBottom: 16 },
  preview: { width: '100%', height: 180, borderRadius: 8 },
  removeOverlay: { position: 'absolute', top: 8, right: 8, borderRadius: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  modalContent: { width: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: 1, paddingBottom: Platform.OS === 'ios' ? 20 : 12 },
});
