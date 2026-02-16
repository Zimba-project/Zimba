import React, { useState } from 'react';
import { StyleSheet, Modal, FlatList } from 'react-native';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { useTranslation } from 'react-i18next';

export const PostFilterBar = ({
  selectedTab,
  setSelectedTab,
  selectedDropdown,
  setSelectedDropdown,
}) => {
  const { theme } = useTheme();
  const tTheme = getTheme(theme);
  const { t: translate } = useTranslation();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const TABS = [
    { key: 'hot', icon: 'flame' },
    { key: 'new', icon: 'time' },
    { key: 'top', icon: 'star' },
  ];

  const DROPDOWN_OPTIONS = ['all', 'discussions', 'polls'];

  return (
    <Box style={styles.container}>
      {/* Tabs */}
      <Box style={styles.tabsContainer}>
        {TABS.map(({ key, icon }) => {
          const isActive = selectedTab === key;
          return (
            <Pressable
              key={key}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? tTheme.accent : tTheme.cardBackground,
                  borderColor: isActive ? tTheme.accent : tTheme.inputBorder,
                },
              ]}
              onPress={() => setSelectedTab(key)} // store key
            >
              <Ionicons name={icon} size={16} color={isActive ? '#fff' : tTheme.text} />
              {isActive && (
                <Text style={[styles.tabText, { color: '#fff', marginLeft: 4 }]}>
                  {translate(key)}
                </Text>
              )}
            </Pressable>
          );
        })}
      </Box>

      {/* Selected filter text */}
      <Text style={[styles.filterLabel, { color: tTheme.text }]}>
        {selectedDropdown !== 'all' ? translate(selectedDropdown) : translate('filter')}
      </Text>

      {/* Filter Icon */}
      <Pressable
        style={[
          styles.filterButton,
          { borderColor: tTheme.inputBorder, backgroundColor: tTheme.cardBackground },
        ]}
        onPress={() => setDropdownVisible(true)}
      >
        <Ionicons name="filter" size={18} color={tTheme.text} />
      </Pressable>

      {/* Dropdown Modal */}
      <Modal
        transparent
        visible={dropdownVisible}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDropdownVisible(false)}>
          <Box style={[styles.modalContent, { backgroundColor: tTheme.cardBackground }]}>
            <FlatList
              data={DROPDOWN_OPTIONS}
              keyExtractor={item => item}
              style={{ maxHeight: 120 }}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedDropdown(item); // store key
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={{ color: tTheme.text }}>{translate(item)}</Text>
                </Pressable>
              )}
            />
          </Box>
        </Pressable>
      </Modal>
    </Box>
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
  filterLabel: { marginRight: 4, fontWeight: '500', fontSize: 14 },
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
