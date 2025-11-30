import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import useCurrentUser from '../../utils/GetUser';

export default function RightButton() {
  const navigation = useNavigation();
  const { user, loading, refreshUser } = useCurrentUser();

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      //refreshUser();
    });
    return unsub;
  }, [navigation, refreshUser]);

  const getInitials = () => {
    if (!user) return null;

    // Prefer explicit first/last fields if present
    const first = user.firstName || user.first_name || '';
    const last = user.lastName || user.last_name || '';

    if (first && last) {
      return (String(first)[0] + String(last)[0]).toUpperCase();
    }

    // Fallback to splitting full name
    const full = user.name || user.fullName || user.username || user.email || '';
    const parts = String(full).trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return null;
  };

  const initials = getInitials();

  // while loading show an empty placeholder to keep layout stable
  if (loading) return <Box style={styles.placeholder} />;

  return (
    <Box style={styles.container}>
      {/* Search button - keeps search ability */}
      <Pressable
        style={styles.searchBtn}
        onPress={() => navigation.navigate('Search')}
        accessibilityLabel="Search"
      >
        <Icon as={Search} size="lg" className="text-typography-700" />
      </Pressable>

      {initials ? (
        <Pressable onPress={() => navigation.navigate('Profile')}>
          <Box style={styles.avatar} className="bg-primary-600">
            <Text className="text-typography-0 font-bold">{initials}</Text>
          </Box>
        </Pressable>
      ) : (
        <Pressable style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text className="text-primary-600 font-semibold">Login</Text>
        </Pressable>
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  placeholder: { width: 96, height: 40, marginRight: 8 },
  searchBtn: { paddingHorizontal: 10, paddingVertical: 6, marginRight: 6 },
  loginBtn: { paddingHorizontal: 10, paddingVertical: 6, marginRight: 6 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
