import React, { useState, useEffect } from 'react';
import {ScrollView, Image, StyleSheet, TextInput, FlatList, ActivityIndicator, Alert} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardHeader from '../components/Cards/CardHeader';
import StatsBar from '../components/Cards/StatsBar';
import useCurrentUser from '../utils/GetUser';
import { getPostComments, addPostComment } from '../api/postService';
import { normalizeUrl, normalizeAvatarUrl } from '../utils/urlHelper';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';

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
      <SafeAreaView edges={["top", "bottom"]} style={[styles.center, { backgroundColor: t.background }]}>
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
    <SafeAreaView edges={["top", "bottom"]} style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView>
        <CardHeader
          author={{ avatar: avatarUrl, name: author_name, time: created_at, verified: author_avatar }}
          topic={topic}
        />

        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}

        <Box style={styles.body}>
          <Text style={[styles.title, { color: t.text }]}>{title}</Text>
          <Text style={[styles.description, { color: t.secondaryText }]}>{description}</Text>
          <StatsBar comments={commentsList.length} views={views} />

          {/* Add Comment */}
          <Box style={[styles.commentInputContainer, { borderTopColor: t.inputBorder }]}>
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
            <Pressable
              style={[styles.commentButton, { backgroundColor: t.accent }]}
              onPress={handleAddComment}
              disabled={posting}
            >
              <Text style={styles.commentButtonText}>
                {posting ? 'Posting...' : 'Post'}
              </Text>
            </Pressable>
          </Box>

          {/* Comments */}
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={t.accent} />
          ) : (
            <FlatList
              data={commentsList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Box style={[styles.commentContainer, { borderBottomColor: t.inputBorder }]}>
                  <Text style={[styles.commentAuthor, { color: t.text }]}>
                    {item.author_name || 'Unknown'}
                  </Text>
                  <Text style={[styles.commentText, { color: t.secondaryText }]}>{item.text}</Text>
                </Box>
              )}
              scrollEnabled={false}
              contentContainerStyle={{ marginTop: 16 }}
            />
          )}
        </Box>
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
