import React from 'react';
import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import StatsBar from './StatsBar';
import CardHeader from './CardHeader';
import CardContainer from './CardContainer';
import { formatTime } from '../../utils/TimeFormatter';
import useThemedStyles from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeProvider';

const PollCard = ({
    topic = 'Poll',
    author_name,
    author_avatar,
    image,
    title,
    description,
    votes,
    comments,
    end_time,
    created_at,
    onTakePoll = () => { },
    onShare = () => { },
    onSave = () => { },
}) => {
    const { colors } = useTheme();
    const t = useThemedStyles((c) => ({
        image: { width: '100%', height: 180, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
        overlay: { flex: 1, justifyContent: 'flex-end', padding: 16 },
        imageTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
        body: { padding: 16 },
        title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: c.text },
        description: { fontSize: 14, color: c.muted, marginBottom: 12 },
        pollButton: {
            backgroundColor: c.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 12,
        },
        pollButtonText: { color: c.onPrimary || '#fff', fontWeight: '600', fontSize: 16 },
        endTime: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
        endTimeText: { marginLeft: 6, fontSize: 12, color: c.muted },
    }));

    // Build overlay rgba if token exists, otherwise fallback to neutral overlay
    const overlayBg = colors?.overlay
        ? colors.overlay.replace(/^rgb\(/, 'rgba(').replace(/\)$/, ',0.32)')
        : 'rgba(0,0,0,0.32)';

    return (
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
                <Text style={t.description} numberOfLines={3} ellipsizeMode="tail">{description}</Text>

                <TouchableOpacity style={t.pollButton} onPress={onTakePoll}>
                    <Text style={t.pollButtonText}>Take a Poll</Text>
                </TouchableOpacity>

                <View style={t.endTime}>
                    <Icon name="clock" size={14} color={colors.muted} />
                    <Text style={t.endTimeText}>Ends: {formatTime(end_time)}</Text>
                </View>

                <StatsBar votes={votes} comments={comments} share={onShare} onSave={onSave} />
            </View>
        </CardContainer>
    );
};

export default PollCard;
