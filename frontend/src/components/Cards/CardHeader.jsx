import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from '../Profile/Avatar';
import { getTopicColors } from '../../utils/TopicColors';
import { formatTime } from '../../utils/TimeFormatter';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons'; 

const CardHeader = ({ author, topic }) => {
  const { theme } = useTheme();
  const t = getTheme(theme);

  const { bg: topicBg, text: topicText, en: topicEnglish } = getTopicColors(topic);

  return (
    <View style={[styles.header, { backgroundColor: t.cardBackground }]}>
      <Avatar 
        uri={author.avatar}
        style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden' }}
        imageStyle={{ resizeMode: 'cover' }}
      />

      <View style={styles.headerCenter}>
        <View style={styles.authorRow}>
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
        </View>

        <Text style={[styles.time, { color: t.secondaryText }]}>
          {formatTime(author.time)}
        </Text>
      </View>

      {topic ? (
        <View style={[styles.topicContainer, { backgroundColor: topicBg }]}>
          <Text
            style={[styles.topic, { color: topicText }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {topicEnglish}
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
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },
  authorName: {
    fontWeight: '600',
    fontSize: 14,
    flexShrink: 1, // allow truncation
  },
  time: {
    fontSize: 12,
    marginTop: 2,
    flexShrink: 1,
  },
  topicContainer: {
    maxWidth: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8, // ensure spacing from author
  },
  topic: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default CardHeader;
