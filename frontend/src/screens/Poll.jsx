import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardHeader from '../components/Cards/CardHeader';
import StatsBar from '../components/Cards/StatsBar';
import PollResults from '../components/Cards/PollResults';
import { getPollOptions, votePoll } from '../api/postService';
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
  const insets = useSafeAreaInsets();
  const { postData } = route.params || {};
  const postId = postData?.id;

  const { user } = useCurrentUser();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const { theme } = useTheme();
  const t = getTheme(theme);

  useEffect(() => {
    if (!postId) return;
    fetchOptions();
  }, [postId]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const opts = await getPollOptions(postId);
      setOptions(opts);
    } catch (err) {
      console.log('Failed to load options:', err);
      Alert.alert('Error', err.message || 'Unable to load poll options.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || !user) return;

    try {
      await votePoll(postId, selectedOption, user.id);
      setSubmitted(true);
      await fetchOptions(); // refresh votes
    } catch (err) {
      console.log('Vote failed:', err);
      Alert.alert('Error', err.message || 'Unable to submit your vote.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={[styles.center, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={{ marginTop: 12, color: t.text }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!postData) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={[styles.center, { backgroundColor: t.background }]}>
        <Text style={{ color: t.text }}>No poll data available</Text>
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
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <CardHeader
          author={{ avatar: avatarUrl, name: author_name, time: created_at, verified: author_verified }}
          topic={topic}
        />

        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}

        <Box style={styles.body}>
          <Text style={[styles.title, { color: t.text }]}>{title}</Text>
          <Text style={[styles.description, { color: t.secondaryText }]}>{description}</Text>

          {/* Show votes and views, but no comments */}
          <StatsBar views={views} />

          <Box style={styles.optionsContainer}>
            {!submitted ? (
              options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    style={[
                      styles.optionButton,
                      { backgroundColor: t.cardBackground, borderColor: t.inputBorder },
                      isSelected && { backgroundColor: t.accent, borderColor: t.accent },
                    ]}
                    onPress={() => setSelectedOption(opt.id)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: t.text },
                        isSelected && { color: '#fff' },
                      ]}
                    >
                      {opt.text}
                    </Text>
                    <Text style={[styles.voteCount, { color: t.accent }]}>{opt.votes} votes</Text>
                  </Pressable>
                );
              })
            ) : (
              <PollResults options={options} />
            )}

            {!submitted && (
              <Pressable
                style={[
                  styles.submitButton,
                  { backgroundColor: selectedOption ? t.accent : t.placeholder },
                ]}
                disabled={!selectedOption}
                onPress={handleSubmit}
              >
                <Text style={styles.submitText}>Submit Vote</Text>
              </Pressable>
            )}

            {submitted && (
              <Text style={[styles.thankYouText, { color: '#16a34a' }]}>Thanks for voting!</Text>
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
  image: { width: '100%', height: 250 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  description: { fontSize: 16, lineHeight: 22 },
  optionsContainer: { marginTop: 20 },
  optionButton: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabledOption: { opacity: 0.7 },
  optionText: { fontSize: 16 },
  voteCount: { fontWeight: '600' },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  thankYouText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});
