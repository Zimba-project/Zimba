import React from 'react';
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
import { useNavigation } from '@react-navigation/native';

const CardHeader = ({ author, topic }) => {
  const { theme } = useTheme();
  const t = getTheme(theme);
  const navigation = useNavigation();

  const { bg: topicBg, text: topicText, en: topicEnglish } = getTopicColors(topic);

  const handleProfilePress = () => {
    if (author.id) {
      navigation.navigate('UserProfile', { userId: author.id });
    }
  };

  return (
    <Box style={[styles.header, { backgroundColor: t.cardBackground }]}>
      <Pressable onPress={handleProfilePress}>
        <Avatar 
          uri={author.avatar}
          style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden' }}
          imageStyle={{ resizeMode: 'cover' }}
        />
      </Pressable>

      <Box style={styles.headerCenter}>
        <Pressable onPress={handleProfilePress}>
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
        </Pressable>

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
            {topicEnglish}
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
