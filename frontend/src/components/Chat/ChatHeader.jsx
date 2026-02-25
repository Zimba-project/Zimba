import React, { useState } from 'react';
import { Image, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getInitials } from '../../utils/GetInitials';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';

export default function ChatHeader({ navigation, chatWith, avatarUrl }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { theme } = useTheme();
  const t = getTheme(theme);

  const handleMenuOption = (option) => {
    setMenuVisible(false);
    alert(option); // Replace with real actions later
  };

  return (
    <Box style={[styles.container, { backgroundColor: t.background, borderBottomColor: t.secondaryText }]}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={28} color={t.text} />
      </Pressable>

      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <Box style={[styles.avatarPlaceholder, { backgroundColor: t.accent }]}>
          <Text style={styles.avatarText}>{getInitials(chatWith)}</Text>
        </Box>
      )}

      <Text style={[styles.name, { color: t.text }]}>{chatWith}</Text>

      <Pressable onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
        <Ionicons name="ellipsis-vertical" size={22} color={t.text} />
      </Pressable>

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <Box style={[styles.menu, { backgroundColor: t.cardBackground }]}>
            {['Mute Notifications', 'Report', 'Block User'].map((opt) => (
              <Pressable key={opt} style={styles.menuItem} onPress={() => handleMenuOption(opt)}>
                <Text style={[styles.menuText, { color: t.text }]}>{opt}</Text>
              </Pressable>
            ))}
          </Box>
        </Pressable>
      </Modal>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 10,
    paddingTop: 0,
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
    top: 56,
    right: 10,
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 5,
  },
  menuItem: { paddingHorizontal: 12, paddingVertical: 10 },
  menuText: { fontSize: 14 },
});
