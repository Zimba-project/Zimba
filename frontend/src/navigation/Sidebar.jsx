import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import MainTabs from './MainTabs';
// for now fetch from static file
import { TOPIC_COLORS } from '../utils/TopicColors';
import { useTheme } from '../theme/ThemeProvider';
import useThemedStyles from '../theme/useThemedStyles';


// Placeholder-screenit (Pitää korvata oikeilla sitte)

function LanguageScreen() { return <View style={{ flex: 1 }} />; }
function DarkmodeScreen() { return <View style={{ flex: 1 }} />; }

// Custom drawer content — renders standard links plus a collapsible Topics section
function CustomDrawerContent(props) {
  const { navigation } = props;
  const topics = Object.keys(TOPIC_COLORS || {});
  const [topicsOpen, setTopicsOpen] = React.useState(false);
  const { toggleTheme, colors, isDark } = useTheme();
  const themeStyles = useThemedStyles((c) => ({
    iconColor: c.text || '#374151',
    switchThumb: c.primary || '#6366f1',
    switchTrackOn: c.primary ? c.primary.replace(/^rgb\(/, 'rgba(').replace(/\)$/, ',0.3)') : 'rgba(99,102,241,0.3)'
  }));

  const t = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 16, backgroundColor: c.background },
    heading: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: c.text },
    drawerItem: { paddingVertical: 10 },
    drawerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    drawerLabel: { marginLeft: 8, fontSize: 16, color: c.text, fontWeight: '600' },
    topicsList: { marginTop: 8, paddingLeft: 12 },
    topicInnerRow: { marginBottom: 6, borderRadius: 6, borderBottomWidth: 1, borderBottomColor: c.border },
    topicInnerRowContent: { paddingVertical: 8, paddingHorizontal: 6, paddingLeft: 12 },
    topicRowContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    topicRow: { flex: 1 },
    chevButton: { padding: 6 },
    badge: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
    badgeText: { fontWeight: '600', fontSize: 13 },
    topicLabel: { fontSize: 13, color: c.muted, paddingVertical: 6, lineHeight: 18 },
    separator: { height: 1, backgroundColor: c.border, marginVertical: 8 },
  }));

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: colors?.background }} contentContainerStyle={t.content}>
      {/* Topics collapsible */}
      <View style={t.drawerItem}>
        <TouchableOpacity style={t.drawerRow} activeOpacity={0.7} onPress={() => setTopicsOpen(s => !s)}>
          <View style={t.drawerRow}>
            <Ionicons name="list-outline" size={20} color={themeStyles.iconColor} />
            <Text style={[t.drawerLabel, { color: colors?.text }]}>Topics</Text>
          </View>
          <Ionicons name={topicsOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors?.muted} />
        </TouchableOpacity>

        {topicsOpen && (
          <View style={t.topicsList}>
            {topics.map((topicName) => {
              return (
                <TouchableOpacity
                  key={topicName}
                  style={[t.topicInnerRow, { borderBottomColor: colors?.border }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    // Close drawer and navigate Home (could pass topic param later)
                    try { navigation.closeDrawer && navigation.closeDrawer(); } catch (e) { }
                    navigation.navigate('Home');
                  }}
                >
                  <View style={t.topicInnerRowContent}>
                    <Text style={[t.topicLabel, { color: colors?.text }]} numberOfLines={1}>{topicName}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
      <View style={[t.separator, { backgroundColor: colors?.border }]} />

      {/* Language link */}
      <TouchableOpacity style={t.drawerItem} activeOpacity={0.7} onPress={() => navigation.navigate('Language')}>
        <View style={t.drawerRow}>
          <Ionicons name="language-outline" size={20} color={themeStyles.iconColor} />
          <Text style={[t.drawerLabel, { color: colors?.text }]}>Language</Text>
        </View>
      </TouchableOpacity>
      <View style={[t.separator, { backgroundColor: colors?.border }]} />


      {/* Dark mode switch */}
      <TouchableOpacity
        style={t.drawerItem}
        activeOpacity={0.8}
        onPress={() => {
          toggleTheme(); // from useTheme()
        }}
      >
        <View style={[t.drawerRow, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="moon-outline" size={20} color={themeStyles.iconColor} />
            <Text style={[t.drawerLabel, { color: colors?.text }]}>Dark mode</Text>
          </View>
          <Switch
            value={!!isDark}
            onValueChange={toggleTheme}
            thumbColor={isDark ? themeStyles.switchThumb : '#f4f3f4'}
            trackColor={{ false: '#767577', true: themeStyles.switchTrackOn }}
          />
        </View>
      </TouchableOpacity>

    </DrawerContentScrollView>
  );
}

const Drawer = createDrawerNavigator();

export default function Sidebar({ route, navigation }) {
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

  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false, drawerActiveTintColor: colors?.text }}
      drawerStyle={{ backgroundColor: colors?.background }}
      sceneContainerStyle={{ backgroundColor: colors?.background }}
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

// styles removed — using themed styles via `useThemedStyles` (see `t` above)
