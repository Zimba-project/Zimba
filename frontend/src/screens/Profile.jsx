// ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Pressable as RNPressable,
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
  const [showDropdown, setShowDropdown] = useState(false);
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

  // Load user on mount
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
    return user?.name ?? user?.username ?? translate('profile');
  };

  const handleSave = async () => {
    try {
      await updateUser(user.id, form);
      setUser({ ...user, ...form });
      setIsEditing(false);
      Alert.alert(translate('profile_updated'), translate('changes_saved'));
    } catch (error) {
      console.log('save profile error', error);
      Alert.alert(translate('error'), translate('failed_save_profile'));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      translate('confirm_delete'),
      translate('are_you_sure_delete_account'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('delete_account'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              translate('account_deleted'),
              translate('your_account_removed'),
              [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
            );
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      translate('log_out'),
      translate('log_out_confirmation'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('log_out'),
          style: 'destructive',
          onPress: () => {
            sessionStorage.removeItem('authToken');
            setUser(null);
            navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
          },
        },
      ]
    );
  };

  const uploadAvatar = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(translate('permission_required'), translate('photo_library_access_required'));
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
      Alert.alert(translate('avatar_updated'), translate('profile_picture_updated'));
    } catch (error) {
      console.log('Avatar upload error:', error);
      Alert.alert(translate('error'), translate('failed_save_profile'));
    } finally {
      setUploading(false);
    }
  };

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
          {translate('you_need_to_log_in_to_view_your_profile')}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: t.background }]}>

      {/* ── Top Bar ── */}
      <Box style={[styles.topBar, { backgroundColor: t.background, borderBottomColor: t.cardBackground }]}>
        <Pressable style={styles.topBarBack} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={t.accent} />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: t.text }]}>{translate('profile')}</Text>
        <Box>
          <Pressable style={styles.topBarAction} onPress={() => setShowDropdown(prev => !prev)}>
            <Ionicons name="settings-sharp" size={22} color={t.secondaryText} />
          </Pressable>

          {showDropdown && (
            <>
              <RNPressable style={StyleSheet.absoluteFill} onPress={() => setShowDropdown(false)} />
              <Box style={[styles.dropdown, { backgroundColor: t.cardBackground, borderColor: t.border }]}>
                <Pressable style={styles.dropdownItem} onPress={() => { setShowDropdown(false); handleLogout(); }}>
                  <Ionicons name="log-out-outline" size={18} color={t.text} />
                  <Text style={[styles.dropdownText, { color: t.text }]}>{translate('log_out')}</Text>
                </Pressable>
                <Pressable style={styles.dropdownItem} onPress={() => { setShowDropdown(false); handleDelete(); }}>
                  <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  <Text style={[styles.dropdownText, { color: '#FF3B30' }]}>{translate('delete_account')}</Text>
                </Pressable>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* ── Scroll Content ── */}
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header Section ── */}
        <Box style={[styles.headerSection, { backgroundColor: t.cardBackground }]}>
          <Pressable style={styles.avatarWrapper} onPress={uploadAvatar} disabled={uploading}>
            <Avatar uri={user?.avatar ? normalizeAvatarUrl(user.avatar) : null} customSize={120} />
            {uploading && (
              <Box style={styles.uploadingOverlay}>
                <ActivityIndicator color="#fff" />
              </Box>
            )}
            <Box style={[styles.cameraBtn, { backgroundColor: t.accent }]}>
              <Ionicons name="camera" size={14} color="#fff" />
            </Box>
          </Pressable>

          <Box style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={[styles.displayName, { color: t.text }]}>{getDisplayName()}</Text>
            {user?.verified && <Ionicons name="checkmark-circle" size={20} color="#1DA1F2" style={{ marginLeft: 6 }} />}
          </Box>

          {user?.email && <Text style={[styles.email, { color: t.secondaryText }]}>{user.email}</Text>}

          <Box style={styles.statsRow}>
            <Box style={styles.statItem}>
              <Text style={[styles.statNumber, { color: t.text }]}>{userPosts.length}</Text>
              <Text style={[styles.statLabel, { color: t.secondaryText }]}>{translate('posts')}</Text>
            </Box>
            <Box style={[styles.statDivider, { backgroundColor: t.border }]} />
            <Box style={styles.statItem}>
              <Text style={[styles.statNumber, { color: t.text }]}>{userPosts.reduce((sum, p) => sum + (Number(p.votes) || 0), 0)}</Text>
              <Text style={[styles.statLabel, { color: t.secondaryText }]}>{translate('votes')}</Text>
            </Box>
            <Box style={[styles.statDivider, { backgroundColor: t.border }]} />
            <Box style={styles.statItem}>
              <Text style={[styles.statNumber, { color: t.text }]}>{userPosts.reduce((sum, p) => sum + (Number(p.comments) || 0), 0)}</Text>
              <Text style={[styles.statLabel, { color: t.secondaryText }]}>{translate('comments')}</Text>
            </Box>
          </Box>

          {user?.created_at && (
            <Text style={[styles.memberSince, { color: t.secondaryText }]}>
              {translate('member_since')} {formatTime(user.created_at, translate)}
            </Text>
          )}
        </Box>

        {/* ── Tabs ── */}
        <Box style={[styles.tabContainer, { backgroundColor: t.cardBackground, borderBottomColor: t.border }]}>
          {['Posts', 'About'].map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, selectedTab === tab && { borderBottomColor: t.accent, borderBottomWidth: 2 }]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, { color: selectedTab === tab ? t.accent : t.secondaryText }]}>
                {tab === 'Posts' ? `${translate('posts')} (${userPosts.length})` : translate('about')}
              </Text>
            </Pressable>
          ))}
        </Box>

        {/* ── Posts Tab ── */}
        {selectedTab === 'Posts' && (
          <Box style={styles.postsContainer}>
            {postsLoading ? (
              <Box style={styles.emptyState}><ActivityIndicator color={t.accent} /></Box>
            ) : userPosts.length > 0 ? (
              userPosts.map((post, index) => (
                <Pressable
                  key={`${post.type}-${post.id}-${index}`}
                  onPress={() => navigation.navigate(post.type === 'poll' ? 'Poll' : 'Discuss', { postData: post })}
                >
                  {post.type === 'poll' ? <PollCard {...post} theme={theme} /> : <DiscussionCard {...post} theme={theme} />}
                </Pressable>
              ))
            ) : (
              <Box style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color={t.secondaryText} />
                <Text style={[styles.emptyText, { color: t.secondaryText }]}>{translate('no_posts_yet')}</Text>
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
                  <Text style={[styles.aboutTitle, { color: t.text }]}>{translate('about')}</Text>
                  <Pressable onPress={() => setIsEditing(true)}>
                    <Ionicons name="pencil-outline" size={20} color={t.accent} />
                  </Pressable>
                </Box>
                <Text style={[styles.aboutText, { color: t.secondaryText, fontStyle: user?.about ? 'normal' : 'italic' }]}>
                  {user?.about || translate('no_bio_yet')}
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
                    <Text style={[styles.infoText, { color: t.secondaryText }]}>{new Date(user.birthdate).toLocaleDateString()}</Text>
                  </Box>
                )}
              </>
            ) : (
              <>
                <Text style={[styles.aboutTitle, { color: t.text, marginBottom: 16 }]}>{translate('edit_profile')}</Text>
                {['first_name', 'last_name', 'phone'].map((key) => (
                  <TextInput
                    key={key}
                    style={[styles.input, { backgroundColor: t.background, borderColor: t.border, color: t.text }]}
                    value={form[key]}
                    onChangeText={(text) => setForm({ ...form, [key]: text })}
                    placeholder={translate(key === 'phone' ? 'phone_number' : key)}
                    placeholderTextColor={t.secondaryText}
                  />
                ))}
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: t.background, borderColor: t.border, color: t.text }]}
                  value={form.about}
                  onChangeText={(text) => setForm({ ...form, about: text })}
                  placeholder={translate('about_me')}
                  placeholderTextColor={t.secondaryText}
                  multiline
                />
                <Box style={styles.buttonRow}>
                  <Pressable style={[styles.btnCancel, { borderColor: t.border }]} onPress={() => setIsEditing(false)}>
                    <Text style={{ color: t.secondaryText, fontWeight: '600' }}>{translate('cancel')}</Text>
                  </Pressable>
                  <Pressable style={[styles.btnSave, { backgroundColor: t.accent }]} onPress={handleSave}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>{translate('save')}</Text>
                  </Pressable>
                </Box>
              </>
            )}
          </Box>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  topBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: 1 },
  topBarBack: { padding: 6, width: 40 },
  topBarTitle: { fontSize: 17, fontWeight: '700' },
  topBarAction: { padding: 6, width: 40, alignItems: 'flex-end' },

  dropdown: { position: 'absolute', top: 36, right: 0, width: 180, borderWidth: 1, borderRadius: 8, overflow: 'hidden', zIndex: 999, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 10 },
  dropdownText: { fontSize: 15, fontWeight: '600' },

  headerSection: { padding: 24, alignItems: 'center', marginBottom: 8 },
  avatarWrapper: { position: 'relative', marginBottom: 16, width: 120, height: 120 },
  uploadingOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 60, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  cameraBtn: { position: 'absolute', bottom: -4, right: -4, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  displayName: { fontSize: 22, fontWeight: '700' },
  email: { fontSize: 13, marginBottom: 16 },
  memberSince: { fontSize: 12, marginTop: 8 },

  statsRow: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 16 },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, height: 36 },

  tabContainer: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabText: { fontSize: 15, fontWeight: '600' },

  postsContainer: { paddingBottom: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, marginTop: 12 },

  aboutContainer: { margin: 16, padding: 20, borderRadius: 14 },
  aboutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  aboutTitle: { fontSize: 18, fontWeight: '700' },
  aboutText: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  infoText: { fontSize: 14, marginLeft: 10 },

  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginBottom: 12 },
  textArea: { height: 90, textAlignVertical: 'top' },

  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  btnCancel: { flex: 1, marginRight: 8, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnSave: { flex: 1, marginLeft: 8, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
});
