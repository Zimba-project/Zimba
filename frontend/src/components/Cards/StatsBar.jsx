import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Linking } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';

const StatsBar = ({ votes, comments, showComments = true, onShare, onSave, share }) => {
  const themeFromProvider = useTheme();
  const t = getTheme(themeFromProvider?.theme);

  const handleShare = async () => {
    try {
      if (typeof onShare === 'function') {
        onShare();
        return;
      }

      if (share && (share.message || share.url)) {
        const content = {};
        if (share.message) content.message = share.message;
        if (share.url) content.url = share.url;
        if (share.title) content.title = share.title;

        await Share.share(content);
        return;
      }

      const whatsappUrl = 'whatsapp://send?text=' + encodeURIComponent('Check this out!');
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        return;
      }

      await Share.share({ message: 'Check this out!' });
    } catch (err) {
      console.warn('Share failed', err);
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.leftItems}>
        {votes !== undefined && (
          <View style={styles.item}>
            <Icon name="bar-chart-2" size={16} color={t.accent} />
            <Text style={[styles.label, { color: t.secondaryText }]}>{votes.toLocaleString()} Votes</Text>
          </View>
        )}
        {showComments && comments !== undefined && (
          <View style={styles.item}>
            <Icon name="message-circle" size={16} color={t.accent} />
            <Text style={[styles.label, { color: t.secondaryText }]}>{comments} Comments</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {(onShare || share) && (
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Icon name="share-2" size={18} color={t.accent} />
          </TouchableOpacity>
        )}
        {onSave && (
          <TouchableOpacity onPress={onSave} style={styles.iconButton}>
            <Icon name="bookmark" size={18} color={t.accent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  leftItems: { flexDirection: 'row', alignItems: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  label: { marginLeft: 6, fontSize: 13 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { paddingHorizontal: 8, paddingVertical: 4 },
});

export default StatsBar;
