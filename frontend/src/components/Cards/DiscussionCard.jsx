import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import StatsBar from './StatsBar';
import CardHeader from './CardHeader';
import CardContainer from './CardContainer';
import { useNavigation } from '@react-navigation/native';
import useThemedStyles from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeProvider';

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
    onShare = () => { },
    onSave = () => { },

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

    const { colors } = useTheme();
    const t = useThemedStyles((c) => ({
        image: {
            width: '100%',
            height: 180,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: 'hidden',
        },
        overlay: {
            flex: 1,
            justifyContent: 'flex-end',
            padding: 16,
        },
        imageTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
        body: { padding: 16 },
        title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: c.text },
        preview: { fontSize: 14, color: c.muted, marginBottom: 12 },
    }));

    const overlayBg = colors?.overlay
        ? colors.overlay.replace(/^rgb\(/, 'rgba(').replace(/\)$/, ',0.32)')
        : 'rgba(0,0,0,0.3)';

    return (
        <TouchableOpacity onPress={handlePress}>
            <CardContainer>
                {/* HEADER */}
                <CardHeader author={{ avatar: author_avatar, name: author_name, time: created_at }} topic={topic} />

                {/* IMAGE (title overlays image) */}
                {image && (
                    <ImageBackground source={{ uri: image }} style={t.image}>
                        <View style={[t.overlay, { backgroundColor: overlayBg }]}>
                            <Text style={t.imageTitle}>{title}</Text>
                        </View>
                    </ImageBackground>
                )}

                {/* BODY */}
                <View style={t.body}>
                    {!image && <Text style={t.title}>{title}</Text>}
                    <Text style={t.preview} numberOfLines={3} ellipsizeMode="tail">{description}</Text>
                    <StatsBar comments={comments} views={views} share={onShare} onSave={onSave} />
                </View>
            </CardContainer>
        </TouchableOpacity>
    );
};

export default DiscussionCard;
