import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from '../Profile/Avatar';
import { getTopicColors } from '../../utils/TopicColors';
import { formatTime } from '../../utils/TimeFormatter';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';

const CardHeader = ({ author, topic }) => {
  const { theme } = useTheme();
  const t = getTheme(theme);

  const { bg: topicBg, text: topicText } = getTopicColors(topic);

  return (
    <View style={[styles.header, { backgroundColor: t.cardBackground }]}>
      <Avatar uri={author.avatar} />

      <View style={styles.headerCenter}>
        <Text
          style={[styles.authorName, { color: t.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {author.name}
        </Text>
        <Text style={[styles.time, { color: t.secondaryText }]}>{formatTime(author.time)}</Text>
      </View>

      {topic ? (
        <View style={[styles.topicContainer, { backgroundColor: topicBg }]}>
          <Text
            style={[styles.topic, { color: topicText }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {topic}
          </Text>
        </View>
      ) : null}
    </View>
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
