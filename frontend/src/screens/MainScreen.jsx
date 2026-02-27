import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FlatList, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
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

const PAGE_SIZE = 10;

export default function MainScreen({ navigation }) {
  const { theme } = useTheme();
  const t = getTheme(theme);
  const { t: translate } = useTranslation();
  const user = useCurrentUser();
  const isDark = theme === 'dark';
  const isFocused = useIsFocused();
  const flatListRef = useRef(null);

  const gradientColors = useMemo(() =>
    isDark
      ? ['#111827', '#1e3a5f', '#1f2937']
      : ['#f0f4ff', '#dbeafe', '#eff6ff'],
    [isDark]
  );

  const [allPosts, setAllPosts] = useState([]);
  const [feed, setFeed] = useState([]);
  const [displayedFeed, setDisplayedFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [selectedTab, setSelectedTab] = useState('new');
  const [selectedDropdown, setSelectedDropdown] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);

  // Scroll to top when home tab is pressed while already on this screen
  useEffect(() => {
    const unsubscribe = navigation.getParent()?.addListener('tabPress', (e) => {
      if (isFocused) {
        e.preventDefault();
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    });
    return unsubscribe;
  }, [isFocused, navigation]);

  const applyFilterAndSort = (posts, dropdown, tab) => {
    let filtered =
      dropdown === 'all'
        ? [...posts]
        : posts.filter(p => p.type === FILTER_MAP[dropdown]);

    if (tab === 'new') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (tab === 'hot') {
      filtered.sort((a, b) => b.votes - a.votes);
    } else if (tab === 'top') {
      filtered.sort((a, b) => b.comments - a.comments);
    }

    return filtered;
  };

  const resetPagination = (filtered) => {
    setFeed(filtered);
    setPage(1);
    setDisplayedFeed(filtered.slice(0, PAGE_SIZE));
    setHasMore(filtered.length > PAGE_SIZE);
  };

  const fetchPosts = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);
      const posts = await getAllPosts();
      setAllPosts(posts);

      const filtered = applyFilterAndSort(posts, selectedDropdown, selectedTab);
      resetPagination(filtered);
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
    const filtered = applyFilterAndSort(allPosts, selectedDropdown, selectedTab);
    resetPagination(filtered);

    const timer = setTimeout(() => setIsProcessing(false), 200);
    return () => clearTimeout(timer);
  }, [selectedDropdown, selectedTab, allPosts]);

  const handleLoadMore = () => {
    if (!hasMore || isProcessing) return;
    const nextPage = page + 1;
    const nextItems = feed.slice(0, nextPage * PAGE_SIZE);
    setDisplayedFeed(nextItems);
    setPage(nextPage);
    setHasMore(nextItems.length < feed.length);
  };

  const handleRefresh = () => fetchPosts(true);

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <LinearGradient colors={gradientColors} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
        <SafeAreaView edges={['']} style={styles.centered}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={[styles.loadingText, { color: t.secondaryText }]}>
            {translate('loading_posts')}
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.wrapper}>
        <LinearGradient colors={gradientColors} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
        <SafeAreaView edges={['']} style={styles.centered}>
          <Text style={[styles.errorText, { color: t.error }]}>{error}</Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: t.accent }]}
            onPress={() => fetchPosts()}
          >
            <Text style={styles.retryText}>{translate('retry')}</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.container} edges={['']}>
        <FlatList
          ref={flatListRef}
          data={displayedFeed}
          keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
              style={styles.cardWrapper}
            >
              {item.type === 'poll' ? (
                <PollCard {...item} theme={theme} />
              ) : (
                <DiscussionCard {...item} theme={theme} />
              )}
            </Pressable>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={() => (
            <Box style={styles.listHeader}>
              <Box style={styles.sectionRow}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>
                  {translate('upcoming')}
                </Text>
                <Pressable onPress={() => alert(translate('show_all_upcoming'))}>
                  <Text style={[styles.seeAll, { color: t.accent }]}>
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
          ListFooterComponent={() =>
            hasMore ? (
              <ActivityIndicator
                size="small"
                color={t.accent}
                style={{ marginVertical: 20 }}
              />
            ) : (
              <Text style={[styles.endText, { color: t.secondaryText }]}>
                You're all caught up
              </Text>
            )
          }
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      </SafeAreaView>
    </View>
  );
}

const infoItems = [
  {
    id: 'i1',
    title: 'Europe captures record share of private capital',
    subtitle:
      'Investors bet big on continent\'s infrastructure spending spree as European funds raise $311 billion',
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
    source: 'Barron\'s',
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
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontWeight: '600',
    fontSize: 14,
  },
  cardWrapper: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  endText: {
    textAlign: 'center',
    fontSize: 13,
    marginVertical: 20,
  },
});