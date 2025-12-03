// ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  StyleSheet,
  View,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { updateUser } from '../api/auth';
import { sessionStorage } from '../utils/Storage';
import useCurrentUser from '../utils/GetUser';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { normalizeAvatarUrl } from '../utils/urlHelper';

export default function ProfileScreen({ navigation, route }) {
  const { user, setUser, loading: userLoading } = useCurrentUser(route);
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showExtraInfo, setShowExtraInfo] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    about: '',
    birthdate: '',
  });

  const { theme } = useTheme();
  const t = getTheme(theme);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name ?? user.firstName ?? '',
        last_name: user.last_name ?? user.lastName ?? '',
        phone: user.phone ?? '',
        about: user.about ?? '',
        birthdate: user.birthdate ?? '',
      });
    }
  }, [user]);

  const getDisplayName = () => {
    const first = user?.first_name ?? user?.firstName ?? '';
    const last = user?.last_name ?? user?.lastName ?? '';
    if (first || last) return `${first}`.trim(); 
    return user?.name ?? user?.username ?? 'User';
  };

  const handleSave = async () => {
    try {
      const updated = { ...user, ...form };
      await updateUser(await sessionStorage.getItem('authToken'), updated);
      setUser(updated);
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Your changes have been saved.');
    } catch (error) {
      console.log('save profile error', error);
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  const handleDelete = async () => {
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Account Deleted', 'User removed successfully.', [
            { text: 'OK', onPress: () => navigation.navigate('Main') },
          ]);
        },
      },
    ]);
  };

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          sessionStorage.removeItem('authToken');
          setUser(null);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        },
      },
    ]);
  };

  const uploadAvatar = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Permission to access photos is required to change avatar.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

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

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const updatedUser = data.user ?? data;
      setUser(updatedUser);
      setForm({
        first_name: updatedUser.first_name ?? updatedUser.firstName ?? '',
        last_name: updatedUser.last_name ?? updatedUser.lastName ?? '',
        phone: updatedUser.phone ?? '',
        about: updatedUser.about ?? '',
        birthdate: updatedUser.birthdate ?? '',
      });
      Alert.alert('Avatar Updated', 'Your profile picture has been updated.');
    } catch (error) {
      console.log('Avatar upload error:', error);
      Alert.alert('Error', 'Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  if (userLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: t.background }]}>
        <Text style={{ color: t.secondaryText, fontSize: 16 }}>
          You need to log in to view your profile.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
      <View style={[styles.topBar, { backgroundColor: t.background, borderBottomColor: t.cardBackground }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={t.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* PROFILE CARD */}
        <View style={[styles.profileCard, { backgroundColor: t.cardBackground, borderColor: t.cardBackground }]}>
          {/* Avatar + camera + cogwheel */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={uploadAvatar} disabled={uploading}>
              {user?.avatar ? (
                <Image
                  source={{ uri: normalizeAvatarUrl(user.avatar) + (user.avatar ? `?v=${encodeURIComponent(user.avatar)}` : '') }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: t.cardBackground, borderColor: t.secondaryText }]}>
                  <Ionicons name="person-circle-outline" size={60} color={t.secondaryText} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: t.accent }]} onPress={uploadAvatar}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cogBtn, { backgroundColor: t.cardBackground, borderColor: t.secondaryText }]}
              onPress={() => setShowSettings(true)}
            >
              <Ionicons name="settings-sharp" size={18} color={t.text} />
            </TouchableOpacity>
          </View>

          {/* Display / Edit area */}
          {!isEditing ? (
            <>
              <Text style={[styles.title, { color: t.text }]}>{getDisplayName()}</Text>

              {user?.about ? <Text style={[styles.about, { color: t.secondaryText }]}>{user.about}</Text> : null}

              {/* Toggle Extra Info */}
              <TouchableOpacity onPress={() => setShowExtraInfo(!showExtraInfo)}>
                <Text style={{ color: t.accent, marginTop: 6 }}>
                  {showExtraInfo ? 'Hide Details' : 'Show Details'}
                </Text>
              </TouchableOpacity>

              {showExtraInfo && (
                <>
                  <View style={styles.metaRow}>
                    <Ionicons name="call-outline" size={16} color={t.secondaryText} />
                    <Text style={[styles.metaText, { color: t.secondaryText }]}>{user.phone ?? 'Not set'}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={16} color={t.secondaryText} />
                    <Text style={[styles.metaText, { color: t.secondaryText }]}>
                      {user.birthdate ? new Date(user.birthdate).toLocaleDateString('fi-FI') : 'Not set'}
                    </Text>
                  </View>
                </>
              )}
            </>
          ) : (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: t.background, borderColor: t.secondaryText, color: t.text }]}
                value={form.first_name}
                onChangeText={(text) => setForm({ ...form, first_name: text })}
                placeholder="First name"
                placeholderTextColor={t.secondaryText}
              />
              <TextInput
                style={[styles.input, { backgroundColor: t.background, borderColor: t.secondaryText, color: t.text }]}
                value={form.last_name}
                onChangeText={(text) => setForm({ ...form, last_name: text })}
                placeholder="Last name"
                placeholderTextColor={t.secondaryText}
              />
              <TextInput
                style={[styles.input, { height: 90, backgroundColor: t.background, borderColor: t.secondaryText, color: t.text }]}
                value={form.about}
                onChangeText={(text) => setForm({ ...form, about: text })}
                placeholder="About"
                placeholderTextColor={t.secondaryText}
                multiline
              />

              {/* Toggle Extra Info in Edit */}
              <TouchableOpacity onPress={() => setShowExtraInfo(!showExtraInfo)}>
                <Text style={{ color: t.accent, marginBottom: 6 }}>
                  {showExtraInfo ? 'Hide Details' : 'Show Details'}
                </Text>
              </TouchableOpacity>

              {showExtraInfo && (
                <>
                  <TextInput
                    style={[styles.input, { backgroundColor: t.background, borderColor: t.secondaryText, color: t.text }]}
                    value={form.phone}
                    onChangeText={(text) => setForm({ ...form, phone: text })}
                    placeholder="Phone number"
                    placeholderTextColor={t.secondaryText}
                  />
                  <TextInput
                    style={[styles.input, { backgroundColor: t.background, borderColor: t.secondaryText, color: t.text }]}
                    value={form.birthdate}
                    onChangeText={(text) => setForm({ ...form, birthdate: text })}
                    placeholder="Birthdate (YYYY-MM-DD)"
                    placeholderTextColor={t.secondaryText}
                  />
                </>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <Text style={[styles.btnCancel, { color: t.secondaryText }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave}>
                  <Text style={[styles.btnSave, { color: t.accent }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* COMING FEATURES */}
        <View style={[styles.featuresCard, { backgroundColor: t.cardBackground }]}>
          <Text style={[styles.featuresTitle, { color: t.text }]}>🚀 Coming Soon </Text>
          <Text style={[styles.featuresTitle, { color: t.text }]}>More features will be added here 👀 </Text>
        </View>
      </ScrollView>

      {/* SETTINGS BOTTOM SHEET */}
      {showSettings && (
        <View style={[styles.settingsSheet, { backgroundColor: t.cardBackground }]}>
          <TouchableOpacity style={styles.sheetBtn} onPress={() => { setIsEditing(true); setShowSettings(false); }}>
            <Text style={[styles.sheetText, { color: t.text }]}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sheetBtn} onPress={() => { setShowSettings(false); handleLogout(); }}>
            <Text style={[styles.sheetText, { color: t.text }]}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sheetBtn} onPress={() => { setShowSettings(false); handleDelete(); }}>
            <Text style={[styles.sheetText, { color: 'red' }]}>Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sheetCancel} onPress={() => setShowSettings(false)}>
            <Text style={[styles.sheetText, { color: t.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    height: 80,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', paddingTop: 20 },

  scrollContent: { alignItems: 'center', paddingHorizontal: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  profileCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    marginTop: 18,
    alignItems: 'center',
  },

  avatarContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 12,
  },

  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#fff',
  },

  avatarPlaceholder: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  cameraBtn: {
    position: 'absolute',
    bottom: 6,
    right: '30%',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },

  cogBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 4,
  },

  title: { fontSize: 20, fontWeight: '700', marginTop: 6 },
  about: { fontSize: 14, textAlign: 'center', marginTop: 6, marginBottom: 8 },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  metaText: { marginLeft: 8, fontSize: 15 },

  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    width: '100%',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },

  btnCancel: { fontSize: 16, fontWeight: '600' },
  btnSave: { fontSize: 16, fontWeight: '700' },

  featuresCard: {
    width: '100%',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
  },
  featuresTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  featureItem: { fontSize: 15, marginVertical: 4 },

  settingsSheet: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 12,
  },
  sheetBtn: { paddingVertical: 14 },
  sheetCancel: { paddingVertical: 14, marginTop: 6 },
  sheetText: { textAlign: 'center', fontWeight: '600', fontSize: 16 },
});
