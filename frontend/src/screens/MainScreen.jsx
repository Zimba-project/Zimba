import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import InfoBoard from '../components/MainPage/InfoBoard';
import PollCard from '../components/Cards/PollCard';
import DiscussionCard from '../components/Cards/DiscussionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllPosts } from '../api/postService';
import useThemedStyles from '../theme/useThemedStyles';
import { useTheme } from '../theme/ThemeProvider';

const MainScreen = ({ navigation, route }) => {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = route?.params?.user;

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);

            const posts = await getAllPosts();
            /*const polls = posts.filter(p => p.type === 'poll');
            const discussions = posts.filter(p => p.type === 'discussion');
      
            const mixed = [];
            const max = Math.max(polls.length, discussions.length);
            for (let i = 0; i < max; i++) {
              if (polls[i]) mixed.push({ ...polls[i], _type: 'poll' });
              if (discussions[i]) mixed.push({ ...discussions[i], _type: 'discussion' });
            }*/

            setFeed(posts);
        } catch (err) {
            console.error("Error fetching posts:", err.message);
            setError("Unable to fetch posts. Check your network or server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const { colors } = useTheme();
    const t = useThemedStyles((c) => ({
        container: { flex: 1, backgroundColor: c.background },
        centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background },
        loadingText: { marginTop: 8, fontSize: 16, color: c.text },
        errorText: { color: c.danger, fontSize: 16, textAlign: 'center', marginBottom: 12, paddingHorizontal: 16 },
        retryButton: { backgroundColor: c.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
        retryText: { color: c.onPrimary, fontWeight: '600' },
        headerTitle: { fontSize: 18, fontWeight: '700', color: c.text },
        seeAll: { color: c.primary, fontWeight: '600' }
    }));

    // Info items use theme surface for background so no hard-coded colors remain
    const infoItems = [
        {
            id: 'i1',
            title: 'Traffic arrangements in downtown (wk 45)',
            subtitle: 'Road and cable works in the city center — expect detours and temporary closures.',
            image: 'https://unsplash.com/photos/HCDmcskE_Zk/download?force=true&w=800',
            background: colors?.surface,
        },
        {
            id: 'i2',
            title: 'City park renovation begins',
            subtitle: 'Park renovation starts next month: walking paths will be adjusted and the playground renewed.',
            image: 'https://unsplash.com/photos/GjnpGl9KYL4/download?force=true&w=800',
            background: colors?.surface,
        },
        {
            id: 'i3',
            title: 'Public transport timetable changes',
            subtitle: 'New bus schedules take effect on Monday — check routes in the app.',
            image: 'https://unsplash.com/photos/CI3UhW7AaZE/download?force=true&w=800',
            background: colors?.surface,
        },
    ];

    if (loading) {
        return (
            <SafeAreaView style={t.centered}>
                <ActivityIndicator size="large" color={colors?.primary} />
                <Text style={t.loadingText}>Loading posts...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={t.centered}>
                <Text style={t.errorText}>{error}</Text>
                <TouchableOpacity style={t.retryButton} onPress={fetchPosts}>
                    <Text style={t.retryText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={t.container} edges={["bottom"]}>
            <FlatList
                data={feed}
                keyExtractor={(item, index) => `${item._type}-${item.id}-${index}`}
                renderItem={({ item }) =>
                    item._type === 'poll' ? (
                        <PollCard
                            {...item}
                            onTakePoll={() => alert('Poll opened!')}
                            share={item.share}
                            onSave={item.onSave}
                        />
                    ) : (
                        <DiscussionCard
                            {...item}
                            share={item.share}
                            onSave={item.onSave}
                        />
                    )
                }
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={t.headerTitle}>Upcoming in your area</Text>
                            <TouchableOpacity onPress={() => alert('Show all upcoming changes')}>
                                <Text style={t.seeAll}>See all</Text>
                            </TouchableOpacity>
                        </View>

                        <InfoBoard
                            items={infoItems}
                            onCardPress={(it) => alert(`Info: ${it.title}`)}
                        />
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 24 }}
            />
        </SafeAreaView>
    );
};

// infoItems moved into component to use theme tokens

// styles removed — use themed styles via `useThemedStyles` (variable `t`)

export default MainScreen;
