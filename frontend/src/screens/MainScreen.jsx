import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
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

const FILTER_MAP = { Discussions: 'discussion', Polls: 'poll' };

export default function MainScreen({ navigation, route }) {
    const { theme } = useTheme();
    const t = getTheme(theme);
    const user = useCurrentUser();
    const [allPosts, setAllPosts] = useState([]);
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState('New');
    const [selectedDropdown, setSelectedDropdown] = useState('All');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchPosts = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError(null);
            const posts = await getAllPosts();
            setAllPosts(posts);
        } catch (err) {
            console.error("Error fetching posts:", err.message);
            setError("Unable to fetch posts. Check your network or server.");
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
        let filtered = selectedDropdown === "All"
            ? [...allPosts]
            : allPosts.filter(p => p.type === FILTER_MAP[selectedDropdown]);
        if (selectedTab === "New") {
            filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (selectedTab === "Hot") {
            filtered = [...filtered].sort((a, b) => b.votes - a.votes);
        } else if (selectedTab === 'Top') {
            filtered = [...filtered].sort((a, b) => b.comments - a.comments);
        }
        setFeed(filtered);
        const timer = setTimeout(() => setIsProcessing(false), 200);
        return () => clearTimeout(timer);
    }, [selectedDropdown, selectedTab, allPosts]);

    const handleRefresh = () => fetchPosts(true);

    if (loading) {
        return (
            <SafeAreaView edges={["bottom"]} style={[styles.centered, { backgroundColor: t.background }]}>
                <ActivityIndicator size="large" color={t.accent} />
                <Text style={[styles.loadingText, { color: t.secondaryText }]}>Loading posts...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView edges={["bottom"]} style={[styles.centered, { backgroundColor: t.background }]}>
                <Text style={[styles.errorText, { color: t.error }]}>{error}</Text>
                <Pressable style={[styles.retryButton, { backgroundColor: t.accent }]} onPress={() => fetchPosts()}>
                    <Text style={styles.retryText}>Retry</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: t.background }]} edges={["bottom"]}>
            <FlatList
                data={feed}
                keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
                renderItem={({ item }) => (
                    <Pressable onPress={() => navigation.navigate("PostDetails", { postId: item.id })}>
                        {item.type === "poll" ? (
                            <PollCard {...item} theme={theme} />
                        ) : (
                            <DiscussionCard {...item} theme={theme} />
                        )}
                    </Pressable>
                )}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <Box style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                        <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: t.text }}>Upcoming in your area</Text>
                            <Pressable onPress={() => alert('Show all upcoming changes')}>
                                <Text style={{ color: t.accent, fontWeight: '600' }}>See all</Text>
                            </Pressable>
                        </Box>

                        <InfoBoard
                            items={infoItems}
                            onCardPress={(it) => alert(`Info: ${it.title}`)}
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
        title: 'Traffic arrangements in downtown (week 45)',
        subtitle: 'Road and cable works in the city center — expect detours and temporary closures.',
        image: 'https://unsplash.com/photos/HCDmcskE_Zk/download?force=true&w=800',

    },
    {
        id: 'i2',
        title: 'City park renovation begins',
        subtitle: 'Park renovation starts next month: walking paths will be adjusted and the playground renewed.',
        image: 'https://unsplash.com/photos/GjnpGl9KYL4/download?force=true&w=800',

    },
    {
        id: 'i3',
        title: 'Public transport timetable changes',
        subtitle: 'New bus schedules take effect on Monday — check routes in the app.',
        image: 'https://unsplash.com/photos/CI3UhW7AaZE/download?force=true&w=800',

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
