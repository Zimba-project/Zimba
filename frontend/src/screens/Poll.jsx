import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import CardHeader from '../components/Cards/CardHeader';
import StatsBar from '../components/Cards/StatsBar';
import { getPollQuestions, votePoll, getPostById } from '../api/postService';
import useCurrentUser from '../utils/GetUser';
import { normalizeUrl, normalizeAvatarUrl } from '../utils/urlHelper';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';

export default function PollScreen() {
  const route = useRoute();
  const { user } = useCurrentUser();
  const { postData, id: deepLinkId } = route.params || {};
  const postId = postData?.id || deepLinkId;

  const [post, setPost] = useState(postData || null);
  const [questions, setQuestions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({}); // { questionId: [optionIds] }
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const { theme } = useTheme();
  const t = getTheme(theme);

  // Fetch post & poll questions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch post if not passed via navigation
        let postDetails = post;
        if (!post) {
          postDetails = await getPostById(postId);
          setPost(postDetails);
        }

        // Fetch poll questions from API
        const pollQuestions = await getPollQuestions(postId);
        // map questions to frontend structure
        const normalizedQuestions = pollQuestions.map(q => ({
          id: q.question_id,
          text: q.question_text,
          allowMultiple: q.allow_multiple,
          options: q.options.map(o => ({
            id: o.option_id,
            text: o.option_text,
            votes: o.votes || 0,
          })),
        }));
        setQuestions(normalizedQuestions);

      } catch (err) {
        console.error("Failed to load poll:", err);
        Alert.alert("Error", "Unable to load this poll.");
      } finally {
        setLoading(false);
      }
    };

    if (postId) fetchData();
  }, [postId]);

  const toggleOption = (questionId, optionId, allowMultiple) => {
    setSelectedOptions(prev => {
      const current = prev[questionId] || [];
      let updated;
      if (allowMultiple) {
        updated = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
      } else {
        updated = [optionId];
      }
      return { ...prev, [questionId]: updated };
    });
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      for (const q of questions) {
        const optionIds = selectedOptions[q.id] || [];
        if (optionIds.length === 0) continue;

        await votePoll(q.id, optionIds, user.id); // backend expects questionId + optionIds
      }

      setSubmitted(true);

      // Update vote counts locally
      setQuestions(prev =>
        prev.map(q => ({
          ...q,
          options: q.options.map(o => ({
            ...o,
            votes: selectedOptions[q.id]?.includes(o.id)
              ? o.votes + 1
              : o.votes,
          })),
        }))
      );
    } catch (err) {
      console.error("Vote failed:", err);
      Alert.alert("Error", "Failed to submit your votes.");
    }
  };

  if (loading || !post) {
    return (
      <SafeAreaView edges={["bottom"]} style={[styles.center, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={{ marginTop: 12, color: t.text }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const { author_id, author_name, author_avatar, author_verified, title, description, image, views = 0, created_at, topic } = post;
  const imageUrl = normalizeUrl(image);
  const avatarUrl = normalizeAvatarUrl(author_avatar);

  return (
    <SafeAreaView edges={["bottom"]} style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <CardHeader
          author={{ id: author_id, avatar: avatarUrl, name: author_name, time: created_at, verified: author_verified }}
          topic={topic}
        />

        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}

        <Box style={styles.body}>
          <Text style={[styles.title, { color: t.text }]}>{title}</Text>
          <Text style={[styles.description, { color: t.secondaryText }]}>{description}</Text>

          <StatsBar views={views} postId={postId} share={{ url: `myapp://post/${postId}` }} />

          <Box style={styles.optionsContainer}>
            {questions.map(q => (
              <Box key={q.id} style={{ marginBottom: 20 }}>
                <Text style={[styles.questionText, { color: t.text }]}>{q.text}</Text>
                {q.options.map(opt => {
                  const isSelected = (selectedOptions[q.id] || []).includes(opt.id);
                  return (
                    <Pressable
                      key={opt.id}
                      style={[
                        styles.optionButton,
                        { backgroundColor: t.cardBackground, borderColor: t.inputBorder },
                        isSelected && { backgroundColor: t.accent, borderColor: t.accent }
                      ]}
                      onPress={() => !submitted && toggleOption(q.id, opt.id, q.allowMultiple)}
                    >
                      <Text style={[styles.optionText, { color: isSelected ? "#fff" : t.text }]}>{opt.text}</Text>
                      <Text style={[styles.voteCount, { color: t.accent }]}>{opt.votes} votes</Text>
                    </Pressable>
                  );
                })}
              </Box>
            ))}

            {!submitted && (
              <Pressable
                style={[styles.submitButton, { backgroundColor: Object.keys(selectedOptions).length ? t.accent : t.placeholder }]}
                disabled={Object.keys(selectedOptions).length === 0}
                onPress={handleSubmit}
              >
                <Text style={styles.submitText}>Submit Vote</Text>
              </Pressable>
            )}

            {submitted && (
              <Text style={[styles.thankYouText, { color: "#16a34a" }]}>Thanks for voting!</Text>
            )}
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  body: { paddingHorizontal: 16, paddingBottom: 20 },
  description: { fontSize: 16, lineHeight: 22 },
  optionsContainer: { marginTop: 20 },
  questionText: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  optionButton: {
    padding: 16,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  optionText: { fontSize: 16, flex: 1, marginRight: 12, lineHeight: 22 },
  voteCount: { fontWeight: '600', fontSize: 14, flexShrink: 0 },
  submitButton: { paddingVertical: 12, borderRadius: 8, marginTop: 12, alignItems: "center" },
  submitText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  thankYouText: { marginTop: 12, fontSize: 16, fontWeight: "500" },
});