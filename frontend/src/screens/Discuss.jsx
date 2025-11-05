import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '../components/TopBar';

const Discuss = ({ navigation }) => {
  const post = {
    author: {
      name: 'Matt Hardy',
      time: '25 min ago',
      avatar: 'https://i.pravatar.cc/150?img=11',
    },
    topic: 'Asuminen ja rakentaminen',
    title: 'Maecenas mattis hendrerit enim ac vest...',
    description:
      'This is the post in description Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. This is the post in description Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Phasellus interdum neque nunc, non tempor dui auctor eu. Mauris tincidunt tincidunt odio, eu elementum tellus. Curabitur blandit nisl sit amet mauris finibus.',
    image:
      'https://images.unsplash.com/photo-1522199710521-72d69614c702?w=800&q=80',
  };

  const [selectedOption, setSelectedOption] = useState(null);
  const pollOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
  const [comment, setComment] = useState('');

  const handleComment = () => {
    if (comment.trim().length === 0) return;
    alert(`Comment added: ${comment}`);
    setComment('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <TopBar
        title="Parlanet"
        leftIcon="arrow-left"
        onLeftPress={() => navigation.goBack()}
        rightIcon="more-vertical"
        onRightPress={() => alert('More options')}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerRow}>
          <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.authorName}>{post.author.name}</Text>
            <Text style={styles.time}>{post.author.time}</Text>
          </View>
          <View style={styles.topicTag}>
            <Text style={styles.topicText}>{post.topic}</Text>
          </View>
        </View>

        {/* Image */}
        <ImageBackground source={{ uri: post.image }} style={styles.postImage} imageStyle={{ borderRadius: 12 }}>
          <View style={styles.imageOverlay}></View>
        </ImageBackground>

        {/* Post Body */}
        <View style={styles.body}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.description}>{post.description}</Text>
        </View>

        {/* Poll Options */}
        <View style={styles.pollSection}>
          {pollOptions.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.pollOption,
                selectedOption === idx && styles.pollOptionSelected,
              ]}
              onPress={() => setSelectedOption(idx)}
            >
              <Text
                style={[
                  styles.pollOptionText,
                  selectedOption === idx && { color: '#2563eb' },
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Comment */}
        <View style={styles.commentContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add comment"
            placeholderTextColor="#999"
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity style={styles.commentButton} onPress={handleComment}>
            <Text style={styles.commentButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollContainer: { paddingBottom: 80 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 10 },
  authorName: { fontSize: 16, fontWeight: '600', color: '#111' },
  time: { color: '#777', fontSize: 12 },
  topicTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicText: { color: '#16a34a', fontWeight: '600', fontSize: 12 },
  postImage: {
    width: '92%',
    height: 160,
    borderRadius: 12,
    alignSelf: 'center',
    marginVertical: 12,
    overflow: 'hidden',
  },
  imageOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.05)' },
  body: { paddingHorizontal: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 6 },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 12,
  },
  pollSection: {
    marginTop: 4,
    paddingHorizontal: 16,
  },
  pollOption: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    marginVertical: 5,
  },
  pollOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  pollOptionText: { color: '#111', fontSize: 15 },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
  },
  commentButton: {
    marginLeft: 10,
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  commentButtonText: { color: '#fff', fontWeight: '600' },
});

export default Discuss;