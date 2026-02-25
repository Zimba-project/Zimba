import React, { useState } from 'react';
import { StyleSheet, Share } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';
import { useTranslation } from 'react-i18next';

const StatsBar = ({
  postId,
  votes,
  comments,
  showComments = true,
  share = false,
  initialSaved = false,
  userId,
}) => {
  const { theme } = useTheme();
  const t = getTheme(theme);
  const { t: translate } = useTranslation();

  const [saved, setSaved] = useState(initialSaved);
  const postUrl = `zimbaapp://posts/${postId}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check this out!',
        url: postUrl,
      });
    } catch (err) {
      console.warn('Share failed', err);
    }
  };

  const handleSave = async () => {
    try {
      const next = !saved;
      setSaved(next);

      const endpoint = next
        ? 'https://YOUR_API_URL/bookmarks/add'
        : 'https://YOUR_API_URL/bookmarks/remove';

      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, postId }),
      });
    } catch (err) {
      console.warn('Bookmark failed', err);
      setSaved(!saved);
    }
  };

  return (
    <Box style={styles.row}>
      <Box style={styles.leftItems}>
        {votes !== undefined && (
          <Box style={styles.item}>
            <Icon name="bar-chart-2" size={16} color={t.accent} />
            <Text style={[styles.label, { color: t.secondaryText }]}>
              {votes.toLocaleString()} {translate('votes')}
            </Text>
          </Box>
        )}

        {showComments && comments !== undefined && (
          <Box style={styles.item}>
            <Icon name="message-circle" size={16} color={t.accent} />
            <Text style={[styles.label, { color: t.secondaryText }]}>
              {comments} {translate('comments')}
            </Text>
          </Box>
        )}
      </Box>

      <Box style={styles.actions}>
        {share && (
          <Pressable onPress={handleShare} style={styles.iconButton}>
            <Icon name="share-2" size={18} color={t.accent} />
          </Pressable>
        )}

        {userId && (
          <Pressable onPress={handleSave} style={styles.iconButton}>
            <Icon
              name={saved ? 'bookmark' : 'bookmark'}
              size={18}
              color={saved ? t.accent : t.secondaryText}
            />
          </Pressable>
        )}
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  leftItems: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    marginLeft: 6,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

export default StatsBar;
