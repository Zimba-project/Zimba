import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { getGroup, joinGroup, leaveGroup, listJoinRequests, approveRequest, rejectRequest, deleteGroup } from '../api/groupsService';
import { sessionStorage } from '../utils/Storage';

export default function GroupDetail({ route, navigation }) {
  const { groupId } = route.params || {};
  const { theme } = useTheme();
  const t = getTheme(theme);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [hasPending, setHasPending] = useState(false);
  const [requests, setRequests] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getGroup(groupId);
      setGroup(res.group);
      setMembers(res.members || []);
      setJoined(!!res.is_member);
      setHasPending(!!res.has_pending_request);
      // determine if current user is owner (res.group.created_by)
      const storedId = await sessionStorage.getItem('userId');
      setIsOwner(storedId ? String(res.group.created_by) === String(storedId) : false);
      // if owner, load pending requests
      if (storedId && String(res.group.created_by) === String(storedId)) {
        const reqs = await listJoinRequests(groupId).catch(() => []);
        setRequests(reqs || []);
      } else {
        setRequests([]);
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

  const handleDelete = async () => {
    Alert.alert(
      'Delete group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteGroup(groupId);
            navigation.goBack();
          } catch (err) {
            console.error('Delete failed', err);
            Alert.alert('Error', err.message || 'Failed to delete group');
          }
        } }
      ]
    );
  };

  if (!group) return <View style={[styles.container, { backgroundColor: t.background }]} />;

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}> 
      <View style={[styles.header, { backgroundColor: t.cardBackground }]}> 
        <Text style={[styles.title, { color: t.text }]}>{group.name}</Text>
        <Text style={{ color: t.secondaryText }}>{group.description}</Text>
        <View style={styles.controls}>
          {isOwner ? (
            <TouchableOpacity style={[styles.button, { backgroundColor: '#c43a3a' }]} onPress={handleDelete}>
              <Text style={{ color: '#fff' }}>Delete Group</Text>
            </TouchableOpacity>
          ) : joined ? (
            <TouchableOpacity style={[styles.button, { backgroundColor: t.rowBorder }]} onPress={handleLeave}>
              <Text style={{ color: t.text }}>Leave</Text>
            </TouchableOpacity>
          ) : group.privacy === 1 ? (
            // private group
            hasPending ? (
              <TouchableOpacity style={[styles.button, { backgroundColor: '#999' }]} disabled>
                <Text style={{ color: '#fff' }}>Requested</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.button, { backgroundColor: t.accent }]} onPress={handleJoin}>
                <Text style={{ color: '#fff' }}>Send join request</Text>
              </TouchableOpacity>
            )
          ) : (
            // public group
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
      {isOwner && (
        <View style={{ padding: 12 }}>
          <Text style={{ color: t.text, fontWeight: '700', marginBottom: 8 }}>Join requests</Text>
          {requests.length === 0 ? (
            <Text style={{ color: t.secondaryText }}>No pending requests</Text>
          ) : (
            requests.map(r => (
              <View key={r.id} style={[styles.requestRow, { borderBottomColor: t.rowBorder }]}> 
                <Text style={{ color: t.text }}>{r.first_name}</Text>
                <Text style={{ color: t.secondaryText }}>{r.message}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: 'green' }]} onPress={async () => { await approveRequest(groupId, r.id); await load(); }}>
                    <Text style={{ color: '#fff' }}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: 'red' }]} onPress={async () => { await rejectRequest(groupId, r.id); await load(); }}>
                    <Text style={{ color: '#fff' }}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}
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
  requestRow: { paddingVertical: 12, borderBottomWidth: 1 },
  smallBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, marginLeft: 8 },
});
