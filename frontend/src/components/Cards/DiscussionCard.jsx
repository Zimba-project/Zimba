import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import StatsBar from './StatsBar';
import CardHeader from './CardHeader';
import CardContainer from './CardContainer';

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
    return (
        <TouchableOpacity onPress={()=> navigation.navigate('Discuss')}>
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
                    <Text style={styles.preview} numberOfLines={3} ellipsizeMode="tail">{preview}</Text>
                    <StatsBar comments={comments} views={views} share={share} onSave={onSave} />
                </View>
            </CardContainer>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 180,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
        padding: 16,
    },
    imageTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    body: { padding: 16 },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#111' },
    preview: { fontSize: 14, color: '#555', marginBottom: 12 },
});

export default DiscussionCard;
