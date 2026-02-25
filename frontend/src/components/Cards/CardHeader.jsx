import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import Avatar from '../Profile/Avatar';
import { getTopicColors } from '../../utils/TopicColors';
import { formatTime } from '../../utils/TimeFormatter';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

// Helper function to get relative time
const getRelativeTime = (timestamp, t) => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffMs = now - postTime;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffSecs < 5) return t('time.justNow', 'just now');
  if (diffSecs < 60) return t('time.secondsAgo', '{{count}} seconds ago', { count: diffSecs }).replace('{{count}}', diffSecs);
  if (diffMins < 60) return t('time.minutesAgo', '{{count}} minutes ago', { count: diffMins }).replace('{{count}}', diffMins);
  if (diffHours < 24) return t('time.hoursAgo', '{{count}} hours ago', { count: diffHours }).replace('{{count}}', diffHours);
  return t('time.daysAgo', '{{count}} day ago', { count: diffDays }).replace('{{count}}', diffDays);
};

const shouldShowFullDate = (timestamp) => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffMs = now - postTime;
  const diffDays = Math.floor(diffMs / 86400000);
  return diffDays >= 7;
};

const CardHeader = ({ author, topic }) => {
  const { theme } = useTheme();
  const tTheme = getTheme(theme);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const { bg: topicBg, text: topicText } = getTopicColors(topic);
  const localizedTopic = topic ? t(`topics.${topic}`, topic) : '';

  const handleProfilePress = () => {
    if (author?.id) {
      navigation.navigate('UserProfile', { userId: author.id });
    }
  };

  return (
    <Box style={[styles.header, { backgroundColor: tTheme.cardBackground }]}>
      <Box style={styles.mainRow}>
        <Pressable onPress={handleProfilePress} style={styles.avatarWrapper}>
          <Avatar uri={author.avatar} customSize={44} />
        </Pressable>
        <Pressable onPress={handleProfilePress} style={styles.nameSection}>
          <Box style={styles.nameRow}>
            <Text
              style={[styles.authorName, { color: tTheme.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {author.name}
            </Text>
            {author.verified && (
              <Ionicons
                name="checkmark-circle-sharp"
                size={15}
                color="#1DA1F2"
                style={styles.verifiedIcon}
              />
            )}
          </Box>
          <Text style={[styles.timeText, { color: tTheme.secondaryText }]}>
            {shouldShowFullDate(author.time)
              ? formatTime(author.time, t)
              : getRelativeTime(author.time, t)}
          </Text>
        </Pressable>
      </Box>
      {topic && (
        <Box style={styles.badgeRow}>
          <Box style={[styles.badge, { backgroundColor: topicBg }]}>
            <Text
              style={[styles.badgeText, { color: topicText }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {localizedTopic}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatarWrapper: {
    flexShrink: 0,
  },
  nameSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  verifiedIcon: {
    flexShrink: 0,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: -0.2,
    marginTop: 2,
  },
  badgeRow: {
    paddingLeft: 54,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});

export default CardHeader;