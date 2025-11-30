import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import Avatar from '../Profile/Avatar';
import { getTopicColors } from '../../utils/TopicColors';
import { formatTime } from '../../utils/TimeFormatter';

const CardHeader = ({ author, topic }) => {
    const { bg, text } = getTopicColors(topic);
    return (
        <Box className="flex-row items-center p-3">
            <Avatar uri={author.avatar} />
            <Box className="flex-1 ml-2.5">
                <Text size="sm" className="text-typography-900 font-semibold">{author.name}</Text>
                <Text size="xs" className="text-typography-600">{formatTime(author.time)}</Text>
            </Box>
            <Box style={[styles.topicContainer, { backgroundColor: bg }]}>
                <Text size="xs" style={[styles.topic, { color: text }]}>{topic}</Text>
            </Box>
        </Box>
    );
};

const styles = StyleSheet.create({
    topicContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        alignItems: 'center',
    },
    topic: { fontWeight: '600' },
});

export default CardHeader;
