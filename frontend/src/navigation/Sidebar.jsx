import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { TOPIC_COLORS } from '../utils/TopicColors';

import MainTabs from './MainTabs';

function LanguageScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="language-outline" size={32} color="#374151" />
    </View>
  );
}

function DarkmodeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="moon-outline" size={32} color="#374151" />
    </View>
  );
}

const DrawerNav = createDrawerNavigator();

// Plain RN drawer content
function CustomDrawerContent({ navigation }) {
  const topics = Object.keys(TOPIC_COLORS || {});
  const [topicsOpen, setTopicsOpen] = useState(false);

  return (
    <DrawerContentScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Menu</Text>

      <TouchableOpacity
        onPress={() => setTopicsOpen(!topicsOpen)}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="list-outline" size={20} color="#374151" />
          <Text style={{ fontWeight: 'bold' }}>Topics</Text>
        </View>
        <Ionicons name={topicsOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#6b7280" />
      </TouchableOpacity>

      {topicsOpen && (
        <View style={{ paddingLeft: 16, gap: 8 }}>
          {topics.map((topic) => (
            <TouchableOpacity
              key={topic}
              onPress={() => {
                navigation.closeDrawer?.();
                navigation.navigate('Root', { screen: 'Home', params: { topic } });
              }}
            >
              <Text style={{ fontSize: 14, color: '#4b5563' }}>{topic}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 }} />

      <TouchableOpacity
        onPress={() => navigation.navigate('Language')}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 }}
      >
        <Ionicons name="language-outline" size={20} color="#374151" />
        <Text style={{ fontWeight: 'bold' }}>Language</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Darkmode')}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 }}
      >
        <Ionicons name="moon-outline" size={20} color="#374151" />
        <Text style={{ fontWeight: 'bold' }}>Dark Mode</Text>
      </TouchableOpacity>
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
        name="Root"
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