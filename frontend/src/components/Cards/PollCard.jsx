import React from 'react';
import {
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonText } from '@/components/ui/button';
import { Clock } from 'lucide-react-native';
import StatsBar from './StatsBar';
import CardHeader from './CardHeader';
import CardContainer from './CardContainer';
import { formatTime } from '../../utils/TimeFormatter';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE.replace(/\/api$/, '');

const PollCard = ({
  id,
  topic = 'Poll',
  author_name,
  author_avatar,
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

  const handlePress = () => {
    const postData = {
      id,
      topic,
      author_name,
      author_avatar,
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

  const imageUrl = image ? image.startsWith('http') ? image : `${API_BASE}${image}` : null;

  return (
    <Pressable onPress={handlePress}>
      <CardContainer>
        <CardHeader
          author={{
            avatar: author_avatar?.startsWith('http') ? author_avatar : author_avatar ? `${API_BASE}${author_avatar}` : null,
            name: author_name,
            time: created_at,
          }}
          topic={topic}
        />

        {imageUrl && (
          <ImageBackground source={{ uri: imageUrl }} style={styles.image}>
            <Box style={styles.overlay}>
              <Text size="lg" className="font-bold" style={{ color: 'rgb(255, 255, 255)' }}>{title}</Text>
            </Box>
          </ImageBackground>
        )}

        <Box style={styles.body}>
          {!imageUrl && <Text size="lg" className="text-typography-900 font-bold mb-2">{title}</Text>}

          <Text size="sm" className="text-typography-700 mb-3" numberOfLines={3}>
            {description}
          </Text>

          <Button className="bg-primary-500 mb-3" onPress={handlePress}>
            <ButtonText>Take a Poll</ButtonText>
          </Button>

          <Box className="flex-row items-center mb-2">
            <Icon as={Clock} size="sm" className="text-typography-600" />
            <Text size="xs" className="text-typography-600 ml-1.5">Ends: {formatTime(end_time)}</Text>
          </Box>

          <StatsBar
            votes={votes}
            comments={comments}
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

export default PollCard;
