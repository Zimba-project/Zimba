import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { listGroups } from '../api/groupsService';
import { Ionicons } from '@expo/vector-icons';

export default function GroupsList({ navigation }) {
  const { theme } = useTheme();
  const t = getTheme(theme);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const g = await listGroups();
      setGroups(g);
    } catch (err) {
      console.error('Failed to load groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
        <Text style={[styles.header, { color: t.text }]}>Groups</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateGroup')}>
          <Text style={{ color: t.accent }}>Create</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
        refreshing={loading}
        onRefresh={load}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 20, fontWeight: '700' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  card: { borderRadius: 12, padding: 12, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rightCol: { alignItems: 'flex-end', marginLeft: 12 },
  title: { fontSize: 16, fontWeight: '700' },
  desc: { marginTop: 6, fontSize: 13 },
});
