import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  StyleSheet,
  Button,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', bio: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // TODO: replace this with an API call
        const data = {
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          bio: 'React Native developer who loves clean design and coffee ☕',
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
  }, []);

  const handleSave = async () => {
    setIsEditing(false);
    try {
      // TODO: send data to backend with fetch/axios
      setUser(form);
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
        onPress: async () => {
          try {
            // TODO: call your DELETE endpoint
            Alert.alert('Account Deleted', 'User removed successfully.');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete account.');
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
    <SafeAreaView style={styles.container}>
      <View style={styles.profileBox}>
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
            <Text style={styles.title}>{user.name}</Text>
            <Text style={styles.text}>{user.email}</Text>
            <Text style={styles.text}>{user.bio}</Text>

            <View style={styles.buttonRow}>
              <Button title="Edit Profile" onPress={() => setIsEditing(true)} />
            </View>
          </>
        )}
      </View>

 {/* empty boxes for future features for example polls the user has voted on */}
      <View style={styles.box}>
        <Text>Empty Box 1</Text>
      </View>
      <View style={styles.box}>
        <Text>Empty Box 2</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Delete Account" color="red" onPress={handleDelete} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef1f5', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBox: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#007AFF', 
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 16,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  box: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    height: 80,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    marginVertical: 6,
  },
});

export default Profile;
