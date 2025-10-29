import React from 'react';
import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import Avatar from '../Profile/Avatar';
import StatsBar from './StatsBar';

const PollCard = ({
    author,
    image,
    title,
    description,
    votes,
    comments,
    endTime,
    onTakePoll,
    topic = 'Poll',
    share,
    onSave,
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
            <Text style={styles.description}>{description}</Text>

            {/* TAKE A POLL */}
            <TouchableOpacity style={styles.pollButton} onPress={onTakePoll}>
                <Text style={styles.pollButtonText}>Take a Poll</Text>
            </TouchableOpacity>

            {/* END TIME WITH CLOCK ICON */}
            <View style={styles.endTime}>
                <Icon name="clock" size={14} color="#6b7280" />
                <Text style={styles.endTimeText}>Ends: {endTime}</Text>
            </View>
            <StatsBar votes={votes} comments={comments} share={share} onSave={onSave} />
        </View>
    </View>
);

const styles = StyleSheet.create({
    card: { backgroundColor: '#fff', borderRadius: 16, margin: 16, overflow: 'hidden', elevation: 3 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    headerCenter: { flex: 1, marginLeft: 10 },
    authorName: { fontWeight: '600', color: '#111' },
    time: { fontSize: 12, color: '#666' },

    topicContainer: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        minWidth: 60,
        alignItems: 'center',
    },
    topic: { fontSize: 11, fontWeight: '600', color: '#1e40af' },

    image: { height: 180 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end', padding: 16 },
    imageTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

    body: { padding: 16 },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#111' },
    description: { fontSize: 14, color: '#555', marginBottom: 12 },

    pollButton: {
        backgroundColor: '#6366f1',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    pollButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },

    endTime: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    endTimeText: { marginLeft: 6, fontSize: 12, color: '#6b7280' },

    /* share/save moved into StatsBar as compact icons */
});

export default PollCard;