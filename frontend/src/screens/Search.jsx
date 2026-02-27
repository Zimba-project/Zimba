import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Ionicons } from '@expo/vector-icons';
import { searchPosts } from '../api/postService';
import DiscussionCard from '../components/Cards/DiscussionCard';
import PollCard from '../components/Cards/PollCard';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useCurrentUser from '../utils/GetUser';

const PAGE_SIZE = 10;

const SUGGESTIONS = [
  { label: 'Housing & Construction', icon: 'home-outline', key: 'asuminen ja rakentaminen' },
  { label: 'Culture & Leisure', icon: 'musical-notes-outline', key: 'kulttuuri ja vapaa-aika' },
  { label: 'Traffic & Streets', icon: 'car-outline', key: 'liikenne ja kadut' },
  { label: 'Sports & Nature', icon: 'leaf-outline', key: 'liikunta ja luonto' },
  { label: 'Education', icon: 'school-outline', key: 'kasvatus ja opetus' },
  { label: 'Work Life', icon: 'briefcase-outline', key: 'työelämä' },
  { label: 'City & Governance', icon: 'business-outline', key: 'kaupunki ja päätöksenteko' },
  { label: 'Business', icon: 'storefront-outline', key: 'yritykset' },
  { label: 'Tourism', icon: 'airplane-outline', key: 'matkailu' },
  { label: 'Sustainability', icon: 'earth-outline', key: 'luonto ja kestävä kehitys' },
  { label: 'Participate', icon: 'hand-left-outline', key: 'osallistu' },
  { label: 'Latest', icon: 'time-outline', key: 'tuoreimmat' },
];

