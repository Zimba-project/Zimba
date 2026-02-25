import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CardHeader from '../components/Cards/CardHeader';
import StatsBar from '../components/Cards/StatsBar';
import useCurrentUser from '../utils/GetUser';
import { getPostComments, addPostComment, replyToComment } from '../api/postService';
import { fetchSummary } from '../api/ai';
import { normalizeUrl, normalizeAvatarUrl } from '../utils/urlHelper';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Feather as Icon } from '@expo/vector-icons';

// ── AI Analysis Modal ──────────────────────────────────────────────────────────

const AnalysisModal = ({ analysis, isVisible, onClose, onSuggestionPress, t }) => {
  if (!analysis) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Box style={styles.modalOverlay}>
        <Box style={[styles.modalContent, { backgroundColor: t.background }]}>
          <Text style={[styles.modalTitle, { color: t.text }]}>Tekoäly-Yhteenveto</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: t.accent }]}>Yhteenveto</Text>
            <ScrollView style={{ maxHeight: 100 }}>
              <Text style={[styles.sectionText, { color: t.secondaryText }]}>{analysis.recap}</Text>
            </ScrollView>

            {analysis.impact && (
              <>
                <Text style={[styles.sectionTitle, { color: t.accent }]}>Vaikutus</Text>
                <Box style={{ backgroundColor: t.background + '80', padding: 10, borderRadius: 8, marginBottom: 10 }}>
                  <Text style={[styles.sectionText, { color: t.text, fontStyle: 'italic' }]}>
                    🏠 {analysis.impact}
                  </Text>
                </Box>
              </>
            )}

            <Text style={[styles.sectionTitle, { color: t.accent }]}>Hyödyt</Text>
            <Box style={styles.listContainer}>
              {analysis.pros?.map((p, i) => (
                <Text key={`p${i}`} style={[styles.prosText, { color: t.text }]}>✅ {p}</Text>
              ))}
            </Box>

            <Text style={[styles.sectionTitle, { color: t.accent }]}>Huomioitavaa</Text>
            <Box style={styles.listContainer}>
              {analysis.cons?.map((c, i) => (
                <Text key={`c${i}`} style={[styles.consText, { color: t.text }]}>⚠️ {c}</Text>
              ))}
            </Box>

            {analysis.suggestions?.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: t.accent, marginTop: 10 }]}>Kysy keskustelussa</Text>
                <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
                  {analysis.suggestions.map((s, i) => (
                    <Pressable
                      key={`s${i}`}
                      style={{ borderWidth: 1, borderColor: t.accent, padding: 8, borderRadius: 20 }}
                      onPress={() => onSuggestionPress?.(s)}
                    >
                      <Text style={{ color: t.accent, fontSize: 12 }}>💬 {s}</Text>
                    </Pressable>
                  ))}
                </Box>
              </>
            )}
          </ScrollView>

          <Pressable style={[styles.modalCloseButton, { backgroundColor: t.accent }]} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Sulje</Text>
          </Pressable>
        </Box>
      </Box>
    </Modal>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function DiscussScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { postData } = route.params || {};
  const postId = postData?.id;

  const { user } = useCurrentUser();
  const isLoggedIn = !!user?.id;

  const { theme } = useTheme();
  const t = getTheme(theme);

  const [commentsList, setCommentsList] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [replyingMap, setReplyingMap] = useState({});
  const [openReplyFor, setOpenReplyFor] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [aiRecapLoading, setAiRecapLoading] = useState(false);

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const comments = await getPostComments(postId);
      setCommentsList(comments);
      setVisibleCount(3);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !isLoggedIn) return;
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
    if (!text || !isLoggedIn) return;
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
      setReplyingMap(prev => ({ ...prev, [commentId]: '' }));
      setOpenReplyFor(null);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to post reply');
    } finally {
      setPosting(false);
    }
  };

  const handleAiRecap = async () => {
    setAiRecapLoading(true);
    const textToSummarize = postData?.description || postData?.title;
    if (!textToSummarize) {
      Alert.alert('Virhe', 'Tiivistettävää tekstiä ei ole saatavilla.');
      setAiRecapLoading(false);
      return;
    }
    try {
      const analysis = await fetchSummary(textToSummarize);
      if (analysis?.recap) {
        setAiAnalysis(analysis);
        setIsModalVisible(true);
      } else {
        Alert.alert('Virhe', 'Analyysiä ei saatu. Yritä uudelleen.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Virhe', 'AI-palvelu epäonnistui. Tarkista backendin lokit.');
    } finally {
      setAiRecapLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setIsModalVisible(false);
    navigation.navigate('Chat', {
      chatWith: 'AI Assistant',
      avatarUrl: null,
      initialMessage: suggestion,
      autoSend: true,
      contextText: postData?.description || postData?.title || '',
    });
  };

  if (!postData) {
    return (
      <SafeAreaView edges={['bottom']} style={[styles.center, { backgroundColor: t.background }]}>
        <Text style={{ color: t.text }}>No discuss data available</Text>
      </SafeAreaView>
    );
  }

  const {
    author_id,
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
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: t.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <CardHeader
            author={{ id: author_id, avatar: avatarUrl, name: author_name, time: created_at, verified: false }}
            // debug topic={topic}
          />

          {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}

          <Box style={styles.body}>
            <Text style={[styles.title, { color: t.text }]}>{title}</Text>
            <Text style={[styles.description, { color: t.secondaryText }]}>{description}</Text>

            <Pressable
              style={[styles.aiButton, aiRecapLoading && { opacity: 0.6 }]}
              onPress={handleAiRecap}
              disabled={aiRecapLoading}
            >
              <Text style={styles.aiButtonText}>{aiRecapLoading ? 'Loading...' : 'AI Recap'}</Text>
            </Pressable>

            <StatsBar comments={commentsList.length} views={views} />

            {/* Add Comment */}
            <Box style={styles.commentInputContainer}>
              <TextInput
                style={[styles.commentInput, { backgroundColor: t.inputBackground, color: t.text }]}
                placeholder={isLoggedIn ? 'Write a comment...' : 'Log in to comment'}
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
                <Text style={styles.commentButtonText}>{posting ? 'Posting...' : 'Post'}</Text>
              </Pressable>
            </Box>

            {/* Comments */}
            {loading ? (
              <ActivityIndicator style={{ marginTop: 20 }} color={t.accent} />
            ) : (
              <>
                {commentsList.length > 0 && (
                  <Text style={[styles.sectionTitle, { color: t.text }]}>Comments ({commentsList.length})</Text>
                )}
                {commentsList.slice(0, visibleCount).map((item) => (
                  <Box key={item.id} style={[styles.commentCard, { backgroundColor: t.cardBackground }]}> 
                    <CardHeader
                      author={{
                        id: item.user_id,
                        avatar: normalizeAvatarUrl(item.author_avatar),
                        name: item.author_name || 'Unknown',
                        time: item.created_at,
                        verified: item.author_verified,
                      }}
                      topic={null}
                    />
                    <Text style={[styles.commentBody, { color: t.text }]}>{item.text}</Text>
                    {isLoggedIn && (
                      <Pressable
                        onPress={() => setOpenReplyFor(openReplyFor === item.id ? null : item.id)}
                        style={[styles.replyBtn, { backgroundColor: openReplyFor === item.id ? t.accent : t.inputBackground }]}
                      >
                        <Icon name="corner-up-left" size={14} color={openReplyFor === item.id ? '#fff' : t.accent} />
                        <Text style={[styles.replyBtnText, { color: openReplyFor === item.id ? '#fff' : t.accent }]}>Reply</Text>
                      </Pressable>
                    )}
                    {openReplyFor === item.id && (
                      <Box style={[styles.replyInputContainer, { backgroundColor: t.inputBackground }]}> 
                        <TextInput
                          style={[styles.replyInput, { color: t.text }]}
                          placeholder={isLoggedIn ? 'Write a reply...' : 'Log in to reply'}
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
                    {item.replies && item.replies.length > 0 && (
                      <Box style={{ marginLeft: 32, marginTop: 4 }}>
                        {[...item.replies]
                          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                          .map((reply) => (
                            <Box key={reply.id} style={{ marginBottom: 6 }}>
                              <CardHeader
                                author={{
                                  id: reply.user_id,
                                  avatar: normalizeAvatarUrl(reply.author_avatar),
                                  name: reply.author_name || 'Unknown',
                                  time: reply.created_at,
                                  verified: reply.author_verified,
                                }}
                                topic={null}
                              />
                              <Text
                                style={[
                                  styles.commentBody,
                                  { color: t.text, fontSize: 14 },
                                ]}
                              >
                                {reply.text}
                              </Text>
                            </Box>
                          ))}
                      </Box>
                    )}
                  </Box>
                ))}
                {commentsList.length > visibleCount && (
                  <Pressable
                    style={{ alignSelf: 'center', marginTop: 8, paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8, backgroundColor: t.accent }}
                    onPress={() => setVisibleCount((prev) => prev + 3)}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Show more comments</Text>
                  </Pressable>
                )}
                {commentsList.length === 0 && (
                  <Box style={[styles.emptyState, { backgroundColor: t.cardBackground }]}> 
                    <Icon name="message-circle" size={32} color={t.secondaryText} style={{ opacity: 0.5 }} />
                    <Text style={[styles.emptyTitle, { color: t.text }]}>No comments yet</Text>
                    <Text style={[styles.emptyText, { color: t.secondaryText }]}>Be the first to share your thoughts!</Text>
                  </Box>
                )}
              </>
            )}
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>

      <AnalysisModal
        analysis={aiAnalysis}
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuggestionPress={handleSuggestionPress}
        t={t}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  body: { paddingHorizontal: 16, paddingBottom: 16, marginBottom: 40 },
  description: { fontSize: 16, lineHeight: 22 },
  commentInputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 16 },
  commentInput: { flex: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, minHeight: 44, maxHeight: 120, marginRight: 8, fontSize: 15 },
  commentButton: { paddingVertical: 11, paddingHorizontal: 18, borderRadius: 12 },
  commentButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  commentCard: { borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  commentBody: { fontSize: 15, lineHeight: 21, marginBottom: 8, paddingHorizontal: 16, paddingBottom: 8 },
  replyBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8, alignSelf: 'flex-start', marginLeft: 16, marginBottom: 10 },
  replyBtnText: { fontSize: 13, fontWeight: '600', marginLeft: 6 },
  replyInputContainer: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 10, padding: 10, borderRadius: 12, marginHorizontal: 16, marginBottom: 10 },
  replyInput: { flex: 1, fontSize: 14, maxHeight: 80, paddingRight: 8 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  emptyState: { marginTop: 20, paddingVertical: 32, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  aiButton: { marginTop: 12, marginBottom: 8, alignSelf: 'flex-end', backgroundColor: '#0d488c', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8 },
  aiButtonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalContent: { width: '100%', padding: 20, borderRadius: 12, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  sectionText: { fontSize: 14, marginBottom: 10, lineHeight: 20 },
  listContainer: { marginBottom: 10 },
  prosText: { fontSize: 14, marginBottom: 4 },
  consText: { fontSize: 14, marginBottom: 4 },
  modalCloseButton: { marginTop: 20, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  modalCloseButtonText: { color: 'white', fontWeight: '600' },
});