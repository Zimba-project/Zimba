import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Ionicons } from '@expo/vector-icons';
import { searchPosts } from '../api/postService';
import DiscussionCard from '../components/Cards/DiscussionCard';
import PollCard from '../components/Cards/PollCard';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';

export default function TopicResultsScreen({ route, navigation }) {
    const { topic } = route.params || {};
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const { theme } = useTheme();
    const t = getTheme(theme);

    useEffect(() => {
        const fetchTopicPosts = async () => {
            if (!topic) return;
            try {
                setLoading(true);
                const res = await searchPosts(topic);
                setResults(res || []);
            } catch (err) {
                console.error('Failed to fetch topic posts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTopicPosts();
    }, [topic]);

    const renderItem = ({ item }) => {
        const onPress = () => {
            navigation.navigate(item.type === 'poll' ? 'Poll' : 'Discuss', { postData: item });
        };
        return (
            <Pressable onPress={onPress}>
                {item.type === 'poll' ? <PollCard {...item} theme={theme} /> : <DiscussionCard {...item} theme={theme} />}
            </Pressable>
        );
    };

    return (
        <SafeAreaView edges={["bottom"]} style={[styles.container, { backgroundColor: t.background }]}>
            {loading ? (
                <Box style={styles.center}>
                    <ActivityIndicator size="large" color={t.accent} />
                </Box>
            ) : results.length === 0 ? (
                <Box style={styles.center}>
                    <Ionicons name="document-text-outline" size={48} color={t.secondaryText} />
                    <Text style={[styles.emptyText, { color: t.secondaryText }]}>
                        No posts found for "{topic}"
                    </Text>
                </Box>
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
    container: { flex: 1 },
    // header removed to avoid duplicate top bar; using global stack header
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        textAlign: 'center',
    },
});
