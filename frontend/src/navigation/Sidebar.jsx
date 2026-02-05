import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import MainTabs from './MainTabs';
import GroupsStack from './GroupsStack';
import { TOPIC_COLORS } from '../utils/TopicColors';

import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';

function LanguageScreen() {
  return <View style={{ flex: 1 }} />;
}

function CustomDrawerContent(props) {
  const { navigation } = props;
  const topics = Object.keys(TOPIC_COLORS || {});
  const [topicsOpen, setTopicsOpen] = React.useState(false);

  const { theme, toggleTheme } = useTheme();
  const t = getTheme(theme);

  return (
    <View style={[styles.container, { flex: 1, backgroundColor: t.background }]}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[styles.content, { backgroundColor: t.background }]}
      >
        {/* Topics collapsible */}
        <Box style={styles.drawerItem}>
          <TouchableOpacity
            style={styles.drawerRow}
            activeOpacity={0.7}
            onPress={() => setTopicsOpen((s) => !s)}
          >
            <Box style={styles.drawerRow}>
              <Ionicons name="list-outline" size={20} color={t.text} />
              <Text style={[styles.drawerLabel, { color: t.text }]}>Topics</Text>
            </Box>
            <Ionicons
              name={topicsOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={t.secondaryText}
            />
          </TouchableOpacity>
          {topicsOpen && (
            <Box
              style={styles.topicsList}
              p="$3"
              mt="$1"
              bg={t.cardBackground}
              rounded="md"
              shadow="1"
            >
              {topics.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={styles.topicInnerRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    try {
                      navigation.closeDrawer && navigation.closeDrawer();
                    } catch (e) {}
                    navigation.navigate('Home');
                  }}
                >
                  <Box style={styles.topicInnerRowContent}>
                    <Text
                      style={[styles.topicLabel, { color: t.secondaryText }]}
                      numberOfLines={1}
                    >
                      {topic}
                    </Text>
                  </Box>
                </TouchableOpacity>
              ))}
            </Box>
          )}
        </Box>

        <Box style={[styles.separator, { backgroundColor: t.rowBorder }]} />
        {/* Groups link */}
        <TouchableOpacity
          style={styles.drawerItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Groups')}
        >
          <View style={styles.drawerRow}>
            <Ionicons name="people-outline" size={20} color={t.text} />
            <Text style={[styles.drawerLabel, { color: t.text }]}>Groups</Text>
          </View>
        </TouchableOpacity>

        <Box style={[styles.separator, { backgroundColor: t.rowBorder }]} />

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

        <Box style={[styles.separator, { backgroundColor: t.rowBorder }]} />

        {/* Dark mode toggle */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" p="$3">
          <Box flexDirection="row" alignItems="center">
            <Ionicons name="moon-outline" size={20} color={t.moonIconColor} />
            <Text style={[styles.drawerLabel, { color: t.text }]}>Dark mode</Text>
          </Box>
          <Switch size="md" isChecked={t.isDark} onToggle={toggleTheme} />
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
    const shouldOpen = route?.params?.openDrawer;
    if (shouldOpen) {
      try {
        navigation.openDrawer && navigation.openDrawer();
      } catch (e) {}
      try {
        const parent = navigation.getParent && navigation.getParent();
        parent && parent.setParams && parent.setParams({ openDrawer: false });
      } catch (e) {}
    }
  }, [route?.params?.openDrawer]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent key={theme} {...props} />}
      screenOptions={{ headerShown: false, drawerActiveTintColor: t.text }}
    >
      <Drawer.Screen
        name="Home"
        component={MainTabs}
        options={{ drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen name="Groups" component={GroupsStack} options={{ headerShown: false }} />
      <Drawer.Screen name="Language" component={LanguageScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  heading: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  drawerItem: { paddingTop: 12, paddingHorizontal: 4, borderRadius: 8 },
  drawerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  drawerLabel: { marginLeft: 8, fontSize: 16, fontWeight: '500' },
  topicsList: {
    marginTop: 8,
    paddingLeft: 12,
    borderRadius: 6,
    paddingVertical: 4,
    elevation: 1,
  },
  topicInnerRow: { marginBottom: 0, borderBottomWidth: 0 },
  topicInnerRowContent: { paddingVertical: 10, paddingHorizontal: 6, paddingLeft: 12 },
  topicLabel: { fontSize: 14, paddingVertical: 0, lineHeight: 20 },
  separator: { height: 1, marginVertical: 10 },
  topicRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  topicRow: { flex: 1 },
  chevButton: { padding: 6 },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontWeight: '600', fontSize: 13 },
});
