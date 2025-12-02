import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, LayoutAnimation } from 'react-native';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';

const FILTERS = ['All', 'Discussions', 'Polls'];

export const FilterBar = ({ selectedFilter, setSelectedFilter }) => {
  const { theme } = useTheme();
  const t = getTheme(theme);

  const handleSelect = (filter) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedFilter(filter);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipContainer}
    >
      {FILTERS.map((filter) => {
        const isActive = selectedFilter === filter;
        return (
          <TouchableOpacity
            key={filter}
            style={[
              styles.chip,
              { backgroundColor: t.cardBackground, borderColor: t.inputBorder },
              isActive && { backgroundColor: t.accent },
            ]}
            onPress={() => handleSelect(filter)}
          >
            <Text
              style={[
                styles.chipText,
                { color: t.text },
                isActive && { color: '#fff' },
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
