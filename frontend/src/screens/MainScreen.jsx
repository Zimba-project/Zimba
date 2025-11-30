import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import InfoBoard from '../components/MainPage/InfoBoard';
import PollCard from '../components/Cards/PollCard';
import DiscussionCard from '../components/Cards/DiscussionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllPosts } from '../api/postService';
import { FilterBar } from '../components/MainPage/FilterBar';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

const FILTER_MAP = { Discussions: 'discussion', Polls: 'poll', };

export default function MainScreen({ navigation, route }) {
    const [allPosts, setAllPosts] = useState([]);
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState('All');

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
        const filtered = selectedFilter === "All" ? allPosts : allPosts.filter((p) => p.type === FILTER_MAP[selectedFilter]);
        setFeed(filtered);
    }, [selectedFilter, allPosts]);

    const handleRefresh = () => fetchPosts(true);

    if (loading) {
        return (
            <SafeAreaView style={styles.centered} className="bg-background-0">
                <ActivityIndicator size="large" className="text-primary-500" />
                <Text size="md" className="text-typography-700 mt-2">Loading posts...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.centered} className="bg-background-0">
                <Text size="md" className="text-error-600 text-center mb-3 px-4">{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => fetchPosts()}>
                    <Text className="text-typography-0 font-semibold">Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} className="bg-background-0" edges={["bottom"]}>
            <FlatList
                data={feed}
                keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate("PostDetails", { postId: item.id })}>
                        {item.type === "poll" ? (
                            <PollCard {...item} />
                        ) : (
                            <DiscussionCard {...item} />
                        )}
                    </TouchableOpacity>
                )}

                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <Box style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                        <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text size="xl" className="text-typography-900 font-bold">Upcoming in your area</Text>
                            <TouchableOpacity onPress={() => alert('Show all upcoming changes')}>
                                <Text size="md" className="text-primary-500 font-semibold">See all</Text>
                            </TouchableOpacity>
                        </Box>

                        <InfoBoard
                            items={infoItems}
                            onCardPress={(it) => alert(`Info: ${it.title}`)}
                        />
                        <FilterBar selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
                    </Box>
                )}
                contentContainerStyle={{ paddingBottom: 24 }}
                onRefresh={handleRefresh}
                refreshing={refreshing}
            />
        </SafeAreaView>
    );
};

const infoItems = [
    {
        id: 'i1',
        title: 'Traffic arrangements in downtown (wk 45)',
        subtitle: 'Road and cable works in the city center — expect detours and temporary closures.',
        image: 'https://unsplash.com/photos/HCDmcskE_Zk/download?force=true&w=800',
        background: '#fffaf0',
    },
    {
        id: 'i2',
        title: 'City park renovation begins',
        subtitle: 'Park renovation starts next month: walking paths will be adjusted and the playground renewed.',
        image: 'https://unsplash.com/photos/GjnpGl9KYL4/download?force=true&w=800',
        background: '#f9fafb',
    },
    {
        id: 'i3',
        title: 'Public transport timetable changes',
        subtitle: 'New bus schedules take effect on Monday — check routes in the app.',
        image: 'https://unsplash.com/photos/CI3UhW7AaZE/download?force=true&w=800',
        background: '#fff7ed',
    },
];

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    retryButton: { backgroundColor: '#6366f1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
});