import React, { useState } from 'react';
import { Image, StyleSheet, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable as GluestackPressable } from '@/components/ui/pressable';
import { Ionicons } from '@expo/vector-icons';
import { getInitials } from '../../utils/GetInitials';

export default function ChatHeader({ navigation, chatWith, avatarUrl }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const handleMenuOption = (option) => {
    setMenuVisible(false);
    alert(option); // Replace with real actions later
  };

  return (
    <Box
      style={[
        styles.container,
        { paddingTop: insets.top, height: 56 + insets.top },
      ]}
      className="bg-background-0 border-b border-outline-200"
    >
      <GluestackPressable onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={28} color="#111" />
      </GluestackPressable>

      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <Box style={styles.avatarPlaceholder} className="bg-primary-600">
          <Text className="text-typography-0 font-bold">{getInitials(chatWith)}</Text>
        </Box>
      )}

      <Text className="text-base text-typography-900 font-semibold ml-2 flex-1">Chat</Text>

      <GluestackPressable onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
        <Ionicons name="ellipsis-vertical" size={22} color="#111" />
      </GluestackPressable>

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <Box style={styles.menu} className="bg-background-0">
            {['Mute Notifications', 'Report', 'Block User'].map((opt) => (
              <GluestackPressable key={opt} style={styles.menuItem} onPress={() => handleMenuOption(opt)}>
                <Text className="text-sm text-typography-900">{opt}</Text>
              </GluestackPressable>
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
    paddingHorizontal: 10,
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
});