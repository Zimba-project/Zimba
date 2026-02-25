import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { searchPosts } from '../api/postService';
import DiscussionCard from '../components/Cards/DiscussionCard';
import PollCard from '../components/Cards/PollCard';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';

const suggestionList = [
  'asuminen ja rakentaminen',
  'kulttuuri ja vapaa-aika',
  'liikenne ja kadut',
  'liikunta ja luonto',
  'kasvatus ja opetus',
  'työelämä',
  'kaupunki ja päätöksenteko',
  'yritykset',
  'matkailu',
  'luonto ja kestävä kehitys',
  'osallistu',
  'tuoreimmat',
];

export default function SearchScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const { theme } = useTheme();
  const t = getTheme(theme);

  const doSearch = async (q) => {
    if (!q) return;
    try {
      setLoading(true);
      const res = await searchPosts(q);
      setResults(res || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const renderItem = useCallback(({ item }) => {
    const onPress = () => {
      navigation.navigate(item._type === 'poll' ? 'Poll' : 'Discuss', { postData: item });
    };
    return (
      <Pressable onPress={onPress}>
        {item._type === 'poll' ? <PollCard {...item} /> : <DiscussionCard {...item} />}
      </Pressable>
    );
  }, [navigation]);

  const renderSuggestions = () => (
    <ScrollView style={styles.suggestionContainer}>
      <Text style={[styles.sectionTitle, { color: t.text }]}>You may like</Text>
      {suggestionList.map((item, index) => (
        <Pressable key={index} onPress={() => setQuery(item)}>
          <Text style={[styles.suggestionText, { color: t.text }]}>
            {item.includes(query) ? (
              <>
                <Text style={[styles.highlight, { color: t.accent }]}>{query}</Text>
                {item.replace(query, '')}
              </>
            ) : item}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView edges={["bottom"]} style={[styles.container, { backgroundColor: t.background }]}>
      <HStack style={[styles.searchRow, { backgroundColor: t.cardBackground }]}>
        <Ionicons name="search" size={18} color={t.secondaryText} style={{ marginLeft: 8 }} />
        <TextInput
          placeholder="Search posts, topics, authors..."
          value={query}
          onChangeText={setQuery}
          style={[styles.input, { color: t.text }]}
          placeholderTextColor={t.secondaryText}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
            <Ionicons name="close" size={16} color={t.secondaryText} />
          </Pressable>
        )}
      </HStack>

      {query.length === 0 ? (
        renderSuggestions()
      ) : loading ? (
        <Box style={styles.center}>
          <ActivityIndicator size="large" color={t.accent} />
        </Box>
      ) : results.length === 0 ? (
        <Box style={styles.center}>
          <Text style={[styles.emptyText, { color: t.secondaryText }]}>No results for “{query}”.</Text>
        </Box>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(it, idx) => String(it.id ?? it._id ?? idx)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    borderRadius: 10,
    paddingHorizontal: 6,
    height: 44,
    elevation: 2,
  },
  input: { flex: 1, paddingHorizontal: 8, fontSize: 15 },
  clearBtn: { paddingHorizontal: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: {},
  suggestionContainer: { paddingHorizontal: 16 },
  sectionTitle: { marginVertical: 12, fontWeight: 'bold' },
  suggestionText: { paddingVertical: 8 },
  highlight: { fontWeight: 'bold' },
});
