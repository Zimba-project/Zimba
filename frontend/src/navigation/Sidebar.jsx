import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import MainTabs from './MainTabs';
import { TOPIC_COLORS } from '../utils/TopicColors';

import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';

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
    <DrawerContentScrollView {...props} contentContainerStyle={styles.content}>

      {/* Topics collapsible */}
      <Box style={styles.drawerItem}>

        <TouchableOpacity style={styles.drawerRow} activeOpacity={0.7} onPress={() => setTopicsOpen(s => !s)}>
          <Box style={styles.drawerRow}>
            <Ionicons name="list-outline" size={20} color="#374151" />
            {/* Gluestack Text käytössä */}
            <Text style={styles.drawerLabel}>Topics</Text>
          </Box>
          <Ionicons name={topicsOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#6b7280" />
        </TouchableOpacity>

        {topicsOpen && (
          <Box style={styles.topicsList}
            p="$3"
            mt="$1"
            bg="$white"
            rounded="md"
            shadow="1"
          >
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
                  <Text style={styles.topicLabel} numberOfLines={1}>{t}</Text>
                </Box>
              </TouchableOpacity>
            ))}
          </Box>
        )}
      </Box>
      <Box style={styles.separator} />

      {/* Language link */}
      <TouchableOpacity style={styles.drawerItem} activeOpacity={0.7} onPress={() => navigation.navigate('Language')}>
        <View style={styles.drawerRow}>
          <Ionicons name="language-outline" size={20} color="#374151" />
          <Text style={styles.drawerLabel}>Language</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.separator} />


      {/* Dark mode link */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        p="$3"
      >
        <Box flexDirection="row" alignItems="center">
          <Ionicons name="moon-outline" size={20} color="#374151" />
          <Text style={styles.drawerLabel}>Dark mode</Text>
        </Box>


        <Switch
          size="md"
          value={theme === 'dark'}
          onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
        />
      </Box>

    </DrawerContentScrollView>
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
      screenOptions={{ headerShown: false, drawerActiveTintColor: '#111827' }}
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
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },

  heading: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#1f2937' },

  drawerItem: { paddingVertical: 12, paddingHorizontal: 4, borderRadius: 8 },
  drawerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  drawerLabel: { marginLeft: 8, fontSize: 16, color: '#1f2937', fontWeight: '500' },
  topicsList: { marginTop: 8, paddingLeft: 12, backgroundColor: '#ffffff', borderRadius: 6, paddingVertical: 4, elevation: 1 },
  topicInnerRow: { marginBottom: 0, borderBottomWidth: 0 },
  topicInnerRowContent: { paddingVertical: 10, paddingHorizontal: 6, paddingLeft: 12 },
  topicLabel: { fontSize: 14, color: '#4b5563', paddingVertical: 0, lineHeight: 20 },
  separator: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 10 },
  topicRowContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  topicRow: { flex: 1 },
  chevButton: { padding: 6 },
  badge: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontWeight: '600', fontSize: 13 },
});