import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { listGroups, listMyGroups } from '../api/groupsService';
import { Ionicons } from '@expo/vector-icons';
import { sessionStorage } from '../utils/Storage';

export default function GroupsList({ navigation }) {
  const { theme } = useTheme();
  const t = getTheme(theme);
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const [userId, setUserId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [g, mine] = await Promise.all([listGroups(), listMyGroups().catch(() => [])]);
      setGroups(g);
      setMyGroups(mine);
      const storedId = await sessionStorage.getItem('userId');
      setUserId(storedId || null);
    } catch (err) {
      console.error('Failed to load groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isFocused]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: t.cardBackground }]}
      onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: t.text }]}>{item.name}</Text>
          <Text style={[styles.desc, { color: t.secondaryText }]} numberOfLines={2}>{item.description}</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={{ color: t.secondaryText }}>{item.member_count ?? 0} members</Text>
          <Ionicons name="chevron-forward" size={20} color={t.secondaryText} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}> 
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={t.text} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: t.text }]}>Groups</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('CreateGroup')}>
          <Text style={{ color: t.accent }}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* Owned groups (you created) */}
      <FlatList
        data={myGroups.filter(g => String(g.created_by) === String(userId))}
        keyExtractor={(i) => `owned-${i.id}`}
        ListHeaderComponent={() => (
          <View style={{ paddingHorizontal: 12 }}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Groups you own</Text>
          </View>
        )}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={() => (
          <View style={{ paddingHorizontal: 12 }}>
            <Text style={{ color: t.secondaryText }}>You don't own any groups yet.</Text>
          </View>
        )}
      />

      {/* Joined groups (you are member but not owner) */}
      <View style={{ height: 8 }} />
      <FlatList
        data={myGroups.filter(g => String(g.created_by) !== String(userId))}
        keyExtractor={(i) => `joined-${i.id}`}
        ListHeaderComponent={() => (
          <View style={{ paddingHorizontal: 12 }}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Groups you joined</Text>
          </View>
        )}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={() => (
          <View style={{ paddingHorizontal: 12 }}>
            <Text style={{ color: t.secondaryText }}>You haven't joined any groups yet.</Text>
          </View>
        )}
      />

      {/* All other groups (available to join) */}
      <View style={{ height: 8 }} />
      <FlatList
        data={groups.filter(g => !myGroups.some(m => Number(m.id) === Number(g.id)))}
        keyExtractor={(i) => `all-${i.id}`}
        ListHeaderComponent={() => (
          <View style={{ paddingHorizontal: 12 }}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>All groups</Text>
          </View>
        )}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 120 }}
        refreshing={loading}
        onRefresh={load}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { padding: 6, marginRight: 8 },
  header: { fontSize: 20, fontWeight: '700' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  card: { borderRadius: 12, padding: 12, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rightCol: { alignItems: 'flex-end', marginLeft: 12 },
  title: { fontSize: 16, fontWeight: '700' },
  desc: { marginTop: 6, fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 6, marginBottom: 8 },
});
