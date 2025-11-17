import React, { useState, useEffect } from 'react';
import { me as info } from '../api/auth';
import { sessionStorage } from '../utils/Storage';
import {
  SafeAreaView,
  Text,
  TextInput,
  Button,
  View,
  Alert,
  ActivityIndicator,
  ScrollView,
  Pressable
} from 'react-native';
import useThemedStyles from '../theme/useThemedStyles';
import { useTheme } from '../theme/ThemeProvider';

const Profile = ({ navigation, route }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', bio: '' });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadUser = async () => {
      try {

        // TODO: replace this with an API call
        const res = await info(sessionStorage.getItem('authToken'));
        console.log(res.body.user);
        const passedUser = res?.body?.user;// //res.body.user;
        const data =
          passedUser || {
            first_name: 'Jane Doe',
            phone: 'jane.doe@example.com',
            about: 'React Native developer who loves clean design and coffee ☕',
          };
        setUser(data);
        setForm(data);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [route?.params?.user]);

  const handleSave = async () => {
    setIsEditing(false);
    try {
      // TODO: send data to backend with fetch/axios
      setUser(form);
      Alert.alert('Profile Updated', 'Your changes have been saved.', [
        { text: 'OK', onPress: () => navigation.navigate('Main', { user: form }) },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  const handleDelete = async () => {
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // TODO: call your DELETE endpoint
            Alert.alert('Account Deleted', 'User removed successfully.', [
              { text: 'OK', onPress: () => navigation.navigate('Main') },
            ]);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete account.');
          }
        },
      },
    ]);
  };

  // Added: handleLogout function
  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            // TODO: clear authentication tokens 
            setUser(null);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            Alert.alert('Error', 'Failed to log out.');
          }
        },
      },
    ]);
  };

  const { colors } = useTheme();
  const t = useThemedStyles((c) => ({
    safeArea: { flex: 1, backgroundColor: c.background },
    scrollContent: { alignItems: 'center', paddingHorizontal: 16, paddingBottom: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topBar: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.surface },
    topTitle: { fontSize: 18, fontWeight: '700', color: c.text },
    backText: { color: c.primary, fontSize: 16, fontWeight: '600' },
    profileCard: { width: '100%', backgroundColor: c.surface, borderRadius: 12, borderWidth: 1, borderColor: c.border, padding: 20, marginTop: 20, marginBottom: 12, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2, alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6, textAlign: 'center', color: c.text },
    text: { fontSize: 16, marginBottom: 6, textAlign: 'center', color: c.text },
    input: { borderWidth: 1, borderColor: c.border, padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 16, width: '100%', backgroundColor: c.surface },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
    featureBox: { borderWidth: 1, borderColor: c.border, borderRadius: 10, height: 90, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: c.surface, marginVertical: 6, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    featureText: { color: c.muted }
  }));

  if (loading) {
    return (
      <SafeAreaView style={t.center}>
        <ActivityIndicator size="large" color={colors?.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={t.safeArea}>
      {/* Simple top bar */}
      <View style={t.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={t.backText}>← Back</Text>
        </Pressable>
        <Text style={t.topTitle}>Profile</Text>
        <View style={{ width: 40 }}>
          <Text style={t.topTitle}>placeholder to balance layout </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={t.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={t.profileCard}>
          {isEditing ? (
            <>
              <TextInput
                style={t.input}
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="Name"
                placeholderTextColor={colors?.muted}
              />
              <TextInput
                style={t.input}
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor={colors?.muted}
              />
              <TextInput
                style={[t.input, { height: 80 }]}
                value={form.bio}
                onChangeText={(text) => setForm({ ...form, bio: text })}
                placeholder="Bio"
                multiline
                placeholderTextColor={colors?.muted}
              />
              <View style={t.buttonRow}>
                <Button title="Cancel" color={colors?.muted} onPress={() => setIsEditing(false)} />
                <Button title="Save" color={colors?.primary} onPress={handleSave} />
              </View>
            </>
          ) : (
            <>
              <Text style={t.title}>{user.first_name} {user.last_name}</Text>
              <Text style={t.text}>{user.phone}</Text>
              <Text style={t.text}>{user.about}</Text>

              <View style={t.buttonRow}>
                <Button title="Edit Profile" color={colors?.primary} onPress={() => setIsEditing(true)} />
              </View>
            </>
          )}
        </View>

        {/* empty boxes for future features for example polls the user has voted on */}
        <View style={t.featureBox}>
          <Text style={t.featureText}>Empty Box 1</Text>
        </View>
        <View style={t.featureBox}>
          <Text style={t.featureText}>Empty Box 2</Text>
        </View>

        {/* Added: Logout button */}
        <View style={{ marginTop: 20 }}>
          <Button title="Log Out" color={colors?.primary} onPress={handleLogout} />
        </View>

        <View style={{ marginTop: 10 }}>
          <Button title="Delete Account" color={colors?.danger} onPress={handleDelete} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
// styles moved to `useThemedStyles` (variable `t`)

export default Profile;