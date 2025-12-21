import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Linking } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

const StatsBar = ({ postId,votes, comments, showComments = true, share, initialSaved = false, userId }) => {
  const themeFromProvider = useTheme();
  const t = getTheme(themeFromProvider?.theme);
  const [saved, setSaved] = useState(initialSaved);
  const postUrl = `zimbaapp://posts/${postId}`;

  const handleShare = async () => {
    try {
      const sharePayload = {
        message: "Check this out!",
        url: postUrl,
      };

      Object.keys(sharePayload).forEach(
        key => sharePayload[key] === undefined && delete sharePayload[key]
      );

      await Share.share(sharePayload);

    } catch (err) {
      console.warn("Share failed", err);
    }
  };

  const handleSave = async () => {
    try {
      const newSavedState = !saved;
      setSaved(newSavedState); 

      const endpoint = newSavedState
        ? "https://YOUR_API_URL/bookmarks/add"
        : "https://YOUR_API_URL/bookmarks/remove";

      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, postId }),
      });

    } catch (err) {
      console.warn("Bookmark failed", err);
      setSaved(!saved);
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.leftItems}>
        {votes !== undefined && (
          <View style={styles.item}>
            <Icon name="bar-chart-2" size={16} color={t.accent} />
            <Text style={[styles.label, { color: t.secondaryText }]}>
              {votes.toLocaleString()} Votes
            </Text>
          </View>
        )}

        {showComments && comments !== undefined && (
          <View style={styles.item}>
            <Icon name="message-circle" size={16} color={t.accent} />
            <Text style={[styles.label, { color: t.secondaryText }]}>
              {comments} Comments
            </Text>
          </View>
        )}
      </View>

      {/* ACTIONS */}
      <View style={styles.actions}>
        {share && (
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Icon name="share-2" size={18} color={t.accent} />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleSave} style={styles.iconButton}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"} 
            size={18}
            color={t.accent}
          />
        </TouchableOpacity>
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
