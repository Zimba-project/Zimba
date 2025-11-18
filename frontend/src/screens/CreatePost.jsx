import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, LayoutAnimation, Platform, UIManager, Image, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createPost } from '../api/postService';
import { EndTimePicker } from '../utils/EndTimePicker';
import useCurrentUser from '../utils/GetUser';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const CreatePostScreen = ({ navigation, route }) => {
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
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Poll option functions
  const addOption = () => {
    const newId = options.length ? Math.max(...options.map(o => o.id)) + 1 : 1;
    setOptions([...options, { id: newId, text: '' }]);
  };

  const removeOption = (id) => {
    setOptions(options.filter(o => o.id !== id));
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

      const data = {
        type,
        topic,
        title,
        description,
        image: image || null,
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Create a {type === 'poll' ? 'Poll' : 'Discussion'}</Text>

      <TouchableOpacity style={styles.toggle} onPress={handleTypeToggle}>
        <Ionicons name={type === 'poll' ? 'chatbox' : 'stats-chart'} size={20} color="#6366f1" />
        <Text style={styles.toggleText}>
          Switch to {type === 'poll' ? 'Discussion' : 'Poll'}
        </Text>
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter a title" />

          <Text style={styles.label}>Topic</Text>
          <TextInput style={styles.input} value={topic} onChangeText={setTopic} placeholder="Enter topic/category" />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Write your post content..."
            multiline
          />

          <Text style={styles.label}>Image (optional)</Text>
          {image ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.preview} />
              <TouchableOpacity style={styles.removeOverlay} onPress={() => setImage('')}>
                <Ionicons name="close-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="image" size={20} color="#6366f1" />
              <Text style={styles.uploadText}>Upload from device</Text>
            </TouchableOpacity>
          )}

          {type === 'poll' && (
            <>
              <EndTimePicker
                endTime={endTime}
                setEndTime={setEndTime}
                clearEndTime={() => setEndTime(null)}
              />

              {/* Poll options */}
              <View style={{ marginTop: 16, marginBottom: 16 }}>
                <Text style={styles.label}>Options</Text>

                {options.map((opt, index) => (
                  <View key={opt.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder={`Option ${index + 1}`}
                      value={opt.text}
                      onChangeText={(text) => {
                        const newOptions = [...options];
                        newOptions[index].text = text;
                        setOptions(newOptions);
                      }}
                    />
                    {options.length > 2 && (
                      <TouchableOpacity onPress={() => removeOption(opt.id)} style={{ marginLeft: 8 }}>
                        <Ionicons name="trash" size={20} color="#dc2626" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                <TouchableOpacity onPress={addOption} style={styles.addOptionButton}>
                  <Ionicons name="add-circle" size={20} color="#6366f1" />
                  <Text style={{ marginLeft: 6, color: '#6366f1', fontWeight: '500' }}>Add Option</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, (loading || userLoading) && { opacity: 0.6 }]}
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
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 6,
  },
  toggleText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  form: {},
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 6,
    color: '#111',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  multiline: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  removeOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
