import React, { useState } from 'react';
import {
  View, TextInput, StyleSheet,
  ActivityIndicator, Alert, LayoutAnimation, Platform, UIManager, Image, ScrollView, Pressable, Modal, TouchableOpacity, KeyboardAvoidingView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createPost } from '../api/postService';
import { DatePickerModal } from '@/src/components/DatePicker/DatePickerModal.jsx';
import useCurrentUser from '../utils/GetUser';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { TOPIC_COLORS } from '../utils/TopicColors';

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
  const [options, setOptions] = useState([{ id: 1, text: '' }, { id: 2, text: '' }]);
  const [focusedField, setFocusedField] = useState(null);

  const { user, loading: userLoading, getUserId } = useCurrentUser(route);

  const { theme } = useTheme();
  const t = getTheme(theme);
  const insets = useSafeAreaInsets();

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

  const addOption = () => {
    const newId = options.length ? Math.max(...options.map(o => o.id)) + 1 : 1;
    setOptions([...options, { id: newId, text: '' }]);
  };

  const removeOption = id => {
    setOptions(options.filter(o => o.id !== id));
  };

  const uploadImage = async (imageUri) => {
    if (!imageUri) return null;
    try {
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type,
        name: filename,
      });

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
    if (type === 'poll' && options.some(o => !o.text.trim())) {
      Alert.alert('Invalid options', 'Please fill in all poll options.');
      return;
    }

    try {
      setLoading(true);
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }
      const data = {
        type,
        topic,
        title,
        description,
        image: imageUrl,
        end_time: type === 'poll' && endTime ? endTime.toISOString() : null,
        author_id: userId,
        options: type === 'poll' ? options.map(o => ({ text: o.text })) : undefined,
      };
      const response = await createPost(data);
      console.log('Post created:', response);
      Alert.alert('Success', 'Your post has been created successfully!');
      setTitle('');
      setDescription('');
      setTopic('');
      setImage('');
      setEndTime(null);
      setOptions([{ id: 1, text: '' }, { id: 2, text: '' }]);
      navigation.navigate('Home');
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 16 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
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
                <View style={styles.modalOverlay}>
                  <Pressable style={styles.backdrop} onPress={() => setShowTopicPicker(false)} />
                  <View style={[styles.modalContent, { backgroundColor: t.cardBackground, borderColor: t.secondaryText }]}>
                    <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
                      <Text style={{ color: t.text, fontWeight: '600' }}>Select Topic</Text>
                    </View>
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
                  </View>
                </View>
              </Modal>
            )}

            <Text style={[styles.label, { color: t.text }]}>Description</Text>
            <Textarea
              variant="default"
              style={{
                borderColor: focusedField === 'description' ? t.accent : t.inputBorder,
                borderWidth: 1,
                borderRadius: 8,
                backgroundColor: t.inputBackground,
                marginBottom: 16,
              }}
            >
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
              <View style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.preview} />
                <TouchableOpacity style={styles.removeOverlay} onPress={() => setImage('')}>
                  <Ionicons name="close-circle" size={18} color={t.error || '#dc2626'} />
                </TouchableOpacity>
              </View>
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
                {/* End Time using shared DatePickerModal (date-only for consistency) */}
                <TouchableOpacity
                  style={[
                    styles.input,
                    { backgroundColor: t.inputBackground, borderColor: t.inputBorder, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: endTime ? t.text : t.secondaryText }}>
                    {endTime ? endTime.toLocaleDateString() : 'Select end date'}
                  </Text>
                  <Ionicons name="calendar" size={18} color={t.secondaryText} />
                </TouchableOpacity>

                <DatePickerModal
                  visible={showDatePicker}
                  value={endTime}
                  theme={theme}
                  t={t}
                  mode="date"
                  title="Select End Date"
                  minimumDate={new Date()}
                  onConfirm={(date, { close }) => {
                    setEndTime(date);
                    if (close) setShowDatePicker(false);
                  }}
                  onCancel={() => setShowDatePicker(false)}
                />
                <View style={{ marginTop: 16, marginBottom: 16 }}>
                  <Text style={[styles.label, { color: t.text }]}>Options</Text>
                  {options.map((opt, index) => (
                    <View key={opt.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <TextInput
                        style={[styles.input, { flex: 1, backgroundColor: t.inputBackground, borderColor: focusedField === `option_${opt.id}` ? t.accent : t.inputBorder, color: t.text, borderRadius: 8 }]}
                        placeholder={`Option ${index + 1}`}
                        placeholderTextColor={t.secondaryText}
                        value={opt.text}
                        onChangeText={text => {
                          const newOptions = [...options];
                          newOptions[index].text = text;
                          setOptions(newOptions);
                        }}
                        onFocus={() => setFocusedField(`option_${opt.id}`)}
                        onBlur={() => setFocusedField(null)}
                      />
                      {options.length > 2 && (
                        <TouchableOpacity onPress={() => removeOption(opt.id)} style={{ marginLeft: 8 }}>
                          <Ionicons name="trash" size={20} color={t.error || '#dc2626'} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  <Button variant="link" action="primary" onPress={addOption} className="flex-row items-center" style={{ borderRadius: 8 }}>
                    <Ionicons name="add-circle" size={20} color={t.accent} />
                    <Text style={{ marginLeft: 6, color: t.accent, fontWeight: '500' }}>Add Option</Text>
                  </Button>
                </View>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 12, marginTop: Platform.OS === 'ios' ? 6 : 0, lineHeight: 28 },
  toggle: {
    flexDirection: 'row',
    justifyContent: 'center',   // centers horizontally
    alignItems: 'center',
    alignSelf: 'center',     // centers vertically
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: 6,
  },
  switch: {
    alignItems: 'center',
  },

  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  form: {},
  label: { fontWeight: '500', fontSize: 14, marginBottom: 6 },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 16,
  },
  multiline: { height: 120, textAlignVertical: 'top' },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadText: { fontSize: 14, fontWeight: '500' },
  imageWrapper: { position: 'relative', marginBottom: 16 },
  preview: { width: '100%', height: 180, borderRadius: 8 },
  removeOverlay: { position: 'absolute', top: 8, right: 8, borderRadius: 12 },
  addOptionButton: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  // Modal styles for topic bottom sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
});