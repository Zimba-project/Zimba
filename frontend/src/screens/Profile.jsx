import React, { useState, useEffect } from 'react';
import { updateUser } from '../api/auth';
import { sessionStorage } from '../utils/Storage';
import {
  SafeAreaView,
  Text,
  TextInput,
  StyleSheet,
  Button,
  View,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useCurrentUser from '../utils/GetUser';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';

export default function ProfileScreen({ navigation, route }) {
  const { user, setUser, loading: userLoading } = useCurrentUser(route);
  const [isEditing, setIsEditing] = useState(false);
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
      setForm(user);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateUser(sessionStorage.getItem('authToken'), form);
      setUser(form);
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Your changes have been saved.');
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

  if (userLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.center,  { backgroundColor: t.background }]}>
        <Text style={{ color: t.secondaryText, fontSize: 16 }}>
          You need to log in to view your profile.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: t.background, borderBottomColor: t.secondaryText }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={t.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: t.cardBackground, borderColor: t.secondaryText }]}>
          {isEditing ? (
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
              <TextInput
                style={[styles.input, { height: 80, backgroundColor: t.background, borderColor: t.secondaryText, color: t.text }]}
                value={form.about}
                onChangeText={(text) => setForm({ ...form, about: text })}
                placeholder="About you"
                placeholderTextColor={t.secondaryText}
                multiline
              />
              <View style={styles.buttonRow}>
                <Button title="Cancel" onPress={() => setIsEditing(false)} color={t.secondaryText} />
                <Button title="Save" onPress={handleSave} color={t.accent} />
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: t.text }]}>
                {user.first_name} {user.last_name}
              </Text>
              <Text style={[styles.text, { color: t.secondaryText }]}>{user.phone}</Text>
              <Text style={[styles.text, { color: t.secondaryText }]}>{user.about}</Text>
              <Text style={[styles.text, { color: t.secondaryText }]}>
                {user.birthdate ? new Date(user.birthdate).toLocaleDateString('fi-FI') : 'Not set'}
              </Text>

              <View style={styles.buttonRow}>
                <Button title="Edit Profile" onPress={() => setIsEditing(true)} color={t.accent} />
              </View>
            </>
          )}
        </View>

        {/* Feature Boxes */}
        <View style={[styles.featureBox, { backgroundColor: t.cardBackground, borderColor: t.secondaryText }]}>
          <Text style={[styles.featureText, { color: t.secondaryText }]}>Empty Box 1</Text>
        </View>
        <View style={[styles.featureBox, { backgroundColor: t.cardBackground, borderColor: t.secondaryText }]}>
          <Text style={[styles.featureText, { color: t.secondaryText }]}>Empty Box 2</Text>
        </View>

        {/* Logout & Delete */}
        <View style={{ marginTop: 20, width: '100%' }}>
          <Button title="Log Out" color={t.accent} onPress={handleLogout} />
        </View>
        <View style={{ marginTop: 10, width: '100%' }}>
          <Button title="Delete Account" color={t.error || 'red'} onPress={handleDelete} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { alignItems: 'center', paddingHorizontal: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 80,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', paddingTop: 14 },
  profileCard: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginTop: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  text: { fontSize: 16, marginBottom: 6, textAlign: 'center' },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    width: '100%',
  },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
    marginTop: 10 
  },
  featureBox: {
    borderWidth: 1,
    borderRadius: 10,
    height: 90,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureText: { fontSize: 16 },
});