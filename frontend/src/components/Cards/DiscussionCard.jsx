import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, useAnimatedValue } from 'react-native';
import StatsBar from './StatsBar';
import CardHeader from './CardHeader';
import CardContainer from './CardContainer';
import { useNavigation } from '@react-navigation/native';

const DiscussionCard = ({
    id,
    topic = 'Discussion',
    author_name,
    author_avatar,
    image,
    title,
    description,
    comments,
    views,
    created_at,
    onShare = () => {},
    onSave = () => {},

}) => {

    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('Discuss', {
            postId: id,
            postData: {
                id,
                topic,
                author_name,
                author_avatar,
                image,
                title,
                description,
                comments,
                views,
                created_at,
            },
        });
    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <CardContainer>
                {/* HEADER */}
                <CardHeader author={{ avatar: author_avatar, name: author_name, time: created_at }} topic={topic}/>

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
                    <Text style={styles.preview} numberOfLines={3} ellipsizeMode="tail">{description}</Text>
                    <StatsBar comments={comments} views={views} share={onShare} onSave={onSave} />
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
