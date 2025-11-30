import React, { useState, useEffect } from 'react';
import {
  TextInput,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardHeader from '../components/Cards/CardHeader';
import StatsBar from '../components/Cards/StatsBar';
import useCurrentUser from '../utils/GetUser';
import { getPostComments, addPostComment } from '../api/postService';
import { normalizeUrl, normalizeAvatarUrl } from '../utils/urlHelper';

export default function DiscussScreen() {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { postData } = route.params || {};
  const postId = postData?.id;

  const { user } = useCurrentUser();

  const [commentsList, setCommentsList] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const comments = await getPostComments(postId);
      setCommentsList(comments);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !user?.id) return;

    try {
      setPosting(true);

      const res = await addPostComment(postId, user.id, commentText.trim());
      const c = res.comment;

      const normalized = {
        id: c.id,
        text: c.comment,
        author_name: user.first_name,
        author_avatar: user.avatar,
        created_at: c.created_at,
        user_id: c.user_id,
      };

      setCommentsList([normalized, ...commentsList]);
      setCommentText('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  if (!postData) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center">
        <Text className="text-typography-900">No discuss data available</Text>
      </Box>
    );
  }

  const {
    author_name,
    author_avatar,
    title,
    description,
    image,
    views = 0,
    created_at,
    topic,
  } = postData;


  const imageUrl = normalizeUrl(image);
  const avatarUrl = normalizeAvatarUrl(author_avatar);

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView>
        <CardHeader
          author={{ avatar: avatarUrl, name: author_name, time: created_at }}
          topic={topic}
        />

        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}

        <Box style={styles.body}>
          <Text className="text-2xl text-typography-900 font-bold mb-3">{title}</Text>
          <Text className="text-base text-typography-700 mb-3" style={{ lineHeight: 22 }}>{description}</Text>
          <StatsBar comments={commentsList.length} views={views} />

          {/* Add Comment */}
          <Box style={styles.commentInputContainer} className="border-t border-outline-200">
            <Box className="flex-1 border border-outline-200 rounded-lg bg-background-50 mr-2">
              <TextInput
                className="px-4 py-2 text-typography-900"
                placeholder="Write a comment..."
                placeholderTextColor="#9ca3af"
                value={commentText}
                onChangeText={setCommentText}
              />
            </Box>
            <Pressable
              style={styles.commentButton}
              className="bg-primary-600"
              onPress={handleAddComment}
              disabled={posting}
            >
              <Text className="text-typography-0 font-semibold">
                {posting ? 'Posting...' : 'Post'}
              </Text>
            </Pressable>
          </Box>

          {/* Comments */}
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={commentsList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Box style={styles.commentContainer} className="border-b border-background-100">
                  <Text className="text-typography-900 font-bold mb-0.5">
                    {item.author_name || 'Unknown'}
                  </Text>
                  <Text className="text-base text-typography-900">{item.text}</Text>
                </Box>
              )}
              scrollEnabled={false}
              contentContainerStyle={{ marginTop: 16 }}
            />
          )}
        </Box>
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 250 },
  body: { padding: 16 },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 12,
  },
  commentButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  commentContainer: {
    paddingVertical: 8,
  },
});
