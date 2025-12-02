import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getInitials } from '../../utils/GetInitials';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';

export default function ChatHeader({ navigation, chatWith, avatarUrl }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { theme } = useTheme();
  const t = getTheme(theme);

  const handleMenuOption = (option) => {
    setMenuVisible(false);
    alert(option); // Replace with real actions later
  };

  return (
    <View style={[styles.container, { backgroundColor: t.cardBackground, borderBottomColor: t.secondaryText }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={28} color={t.text} />
      </TouchableOpacity>

      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: t.accent }]}>
          <Text style={styles.avatarText}>{getInitials(chatWith)}</Text>
        </View>
      )}

      <Text style={[styles.name, { color: t.text }]}>{chatWith}</Text>

      <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
        <Ionicons name="ellipsis-vertical" size={22} color={t.text} />
      </TouchableOpacity>

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menu, { backgroundColor: t.cardBackground }]}>
            {['Mute Notifications', 'Report', 'Block User'].map((opt) => (
              <TouchableOpacity key={opt} style={styles.menuItem} onPress={() => handleMenuOption(opt)}>
                <Text style={[styles.menuText, { color: t.text }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
    paddingHorizontal: 10,
    paddingTop: 20,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginLeft: 8 },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  name: { fontWeight: '600', fontSize: 16, marginLeft: 8, flex: 1 },
  menuBtn: { padding: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  menu: {
    position: 'absolute',
    top: 70,
    right: 10,
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 5,
  },
  menuItem: { paddingHorizontal: 12, paddingVertical: 10 },
  menuText: { fontSize: 14 },
});
