import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Image,
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
import { getPollOptions, votePoll } from '../api/postService';
import useCurrentUser from '../utils/GetUser';
import { normalizeUrl, normalizeAvatarUrl } from '../utils/urlHelper';

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

  useEffect(() => {
    if (!postId) return;
    fetchOptions();
    console.log('User JSON:', user);
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
      Alert.alert('Thank you', err.message || 'Unable to submit your vote.');
    }
  };

  if (loading) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="text-typography-900 mt-3">Loading...</Text>
      </Box>
    );
  }

  if (!postData) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center">
        <Text className="text-typography-900">No poll data available</Text>
      </Box>
    );
  }

  const {
    author_name,
    author_avatar,
    title,
    description,
    image,
    comments = 0,
    views = 0,
    created_at,
    topic,
  } = postData;

  // ✅ Use utils to normalize URLs
  const imageUrl = normalizeUrl(image);
  const avatarUrl = normalizeAvatarUrl(author_avatar);

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <CardHeader
          author={{ avatar: avatarUrl, name: author_name, time: created_at }}
          topic={topic}
        />

        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}

        <Box style={styles.body}>
          <Text className="text-2xl text-typography-900 font-bold mb-3">{title}</Text>
          <Text className="text-base text-typography-700 mb-3" style={{ lineHeight: 22 }}>{description}</Text>
          <StatsBar comments={comments} views={views} />

          <Box style={styles.optionsContainer}>
            {options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.optionButton,
                    submitted && styles.disabledOption,
                  ]}
                  className={isSelected ? "bg-primary-600 border-primary-700" : "bg-background-100 border-outline-200"}
                  disabled={submitted}
                  onPress={() => setSelectedOption(opt.id)}
                >
                  <Text className={isSelected ? "text-base text-typography-0 font-semibold" : "text-base text-typography-900"}>
                    {opt.text}
                  </Text>
                  <Text className={isSelected ? "text-typography-0 font-semibold" : "text-primary-600 font-semibold"}>{opt.votes} votes</Text>
                </Pressable>
              );
            })}

            {submitted ? (
              <Text className="text-base text-success-600 font-medium mt-3">Thanks for voting!</Text>
            ) : (
              <Pressable
                style={[
                  styles.submitButton,
                  !selectedOption && styles.disabledSubmit,
                ]}
                className="bg-primary-600"
                disabled={!selectedOption}
                onPress={handleSubmit}
              >
                <Text className="text-typography-0 font-semibold text-base">Submit Vote</Text>
              </Pressable>
            )}
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 250 },
  body: { padding: 16 },
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
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  disabledSubmit: { opacity: 0.5 },
});
