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
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE.replace(/\/api$/, '');

const PollCard = ({
  id,
  topic = 'Poll',
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

  return (
    <Pressable onPress={handlePress} style={{}}>
      <CardContainer>
        <CardHeader
          author={{
            avatar: author_avatar?.startsWith('http')
              ? author_avatar
              : author_avatar
                ? `${API_BASE}${author_avatar}`
                : null,
            name: author_name,
            time: created_at,
            verified: author_verified
          }}
          topic={topic}
        />

        {imageUrl && (
          <ImageBackground source={{ uri: imageUrl }} style={styles.image}>
            <Box style={styles.overlay}>
              <Text style={styles.imageTitle}>{title}</Text>
            </Box>
          </ImageBackground>
        )}

        <Box style={[styles.body, { backgroundColor: t.cardBackground }]}>
          {!imageUrl && <Text style={[styles.title, { color: t.text }]}>{title}</Text>}

          <Text style={[styles.description, { color: t.text }]} numberOfLines={3}>
            {description}
          </Text>

          <Pressable style={[styles.pollButton, { backgroundColor: t.accent }]} onPress={handlePress}>
            <Text style={styles.pollButtonText}>Take a Poll</Text>
          </Pressable>

          <Box style={styles.endTime}>
            <Icon name="clock" size={14} color={t.secondaryText} />
            <Text style={[styles.endTimeText, { color: t.secondaryText }]}>
              Ends: {formatTime(end_time)}
            </Text>
          </Box>

          <StatsBar votes={votes} showComments={false} share={onShare} onSave={onSave} />
        </Box>
      </CardContainer>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  imageTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  body: { padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  description: { fontSize: 14, marginBottom: 12 },
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
  endTime: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  endTimeText: { marginLeft: 6, fontSize: 12 },
});

export default PollCard;
