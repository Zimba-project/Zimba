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

  const DROPDOWN_OPTIONS = [
    { key: 'all', icon: 'apps' },
    { key: 'discussions', icon: 'chatbubble-ellipses' },
    { key: 'polls', icon: 'bar-chart' },
  ];

  return (
    <Box style={styles.container}>
      {/* Tabs (UNCHANGED) */}
      <Box style={styles.tabsContainer}>
        {TABS.map(({ key, icon }) => {
          const isActive = selectedTab === key;
          return (
            <Pressable
              key={key}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive
                    ? tTheme.accent
                    : tTheme.cardBackground,
                  borderColor: isActive
                    ? tTheme.accent
                    : tTheme.inputBorder,
                },
              ]}
              onPress={() => setSelectedTab(key)}
            >
              <Ionicons
                name={icon}
                size={16}
                color={isActive ? '#fff' : tTheme.text}
              />
              {isActive && (
                <Text
                  style={[
                    styles.tabText,
                    { color: '#fff', marginLeft: 4 },
                  ]}
                >
                  {translate(key)}
                </Text>
              )}
            </Pressable>
          );
        })}
      </Box>

      {/* Filter Button */}
      <Pressable
        style={[
          styles.filterButton,
          {
            borderColor:
              selectedDropdown !== 'all'
                ? '#2979FF'
                : tTheme.inputBorder,
            backgroundColor:
              selectedDropdown !== 'all'
                ? 'rgba(41,121,255,0.12)'
                : tTheme.cardBackground,
          },
        ]}
        onPress={() => setDropdownVisible(true)}
      >
        <Ionicons
          name="filter"
          size={18}
          color={
            selectedDropdown !== 'all'
              ? '#2979FF'
              : tTheme.text
          }
        />
      </Pressable>

      {/* Dropdown Modal */}
      <Modal
        transparent
        visible={dropdownVisible}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <Box
            style={[
              styles.modalContent,
              { backgroundColor: tTheme.cardBackground },
            ]}
          >
            <FlatList
              data={DROPDOWN_OPTIONS}
              keyExtractor={item => item.key}
              style={{ maxHeight: 160 }}
              renderItem={({ item }) => {
                const isSelected =
                  selectedDropdown === item.key;

                return (
                  <Pressable
                    style={[
                      styles.modalItem,
                      {
                        backgroundColor: isSelected
                          ? 'rgba(41,121,255,0.15)'
                          : 'transparent',
                        borderRadius: 8,
                      },
                    ]}
                    onPress={() => {
                      setSelectedDropdown(item.key);
                      setDropdownVisible(false);
                    }}
                  >
                    <Box style={styles.dropdownRow}>
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={
                          isSelected
                            ? '#2979FF'
                            : tTheme.text
                        }
                        style={{ marginRight: 10 }}
                      />

                      <Text
                        style={{
                          flex: 1,
                          color: isSelected
                            ? '#2979FF'
                            : tTheme.text,
                          fontWeight: isSelected
                            ? '600'
                            : '400',
                        }}
                      >
                        {translate(item.key)}
                      </Text>

                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color="#2979FF"
                        />
                      )}
                    </Box>
                  </Pressable>
                );
              }}
            />
          </Box>
        </Pressable>
      </Modal>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: {
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
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    minWidth: 180,     
    maxWidth: 180,     
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});