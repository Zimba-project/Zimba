import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import MainTabs from './MainTabs';
import { TOPIC_COLORS } from '../utils/TopicColors';

import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';

function LanguageScreen() {
  return <View style={{ flex: 1 }} />;
}

function CustomDrawerContent({ navigation }) {
  const topics = Object.keys(TOPIC_COLORS || {});
  const [topicsOpen, setTopicsOpen] = React.useState(false);

  const { theme, toggleTheme } = useTheme();
  const t = getTheme(theme);
  const isDarkMode = theme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <DrawerContentScrollView contentContainerStyle={[styles.content, { backgroundColor: t.background }]}>
        {/* Topics collapsible */}
        <Box style={styles.drawerItem}>
          <TouchableOpacity
            style={styles.drawerRow}
            activeOpacity={0.7}
            onPress={() => setTopicsOpen(!topicsOpen)}
          >
            <Box style={styles.drawerRow}>
              <Ionicons name="list-outline" size={20} color={t.text} />
              <Text style={[styles.drawerLabel, { color: t.text }]}>Topics</Text>
            </Box>
            <Ionicons name={topicsOpen ? 'chevron-up' : 'chevron-down'} size={18} color={t.secondaryText} />
          </TouchableOpacity>

          {topicsOpen && (
            <Box style={[styles.topicsList, { backgroundColor: t.cardBackground }]}>
              {topics.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={styles.topicInnerRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    navigation.closeDrawer?.();
                    navigation.navigate('Home', { selectedTopic: topic });
                  }}
                >
                  <Text style={[styles.topicLabel, { color: t.secondaryText }]} numberOfLines={1}>
                    {topic}
                  </Text>
                </TouchableOpacity>
              ))}
            </Box>
          )}
        </Box>

        <View style={[styles.separator, { backgroundColor: t.rowBorder }]} />

        {/* Language link */}
        <TouchableOpacity
          style={styles.drawerItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Language')}
        >
          <View style={styles.drawerRow}>
            <Ionicons name="language-outline" size={20} color={t.text} />
            <Text style={[styles.drawerLabel, { color: t.text }]}>Language</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: t.rowBorder }]} />

        {/* Dark mode toggle via icon */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" p="$3">
          <Text style={[styles.drawerLabel, { color: t.text }]}>Dark mode</Text>
          
          <TouchableOpacity
            onPress={toggleTheme}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDarkMode ? 'moon' : 'moon-outline'}
              size={28}
              color={t.moonIconColor}
            />
          </TouchableOpacity>
        </Box>
      </DrawerContentScrollView>
    </View>
  );
}

const Drawer = createDrawerNavigator();

export default function Sidebar({ route, navigation }) {
  const { theme } = useTheme();
  const t = getTheme(theme);

  React.useEffect(() => {
    if (route?.params?.openDrawer) {
      navigation.openDrawer?.();
      const parent = navigation.getParent?.();
      parent?.setParams?.({ openDrawer: false });
    }
  }, [route?.params?.openDrawer]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false, drawerActiveTintColor: t.text }}
    >
      <Drawer.Screen name="Home" component={MainTabs} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="Language" component={LanguageScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  drawerItem: { paddingVertical: 12, paddingHorizontal: 4, borderRadius: 8 },
  drawerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  drawerLabel: { marginLeft: 8, fontSize: 16, fontWeight: '500' },
  topicsList: { marginTop: 8, paddingVertical: 4, borderRadius: 6 },
  topicInnerRow: { paddingVertical: 10, paddingHorizontal: 12 },
  topicLabel: { fontSize: 14, lineHeight: 20 },
  separator: { height: 1, marginVertical: 10 },
});
