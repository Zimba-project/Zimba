import React, { useEffect, useState } from 'react';
import {SafeAreaView, ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardHeader from '../components/Cards/CardHeader';
import StatsBar from '../components/Cards/StatsBar';
import { getPollOptions, votePoll } from '../api/postService';
import useCurrentUser from '../utils/GetUser';

const PollScreen = () => {
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
    console.log("JSON:", user);
  }, [postId]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const opts = await getPollOptions(postId);
      setOptions(opts);
    } catch (err) {
      console.log("Failed to load options:", err);
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
      console.log("Vote failed:", err);
      Alert.alert('Thank you', err.message || 'Unable to submit your vote.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 12 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!postData) {
    return (
      <SafeAreaView style={[styles.center, { paddingTop: insets.top }]}>
        <Text>No poll data available</Text>
      </SafeAreaView>
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

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <CardHeader
          author={{ avatar: author_avatar, name: author_name, time: created_at }}
          topic={topic}
        />

        {image && <Image source={{ uri: image }} style={styles.image} />}

        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <StatsBar comments={comments} views={views} />

          <View style={styles.optionsContainer}>
            {options.map(opt => {
              const isSelected = selectedOption === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOption,
                    submitted && styles.disabledOption
                  ]}
                  disabled={submitted}
                  onPress={() => setSelectedOption(opt.id)}
                >
                  <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                    {opt.text}
                  </Text>
                  <Text style={styles.voteCount}>{opt.votes} votes</Text>
                </TouchableOpacity>
              );
            })}

            {submitted ? (
              <Text style={styles.thankYouText}>Thanks for voting!</Text>
            ) : (
              <TouchableOpacity
                style={[styles.submitButton, !selectedOption && styles.disabledSubmit]}
                disabled={!selectedOption}
                onPress={handleSubmit}
              >
                <Text style={styles.submitText}>Submit Vote</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PollScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250 },
  body: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#111' },
  description: { fontSize: 16, color: '#555', lineHeight: 22 },
  optionsContainer: { marginTop: 20 },
  optionButton: {
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: { backgroundColor: '#6366f1', borderColor: '#4f46e5' },
  disabledOption: { opacity: 0.7 },
  optionText: { fontSize: 16, color: '#111' },
  selectedOptionText: { color: '#fff', fontWeight: '600' },
  voteCount: { fontWeight: '600', color: '#4f46e5' },
  submitButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  disabledSubmit: { backgroundColor: '#a5b4fc' },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  thankYouText: { marginTop: 12, fontSize: 16, fontWeight: '500', color: '#16a34a' },
});
