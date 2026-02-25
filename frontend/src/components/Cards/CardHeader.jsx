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

const CardHeader = ({ author, topic }) => {
  const { theme } = useTheme();
  const tTheme = getTheme(theme);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const localizedTime = useMemo(
    () => formatTime(author.time, t),
    [author.time, t, i18n.language]
  );

  const { bg: topicBg, text: topicText } = getTopicColors(topic);
  const localizedTopic = topic ? t(`topics.${topic}`, topic) : '';

  const handleProfilePress = () => {
    if (author?.id) {
      navigation.navigate('UserProfile', { userId: author.id });
    }
  };

  return (
    <Box style={[styles.header, { backgroundColor: tTheme.cardBackground }]}>
      {/* Avatar Section */}
      <Pressable onPress={handleProfilePress} style={styles.avatarContainer}>
        <Avatar uri={author.avatar} customSize={44} />
      </Pressable>

      {/* Author Info Section */}
      <Pressable onPress={handleProfilePress} style={styles.headerCenter}>
        <Box style={styles.authorRow}>
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
              size={14}
              color="#1DA1F2"
              style={styles.verifiedBadge}
              accessibilityLabel={t('profile.verified', 'Verified account')}
            />
          )}
        </Box>

        <Text style={[styles.time, { color: tTheme.secondaryText }]}>
          {localizedTime}
        </Text>
      </Pressable>

      {/* Topic Badge Section */}
      {topic && (
        <Box style={[styles.topicBadge, { backgroundColor: topicBg }]}>
          <Text
            style={[styles.topicText, { color: topicText }]}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  avatarContainer: {
    flexShrink: 0,
  },
  headerCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  verifiedBadge: {
    flexShrink: 0,
  },
  time: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  topicBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  topicText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});

export default CardHeader;