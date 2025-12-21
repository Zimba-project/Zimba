import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import Avatar from '../Profile/Avatar';
import { getTopicColors } from '../../utils/TopicColors';
import { formatTime } from '../../utils/TimeFormatter';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

const CardHeader = ({ author, topic }) => {
  const { theme } = useTheme();
  const t = getTheme(theme);

  const { bg: topicBg, text: topicText } = getTopicColors(topic);

  return (
    <Box style={[styles.header, { backgroundColor: t.cardBackground }]}>
      <Avatar uri={author.avatar} />

      <Box style={styles.headerCenter}>
        <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={[styles.authorName, { color: t.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {author.name}
          </Text>

          {author.verified && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color="#1DA1F2"
              style={{ marginLeft: 4 }}
            />
          )}
        </Box>

        <Text style={[styles.time, { color: t.secondaryText }]}>
          {formatTime(author.time)}
        </Text>
      </Box>

      {topic ? (
        <Box style={[styles.topicContainer, { backgroundColor: topicBg }]}>
          <Text
            style={[styles.topic, { color: topicText }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {topic}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  authorName: {
    fontWeight: '600',
    fontSize: 14,
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  topicContainer: {
    maxWidth: 100, // limit width for long topics
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topic: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default CardHeader;
