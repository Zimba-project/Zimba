import React, { useState } from 'react';
import {
  TextInput, StyleSheet,
  ActivityIndicator, Alert, LayoutAnimation, Platform, UIManager, Image
} from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createPost } from '../api/postService';
import { EndTimePicker } from '../utils/EndTimePicker';
import useCurrentUser from '../utils/GetUser';
import { useNavigation, useRoute } from '@react-navigation/native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [type, setType] = useState('discussion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [image, setImage] = useState('');
  const [endTime, setEndTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([{ id: 1, text: '' }, { id: 2, text: '' }]);

  const { user, loading: userLoading, getUserId } = useCurrentUser(route);

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
      formData.append('file', { // 'file' matches your backend multer.single('file')
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
      return json.url; // Return the uploaded file URL
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
    <Box className="flex-1 bg-background-0" style={styles.container}>
      <Text className="text-2xl text-typography-900 font-bold text-center mb-3">
        Create a {type === 'poll' ? 'Poll' : 'Discussion'}
      </Text>

      <Pressable style={styles.toggle} onPress={handleTypeToggle}>
        <Ionicons name={type === 'poll' ? 'chatbox' : 'stats-chart'} size={20} color="#6366f1" />
        <Text className="text-sm text-primary-600 font-semibold ml-1.5">
          Switch to {type === 'poll' ? 'Discussion' : 'Poll'}
        </Text>
      </Pressable>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <Box style={styles.form}>
          <Text className="text-base text-typography-900 font-semibold mb-1.5">Title</Text>
          <Box className="border border-outline-200 rounded-lg mb-4 bg-background-50">
            <TextInput
              className="px-4 py-4 text-typography-900"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter a title"
              placeholderTextColor="#9ca3af"
            />
          </Box>

          <Text className="text-base text-typography-900 font-semibold mb-1.5">Topic</Text>
          <Box className="border border-outline-200 rounded-lg mb-4 bg-background-50">
            <TextInput
              className="px-4 py-4 text-typography-900"
              value={topic}
              onChangeText={setTopic}
              placeholder="Enter topic/category"
              placeholderTextColor="#9ca3af"
            />
          </Box>

          <Text className="text-base text-typography-900 font-semibold mb-1.5">Description</Text>
          <Box className="border border-outline-200 rounded-lg mb-4 bg-background-50">
            <TextInput
              className="px-4 py-4 text-typography-900"
              style={{ height: 120, textAlignVertical: 'top' }}
              value={description}
              onChangeText={setDescription}
              placeholder="Write your post content..."
              placeholderTextColor="#9ca3af"
              multiline
            />
          </Box>

          <Text className="text-base text-typography-900 font-semibold mb-1.5">Image (optional)</Text>
          {image ? (
            <Box style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.preview} />
              <Pressable style={styles.removeOverlay} onPress={() => setImage('')}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </Pressable>
            </Box>
          ) : (
            <Pressable style={styles.uploadButton} className="bg-primary-50" onPress={pickImage}>
              <Ionicons name="image" size={20} color="#6366f1" />
              <Text className="text-sm text-primary-600 font-medium ml-2">Upload from device</Text>
            </Pressable>
          )}

          {type === 'poll' && (
            <>
              <EndTimePicker endTime={endTime} setEndTime={setEndTime} clearEndTime={() => setEndTime(null)} />
              <Box style={{ marginTop: 16, marginBottom: 16 }}>
                <Text className="text-base text-typography-900 font-semibold mb-1.5">Options</Text>
                {options.map((opt, index) => (
                  <Box key={opt.id} className="flex-row items-center mb-2">
                    <Box className="flex-1 border border-outline-200 rounded-lg bg-background-50">
                      <TextInput
                        className="px-4 py-4 text-typography-900"
                        placeholder={`Option ${index + 1}`}
                        placeholderTextColor="#9ca3af"
                        value={opt.text}
                        onChangeText={text => {
                          const newOptions = [...options];
                          newOptions[index].text = text;
                          setOptions(newOptions);
                        }}
                      />
                    </Box>
                    {options.length > 2 && (
                      <Pressable onPress={() => removeOption(opt.id)} style={{ marginLeft: 8 }}>
                        <Ionicons name="trash" size={20} color="#dc2626" />
                      </Pressable>
                    )}
                  </Box>
                ))}
                <Pressable onPress={addOption} style={styles.addOptionButton}>
                  <Ionicons name="add-circle" size={20} color="#6366f1" />
                  <Text className="text-primary-600 font-medium ml-1.5">Add Option</Text>
                </Pressable>
              </Box>
            </>
          )}

          <Pressable
            style={[styles.button, (loading || userLoading) && { opacity: 0.6 }]}
            className="bg-primary-600"
            onPress={handleSubmit}
            disabled={loading || userLoading}
          >
            {(loading || userLoading) ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text className="text-typography-0 font-semibold text-base ml-2">Post</Text>
              </>
            )}
          </Pressable>
        </Box>
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 12 },
  toggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  form: {},
  button: { paddingVertical: 14, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  uploadButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginBottom: 16 },
  imageWrapper: { position: 'relative', marginBottom: 16 },
  preview: { width: '100%', height: 180, borderRadius: 10 },
  removeOverlay: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 12 },
  addOptionButton: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
});
