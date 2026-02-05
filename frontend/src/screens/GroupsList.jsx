import React, { useEffect, useState, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView, Dimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { listGroups, listMyGroups, joinGroup } from '../api/groupsService';
import { Ionicons } from '@expo/vector-icons';
import { sessionStorage } from '../utils/Storage';
import { getInitials } from '../utils/GetInitials';

const { width } = Dimensions.get('window');

export default function GroupsList({ navigation }) {
  const { theme } = useTheme();
  const t = getTheme(theme);
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const [userId, setUserId] = useState(null);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('your-groups'); // 'your-groups', 'discover', 'manage'

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

  // Computed lists
  const joinedGroups = useMemo(() => myGroups.filter(g => String(g.created_by) !== String(userId)), [myGroups, userId]);
  const ownedGroups = useMemo(() => myGroups.filter(g => String(g.created_by) === String(userId)), [myGroups, userId]);
  const discoverGroups = useMemo(() => groups.filter(g => !myGroups.some(m => Number(m.id) === Number(g.id))), [groups, myGroups]);
  
  const filterGroups = (list) => {
    if (!query.trim()) return list;
    return list.filter(g => g.name.toLowerCase().includes(query.toLowerCase()));
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await joinGroup(groupId);
      await load(); // Reload to update lists
    } catch (err) {
      console.error('Failed to join group:', err);
    }
  };

  const renderYourGroupItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.listCard, { backgroundColor: t.cardBackground }]}
      onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
    >
      <View style={[styles.groupAvatar, { backgroundColor: getGroupColor(item.name) }]}>
        <Text style={[styles.avatarText, { color: '#fff' }]}>{getInitials(item.name || 'G')}</Text>
      </View>
      <View style={styles.groupInfo}>
        <Text style={[styles.groupName, { color: t.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.groupMeta, { color: t.secondaryText }]} numberOfLines={1}>
          {item.member_count ?? 0} members
        </Text>
      </View>
      <TouchableOpacity style={styles.pinIcon}>
        <Ionicons name="pin-outline" size={20} color={t.secondaryText} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderDiscoverItem = ({ item, index }) => (
    <View style={styles.gridItem}>
      <TouchableOpacity
        style={[styles.discoverCard, { backgroundColor: t.cardBackground }]}
        onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
      >
        <View style={[styles.coverImage, { backgroundColor: getGroupColor(item.name) }]}>
          <Text style={[styles.coverInitials, { color: '#fff' }]}>{getInitials(item.name || 'G')}</Text>
        </View>
        <View style={styles.discoverInfo}>
          <Text style={[styles.discoverName, { color: t.text }]} numberOfLines={2}>{item.name}</Text>
          <Text style={[styles.discoverMeta, { color: t.secondaryText }]} numberOfLines={1}>
            Public group · {item.member_count ?? 0} members
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.joinButton, { backgroundColor: t.accent }]}
        onPress={() => handleJoinGroup(item.id)}
      >
        <Text style={[styles.joinButtonText, { color: '#fff' }]}>Join</Text>
      </TouchableOpacity>
    </View>
  );

  const renderManageItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.manageCard, { backgroundColor: t.cardBackground }]}
      onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
    >
      <View style={[styles.groupAvatar, { backgroundColor: getGroupColor(item.name) }]}>
        <Text style={[styles.avatarText, { color: '#fff' }]}>{getInitials(item.name || 'G')}</Text>
      </View>
      <View style={styles.groupInfo}>
        <Text style={[styles.groupName, { color: t.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.groupMeta, { color: t.secondaryText }]} numberOfLines={1}>
          {item.member_count ?? 0} members · You're the admin
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={t.secondaryText} />
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'your-groups':
        const filtered = filterGroups(joinedGroups);
        return (
          <FlatList
            key="your-groups-list"
            data={filtered}
            renderItem={renderYourGroupItem}
            keyExtractor={(item) => `joined-${item.id}`}
            contentContainerStyle={styles.listContent}
            refreshing={loading}
            onRefresh={load}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color={t.secondaryText} />
                <Text style={[styles.emptyText, { color: t.secondaryText }]}>
                  {query ? 'No groups found' : "You haven't joined any groups yet"}
                </Text>
              </View>
            }
          />
        );
      
      case 'discover':
        const discover = filterGroups(discoverGroups);
        return (
          <FlatList
            key="discover-grid"
            data={discover}
            renderItem={renderDiscoverItem}
            keyExtractor={(item) => `discover-${item.id}`}
            numColumns={2}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.gridRow}
            refreshing={loading}
            onRefresh={load}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="compass-outline" size={64} color={t.secondaryText} />
                <Text style={[styles.emptyText, { color: t.secondaryText }]}>
                  {query ? 'No groups found' : 'No groups available to discover'}
                </Text>
              </View>
            }
          />
        );
      
      case 'manage':
        const manage = filterGroups(ownedGroups);
        return (
          <FlatList
            key="manage-list"
            data={manage}
            renderItem={renderManageItem}
            keyExtractor={(item) => `manage-${item.id}`}
            contentContainerStyle={styles.listContent}
            refreshing={loading}
            onRefresh={load}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="settings-outline" size={64} color={t.secondaryText} />
                <Text style={[styles.emptyText, { color: t.secondaryText }]}>
                  {query ? 'No groups found' : "You don't manage any groups yet"}
                </Text>
              </View>
            }
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: t.cardBackground, borderBottomColor: t.border || '#e0e0e0' }]}>
        <View style={styles.tabsHeader}>
          <Text style={[styles.pageTitle, { color: t.text }]}>Groups</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreateGroup')} style={styles.createBtn}>
            <Ionicons name="add-circle-outline" size={24} color={t.accent} />
            <Text style={[styles.createText, { color: t.accent }]}>Create</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'your-groups' && styles.activeTab]}
            onPress={() => setActiveTab('your-groups')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'your-groups' ? t.accent : t.secondaryText }
            ]}>
              Your groups
            </Text>
            {activeTab === 'your-groups' && <View style={[styles.tabIndicator, { backgroundColor: t.accent }]} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
            onPress={() => setActiveTab('discover')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'discover' ? t.accent : t.secondaryText }
            ]}>
              Discover
            </Text>
            {activeTab === 'discover' && <View style={[styles.tabIndicator, { backgroundColor: t.accent }]} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'manage' && styles.activeTab]}
            onPress={() => setActiveTab('manage')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'manage' ? t.accent : t.secondaryText }
            ]}>
              Manage
            </Text>
            {activeTab === 'manage' && <View style={[styles.tabIndicator, { backgroundColor: t.accent }]} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: t.background }]}>
        <View style={[styles.searchBar, { backgroundColor: t.cardBackground }]}>
          <Ionicons name="search" size={20} color={t.secondaryText} />
          <TextInput
            placeholder="Search"
            placeholderTextColor={t.secondaryText}
            value={query}
            onChangeText={setQuery}
            style={[styles.searchInput, { color: t.text }]}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={t.secondaryText} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
}

