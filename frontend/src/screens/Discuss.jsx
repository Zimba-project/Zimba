import React from 'react';
import { SafeAreaView, ScrollView, View, Text, Image } from 'react-native';
import useThemedStyles from '../theme/useThemedStyles';
import { useTheme } from '../theme/ThemeProvider';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardHeader from '../components/Cards/CardHeader';
import StatsBar from './../components/Cards/StatsBar';

const Discuss = () => {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { postData } = route.params || {};
    const { colors } = useTheme();
    const t = useThemedStyles((c) => ({
        container: { flex: 1, backgroundColor: c.background },
        center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        image: { width: '100%', height: 250 },
        body: { padding: 16 },
        title: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: c.text },
        description: { fontSize: 16, color: c.muted, lineHeight: 22 },
    }));

    if (!postData) {
        return (
            <SafeAreaView style={[t.center, { paddingTop: insets.top }]}>
                <Text style={{ color: colors?.muted }}>No post data available</Text>
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
        <SafeAreaView style={[t.container, { paddingTop: insets.top }]}>
            <ScrollView>
                <CardHeader
                    author={{ avatar: author_avatar, name: author_name, time: created_at }}
                    topic={topic}
                />
                {image && <Image source={{ uri: image }} style={t.image} />}
                <View style={t.body}>
                    <Text style={t.title}>{title}</Text>
                    <Text style={t.description}>{description}</Text>
                    <StatsBar comments={comments} views={views} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Discuss;
