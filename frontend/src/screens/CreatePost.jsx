import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, LayoutAnimation, Platform, UIManager, Image, ScrollView, Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createPost } from '../api/postService';
import { EndTimePicker } from '../utils/EndTimePicker';
import useCurrentUser from '../utils/GetUser';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function CreatePostScreen({ navigation, route }) {
  const [type, setType] = useState('discussion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [image, setImage] = useState('');
  const [endTime, setEndTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([{ id: 1, text: '' }, { id: 2, text: '' }]);

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
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <Text style={[styles.header, { color: t.text }]}>
        Create a {type === 'poll' ? 'Poll' : 'Discussion'}
      </Text>

      <Pressable style={styles.toggle} onPress={handleTypeToggle}>
        <Ionicons name={type === 'poll' ? 'stats-chart' : 'chatbox'} size={20} color={t.accent}/>
          <Text style={[styles.toggleText, { color: t.accent, fontWeight: '700' }]}>
            Switch to {type === 'poll' ? 'Discussion' : 'Poll'}
          </Text>
      </Pressable>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={[styles.label, { color: t.text }]}>Title</Text>
          <TextInput
            style={[styles.input, { backgroundColor: t.cardBackground, borderColor: t.secondaryText, color: t.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a title"
            placeholderTextColor={t.secondaryText}
          />

          <Text style={[styles.label, { color: t.text }]}>Topic</Text>
          <TextInput
            style={[styles.input, { backgroundColor: t.cardBackground, borderColor: t.secondaryText, color: t.text }]}
            value={topic}
            onChangeText={setTopic}
            placeholder="Enter topic/category"
            placeholderTextColor={t.secondaryText}
          />

          <Text style={[styles.label, { color: t.text }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.multiline, { backgroundColor: t.cardBackground, borderColor: t.secondaryText, color: t.text }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Write your post content..."
            placeholderTextColor={t.secondaryText}
            multiline
          />

          <Text style={[styles.label, { color: t.text }]}>Image (optional)</Text>
          {image ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.preview} />
              <TouchableOpacity style={styles.removeOverlay} onPress={() => setImage('')}>
                <Ionicons name="close-circle" size={18} color={t.error || '#dc2626'} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.uploadButton, { backgroundColor: t.cardBackground }]} onPress={pickImage}>
              <Ionicons name="image" size={20} color={t.accent} />
              <Text style={[styles.uploadText, { color: t.accent }]}>Upload from device</Text>
            </TouchableOpacity>
          )}

          {type === 'poll' && (
            <>
              <EndTimePicker endTime={endTime} setEndTime={setEndTime} clearEndTime={() => setEndTime(null)} />
              <View style={{ marginTop: 16, marginBottom: 16 }}>
                <Text style={[styles.label, { color: t.text }]}>Options</Text>
                {options.map((opt, index) => (
                  <View key={opt.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <TextInput
                      style={[styles.input, { flex: 1, backgroundColor: t.cardBackground, borderColor: t.secondaryText, color: t.text }]}
                      placeholder={`Option ${index + 1}`}
                      placeholderTextColor={t.secondaryText}
                      value={opt.text}
                        onChangeText={text => {
                        const newOptions = [...options];
                        newOptions[index].text = text;
                        setOptions(newOptions);
                      }}
                    />
                    {options.length > 2 && (
                      <TouchableOpacity onPress={() => removeOption(opt.id)} style={{ marginLeft: 8 }}>
                        <Ionicons name="trash" size={20} color={t.error || '#dc2626'} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity onPress={addOption} style={styles.addOptionButton}>
                  <Ionicons name="add-circle" size={20} color={t.accent} />
                  <Text style={{ marginLeft: 6, color: t.accent, fontWeight: '500' }}>Add Option</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: t.accent }, (loading || userLoading) && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading || userLoading}
          >
            {(loading || userLoading) ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.buttonText}>Post</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: -20, paddingBottom: -20 },
  header: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
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
  label: { fontWeight: '600', fontSize: 16, marginBottom: 6 },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 16,
  },
  multiline: { height: 120, textAlignVertical: 'top' },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
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
    borderRadius: 10,
    marginBottom: 16,
  },
  uploadText: { fontSize: 14, fontWeight: '500' },
  imageWrapper: { position: 'relative', marginBottom: 16 },
  preview: { width: '100%', height: 180, borderRadius: 10 },
  removeOverlay: { position: 'absolute', top: 8, right: 8, borderRadius: 12 },
  addOptionButton: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
});