export default function SearchScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const t = getTheme(theme);
  const isDark = theme === 'dark';

  const { user, loading: userLoading } = useCurrentUser();
  const storageKey = !userLoading ? (user?.id ? `recent_searches_${user.id}` : 'recent_searches_guest') : null;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isTyping, setIsTyping] = useState(false);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'discussion', label: 'Discussions' },
    { key: 'poll', label: 'Polls' },
  ];

  // Load recent searches from storage — waits for user to be resolved first
  useEffect(() => {
    if (!storageKey) return; // still loading user, don't flash guest searches
    const loadRecent = async () => {
      try {
        setRecentSearches([]);
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    };
    loadRecent();
  }, [storageKey]);

  // Save recent searches to storage whenever they change
  useEffect(() => {
    const saveRecent = async () => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(recentSearches));
      } catch (e) {
        console.error('Failed to save recent searches:', e);
      }
    };
    if (recentSearches.length > 0 && storageKey) saveRecent();
  }, [recentSearches]);

  const doSearch = async (q) => {
    if (!q.trim()) return;
    try {
      setLoading(true);
      const res = await searchPosts(q);
      setResults(res || []);
      setRecentSearches(prev => [q, ...prev.filter(s => s !== q)].slice(0, 5));
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim()) {
      setIsTyping(true);
      debounceRef.current = setTimeout(() => {
        setIsTyping(false);
        doSearch(query);
      }, 1000);
    } else {
      setIsTyping(false);
      setResults([]);
      setActiveFilter('all');
    }
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const filteredResults = activeFilter === 'all'
    ? results
    : results.filter(r => (r._type ?? r.type) === activeFilter);

  // Reset pagination whenever filtered results change
  useEffect(() => {
    setPage(1);
    setDisplayedResults(filteredResults.slice(0, PAGE_SIZE));
    setHasMore(filteredResults.length > PAGE_SIZE);
  }, [filteredResults.length, activeFilter]);

  const handleLoadMore = () => {
    if (!hasMore) return;
    const nextPage = page + 1;
    const nextItems = filteredResults.slice(0, nextPage * PAGE_SIZE);
    setDisplayedResults(nextItems);
    setPage(nextPage);
    setHasMore(nextItems.length < filteredResults.length);
  };

  const renderItem = useCallback(({ item }) => (
    <Pressable
      onPress={() => navigation.navigate(item._type === 'poll' ? 'Poll' : 'Discuss', { postData: item })}
      style={styles.cardPressable}
    >
      {(item._type ?? item.type) === 'poll'
        ? <PollCard {...item} />
        : <DiscussionCard {...item} />}
    </Pressable>
  ), [navigation]);

  // ── Search bar (always visible) ──────────────────────────────────────────
  const SearchBar = (
    <View style={styles.searchBarWrap}>
      <View style={[
        styles.searchBar,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
        },
      ]}>
        <Ionicons name="search" size={18} color={t.secondaryText} />
        <TextInput
          ref={inputRef}
          placeholder="Search posts, topics, authors..."
          value={query}
          onChangeText={setQuery}
          style={[styles.input, { color: t.text }]}
          placeholderTextColor={t.secondaryText}
          returnKeyType="search"
          onSubmitEditing={() => doSearch(query)}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={[
              styles.clearBtnInner,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' },
            ]}>
              <Ionicons name="close" size={12} color={t.text} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // ── Filter pills ──────────────────────────────────────────────────────────
  const FilterRow = results.length > 0 && !loading && (
    <View style={styles.filterRow}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterPill,
              activeFilter === f.key
                ? { backgroundColor: t.accent }
                : {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    borderWidth: 1,
                  },
            ]}
            onPress={() => setActiveFilter(f.key)}
          >
            <Text style={[
              styles.filterPillText,
              { color: activeFilter === f.key ? '#fff' : t.secondaryText },
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={[styles.resultCount, { color: t.secondaryText }]}>
          {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
        </Text>
      </ScrollView>
    </View>
  );

  // ── Empty state (no query) ─────────────────────────────────────────────
  if (!query.trim()) {
    return (
      <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: t.background }]}>
        {SearchBar}
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="time-outline" size={14} color={t.secondaryText} />
                  <Text style={[styles.sectionTitle, { color: t.secondaryText }]}>RECENT</Text>
                </View>
                <TouchableOpacity onPress={async () => {
                  setRecentSearches([]);
                  await AsyncStorage.removeItem(storageKey);
                }}>
                  <Text style={[styles.clearAll, { color: t.accent }]}>Clear</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chipsRow}>
                {recentSearches.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.recentChip,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                      },
                    ]}
                    onPress={() => setQuery(item)}
                  >
                    <Ionicons name="search-outline" size={13} color={t.secondaryText} />
                    <Text style={[styles.recentChipText, { color: t.text }]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Topic grid */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { marginBottom: 12 }]}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="grid-outline" size={14} color={t.secondaryText} />
                <Text style={[styles.sectionTitle, { color: t.secondaryText }]}>BROWSE TOPICS</Text>
              </View>
            </View>
            <View style={styles.topicsGrid}>
              {SUGGESTIONS.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.topicCard,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)',
                    },
                  ]}
                  onPress={() => setQuery(s.key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.topicIconWrap, { backgroundColor: `${t.accent}20` }]}>
                    <Ionicons name={s.icon} size={18} color={t.accent} />
                  </View>
                  <Text style={[styles.topicLabel, { color: t.text }]} numberOfLines={2}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Typing (waiting for debounce) ────────────────────────────────────────
  if (isTyping) {
    return (
      <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: t.background }]}>
        {SearchBar}
        <View style={styles.center}>
          <Text style={[styles.typingHint, { color: t.secondaryText }]}>Keep typing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: t.background }]}>
        {SearchBar}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={[styles.loadingText, { color: t.secondaryText }]}>Searching...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── No results ────────────────────────────────────────────────────────────
  if (filteredResults.length === 0) {
    return (
      <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: t.background }]}>
        {SearchBar}
        {FilterRow}
        <View style={styles.center}>
          <View style={[styles.noResultsIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
            <Ionicons name="search-outline" size={34} color={t.secondaryText} />
          </View>
          <Text style={[styles.noResultsTitle, { color: t.text }]}>No results found</Text>
          <Text style={[styles.noResultsSubtitle, { color: t.secondaryText }]}>
            Try different keywords or browse a topic
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: t.background }]}>
      {SearchBar}
      {FilterRow}
      <FlatList
        data={displayedResults}
        keyExtractor={(it, idx) => String(it.id ?? it._id ?? idx)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={() =>
          hasMore ? (
            <ActivityIndicator size="small" color={t.accent} style={{ marginVertical: 20 }} />
          ) : filteredResults.length > PAGE_SIZE ? (
            <Text style={{ textAlign: 'center', color: t.secondaryText, marginVertical: 20, fontSize: 13 }}>
              All results shown
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearBtnInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    paddingBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultCount: {
    fontSize: 13,
    marginLeft: 4,
  },
  emptyScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  clearAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  recentChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  topicCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  topicIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  cardPressable: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  typingHint: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  noResultsIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  noResultsSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});