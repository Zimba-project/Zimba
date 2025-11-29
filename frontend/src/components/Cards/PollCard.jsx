import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
    onShare = () => {},
    onSave = () => {},
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

  const imageUrl = image? image.startsWith('http')? image: `${API_BASE}${image}`: null;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <CardContainer>
        <CardHeader
          author={{
            avatar: author_avatar?.startsWith('http')? author_avatar: author_avatar? `${API_BASE}${author_avatar}`: null,
            name: author_name,
            time: created_at,
          }}
          topic={topic}
        />

        {imageUrl && (
          <ImageBackground source={{ uri: imageUrl }} style={styles.image}>
            <View style={styles.overlay}>
              <Text style={styles.imageTitle}>{title}</Text>
            </View>
          </ImageBackground>
        )}

        <View style={styles.body}>
          {!imageUrl && <Text style={styles.title}>{title}</Text>}

          <Text style={styles.description} numberOfLines={3}>
            {description}
          </Text>

          <TouchableOpacity style={styles.pollButton} onPress={handlePress}>
            <Text style={styles.pollButtonText}>Take a Poll</Text>
          </TouchableOpacity>

          <View style={styles.endTime}>
            <Icon name="clock" size={14} color="#6b7280" />
            <Text style={styles.endTimeText}>Ends: {formatTime(end_time)}</Text>
          </View>

          <StatsBar
            votes={votes}
            comments={comments}
            share={onShare}
            onSave={onSave}
          />
        </View>
      </CardContainer>
    </TouchableOpacity>
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
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#111' },
  description: { fontSize: 14, color: '#555', marginBottom: 12 },
  pollButton: {
    backgroundColor: '#6366f1',
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
  endTimeText: { marginLeft: 6, fontSize: 12, color: '#6b7280' },
});

export default PollCard;
