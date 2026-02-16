import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import Avatar from '../Profile/Avatar';
import { getTopicColors } from '../../utils/TopicColors';
import { formatTime } from '../../utils/TimeFormatter';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const CardHeader = ({ author, topic }) => {
  const { theme } = useTheme();
  const tTheme = getTheme(theme);
  const { t, i18n } = useTranslation();

  // Memoize localized time
  const localizedTime = useMemo(
    () => formatTime(author.time, t),
    [author.time, t, i18n.language]
  );

  // Get topic colors
  const { bg: topicBg, text: topicText } = getTopicColors(topic);
  const localizedTopic = topic ? t(`topics.${topic}`, topic) : '';

  return (
    <Box style={[styles.header, { backgroundColor: tTheme.cardBackground }]}>
      <Avatar
        uri={author.avatar}
        style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden' }}
        imageStyle={{ resizeMode: 'cover' }}
      />

      <Box style={styles.headerCenter}>
        <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={[styles.authorName, { color: tTheme.text }]}
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
              accessibilityLabel={t('profile.verified', 'Verified account')}
            />
          )}
        </Box>

        <Text style={[styles.time, { color: tTheme.secondaryText }]}>
          {localizedTime}
        </Text>
      </Box>

      {topic && (
        <Box style={[styles.topicContainer, { backgroundColor: topicBg }]}>
          <Text
            style={[styles.topic, { color: topicText }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {localizedTopic}
          </Text>
        </Box>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  headerCenter: { flex: 1, marginLeft: 10, justifyContent: 'center' },
  authorName: { fontWeight: '600', fontSize: 14, flexShrink: 1 },
  time: { fontSize: 12, marginTop: 2, flexShrink: 1 },
  topicContainer: {
    maxWidth: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  topic: { fontSize: 11, fontWeight: '600' },
});

export default CardHeader;
