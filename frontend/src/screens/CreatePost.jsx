import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createPost } from '../api/postService';
import TopBar from '../components/TopBar';

const CreatePostScreen = ({ navigation, route }) => {
  const user = route?.params?.user;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [image, setImage] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'No logged-in user found!');
      return;
    }

    if (!title.trim() || !description.trim() || !topic.trim()) {
      Alert.alert('Missing fields', 'Please fill in title, topic and description.');
      return;
    }

    try {
      setLoading(true);

      const data = {
        type: 'discussion',       // or 'poll', based on your UI
        topic,
        title,
        description,
        image: image || null,
        end_time: endTime || null,
        author_id: user?.id,      // required by backend
      };

      const response = await createPost(data);
      console.log('Post created:', response);

      Alert.alert('Success', 'Your post has been created successfully!');
      setTitle('');
      setDescription('');
      setTopic('');
      setImage('');
      setEndTime('');
      navigation.navigate('Home'); // back to main feed
    } catch (error) {
      console.error('Error creating post:', error.message);
      Alert.alert('Error', error.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title="Create Post" leftIcon="arrow-left" onLeftPress={() => navigation.goBack()} />

      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter a title"
        />

        <Text style={styles.label}>Topic</Text>
        <TextInput
          style={styles.input}
          value={topic}
          onChangeText={setTopic}
          placeholder="Enter topic/category"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Write your post content..."
          multiline
        />

        <Text style={styles.label}>Image URL (optional)</Text>
        <TextInput style={styles.input} value={image} onChangeText={setImage} placeholder="Paste image URL" />

        <Text style={styles.label}>End Time (optional)</Text>
        <TextInput
          style={styles.input}
          value={endTime}
          onChangeText={setEndTime}
          placeholder="YYYY-MM-DD HH:MM"
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.buttonText}>Post</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  form: { padding: 20 },
  label: { fontWeight: '600', fontSize: 16, marginBottom: 6, color: '#111' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  multiline: { height: 120, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
