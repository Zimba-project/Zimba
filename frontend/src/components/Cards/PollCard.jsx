import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import StatsBar from './StatsBar';
import CardHeader from './CardHeader';
import CardContainer from './CardContainer';
import { formatTime } from '../../utils/TimeFormatter';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';
import { getTopicColors } from '../../utils/TopicColors';
import { useTranslation } from 'react-i18next';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE.replace(/\/api$/, '');

const PollCard = ({
  id,
  topic = 'Poll',
  author_id,
  author_name,
  author_avatar,
  author_verified,
  image,
  title,
  description,
  votes,
  comments,
  end_time,
  created_at,
  onShare = () => { },
  onSave = () => { },
}) => {
  const navigation = useNavigation();
  const themeFromProvider = useTheme();
  const t = getTheme(themeFromProvider?.theme);
  const { t: translate } = useTranslation();
  const { bg: topicBg, text: topicText } = getTopicColors(topic);

  const handlePress = () => {
    const postData = {
      id,
      topic,
      author_name,
      author_avatar,
      author_verified,
      image,
      title,
      description,
      votes,
      comments,
      end_time,
      created_at,
    };
    navigation.navigate('Poll', {
      postId: id,
      postData,
    });
  };

  const imageUrl = image ? (image.startsWith('http') ? image : `${API_BASE}${image}`) : null;

  const formattedEndTime = formatTime(end_time, translate);

  return (
    <Pressable onPress={handlePress} style={{}}>
      <CardContainer>
        {/* HEADER - Without badge */}
        <CardHeader
          author={{
            id: author_id,
            avatar: author_avatar?.startsWith('http')
              ? author_avatar
              : author_avatar
                ? `${API_BASE}${author_avatar}`
                : null,
            name: author_name,
            time: created_at,
            verified: author_verified
          }}
          topic={null}
        />

        {/* IMAGE with BADGE overlay */}
        {imageUrl && (
          <Box style={styles.imageWrapper}>
            <ImageBackground source={{ uri: imageUrl }} style={styles.image}>
              <Box style={styles.overlay}>
                <Text style={styles.imageTitle}>{title}</Text>
              </Box>
            </ImageBackground>
            
            {/* Topic Badge - Top Right Corner */}
            {topic && (
              <Box style={[styles.badge, { backgroundColor: topicBg }]}>
                <Text
                  style={[styles.badgeText, { color: topicText }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {translate(`topics.${topic}`, topic)}
                </Text>
              </Box>
            )}
          </Box>
        )}

        <Box style={[styles.body, { backgroundColor: t.cardBackground }]}>
          {!imageUrl && <Text style={[styles.title, { color: t.text }]}>{title}</Text>}

          <Text style={[styles.description, { color: t.text }]} numberOfLines={3}>
            {description}
          </Text>

          <Pressable style={[styles.pollButton, { backgroundColor: t.accent }]} onPress={handlePress}>
            <Text style={styles.pollButtonText}>{translate('take_poll')}</Text>
          </Pressable>

          <Box style={styles.endTime}>
            <Icon name="clock" size={14} color={t.secondaryText} />
            <Text style={[styles.endTimeText, { color: t.secondaryText }]}>
              Ends: {formattedEndTime}
            </Text>
          </Box>

          <StatsBar votes={votes} showComments={false} share={onShare} onSave={onSave} />
        </Box>
      </CardContainer>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  imageTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  pollButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  pollButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  endTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  endTimeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default React.memo(PollCard);