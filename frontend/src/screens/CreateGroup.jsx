import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';
import { createGroup } from '../api/groupsService';

export default function CreateGroup({ navigation }) {
  const { theme } = useTheme();
  const t = getTheme(theme);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createGroup({ name: name.trim(), description, privacy });
      navigation.goBack();
    } catch (err) { console.error('Create group failed', err); }
    finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}> 
      <View style={[styles.form, { backgroundColor: t.cardBackground }]}> 
        <Text style={[styles.label, { color: t.text }]}>Group name</Text>
        <TextInput value={name} onChangeText={setName} style={[styles.input, { color: t.text }]} />

        <Text style={[styles.label, { color: t.text }]}>Description</Text>
        <TextInput value={description} onChangeText={setDescription} style={[styles.input, { color: t.text }]} multiline />

        <Text style={[styles.label, { color: t.text }]}>Privacy</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => setPrivacy(0)} style={[styles.privacyBtn, { borderColor: privacy === 0 ? t.accent : '#ccc' }]}>
            <Text style={{ color: privacy === 0 ? t.accent : t.text }}>Public</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPrivacy(1)} style={[styles.privacyBtn, { borderColor: privacy === 1 ? t.accent : '#ccc' }]}>
            <Text style={{ color: privacy === 1 ? t.accent : t.text }}>Private</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: t.accent }]} onPress={handleCreate} disabled={loading}>
          <Text style={{ color: '#fff' }}>{loading ? 'Creating...' : 'Create group'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, paddingBottom: 80 },
  form: { padding: 12, borderRadius: 10 },
  label: { fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, marginTop: 6 },
  button: { marginTop: 16, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  privacyBtn: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8, marginTop: 8 },
});