import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from '../Profile/Avatar';
import { getTopicColors } from '../../utils/TopicColors';
import { formatTime } from '../../utils/TimeFormatter';

const CardHeader = ({ author, topic }) => {
    const { bg, text } = getTopicColors(topic);
    return (
        <View style={styles.header}>
            <Avatar uri={author.avatar} />
            <View style={styles.headerCenter}>
                <Text style={styles.authorName}>{author.name}</Text>
                <Text style={styles.time}>{formatTime(author.time)}</Text>
            </View>
            <View style={[styles.topicContainer, { backgroundColor: bg }]}>
                <Text style={[styles.topic, { color: text }]}>{topic}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    headerCenter: { flex: 1, marginLeft: 10 },
    authorName: { fontWeight: '600', color: '#111' },
    time: { fontSize: 12, color: '#666' },
    topicContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        alignItems: 'center',
    },
    topic: { fontSize: 11, fontWeight: '600' },
});

export default CardHeader;
