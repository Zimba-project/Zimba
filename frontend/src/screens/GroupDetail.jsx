import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList, Alert, ScrollView, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { getGroup, joinGroup, leaveGroup, listJoinRequests, approveRequest, rejectRequest, deleteGroup, removeMember } from '../api/groupsService';
import { listGroupPosts, createGroupPost, approveGroupPost, rejectGroupPost } from '../api/groupPostService';
import PollCard from '../components/Cards/PollCard';
import DiscussionCard from '../components/Cards/DiscussionCard';
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
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [activeTab, setActiveTab] = useState('Discussion');
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getGroup(groupId);
      setGroup(res.group);
      setMembers(res.members || []);
      setJoined(!!res.is_member);
      setHasPending(!!res.has_pending_request);
      
      // Set navigation title to group name via params
      if (res.group?.name) {
        navigation.setParams({ title: res.group.name });
      }
      
      // load posts for this group (use dedicated group posts endpoint)
      try {
        const gp = await listGroupPosts(groupId).catch(() => []);
        setPosts(gp || []);
      } catch (e) {
        console.error('Error loading group posts', e);
        setPosts([]);
      }
      // determine if current user is owner or admin
      const storedId = await sessionStorage.getItem('userId');
      const isOwnerNow = storedId ? String(res.group.created_by) === String(storedId) : false;
      setIsOwner(isOwnerNow);
      // check members list for admin role
      let privileged = isOwnerNow;
      if (storedId && !privileged) {
        const my = (res.members || []).find(m => String(m.user_id) === String(storedId));
        if (my && (my.role === 'admin' || my.role === 'owner')) privileged = true;
      }
      setIsPrivileged(privileged);
      // if owner or admin, load pending requests
      if (privileged) {
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
  // reload when screen gains focus (e.g., after creating a post)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return unsubscribe;
  }, [navigation, groupId]);

  const openCreatePostScreen = (type) => {
    // GroupDetail sits inside GroupsStack which is rendered in Drawer under 'Groups'.
    // The CreatePost 'NewPost' screen is inside the Bottom Tabs under Drawer 'Home'.
    // Navigate via parent (Drawer) to Home -> NewPost.
    try {
      const drawer = navigation.getParent();
      if (drawer && typeof drawer.navigate === 'function') {
        drawer.navigate('Home', { screen: 'NewPost', params: { groupId, type } });
        return;
      }
    } catch (e) {
      // fallback
    }
    // fallback to direct navigate (may work if navigator structure differs)
    navigation.navigate('NewPost', { groupId, type });
  };

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

  const handleInvite = () => {
    Alert.alert('Invite', 'Invite flow not implemented yet');
  };

  const handleCreatePost = async () => {
    if (!joined) return Alert.alert('Join group', 'You must join the group to post');
    if (!newPost.trim()) return;
    try {
      const storedId = await sessionStorage.getItem('userId');
      const userId = storedId || null;
      if (!userId) return Alert.alert('Error', 'You must be logged in to post');
      const data = {
        type: 'discussion',
        topic: `group:${groupId}`,
        title: newPost.slice(0, 80) || 'Post',
        description: newPost,
        image: null,
      };
      const result = await createGroupPost(groupId, data);
      setNewPost('');
      // reload posts (member requests will not see pending posts)
      const gp = await listGroupPosts(groupId).catch(() => []);
      setPosts(gp || []);
      if (result && result.status === 'pending') {
        Alert.alert('Submitted for approval', 'Your post was sent for approval and will appear after admin approval');
      } else {
        Alert.alert('Posted', 'Your post was created');
      }
    } catch (err) {
      console.error('Error creating post', err);
      Alert.alert('Error', err.message || 'Failed to create post');
    }
  };

  if (!group) return <View style={[styles.container, { backgroundColor: t.background }]} />;

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}> 
      <View style={[styles.card, { backgroundColor: t.cardBackground }]}> 
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: t.secondaryText, marginRight: 12 }}>{group.privacy === 1 ? 'Private group' : 'Public group'}</Text>
              <Text style={{ color: t.secondaryText }}>{members.length} members</Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            {isPrivileged ? (
              <TouchableOpacity style={{ marginBottom: 8 }} onPress={() => navigation.navigate('GroupSettings', { groupId })}>
                <Ionicons name="settings-outline" size={20} color={t.text} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.inviteBtn} onPress={handleInvite}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>+ Invite</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 10 }}>
              {isOwner ? (
                <TouchableOpacity style={[styles.button, { backgroundColor: '#c43a3a' }]} onPress={handleDelete}>
                  <Text style={{ color: '#fff' }}>Delete Group</Text>
                </TouchableOpacity>
              ) : joined ? (
                <TouchableOpacity style={[styles.button, { backgroundColor: t.rowBorder }]} onPress={handleLeave}>
                  <Text style={{ color: t.text }}>Leave</Text>
                </TouchableOpacity>
              ) : group.privacy === 1 ? (
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
                <TouchableOpacity style={[styles.button, { backgroundColor: t.accent }]} onPress={handleJoin}>
                  <Text style={{ color: '#fff' }}>Join</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarsRow} contentContainerStyle={{ paddingHorizontal: 8 }}>
          {members.slice(0, 16).map(m => (
            <View key={m.user_id} style={styles.avatarWrap}>
              {m.avatar ? (
                <Image source={{ uri: m.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ color: '#555' }}>{(m.first_name || 'U').charAt(0)}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <Text style={[styles.description, { color: t.text }]} numberOfLines={3}>{group.description}</Text>

        <View style={styles.tabsRow}>
          {['Discussion','Posts','Members','Approval'].map(tab => (
            <TouchableOpacity key={tab} style={[styles.tabItem, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[{ fontWeight: activeTab === tab ? '700' : '500', color: activeTab === tab ? t.text : t.secondaryText }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ padding: 12, flex: 1 }}>
        {activeTab === 'Posts' ? (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
            {joined ? (
              <View style={{ marginBottom: 12 }}>
                <TouchableOpacity style={[styles.postBtn, { backgroundColor: t.accent }]} onPress={() => openCreatePostScreen('poll')}>
                  <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>Create Post</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ padding: 12 }}>
                <Text style={{ color: t.secondaryText }}>Join the group to create posts.</Text>
              </View>
            )}

            {/* Posts list (use shared card components for consistent UI) */}
            <View style={{ marginTop: 12 }}>
              {(!posts || posts.length === 0) ? (
                <Text style={{ color: t.secondaryText }}>No posts yet. Be the first to post!</Text>
              ) : (
                posts.filter(p => p.type === 'poll' && p.status === 'approved').map(p => (
                  <View key={p.id} style={{ marginBottom: 12 }}>
                    <PollCard
                      id={p.id}
                      topic={p.topic || `group:${groupId}`}
                      author_name={p.author_name}
                      author_avatar={p.author_avatar}
                      author_verified={p.author_verified}
                      image={p.image}
                      title={p.title}
                      description={p.description}
                      votes={p.votes}
                      comments={p.comments}
                      end_time={p.end_time}
                      created_at={p.created_at}
                      groupId={groupId}
                    />
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        ) : activeTab === 'Members' ? (
          <View style={{ flex: 1 }}>
            {isOwner && requests && requests.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: t.text, fontWeight: '700', marginBottom: 8 }}>Join requests</Text>
                {requests.map(r => (
                  <View key={r.id} style={[styles.requestRow, { borderBottomColor: t.rowBorder, paddingVertical: 8 }]}> 
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={{ color: t.text }}>{r.first_name}</Text>
                        {r.message ? <Text style={{ color: t.secondaryText }}>{r.message}</Text> : null}
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={[styles.smallBtn, { backgroundColor: 'green' }]} onPress={async () => { await approveRequest(groupId, r.id); await load(); }}>
                          <Text style={{ color: '#fff' }}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.smallBtn, { backgroundColor: 'red' }]} onPress={async () => { await rejectRequest(groupId, r.id); await load(); }}>
                          <Text style={{ color: '#fff' }}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <FlatList data={members} keyExtractor={(i) => String(i.user_id)} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} renderItem={({item}) => (
              <View style={[styles.memberRow, { borderBottomColor: t.rowBorder }]}> 
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {item.avatar ? <Image source={{ uri: item.avatar }} style={styles.smallAvatar} /> : <View style={[styles.smallAvatar, { backgroundColor: '#ddd' }]} />}
                  <Text style={{ color: t.text }}>{item.first_name}</Text>
                  <Text style={{ color: t.secondaryText, marginLeft: 8 }}>{item.role}</Text>
                </View>
                {isOwner && String(item.user_id) !== String(group.created_by) ? (
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#c43a3a' }]} onPress={() => {
                    Alert.alert('Remove member', `Remove ${item.first_name} from group?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive', onPress: async () => {
                        try {
                          await removeMember(groupId, item.user_id);
                          await load();
                        } catch (err) {
                          console.error('Remove failed', err);
                          Alert.alert('Error', err.message || 'Failed to remove member');
                        }
                      } }
                    ]);
                  }}>
                    <Text style={{ color: '#fff' }}>Remove</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: t.secondaryText }} />
                )}
              </View>
            )} />
          </View>
        ) : activeTab === 'Discussion' ? (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
              {(!posts || posts.filter(p => p.type === 'discussion' && p.status === 'approved').length === 0) ? (
              <Text style={{ color: t.secondaryText }}>No discussions yet.</Text>
            ) : (
              posts.filter(p => p.type === 'discussion' && p.status === 'approved').map(p => (
                <View key={p.id} style={{ marginBottom: 12 }}>
                  <DiscussionCard
                    id={p.id}
                    topic={p.topic || `group:${groupId}`}
                    author_name={p.author_name}
                    author_avatar={p.author_avatar}
                    author_verified={p.author_verified}
                    image={p.image}
                    title={p.title}
                    description={p.description}
                    comments={p.comments}
                    views={p.views}
                    created_at={p.created_at}
                    groupId={groupId}
                  />
                </View>
              ))
            )}
          </ScrollView>
        ) : activeTab === 'Approval' ? (
          <View style={{ flex: 1 }}>
            {isPrivileged ? (
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontWeight: '700', marginBottom: 8 }}>Pending approvals</Text>
                {(!posts || posts.filter(p => p.status === 'pending').length === 0) ? (
                  <Text style={{ color: t.secondaryText }}>No items awaiting approval.</Text>
                ) : (
                  <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    {posts.filter(p => p.status === 'pending').map(p => (
                      <View key={p.id} style={{ marginBottom: 12, padding: 12, borderRadius: 8, backgroundColor: t.cardBackground }}>
                        <Text style={{ color: t.text, fontWeight: '700', marginBottom: 6 }}>{p.title || '(No title)'}</Text>
                        <Text style={{ color: t.secondaryText, marginBottom: 8 }}>{p.description}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                          <TouchableOpacity style={[styles.smallBtn, { backgroundColor: 'green' }]} onPress={async () => { try { await approveGroupPost(groupId, p.id); await load(); } catch (err) { console.error(err); Alert.alert('Error', err.message || 'Approve failed'); } }}>
                            <Text style={{ color: '#fff' }}>Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.smallBtn, { backgroundColor: 'red' }]} onPress={async () => { try { await rejectGroupPost(groupId, p.id); await load(); } catch (err) { console.error(err); Alert.alert('Error', err.message || 'Reject failed'); } }}>
                            <Text style={{ color: '#fff' }}>Reject</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            ) : (
              <Text style={{ color: t.secondaryText }}>Approval queue is only visible to group owners/admins.</Text>
            )}
          </View>
        ) : (
          <View>
            <Text style={{ color: t.secondaryText }}>No content for {activeTab} yet.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 80 },
  backBtn: { padding: 6, marginRight: 8 },
  card: { padding: 16, borderBottomWidth: 1, borderColor: '#e6e6e6' },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800' },
  description: { marginTop: 10, fontSize: 14 },
  controls: { marginTop: 12 },
  button: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  inviteBtn: { backgroundColor: '#0b69ff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  avatarsRow: { marginTop: 12, maxHeight: 64 },
  avatarWrap: { width: 48, height: 48, marginRight: 8 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  tabsRow: { flexDirection: 'row', marginTop: 12, borderBottomWidth: 1, borderColor: '#eee' },
  tabItem: { paddingVertical: 12, paddingHorizontal: 14, marginRight: 6 },
  tabActive: { borderBottomWidth: 3, borderColor: '#0b69ff' },
  postBox: { padding: 12, borderRadius: 8 },
  postInput: { minHeight: 60, padding: 10, borderRadius: 8, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#eee' },
  postBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, marginTop: 8 },
  memberRow: { paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1 },
  requestRow: { paddingVertical: 12, borderBottomWidth: 1 },
  smallAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  smallBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, marginLeft: 8 },
});
