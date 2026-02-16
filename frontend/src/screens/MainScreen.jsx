import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import InfoBoard from '../components/MainPage/InfoBoard';
import PollCard from '../components/Cards/PollCard';
import DiscussionCard from '../components/Cards/DiscussionCard';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { getAllPosts } from '../api/postService';
import { PostFilterBar } from '../components/MainPage/FilterBar';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import useCurrentUser from '../utils/GetUser';
import { useTranslation } from 'react-i18next';

const FILTER_MAP = {
  all: null,
  discussions: 'discussion',
  polls: 'poll',
};

export default function MainScreen({ navigation }) {
  const { theme } = useTheme();
  const t = getTheme(theme);
  const { t: translate } = useTranslation();
  const user = useCurrentUser();

  const [allPosts, setAllPosts] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [selectedTab, setSelectedTab] = useState('new');        // key
  const [selectedDropdown, setSelectedDropdown] = useState('all'); // key
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPosts = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);
      const posts = await getAllPosts();
      setAllPosts(posts);
    } catch (err) {
      console.error('Error fetching posts:', err.message);
      setError(translate('error_fetch_posts'));
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!allPosts.length) return;
    if (isProcessing) return;

    setIsProcessing(true);
    let filtered =
      selectedDropdown === 'all'
        ? [...allPosts]
        : allPosts.filter(p => p.type === FILTER_MAP[selectedDropdown]);

    // Sorting
    if (selectedTab === 'new') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (selectedTab === 'hot') {
      filtered.sort((a, b) => b.votes - a.votes);
    } else if (selectedTab === 'top') {
      filtered.sort((a, b) => b.comments - a.comments);
    }

    setFeed(filtered);

    const timer = setTimeout(() => setIsProcessing(false), 200);
    return () => clearTimeout(timer);
  }, [selectedDropdown, selectedTab, allPosts]);

  const handleRefresh = () => fetchPosts(true);

  if (loading) {
    return (
      <SafeAreaView
        edges={['bottom']}
        style={[styles.centered, { backgroundColor: t.background }]}
      >
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={[styles.loadingText, { color: t.secondaryText }]}>
          {translate('loading_posts')}
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        edges={['bottom']}
        style={[styles.centered, { backgroundColor: t.background }]}
      >
        <Text style={[styles.errorText, { color: t.error }]}>{error}</Text>
        <Pressable
          style={[styles.retryButton, { backgroundColor: t.accent }]}
          onPress={() => fetchPosts()}
        >
          <Text style={styles.retryText}>{translate('retry')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: t.background }]}
      edges={['bottom']}
    >
      <FlatList
        data={feed}
        keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
          >
            {item.type === 'poll' ? (
              <PollCard {...item} theme={theme} />
            ) : (
              <DiscussionCard {...item} theme={theme} />
            )}
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <Box style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <Box
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: t.text }}>
                {translate('upcoming')}
              </Text>
              <Pressable onPress={() => alert(translate('show_all_upcoming'))}>
                <Text style={{ color: t.accent, fontWeight: '600' }}>
                  {translate('see_all')}
                </Text>
              </Pressable>
            </Box>

            <InfoBoard
              items={infoItems}
              onCardPress={it => alert(`Info: ${it.title}`)}
              theme={theme}
            />

            <PostFilterBar
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              selectedDropdown={selectedDropdown}
              setSelectedDropdown={setSelectedDropdown}
            />
          </Box>
        )}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </SafeAreaView>
  );
}

const infoItems = [
  {
    id: 'i1',
    title: 'Europe captures record share of private capital',
    subtitle:
      'Investors bet big on continent’s infrastructure spending spree as European funds raise $311 billion',
    image:
      'https://images.ft.com/v3/image/raw/ftcms%3A7743fa49-e91f-4518-a797-975f933c9877?source=next-article&fit=scale-down&quality=highest&width=700&dpr=1',
    source: 'Financial Times',
    scope: 'Global',
  },
  {
    id: 'i2',
    title: 'Robots Are Coming. What Investors Need to Know.',
    subtitle:
      'Robots are coming. Some of the numbers being floated are incredible (and challenging to use for investing).',
    image:
      'https://images.barrons.com/im-85561258?width=700&size=1.5005861664712778',
    source: 'Barron’s',
    scope: 'Global',
  },
  {
    id: 'i3',
    title: 'Public transport timetable changes',
    subtitle: 'New bus schedules take effect on Monday — check routes in the app.',
    image:
      'https://unsplash.com/photos/CI3UhW7AaZE/download?force=true&w=800',
    source: 'YLE',
    scope: 'Local',
  },
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 16 },
  errorText: { fontSize: 16, textAlign: 'center', marginBottom: 12, paddingHorizontal: 16 },
  retryButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
});
