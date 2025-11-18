import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, TextInput, FlatList, ActivityIndicator, Text,
  TouchableOpacity, StyleSheet, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchPosts } from '../api/postService';
import DiscussionCard from '../components/Cards/DiscussionCard';
import PollCard from '../components/Cards/PollCard';
import { useNavigation } from '@react-navigation/native';

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

  const renderItem = ({ item }) => {
    const onPress = () => {
      navigation.navigate(item._type === 'poll' ? 'Poll' : 'Discuss', { postData: item });
    };
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {item._type === 'poll' ? <PollCard {...item} /> : <DiscussionCard {...item} />}
      </TouchableOpacity>
    );
  };

  const renderSuggestions = () => (
    <ScrollView style={styles.suggestionContainer}>
      <Text style={styles.sectionTitle}>You may like</Text>
      {suggestionList.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => setQuery(item)}>
          <Text style={styles.suggestionText}>
            {item.includes(query) ? (
              <>
                <Text style={styles.highlight}>{query}</Text>
                {item.replace(query, '')}
              </>
            ) : item}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#6b7280" style={{ marginLeft: 8 }} />
        <TextInput
          placeholder="Search posts, topics, authors..."
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
            <Ionicons name="close" size={16} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {query.length === 0 ? (
        renderSuggestions()
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No results for “{query}”.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(it) => String(it.id ?? it._id ?? Math.random())}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 6,
    height: 44,
    elevation: 2,
  },
  input: { flex: 1, paddingHorizontal: 8, fontSize: 15 },
  clearBtn: { paddingHorizontal: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#6b7280' },
  suggestionContainer: { paddingHorizontal: 16 },
  sectionTitle: { color: '#000000ff', marginVertical: 12, fontWeight: 'bold' },
  suggestionText: { color: '#111827', paddingVertical: 8 },
  highlight: { color: '#000000ff', fontWeight: 'bold' },
});