// Helper function to generate consistent colors for group names
const getGroupColor = (name) => {
  const colors = [
    '#6C5CE7', '#0984E3', '#00B894', '#FDCB6E', '#E17055',
    '#FD79A8', '#A29BFE', '#74B9FF', '#55EFC4', '#FAB1A0',
    '#FF7675', '#6C5CE7', '#00CEC9', '#FFEAA7', '#DFE6E9'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsContainer: {
    borderBottomWidth: 1,
  },
  tabsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pageTitle: { fontSize: 20, fontWeight: '700' },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  createText: { fontSize: 15, fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeTab: {},
  tabText: { fontSize: 15, fontWeight: '600' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  
  // List view styles (Your groups & Manage)
  listContent: { padding: 12, paddingBottom: 120 },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  groupAvatar: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700' },
  groupInfo: { flex: 1, marginLeft: 12 },
  groupName: { fontSize: 16, fontWeight: '600' },
  groupMeta: { fontSize: 13, marginTop: 4 },
  pinIcon: { padding: 8 },
  
  // Manage card
  manageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  
  // Grid view styles (Discover)
  gridContent: { padding: 8, paddingBottom: 120 },
  gridRow: { justifyContent: 'space-between' },
  gridItem: {
    width: (width - 32) / 2,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  discoverCard: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  coverImage: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverInitials: { fontSize: 32, fontWeight: '700' },
  discoverInfo: { padding: 12 },
  discoverName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  discoverMeta: { fontSize: 12 },
  joinButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  joinButtonText: { fontSize: 15, fontWeight: '600' },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: { fontSize: 16, marginTop: 16, textAlign: 'center' },
});
