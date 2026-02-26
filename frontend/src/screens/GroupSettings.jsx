import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { getGroup, updateGroup } from '../api/groupsService';

export default function GroupSettings({ route, navigation }) {
  const { groupId } = route.params || {};
  const { theme } = useTheme();
  const t = getTheme(theme);
  const [postModeration, setPostModeration] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await getGroup(groupId);
      setPostModeration(!!res.group.post_moderation);
    } catch (err) {
      console.error('Failed to load group settings', err);
      Alert.alert('Error', err.message || 'Failed to load settings');
    }
  };

  useEffect(() => { load(); }, [groupId]);

  const save = async () => {
    setLoading(true);
    try {
      await updateGroup(groupId, { post_moderation: !!postModeration });
      Alert.alert('Saved', 'Group settings updated');
      navigation.goBack();
    } catch (err) {
      console.error('Failed to save settings', err);
      Alert.alert('Error', err.message || 'Failed to save settings');
    } finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}> 
      <View style={[styles.card, { backgroundColor: t.cardBackground }]}> 
        <View style={styles.rowSpace}>
          <Text style={{ color: t.text, fontWeight: '700' }}>Require approval for member posts</Text>
          <Switch value={postModeration} onValueChange={setPostModeration} />
        </View>
        <Text style={{ color: t.secondaryText, marginTop: 8 }}>When enabled, posts created by non-admin members will be held for approval before appearing in the group's posts page.</Text>
      </View>

      <View style={{ padding: 12 }}>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: t.accent }]} onPress={save} disabled={loading}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 60 },
  card: { padding: 16, margin: 12, borderRadius: 8 },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saveBtn: { paddingVertical: 12, borderRadius: 8 }
});