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

export default function ProfileScreen({ navigation, route }){
  const { user, setUser, loading: userLoading, refreshUser } = useCurrentUser(route);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    about: '',
    birthdate: '',
  });

  // Sync local form state with user when user loads
  useEffect(() => {
    if (user) {
      setForm(user);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateUser(sessionStorage.getItem('authToken'), form);
      setUser(form);         // Update global user state
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
          // TODO: implement delete API call
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
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: '#6b7280', fontSize: 16 }}>
          You need to log in to view your profile.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={form.first_name}
                onChangeText={(text) => setForm({ ...form, first_name: text })}
                placeholder="First name"
              />
              <TextInput
                style={styles.input}
                value={form.last_name}
                onChangeText={(text) => setForm({ ...form, last_name: text })}
                placeholder="Last name"
              />
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
                placeholder="Phone number"
              />
              <TextInput
                style={styles.input}
                value={form.birthdate}
                onChangeText={(text) => setForm({ ...form, birthdate: text })}
                placeholder="Birthdate (YYYY-MM-DD)"
              />
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={form.about}
                onChangeText={(text) => setForm({ ...form, about: text })}
                placeholder="About you"
                multiline
              />
              <View style={styles.buttonRow}>
                <Button title="Cancel" onPress={() => setIsEditing(false)} />
                <Button title="Save" onPress={handleSave} />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>
                {user.first_name} {user.last_name}
              </Text>
              <Text style={styles.text}>{user.phone}</Text>
              <Text style={styles.text}>{user.about}</Text>
              <Text style={styles.text}>
                {user.birthdate ? new Date(user.birthdate).toLocaleDateString('fi-FI') : 'Not set'}
              </Text>

              <View style={styles.buttonRow}>
                <Button title="Edit Profile" onPress={() => setIsEditing(true)} />
              </View>
            </>
          )}
        </View>

        {/* Feature Boxes */}
        <View style={styles.featureBox}>
          <Text style={styles.featureText}>Empty Box 1</Text>
        </View>
        <View style={styles.featureBox}>
          <Text style={styles.featureText}>Empty Box 2</Text>
        </View>

        {/* Logout & Delete */}
        <View style={{ marginTop: 20, width: '100%' }}>
          <Button title="Log Out" color="#6366f1" onPress={handleLogout} />
        </View>
        <View style={{ marginTop: 10, width: '100%' }}>
          <Button title="Delete Account" color="red" onPress={handleDelete} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
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
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  topTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  backButton: { flexDirection: 'row', alignItems: 'center', paddingTop: 14 },
  backText: { color: '#6366f1', fontSize: 16, fontWeight: '600', marginLeft: 4 },
  profileCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6, textAlign: 'center', color: '#111827' },
  text: { fontSize: 16, marginBottom: 6, textAlign: 'center', color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    width: '100%',
    backgroundColor: '#f9fafb',
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  featureBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    height: 90,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureText: { color: '#6b7280', fontSize: 16 },
});