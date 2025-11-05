import React from 'react';
import { SafeAreaView, ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardHeader from '../components/Cards/CardHeader';
import StatsBar from './../components/Cards/StatsBar';

const Discuss = () => {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { postData } = route.params || {};

    if (!postData) {
        return (
            <SafeAreaView style={[styles.center, { paddingTop: insets.top }]}>
                <Text>No post data available</Text>
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
            <ScrollView>
                <CardHeader
                    author={{ avatar: author_avatar, name: author_name, time: created_at }}
                    topic={topic}
                />
                {image && <Image source={{ uri: image }} style={styles.image} />}
                <View style={styles.body}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>
                    <StatsBar comments={comments} views={views} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    image: { width: '100%', height: 250 },
    body: { padding: 16 },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#111' },
    description: { fontSize: 16, color: '#555', lineHeight: 22 },
});

export default Discuss;
