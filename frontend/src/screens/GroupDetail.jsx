import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { getGroup, joinGroup, leaveGroup } from '../api/groupsService';
import { sessionStorage } from '../utils/Storage';

export default function GroupDetail({ route, navigation }) {
  const { groupId } = route.params || {};
  const { theme } = useTheme();
  const t = getTheme(theme);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getGroup(groupId);
      setGroup(res.group);
      setMembers(res.members || []);
      // determine if current user is a member
      const token = await sessionStorage.getItem('authToken');
      if (token) {
        const storedId = await sessionStorage.getItem('userId');
        if (storedId) {
          setJoined(res.members.some(m => String(m.user_id) === String(storedId)));
        }
      }
    } catch (err) {
      console.error('Error loading group', err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [groupId]);

  const handleJoin = async () => {
    try {
      await joinGroup(groupId);
      await load();
    } catch (err) { console.error(err); }
  };

  const handleLeave = async () => {
    try {
      await leaveGroup(groupId);
      await load();
    } catch (err) { console.error(err); }
  };

  if (!group) return <View style={[styles.container, { backgroundColor: t.background }]} />;

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}> 
      <View style={[styles.header, { backgroundColor: t.cardBackground }]}> 
        <Text style={[styles.title, { color: t.text }]}>{group.name}</Text>
        <Text style={{ color: t.secondaryText }}>{group.description}</Text>
        <View style={styles.controls}>
          {joined ? (
            <TouchableOpacity style={[styles.button, { backgroundColor: t.rowBorder }]} onPress={handleLeave}>
              <Text style={{ color: t.text }}>Leave</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, { backgroundColor: t.accent }]} onPress={handleJoin}>
              <Text style={{ color: '#fff' }}>Join</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ padding: 12 }}>
        <Text style={{ color: t.text, fontWeight: '700', marginBottom: 8 }}>Members</Text>
        <FlatList data={members} keyExtractor={(i) => String(i.user_id)} renderItem={({item}) => (
          <View style={[styles.memberRow, { borderBottomColor: t.rowBorder }]}>
            <Text style={{ color: t.text }}>{item.first_name}</Text>
            <Text style={{ color: t.secondaryText }}>{item.role}</Text>
          </View>
        )} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700' },
  controls: { marginTop: 12 },
  button: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  memberRow: { paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1 },
});
