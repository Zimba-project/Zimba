import React from 'react';
import {
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import StatsBar from './StatsBar';
import CardHeader from './CardHeader';
import CardContainer from './CardContainer';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE.replace(/\/api$/, '');

const DiscussionCard = ({
  id,
  topic = 'Discussion',
  author_name,
  author_avatar,
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

  const handlePress = () => {
    const postData = {
      id,
      topic,
      author_name,
      author_avatar,
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
      postData
    });
  };

  const imageUrl = image ? image.startsWith('http') ? image : `${API_BASE}${image}` : null;

  const avatarUrl = author_avatar ? author_avatar.startsWith('http') ? author_avatar : `${API_BASE}${author_avatar}` : null;

  return (
    <Pressable onPress={handlePress}>
      <CardContainer>
        {/* HEADER */}
        <CardHeader
          author={{ avatar: avatarUrl, name: author_name, time: created_at }}
          topic={topic}
        />

        {/* IMAGE (title overlays image) */}
        {imageUrl && (
          <ImageBackground source={{ uri: imageUrl }} style={styles.image}>
            <Box style={styles.overlay}>
              <Text size="lg" className="text-typography-950 font-bold">{title}</Text>
            </Box>
          </ImageBackground>
        )}

        {/* BODY */}
        <Box style={styles.body}>
          {!imageUrl && <Text size="lg" className="text-typography-900 font-bold mb-2">{title}</Text>}
          <Text size="sm" className="text-typography-700 mb-3" numberOfLines={3} ellipsizeMode="tail">
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
  body: { padding: 16 },
});

export default DiscussionCard;
