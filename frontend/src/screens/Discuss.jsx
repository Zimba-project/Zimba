import React, { useState, useEffect } from 'react';
import { ScrollView, Image, StyleSheet, TextInput, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import CardHeader from '../components/Cards/CardHeader';
import StatsBar from '../components/Cards/StatsBar';
import Avatar from '../components/Profile/Avatar';
import useCurrentUser from '../utils/GetUser';
import { getPostComments, addPostComment, replyToComment } from '../api/postService';
import { normalizeUrl, normalizeAvatarUrl } from '../utils/urlHelper';
import { formatTime } from '../utils/TimeFormatter';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Feather as Icon } from '@expo/vector-icons';

export default function DiscussScreen() {
  const route = useRoute();
  const { postData } = route.params || {};
  const postId = postData?.id;

  const { user } = useCurrentUser();

  const [commentsList, setCommentsList] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [replyingMap, setReplyingMap] = useState({}); // { [commentId]: string }
  const [openReplyFor, setOpenReplyFor] = useState(null); // commentId currently open
  const [collapsedReplies, setCollapsedReplies] = useState({}); // { [commentId]: boolean }

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

  const handleReplyChange = (commentId, text) => {
    setReplyingMap(prev => ({ ...prev, [commentId]: text }));
  };

  const handleReplySubmit = async (commentId) => {
    const text = (replyingMap[commentId] || '').trim();
    if (!text || !user?.id) return;

    try {
      setPosting(true);
      const res = await replyToComment(postId, commentId, user.id, text);
      const r = res.reply;

      const normalized = {
        id: r.id,
        text: r.text || r.reply,
        author_name: user.first_name,
        author_avatar: user.avatar,
        created_at: r.created_at,
        user_id: r.user_id,
      };

      setCommentsList(prev => prev.map(c => {
        if (c.id === commentId) {
          const existing = Array.isArray(c.replies) ? c.replies : [];
          return { ...c, replies: [...existing, normalized] };
        }
        return c;
      }));

      // Clear input and close
      setReplyingMap(prev => ({ ...prev, [commentId]: '' }));
      setOpenReplyFor(null);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to post reply');
    } finally {
      setPosting(false);
    }
  };

  if (!postData) {
    return (
      <SafeAreaView edges={["bottom"]} style={[styles.center, { backgroundColor: t.background }]}>
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
  const isLoggedIn = !!(user && user.id);

  return (
    <SafeAreaView edges={["bottom"]} style={[styles.container, { backgroundColor: t.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80} style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
        <CardHeader
          author={{ avatar: avatarUrl, name: author_name, time: created_at, verified: author_avatar }}
          topic={topic}
        />

        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}

        <Box style={styles.body}>
          <Text style={[styles.title, { color: t.text }]}>{title}</Text>
          <Text style={[styles.description, { color: t.secondaryText }]}>{description}</Text>

          {/* Add Comment */}
          <Box style={styles.commentInputContainer}>
            <TextInput
              style={[
                styles.commentInput,
                { backgroundColor: t.inputBackground, color: t.text },
              ]}
              placeholder={isLoggedIn ? "Write a comment..." : "Log in to comment"}
              placeholderTextColor={t.placeholder}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              numberOfLines={4}
              blurOnSubmit={false}
              textAlignVertical="top"
              maxLength={500}
              editable={isLoggedIn}
              selectTextOnFocus={isLoggedIn}
            />
            <Pressable
              style={[styles.commentButton, { backgroundColor: t.accent }]}
              onPress={handleAddComment}
              disabled={!isLoggedIn || posting}
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
              ListEmptyComponent={
                <Box style={[styles.emptyState, { backgroundColor: t.cardBackground }]}>
                  <Icon name="message-circle" size={32} color={t.secondaryText} style={{ opacity: 0.5 }} />
                  <Text style={[styles.emptyTitle, { color: t.text }]}>No comments yet</Text>
                  <Text style={[styles.emptyText, { color: t.secondaryText }]}>Be the first to share your thoughts!</Text>
                </Box>
              }
              ListHeaderComponent={
                commentsList?.length > 0 ? (
                  <Text style={[styles.sectionTitle, { color: t.text }]}>
                    Comments ({commentsList.length})
                  </Text>
                ) : null
              }
              renderItem={({ item }) => (
                <Box style={[styles.commentCard, { backgroundColor: t.cardBackground }]}>
                  <CardHeader
                    author={{
                      avatar: normalizeAvatarUrl(item.author_avatar),
                      name: item.author_name || 'Unknown',
                      time: item.created_at,
                      verified: item.author_verified
                    }}
                    topic={null}
                  />
                  
                  <Text style={[styles.commentBody, { color: t.text }]}>{item.text}</Text>

                  {/* Actions */}
                  <Box style={styles.commentActions}>
                    {isLoggedIn && (
                      <Pressable
                        onPress={() => setOpenReplyFor(openReplyFor === item.id ? null : item.id)}
                        style={[styles.replyBtn, { backgroundColor: openReplyFor === item.id ? t.accent : t.inputBackground }]}
                      >
                        <Icon name="corner-up-left" size={14} color={openReplyFor === item.id ? "#fff" : t.accent} />
                        <Text style={[styles.replyBtnText, { color: openReplyFor === item.id ? "#fff" : t.accent }]}>Reply</Text>
                      </Pressable>
                    )}
                    
                    {(item.replies && item.replies.length > 0) && (
                      <Pressable
                        onPress={() => setCollapsedReplies(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                        style={[styles.viewRepliesBtn, { backgroundColor: t.inputBackground }]}
                      >
                        <Text style={[styles.viewRepliesBtnText, { color: t.text }]}>
                          {collapsedReplies[item.id] ? 'View' : 'Hide'} {item.replies.length} {item.replies.length === 1 ? 'reply' : 'replies'}
                        </Text>
                        <Icon 
                          name={collapsedReplies[item.id] ? "chevron-down" : "chevron-up"} 
                          size={14} 
                          color={t.secondaryText} 
                        />
                      </Pressable>
                    )}
                  </Box>

                  {/* Reply input */}
                  {openReplyFor === item.id && (
                    <Box style={[styles.replyInputContainer, { backgroundColor: t.inputBackground }]}>
                      <TextInput
                        style={[styles.replyInput, { color: t.text }]}
                        placeholder={isLoggedIn ? "Write a reply..." : "Log in to reply"}
                        placeholderTextColor={t.placeholder}
                        value={replyingMap[item.id] || ''}
                        onChangeText={(txt) => handleReplyChange(item.id, txt)}
                        multiline
                        blurOnSubmit={false}
                        textAlignVertical="top"
                        maxLength={500}
                        editable={isLoggedIn}
                      />
                      <Pressable
                        style={[styles.sendBtn, { backgroundColor: t.accent }]}
                        onPress={() => handleReplySubmit(item.id)}
                        disabled={!isLoggedIn || posting}
                      >
                        <Icon name="send" size={16} color="#fff" />
                      </Pressable>
                    </Box>
                  )}

                  {/* Replies */}
                  {(item.replies && item.replies.length > 0 && !collapsedReplies[item.id]) && (
                    <Box style={styles.repliesSection}>
                      <Box style={[styles.repliesConnector, { borderLeftColor: t.inputBorder }]} />
                      {item.replies.map((r, index) => (
                        <Box key={r.id} style={styles.replyWrapper}>
                          <Box style={[styles.replyCard, { backgroundColor: t.cardBackground }]}>
                            <CardHeader
                              author={{
                                avatar: normalizeAvatarUrl(r.author_avatar),
                                name: r.author_name || 'Unknown',
                                time: r.created_at,
                                verified: r.author_verified
                              }}
                              topic={null}
                            />
                            <Text style={[styles.replyBody, { color: t.text }]}>{r.text}</Text>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
              scrollEnabled={false}
              contentContainerStyle={{ marginTop: 16 }}
            />
          )}
        </Box>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250, marginBottom: 12 },
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
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 120,
    marginRight: 8,
    fontSize: 15,
  },
  commentButton: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  commentButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  commentCard: {
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  commentBody: { fontSize: 15, lineHeight: 21, marginBottom: 8, paddingHorizontal: 16, paddingBottom: 8 },
  commentActions: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  replyBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 14, 
    paddingVertical: 7, 
    borderRadius: 20,
    marginRight: 8,
  },
  replyBtnText: { fontSize: 13, fontWeight: '600', marginLeft: 6 },
  viewRepliesBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 14, 
    paddingVertical: 7, 
    borderRadius: 20,
  },
  viewRepliesBtnText: { fontSize: 13, fontWeight: '600', marginRight: 6 },
  replyInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    marginTop: 10, 
    padding: 10, 
    borderRadius: 12 
  },
  replyInput: { 
    flex: 1, 
    fontSize: 14, 
    maxHeight: 80,
    paddingRight: 8,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repliesSection: { marginTop: 12, marginLeft: 12, position: 'relative' },
  repliesConnector: { 
    position: 'absolute', 
    left: 0, 
    top: 0, 
    bottom: 0, 
    width: 2, 
    borderLeftWidth: 2,
  },
  replyWrapper: { marginBottom: 8 },
  replyCard: { 
    paddingVertical: 0,
    paddingHorizontal: 0, 
    borderRadius: 12,
    marginLeft: 10,
    overflow: 'hidden',
  },
  replyBody: { fontSize: 14, lineHeight: 20, paddingHorizontal: 16, paddingBottom: 12 },
  emptyState: { 
    marginTop: 20, 
    paddingVertical: 32, 
    paddingHorizontal: 20, 
    borderRadius: 12, 
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
