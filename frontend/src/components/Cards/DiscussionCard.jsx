import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import StatsBar from './StatsBar';
import CardHeader from './CardHeader';
import CardContainer from './CardContainer';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE.replace(/\/api$/, '');

const DiscussionCard = ({
  id,
  topic = 'Discussion',
  author_id,
  author_name,
  author_avatar,
  author_verified,
  image,
  title,
  description,
  comments,
  views,
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
      comments,
      views,
      created_at,
    };
    console.log('DiscussionCard postData:', postData);
    navigation.navigate('Discuss', {
      postId: id,
      postData,
    });
  };

  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `${API_BASE}${image}`
    : null;

  const avatarUrl = author_avatar
    ? author_avatar.startsWith('http')
      ? author_avatar
      : `${API_BASE}${author_avatar}`
    : null;

  return (
    <Pressable onPress={handlePress} style={{}}>
      <CardContainer>
        {/* HEADER */}
        <CardHeader
          author={{ id: author_id, avatar: avatarUrl, name: author_name, time: created_at, verified: author_verified }}
          topic={topic}
        />

        {/* IMAGE (title overlays image) */}
        {imageUrl && (
          <ImageBackground source={{ uri: imageUrl }} style={styles.image}>
            <Box style={styles.overlay}>
              <Text style={styles.imageTitle}>{title}</Text>
            </Box>
          </ImageBackground>
        )}

        {/* BODY */}
        <Box style={[styles.body, { backgroundColor: t.cardBackground }]}>
          {!imageUrl && (
            <Text style={[styles.title, { color: t.text }]}>{title}</Text>
          )}
          <Text
            style={[styles.preview, { color: t.secondaryText }]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {description}
          </Text>
          <StatsBar
            comments={comments}
            views={views}
            share={onShare}
            onSave={onSave}
          />
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
  preview: { fontSize: 14, marginBottom: 12 },
});

export default DiscussionCard;
