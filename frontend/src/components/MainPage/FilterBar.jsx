import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

const TABS = [
  { key: 'Hot', icon: 'flame' },
  { key: 'New', icon: 'time' },
  { key: 'Top', icon: 'star' },
];

const DROPDOWN_OPTIONS = ['All', 'Discussions', 'Polls'];

export const PostFilterBar = ({ selectedTab, setSelectedTab, selectedDropdown, setSelectedDropdown }) => {
  const { theme } = useTheme();
  const t = getTheme(theme);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map(({ key, icon }) => {
          const isActive = selectedTab === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.tab,
                { backgroundColor: isActive ? t.accent : t.cardBackground, borderColor: isActive ? t.accent : t.inputBorder }
              ]}
              onPress={() => setSelectedTab(key)}
            >
              <Ionicons name={icon} size={16} color={isActive ? '#fff' : t.text} />
              {isActive && (
                <Text style={[styles.tabText, { color: '#fff', marginLeft: 4 }]}>{key}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected filter text */}
      <Text style={[styles.filterLabel, { color: t.text }]}>
        {selectedDropdown !== 'All' ? selectedDropdown : 'Filter'}
      </Text>

      {/* Filter Icon */}
      <TouchableOpacity
        style={[styles.filterButton, { borderColor: t.inputBorder, backgroundColor: t.cardBackground }]}
        onPress={() => setDropdownVisible(true)}
      >
        <Ionicons name="filter" size={18} color={t.text} />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        transparent
        visible={dropdownVisible}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: t.cardBackground }]}>
            <FlatList
              data={DROPDOWN_OPTIONS}
              keyExtractor={(item) => item}
              style={{ maxHeight: 120 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedDropdown(item);
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={{ color: t.text }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 8 },
  tabsContainer: { flexDirection: 'row', gap: 8, flex: 1 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: { fontWeight: '500', fontSize: 14 },
  filterLabel: {
    marginRight: 4,
    fontWeight: '500',
    fontSize: 14,
  },
  filterButton: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 10,
    padding: 8,
    minWidth: 120,
  },
  modalItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});
