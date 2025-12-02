import React, { useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useCurrentUser from '../../utils/GetUser';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';

export default function RightButton() {
  const navigation = useNavigation();
  const { user, loading, refreshUser } = useCurrentUser();

  const { theme } = useTheme();
  const t = getTheme(theme);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      //refreshUser();
    });
    return unsub;
  }, [navigation, refreshUser]);

  const getInitials = () => {
    if (!user) return null;

    const first = user.firstName || user.first_name || '';
    const last = user.lastName || user.last_name || '';

    if (first && last) {
      return (String(first)[0] + String(last)[0]).toUpperCase();
    }

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

  if (loading) return <View style={styles.placeholder} />;

  return (
    <View style={styles.container}>
      {/* Search button */}
      <TouchableOpacity
        style={styles.searchBtn}
        onPress={() => navigation.navigate('Search')}
        accessibilityLabel="Search"
      >
      <Ionicons name="search" size={20} color={t.text} />
      </TouchableOpacity>

      {initials ? (
        <TouchableOpacity
          style={[styles.avatar, { backgroundColor: t.accent }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.initials}>{initials}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.loginText, { color: t.accent }]}>Login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  placeholder: { width: 96, height: 40, marginRight: 8 },
  searchBtn: { paddingHorizontal: 10, paddingVertical: 6, marginRight: 6 },
  loginBtn: { paddingHorizontal: 10, paddingVertical: 6, marginRight: 6 },
  loginText: { fontWeight: '600' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: { color: '#fff', fontWeight: '700' },
});
