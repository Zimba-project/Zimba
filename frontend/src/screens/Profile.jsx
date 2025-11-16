import React, { useState, useEffect } from 'react';
import { me as info } from '../api/auth';
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
  Pressable
} from 'react-native';

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

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Simple top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.topTitle}>Profile</Text>
        <View style={{ width: 40 }}> 
          <Text style={styles.topTitle}>placeholder to balance layout </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="Name"
              />
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                placeholder="Email"
                keyboardType="email-address"
              />
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={form.bio}
                onChangeText={(text) => setForm({ ...form, bio: text })}
                placeholder="Bio"
                multiline
              />
              <View style={styles.buttonRow}>
                <Button title="Cancel" onPress={() => setIsEditing(false)} />
                <Button title="Save" onPress={handleSave} />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>{user.first_name} {user.last_name}</Text>
              <Text style={styles.text}>{user.phone}</Text>
              <Text style={styles.text}>{user.about}</Text>

              <View style={styles.buttonRow}>
                <Button title="Edit Profile" onPress={() => setIsEditing(true)} />
              </View>
            </>
          )}
        </View>

        {/* empty boxes for future features for example polls the user has voted on */}
        <View style={styles.featureBox}>
          <Text style={styles.featureText}>Empty Box 1</Text>
        </View>
        <View style={styles.featureBox}>
          <Text style={styles.featureText}>Empty Box 2</Text>
        </View>

        {/* Added: Logout button */}
        <View style={{ marginTop: 20 }}>
          <Button title="Log Out" color="#6366f1" onPress={handleLogout} />
        </View>

        <View style={{ marginTop: 10 }}>
          <Button title="Delete Account" color="red" onPress={handleDelete} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  backText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    width: '100%',
    backgroundColor: '#ffffff',
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
    color: '#111827',
  },
  text: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'center',
    color: '#374151',
  },
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  featureBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    height: 90,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureText: {
    color: '#6b7280',
  },
});

export default Profile;