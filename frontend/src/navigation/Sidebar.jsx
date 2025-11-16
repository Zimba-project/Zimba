import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { 
  HStack,
  Box,
  VStack,
  Pressable,
  Divider, 
  Text, 
  Heading,
 } from '@gluestack-ui/themed';
import MainTabs from './MainTabs';
// for now fetch from static file
import { TOPIC_COLORS } from '../utils/TopicColors';


// Placeholder-screenit (Pitää korvata oikeilla sitte)

function LanguageScreen() {
  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text>Language Settings</Text>
    </Box>
  )
}

function DarkmodeScreen() {
  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text>Dark Mode Settings</Text>
    </Box>
  )
}

const DrawerNav = createDrawerNavigator();
// Custom drawer content — renders standard links plus a collapsible Topics section
function CustomDrawerContent({ navigation }) {
  const topics = Object.keys(TOPIC_COLORS || {});
  const [topicsOpen, setTopicsOpen] = React.useState(false);

  return (
    <DrawerContentScrollView>
      <VStack p="$4" space="lg">
        <Heading size="md" mb="$2">
          Menu
        </Heading>

        {/* Topics Section */}
        <Pressable onPress={() => setTopicsOpen(!topicsOpen)}>
          <HStack justifyContent="space-between" alignItems="center">
            <HStack alignItems="center" space="sm">
              <Ionicons name="list-outline" size={20} color="#374151" />
              <Text bold>Topics</Text>
            </HStack>
            <Ionicons
              name={topicsOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#6b7280"
            />
          </HStack>
        </Pressable>

    {topicsOpen && (
  <View style={{ paddingLeft: 20 }}>
    {topics.map((topic) => (
      <TouchableOpacity
        key={topic}
        onPress={() => {
          navigation.closeDrawer?.();
          navigation.navigate('Home');
        }}
      >
        <Text style={{ color: '#6B7280', fontSize: 14 }}>{topic}</Text>
      </TouchableOpacity>
    ))}
  </View>
)}

        <Divider my="$3" />

        {/* Language Link */}
        <Pressable onPress={() => navigation.navigate('Language')}>
          <HStack space="sm" alignItems="center" mb="$3">
            <Ionicons name="language-outline" size={20} color="#374151" />
            <Text bold>Language</Text>
          </HStack>
        </Pressable>

        {/* Dark Mode Link */}
        <Pressable onPress={() => navigation.navigate('Darkmode')}>
          <HStack space="sm" alignItems="center">
            <Ionicons name="moon-outline" size={20} color="#374151" />
            <Text bold>Dark Mode</Text>
          </HStack>
        </Pressable>
      </VStack>
    </DrawerContentScrollView>
  );
}

export default function Sidebar() {
  return (
    <DrawerNav.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false, drawerActiveTintColor: '#111827' }}
    >
      <DrawerNav.Screen
        name="Home"
        component={MainTabs}
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />

      <DrawerNav.Screen name="Language" component={LanguageScreen} />
      <DrawerNav.Screen name="Darkmode" component={DarkmodeScreen} />
    </DrawerNav.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  heading: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  drawerItem: { paddingVertical: 10 },
  drawerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  drawerLabel: { marginLeft: 8, fontSize: 16, color: '#111827', fontWeight: '600' },
  topicsList: { marginTop: 8, paddingLeft: 12 },
  topicInnerRow: { marginBottom: 6, borderRadius: 6, borderBottomWidth: 1, borderBottomColor: '#eef2ff' },
  topicInnerRowContent: { paddingVertical: 8, paddingHorizontal: 6, paddingLeft: 12 },
  topicRowContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  topicRow: { flex: 1 },
  chevButton: { padding: 6 },
  badge: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontWeight: '600', fontSize: 13 },
  topicLabel: { fontSize: 13, color: '#6b7280', paddingVertical: 6, lineHeight: 18 },
  separator: { height: 1, backgroundColor: '#eef2ff', marginVertical: 8 },
});
