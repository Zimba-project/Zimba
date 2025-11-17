import React from 'react';
import { View, Text } from 'react-native';
import Avatar from '../Profile/Avatar';
import { getTopicColors } from '../../utils/TopicColors';
import { formatTime } from '../../utils/TimeFormatter';
import useThemedStyles from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeProvider';

const CardHeader = ({ author, topic }) => {
    const { bg, text } = getTopicColors(topic);
    const { colors } = useTheme();
    const t = useThemedStyles((c) => ({
        header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
        headerCenter: { flex: 1, marginLeft: 10 },
        authorName: { fontWeight: '600', color: c.text },
        time: { fontSize: 12, color: c.muted },
        topicContainer: {
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 20,
            alignItems: 'center',
        },
        topic: { fontSize: 11, fontWeight: '600' },
    }));

    return (
        <View style={t.header}>
            <Avatar uri={author.avatar} />
            <View style={t.headerCenter}>
                <Text style={t.authorName}>{author.name}</Text>
                <Text style={t.time}>{formatTime(author.time)}</Text>
            </View>
            <View style={[t.topicContainer, { backgroundColor: bg ?? colors.surface }]}>
                <Text style={[t.topic, { color: text ?? colors.text }]}>{topic}</Text>
            </View>
        </View>
    );
};

export default CardHeader;
