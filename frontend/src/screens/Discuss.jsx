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
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardHeader from '../components/Cards/CardHeader';
import StatsBar from '../components/Cards/StatsBar';
import useCurrentUser from '../utils/GetUser';
import { getPostComments, addPostComment } from '../api/postService';
import { fetchSummary } from '../api/ai';
import { normalizeUrl, normalizeAvatarUrl } from '../utils/urlHelper';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';


// Tähän vois lisätä esim sen zimba "logon"
const AnalysisModal = ({ analysis, isVisible, onClose, onSuggestionPress, t }) => {
  if (!analysis) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: t.background }]}>

          <Text style={[styles.modalTitle, { color: t.text }]}>Tekoäly-Yhteenveto</Text>

        <ScrollView showsHorizontalScrollIndicator={false}>
          {/* KONTEKSTI / TIIVISTELMÄ */}
          <Text style={[styles.sectionTitle, { color: t.accent }]}>Yhteenveto</Text>
          <ScrollView style={{ maxHeight: 100 }}>
            <Text style={[styles.sectionText, { color: t.secondaryText }]}>{analysis.recap}</Text>
          </ScrollView>

          {/* VAIKUTUS ARKEEN */}
          {analysis.impact && (
            <>
              <Text style={[styles.sectionTitle, { color: t.accent }]}>Vaikutus</Text>
              <View style={{ backgroundColor: t.background + '80', padding: 10, borderRadius: 8, marginBottom: 10 }}>
                <Text style={[styles.sectionText, { color: t.text, fontStyle: 'italic' }]}>
                  🏠 {analysis.impact}
                </Text>
              </View>
            </>
          )}

          {/* PLUSSAT */}
          <Text style={[styles.sectionTitle, { color: t.accent }]}>Hyödyt</Text>
          <View style={styles.listContainer}>
            {analysis.pros && analysis.pros.map((p, i) => (
              <Text key={`p${i}`} style={[styles.prosText, { color: t.text }]}>
                ✅ {p}
              </Text>
            ))}
          </View>

          {/* MIINUKSET */}
          <Text style={[styles.sectionTitle, { color: t.accent }]}>Huomioitavaa</Text>
          <View style={styles.listContainer}>
            {analysis.cons && analysis.cons.map((c, i) => (
              <Text key={`c${i}`} style={[styles.consText, { color: t.text }]}>
                ⚠️ {c}
              </Text>
            ))}
          </View>

          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: t.accent, marginTop: 10 }]}>Kysy keskustelussa</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
                {analysis.suggestions.map((s, i) => (
                  <TouchableOpacity
                    key={`s${i}`}
                    style={{ borderWidth: 1, borderColor: t.accent, padding: 8, borderRadius: 20 }}
                    onPress={() => (onSuggestionPress ? onSuggestionPress(s) : console.log('Lisää kommenttiin: ', s))}
                  >
                    <Text style={{ color: t.accent, fontSize: 12 }}>💬 {s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>

          <TouchableOpacity
            style={[styles.modalCloseButton, { backgroundColor: t.accent }]}
            onPress={onClose}
          >
            <Text style={styles.modalCloseButtonText}>Sulje</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function DiscussScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { postData } = route.params || {};
  const postId = postData?.id;


  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { user } = useCurrentUser();
  const [aiRecapLoading, setAiRecapLoading] = useState(false);

  // Handler for AI Recap
  const handleAiRecap = async () => {

    setAiRecapLoading(true);
    // Varmista, että käytämme postDatan muuttujia, jotka on destructurettu myöhemmin
    const textToSummarize = postData?.description || postData?.title;

    if (!textToSummarize) {
      Alert.alert('Virhe', 'Tiivistettävää tekstiä ei ole saatavilla.');
      setAiRecapLoading(false);
      return;
    }

    try {
      const analysis = await fetchSummary(textToSummarize);
      
      console.log('=== AI ANALYSIS RECEIVED ===');
      console.log('Full analysis:', JSON.stringify(analysis, null, 2));
      console.log('Has recap:', !!analysis?.recap);
      console.log('Has pros:', !!analysis?.pros);
      console.log('Has cons:', !!analysis?.cons);
      console.log('Has impact:', !!analysis?.impact);
      console.log('Has suggestions:', !!analysis?.suggestions);
      console.log('========================');

      if (analysis && analysis.recap) {
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

          {/* AI Recap Button */}
          <TouchableOpacity
            style={[styles.aiButton, aiRecapLoading && { opacity: 0.6 }]}
            onPress={handleAiRecap}
            disabled={aiRecapLoading}
          >
            <Text style={styles.aiButtonText}>{aiRecapLoading ? 'Loading...' : 'AI Recap'}</Text>
          </TouchableOpacity>
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

      {/* RENDERÖI MODAL TÄHÄN! */}
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
  aiButton: {
    marginTop: 12,
    marginBottom: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#0d488cff',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  aiButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  listContainer: {
    marginBottom: 10,
  },
  prosText: {
    fontSize: 14,
    marginBottom: 4,
  },
  consText: {
    fontSize: 14,
    marginBottom: 4,
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});