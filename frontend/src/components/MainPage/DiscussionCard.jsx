import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Avatar from '../Profile/Avatar';
import StatsBar from './StatsBar';

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
}) => (
    <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.header}>
            <Avatar uri={author.avatar} />
            <View style={styles.headerCenter}>
                <Text style={styles.authorName}>{author.name}</Text>
                <Text style={styles.time}>{author.time}</Text>
            </View>

            {/* RIGHT-ALIGNED TOPIC */}
            <View style={styles.topicContainer}>
                <Text style={styles.topic}>{topic}</Text>
            </View>
        </View>

        {/* IMAGE */}
        {image && <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />}

        {/* BODY */}
        <View style={styles.body}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.preview}>{preview}</Text>
            <StatsBar comments={comments} views={views} share={share} onSave={onSave} />

        </View>
    </View >
);

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

    image: { width: '100%', height: 180 },

    body: { padding: 16 },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#111' },
    preview: { fontSize: 14, color: '#555', marginBottom: 12 },

    /* share/save moved into StatsBar as compact icons */
});

export default DiscussionCard;