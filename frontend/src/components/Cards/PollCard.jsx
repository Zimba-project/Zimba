import React from 'react';
import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import StatsBar from './StatsBar';
import CardHeader from './CardHeader';
import CardContainer from './CardContainer';

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
}) => {
    return (
        <CardContainer>
            {/* HEADER */}
            <CardHeader author={author} topic={topic} />

            {/* IMAGE (title overlays image) */}
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
                <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">{description}</Text>

                <TouchableOpacity style={styles.pollButton} onPress={onTakePoll}>
                    <Text style={styles.pollButtonText}>Take a Poll</Text>
                </TouchableOpacity>

                <View style={styles.endTime}>
                    <Icon name="clock" size={14} color="#6b7280" />
                    <Text style={styles.endTimeText}>Ends: {endTime}</Text>
                </View>

                <StatsBar votes={votes} comments={comments} share={share} onSave={onSave} />
            </View>
        </CardContainer>
    );
};

const styles = StyleSheet.create({
    image: { width: '100%', height: 180, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
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
});

export default PollCard;
