import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardHeader from '../components/Cards/CardHeader';
import StatsBar from '../components/Cards/StatsBar';
import useCurrentUser from '../utils/GetUser';
import { getPostComments, addPostComment } from '../api/postService';
import { getComments as getGroupComments, addComment as addGroupComment } from '../api/groupPostService';
import { normalizeUrl, normalizeAvatarUrl } from '../utils/urlHelper';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';

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

  const { theme } = useTheme();
  const t = getTheme(theme);

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const groupId = route.params?.groupId;
      const commentsRaw = groupId ? await getGroupComments(groupId, postId) : await getPostComments(postId);
      // normalize comment shape to { id, text, author_name, author_avatar, created_at, user_id }
      const comments = (commentsRaw || []).map(c => ({
        id: c.id,
        text: c.comment || c.text || '',
        author_name: c.author_name || c.first_name || 'Unknown',
        author_avatar: c.author_avatar || c.avatar || null,
        created_at: c.created_at,
        user_id: c.user_id || c.userId,
      }));
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
      const groupId = route.params?.groupId;
      const res = groupId ? await addGroupComment(groupId, postId, commentText.trim()) : await addPostComment(postId, user.id, commentText.trim());
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
      <SafeAreaView style={[styles.center, { paddingTop: insets.top, backgroundColor: t.background }]}>
        <Text style={{ color: t.text }}>No discuss data available</Text>
      </SafeAreaView>
    );
  }

  const {
    author_name,
    author_avatar,
    author_verified,
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
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView>
        <CardHeader
          author={{ avatar: avatarUrl, name: author_name, time: created_at, verified: author_avatar }}
          topic={topic}
        />

        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}

        <View style={styles.body}>
          <Text style={[styles.title, { color: t.text }]}>{title}</Text>
          <Text style={[styles.description, { color: t.secondaryText }]}>{description}</Text>
          <StatsBar comments={commentsList.length} views={views} />

          {/* Add Comment */}
          <View style={[styles.commentInputContainer, { borderTopColor: t.inputBorder }]}>
            <TextInput
              style={[
                styles.commentInput,
                { backgroundColor: t.inputBackground, borderColor: t.inputBorder, color: t.text },
              ]}
              placeholder="Write a comment..."
              placeholderTextColor={t.placeholder}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity
              style={[styles.commentButton, { backgroundColor: t.accent }]}
              onPress={handleAddComment}
              disabled={posting}
            >
              <Text style={styles.commentButtonText}>
                {posting ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Comments */}
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={t.accent} />
          ) : (
            <FlatList
              data={commentsList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={[styles.commentContainer, { borderBottomColor: t.inputBorder }]}>
                  <Text style={[styles.commentAuthor, { color: t.text }]}>
                    {item.author_name || 'Unknown'}
                  </Text>
                  <Text style={[styles.commentText, { color: t.secondaryText }]}>{item.text}</Text>
                </View>
              )}
              scrollEnabled={false}
              contentContainerStyle={{ marginTop: 16 }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  body: {
  paddingHorizontal: 16,
  paddingBottom: 16,
  marginBottom: 40,
  },
  description: { fontSize: 16, lineHeight: 22 },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  commentButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  commentButtonText: { color: '#fff', fontWeight: '600' },
  commentContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  commentAuthor: { fontWeight: '700', marginBottom: 2 },
  commentText: { fontSize: 15 },
});
