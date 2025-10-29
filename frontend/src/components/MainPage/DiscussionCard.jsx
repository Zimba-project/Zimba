import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import Avatar from '../Profile/Avatar';
import StatsBar from './StatsBar';
import { getTopicColors } from '../../utils/TopicColors';

const DiscussionCard = ({
    author,
    image,
    title,
    preview,
    comments,
    topic = 'Discussion',
    views,
    onSave,
    share,
}) => {
    const { bg, text } = getTopicColors(topic);

    return (
        <View style={styles.card}>
            {/* HEADER */}
            <View style={styles.header}>
                <Avatar uri={author.avatar} />
                <View style={styles.headerCenter}>
                    <Text style={styles.authorName}>{author.name}</Text>
                    <Text style={styles.time}>{author.time}</Text>
                </View>

                {/* TOPIC BADGE */}
                <View style={[styles.topicContainer, { backgroundColor: bg }]}>
                    <Text style={[styles.topic, { color: text }]}>{topic}</Text>
                </View>
            </View>

            {/* IMAGE */}
            {image && (
                <ImageBackground source={{ uri: image }} style={styles.image}>
                    <View style={styles.overlay}>
                        <Text style={styles.imageTitle}>{title}</Text>
                    </View>
                </ImageBackground>
            )}

            {/* BODY */}
            <View style={styles.body}>
                {!image && <Text style={styles.title}>{title}</Text>}
                <Text style={styles.preview} numberOfLines={3} ellipsizeMode="tail">{preview}</Text>
                <StatsBar comments={comments} views={views} share={share} onSave={onSave} />

            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    card: { backgroundColor: '#fff', borderRadius: 16, margin: 16, overflow: 'hidden', elevation: 3 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    headerCenter: { flex: 1, marginLeft: 10 },
    authorName: { fontWeight: '600', color: '#111' },
    time: { fontSize: 12, color: '#666' },

    topicContainer: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
    },
    topic: { fontSize: 11, fontWeight: '600', color: '#d97706' },

    image: { width: '100%', height: 180, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end', padding: 16 },
    imageTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

    body: { padding: 16 },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#111' },
    preview: { fontSize: 14, color: '#555', marginBottom: 12 },

    /* share/save moved into StatsBar as compact icons */
});

export default DiscussionCard;