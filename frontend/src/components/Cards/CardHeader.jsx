import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from '../Profile/Avatar';
import { getTopicColors } from '../../utils/TopicColors';
import { formatTime } from '../../utils/TimeFormatter';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';

const CardHeader = ({ author, topic }) => {
  const themeFromProvider = useTheme();
  const t = getTheme(themeFromProvider?.theme);

  const { bg: topicBg, text: topicText } = getTopicColors(topic);

  return (
    <View style={[styles.header, { backgroundColor: t.cardBackground }]}>
      <Avatar uri={author.avatar} />
      <View style={styles.headerCenter}>
        <Text style={[styles.authorName, { color: t.text }]}>{author.name}</Text>
        <Text style={[styles.time, { color: t.secondaryText }]}>{formatTime(author.time)}</Text>
      </View>
      <View style={[styles.topicContainer, { backgroundColor: topicBg }]}>
        <Text style={[styles.topic, { color: topicText }]}>{topic}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  headerCenter: { flex: 1, marginLeft: 10 },
  authorName: { fontWeight: '600' },
  time: { fontSize: 12 },
  topicContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignItems: 'center',
  },
  topic: { fontSize: 11, fontWeight: '600' },
});

export default CardHeader;
