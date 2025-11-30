import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { List, Languages, Moon, ChevronUp, ChevronDown } from 'lucide-react-native';
import MainTabs from './MainTabs';
import { TOPIC_COLORS } from '../utils/TopicColors';

import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';


// Placeholder-screenit (Pitää korvata oikeilla sitte)
function LanguageScreen() { return <View style={{ flex: 1 }} />; }
function DarkmodeScreen() { return <View style={{ flex: 1 }} />; }

// Custom drawer content — renders standard links plus a collapsible Topics section
function CustomDrawerContent(props) {
  const { navigation } = props;
  const topics = Object.keys(TOPIC_COLORS || {});
  const [topicsOpen, setTopicsOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <Box className="flex-1 bg-background-0 dark:bg-background-900">
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ padding: 0 }}
        style={{ flex: 1 }}
        className="bg-transparent"
      >
        <TouchableOpacity activeOpacity={0.7} onPress={() => setTopicsOpen(s => !s)}>
          <Box style={styles.drawerItem} flexDirection="row" justifyContent="space-between" alignItems="center">
            <Box flexDirection="row" alignItems="center" style={{ gap: 16 }}>
              <Icon as={List} size="xl" className="text-typography-900" />
              <Text className="text-typography-900">Topics</Text>
            </Box>
            <Icon as={topicsOpen ? ChevronUp : ChevronDown} size="lg" className="text-typography-500" />
          </Box>
        </TouchableOpacity>

        {topicsOpen && (
          <Box style={styles.topicsList} className="bg-background-100 dark:bg-background-900">
            {topics.map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.topicInnerRow}
                activeOpacity={0.7}
                onPress={() => {
                  try { navigation.closeDrawer && navigation.closeDrawer(); } catch (e) { }
                  navigation.navigate('Home');
                }}
              >
                <Box style={styles.topicInnerRowContent}>
                  <Text style={styles.topicLabel} className="text-typography-700" numberOfLines={1}>{t}</Text>
                </Box>
              </TouchableOpacity>
            ))}
          </Box>
        )}

        <Box style={styles.separator} className="bg-background-200 dark:bg-background-800" />

        {/* Language link */}
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Language')}>
          <Box style={[styles.drawerItem, { gap: 16 }]} flexDirection="row" alignItems="center">
            <Icon as={Languages} size="xl" className="text-typography-900" />
            <Text className="text-typography-900">Language</Text>
          </Box>
        </TouchableOpacity>

        <View style={styles.separator} className="bg-background-200 dark:bg-background-800" />

        {/* Color mode switch */}
        <Box
          style={styles.drawerItem}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box flexDirection="row" alignItems="center" style={{ gap: 16 }}>
            <Icon as={Moon} size="xl" className="text-typography-900" />
            <Text className="text-typography-900">Dark mode</Text>
          </Box>
          <Switch
            size="md"
            value={theme === 'dark'}
            onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
          />
        </Box>
      </DrawerContentScrollView>
    </Box>
  );
}


const Drawer = createDrawerNavigator();

export default function Sidebar({ route, navigation }) {
  // ... (rest of the component logic remains the same)
  React.useEffect(() => {
    // If the parent Stack passed { openDrawer: true } as a param to this screen,
    // open the drawer and then clear the param so it doesn't re-open repeatedly.
    const shouldOpen = route?.params?.openDrawer;
    if (shouldOpen) {
      // open the drawer
      try {
        navigation.openDrawer && navigation.openDrawer();
      } catch (e) {
        // ignore
      }

      // clear the param on the parent (the Stack) so this runs only once
      try {
        // navigation.getParent() should point to the Stack navigator
        const parent = navigation.getParent && navigation.getParent();
        parent && parent.setParams && parent.setParams({ openDrawer: false });
      } catch (e) {
        // ignore
      }
    }
  }, [route?.params?.openDrawer]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen
        name="Home"
        component={MainTabs}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen name="Language" component={LanguageScreen} />
      <Drawer.Screen name="Darkmode" component={DarkmodeScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 0 },
  heading: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  drawerItem: { paddingVertical: 12, paddingHorizontal: 4, borderRadius: 8 },
  drawerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  drawerLabel: { fontSize: 16, fontWeight: '500' },
  topicsList: { marginTop: 8, paddingLeft: 12, borderRadius: 6, paddingVertical: 4, elevation: 1 },
  topicInnerRow: { marginBottom: 0, borderBottomWidth: 0 },
  topicInnerRowContent: { paddingVertical: 10, paddingHorizontal: 6, paddingLeft: 12 },
  topicLabel: { fontSize: 14, paddingVertical: 0, lineHeight: 20 },
  separator: { height: 1, marginVertical: 10 },
  topicRowContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  topicRow: { flex: 1 },
  chevButton: { padding: 6 },
  badge: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontWeight: '600', fontSize: 13 },
});