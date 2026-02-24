// ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { me, updateUser, getUserById } from '../api/auth';
import { sessionStorage } from '../utils/Storage';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { normalizeAvatarUrl } from '../utils/urlHelper';
import { formatTime } from '../utils/TimeFormatter';
import { useTranslation } from 'react-i18next';
import Avatar from '../components/Profile/Avatar';
import PollCard from '../components/Cards/PollCard';
import DiscussionCard from '../components/Cards/DiscussionCard';

export default function ProfileScreen({ navigation, route }) {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Posts');
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    about: '',
    birthdate: '',
  });

  const { theme } = useTheme();
  const t = getTheme(theme);
  const { t: translate } = useTranslation();

  // Load current user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await sessionStorage.getItem('authToken');
        if (!token) return;
        const res = await me(token);
        const userData = res?.body?.user ?? res?.body ?? res?.user ?? null;
        if (userData) {
          setUser(userData);
          setForm({
            first_name: userData.first_name ?? '',
            last_name: userData.last_name ?? '',
            phone: userData.phone ?? '',
            about: userData.about ?? '',
            birthdate: userData.birthdate ?? '',
          });
          fetchUserPosts(userData.id);
        }
      } catch (err) {
        console.log('Failed to load user:', err);
      } finally {
        setUserLoading(false);
      }
    };
    loadUser();
  }, []);

  const fetchUserPosts = async (userId) => {
    if (!userId) return;
    try {
      setPostsLoading(true);
      const res = await getUserById(userId);
      const fullUser = res?.body?.user ?? res?.user ?? null;
      if (fullUser) setUser(prev => ({ ...prev, ...fullUser }));
      setUserPosts(res?.body?.posts ?? res?.posts ?? []);
    } catch (err) {
      console.log('Failed to load posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const getDisplayName = () => {
    const first = user?.first_name ?? '';
    const last = user?.last_name ?? '';
    if (first || last) return `${first} ${last}`.trim();
    return user?.name ?? user?.username ?? 'User';
  };

  const handleSave = async () => {
    try {
      await updateUser(user.id, form);
      setUser({ ...user, ...form });
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Your changes have been saved.');
    } catch (error) {
      console.log('save profile error', error);
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  const handleDelete = () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Account Deleted', 'Your account has been removed.', [
            { text: 'OK', onPress: () => navigation.navigate('Main') },
          ]);
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          sessionStorage.removeItem('authToken');
          setUser(null);
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  };

  const uploadAvatar = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Photo library access is required to change your avatar.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (result.canceled || !result.assets?.length) return;

      const imageUri = result.assets[0].uri;
      setUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: imageUri.split('/').pop(),
        type: 'image/jpeg',
      });

      const token = await sessionStorage.getItem('authToken');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/upload/avatar`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      const updatedUser = data.user ?? data;
      setUser(updatedUser);
      Alert.alert('Avatar Updated', 'Your profile picture has been updated.');
    } catch (error) {
      console.log('Avatar upload error:', error);
      Alert.alert('Error', 'Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  // ─── Loading / not logged in states ────────────────────────────────────────

  if (userLoading) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.centered, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.centered, { backgroundColor: t.background }]}>
        <Text style={{ color: t.secondaryText, fontSize: 16 }}>
          You need to log in to view your profile.
        </Text>
      </SafeAreaView>
    );
  }

  // ─── Main render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: t.background }]}>

      {/* ── Top Bar ── */}
      <Box style={[styles.topBar, { backgroundColor: t.background, borderBottomColor: t.cardBackground }]}>
        <Pressable style={styles.topBarBack} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={t.accent} />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: t.text }]}>Profile</Text>
        <Pressable style={styles.topBarAction} onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-sharp" size={22} color={t.secondaryText} />
        </Pressable>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header Section ── */}
        <Box style={[styles.headerSection, { backgroundColor: t.cardBackground }]}>

          {/* Avatar with camera overlay */}
          <Pressable style={styles.avatarWrapper} onPress={uploadAvatar} disabled={uploading}>
            <Avatar
              uri={user?.avatar ? normalizeAvatarUrl(user.avatar) : null}
              customSize={120}
            />
            {uploading && (
              <Box style={styles.uploadingOverlay}>
                <ActivityIndicator color="#fff" />
              </Box>
            )}
            <Box style={[styles.cameraBtn, { backgroundColor: t.accent }]}>
              <Ionicons name="camera" size={14} color="#fff" />
            </Box>
          </Pressable>

          {/* Name + verified */}
          <Box style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={[styles.displayName, { color: t.text }]}>{getDisplayName()}</Text>
            {user?.verified && (
              <Ionicons name="checkmark-circle" size={20} color="#1DA1F2" style={{ marginLeft: 6 }} />
            )}
          </Box>

          {user?.email && (
            <Text style={[styles.email, { color: t.secondaryText }]}>{user.email}</Text>
          )}

          {/* Stats row */}
          <Box style={styles.statsRow}>
            <Box style={styles.statItem}>
              <Text style={[styles.statNumber, { color: t.text }]}>{userPosts.length}</Text>
              <Text style={[styles.statLabel, { color: t.secondaryText }]}>Posts</Text>
            </Box>
            <Box style={[styles.statDivider, { backgroundColor: t.border }]} />
            <Box style={styles.statItem}>
              <Text style={[styles.statNumber, { color: t.text }]}>
                {userPosts.reduce((sum, p) => sum + (Number(p.votes) || 0), 0)}
              </Text>
              <Text style={[styles.statLabel, { color: t.secondaryText }]}>Total Votes</Text>
            </Box>
            <Box style={[styles.statDivider, { backgroundColor: t.border }]} />
            <Box style={styles.statItem}>
              <Text style={[styles.statNumber, { color: t.text }]}>
                {userPosts.reduce((sum, p) => sum + (Number(p.comments) || 0), 0)}
              </Text>
              <Text style={[styles.statLabel, { color: t.secondaryText }]}>Comments</Text>
            </Box>
          </Box>

          {user?.created_at && (
            <Text style={[styles.memberSince, { color: t.secondaryText }]}>
              Member since {formatTime(user.created_at, translate)}
            </Text>
          )}
        </Box>

        {/* ── Tabs ── */}
        <Box style={[styles.tabContainer, { backgroundColor: t.cardBackground, borderBottomColor: t.border }]}>
          {['Posts', 'About'].map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && { borderBottomColor: t.accent, borderBottomWidth: 2 },
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, { color: selectedTab === tab ? t.accent : t.secondaryText }]}>
                {tab === 'Posts' ? `Posts (${userPosts.length})` : 'About'}
              </Text>
            </Pressable>
          ))}
        </Box>

        {/* ── Posts Tab ── */}
        {selectedTab === 'Posts' && (
          <Box style={styles.postsContainer}>
            {postsLoading ? (
              <Box style={styles.emptyState}>
                <ActivityIndicator color={t.accent} />
              </Box>
            ) : userPosts.length > 0 ? (
              userPosts.map((post, index) => (
                <Pressable
                  key={`${post.type}-${post.id}-${index}`}
                  onPress={() =>
                    navigation.navigate(post.type === 'poll' ? 'Poll' : 'Discuss', { postData: post })
                  }
                >
                  {post.type === 'poll' ? (
                    <PollCard {...post} theme={theme} />
                  ) : (
                    <DiscussionCard {...post} theme={theme} />
                  )}
                </Pressable>
              ))
            ) : (
              <Box style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color={t.secondaryText} />
                <Text style={[styles.emptyText, { color: t.secondaryText }]}>No posts yet</Text>
              </Box>
            )}
          </Box>
        )}

        {/* ── About Tab ── */}
        {selectedTab === 'About' && (
          <Box style={[styles.aboutContainer, { backgroundColor: t.cardBackground }]}>
            {!isEditing ? (
              <>
                <Box style={styles.aboutHeader}>
                  <Text style={[styles.aboutTitle, { color: t.text }]}>About</Text>
                  <Pressable onPress={() => setIsEditing(true)}>
                    <Ionicons name="pencil-outline" size={20} color={t.accent} />
                  </Pressable>
                </Box>

                <Text style={[styles.aboutText, { color: t.secondaryText, fontStyle: user?.about ? 'normal' : 'italic' }]}>
                  {user?.about || 'No bio yet — tap the pencil to add one.'}
                </Text>

                {user?.phone && (
                  <Box style={styles.infoRow}>
                    <Ionicons name="call-outline" size={18} color={t.secondaryText} />
                    <Text style={[styles.infoText, { color: t.secondaryText }]}>{user.phone}</Text>
                  </Box>
                )}

                {user?.birthdate && (
                  <Box style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color={t.secondaryText} />
                    <Text style={[styles.infoText, { color: t.secondaryText }]}>
                      {new Date(user.birthdate).toLocaleDateString()}
                    </Text>
                  </Box>
                )}
              </>
            ) : (
              <>
                <Text style={[styles.aboutTitle, { color: t.text, marginBottom: 16 }]}>Edit Profile</Text>

                {[
                  { key: 'first_name', placeholder: 'First name' },
                  { key: 'last_name', placeholder: 'Last name' },
                  { key: 'phone', placeholder: 'Phone number' },
                ].map(({ key, placeholder }) => (
                  <TextInput
                    key={key}
                    style={[styles.input, { backgroundColor: t.background, borderColor: t.border, color: t.text }]}
                    value={form[key]}
                    onChangeText={(text) => setForm({ ...form, [key]: text })}
                    placeholder={placeholder}
                    placeholderTextColor={t.secondaryText}
                  />
                ))}

                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: t.background, borderColor: t.border, color: t.text }]}
                  value={form.about}
                  onChangeText={(text) => setForm({ ...form, about: text })}
                  placeholder="About me"
                  placeholderTextColor={t.secondaryText}
                  multiline
                />

                <Box style={styles.buttonRow}>
                  <Pressable
                    style={[styles.btnCancel, { borderColor: t.border }]}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={{ color: t.secondaryText, fontWeight: '600' }}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.btnSave, { backgroundColor: t.accent }]}
                    onPress={handleSave}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
                  </Pressable>
                </Box>
              </>
            )}
          </Box>
        )}
      </ScrollView>

      {/* ── Settings Bottom Sheet (Modal) ── */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowSettings(false)} />
        <Box style={[styles.settingsSheet, { backgroundColor: t.cardBackground }]}>
          <Box style={[styles.sheetHandle, { backgroundColor: t.border }]} />

          <Pressable
            style={styles.sheetBtn}
            onPress={() => { setShowSettings(false); handleLogout(); }}
          >
            <Ionicons name="log-out-outline" size={20} color={t.text} />
            <Text style={[styles.sheetText, { color: t.text }]}>Log Out</Text>
          </Pressable>

          <Box style={[styles.sheetDivider, { backgroundColor: t.border }]} />

          <Pressable
            style={styles.sheetBtn}
            onPress={() => { setShowSettings(false); handleDelete(); }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={[styles.sheetText, { color: '#FF3B30' }]}>Delete Account</Text>
          </Pressable>

          <Pressable
            style={[styles.sheetCancelBtn, { backgroundColor: t.background }]}
            onPress={() => setShowSettings(false)}
          >
            <Text style={{ color: t.secondaryText, fontWeight: '600', fontSize: 16 }}>Cancel</Text>
          </Pressable>
        </Box>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ── Top Bar ──
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  topBarBack: { padding: 6, width: 40 },
  topBarTitle: { fontSize: 17, fontWeight: '700' },
  topBarAction: { padding: 6, width: 40, alignItems: 'flex-end' },

  // ── Header ──
  headerSection: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
    width: 120,
    height: 120,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  displayName: { fontSize: 22, fontWeight: '700' },
  email: { fontSize: 13, marginBottom: 16 },
  memberSince: { fontSize: 12, marginTop: 8 },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, height: 36 },

  // ── Tabs ──
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: { fontSize: 15, fontWeight: '600' },

  // ── Posts ──
  postsContainer: { paddingBottom: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, marginTop: 12 },

  // ── About / Edit ──
  aboutContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 14,
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aboutTitle: { fontSize: 18, fontWeight: '700' },
  aboutText: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  infoText: { fontSize: 14, marginLeft: 10 },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
  },
  textArea: { height: 90, textAlignVertical: 'top' },

  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  btnCancel: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSave: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  // ── Settings Modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  settingsSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 14,
  },
  sheetText: { fontSize: 16, fontWeight: '600' },
  sheetDivider: { height: 1 },
  sheetCancelBtn: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
});