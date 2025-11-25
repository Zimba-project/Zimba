import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, LayoutAnimation } from 'react-native';

const FILTERS = ['All', 'Discussions', 'Polls'];

export const FilterBar = ({ selectedFilter, setSelectedFilter }) => {
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
            style={[styles.chip, isActive && styles.activeChip]}
            onPress={() => handleSelect(filter)}
          >
            <Text style={[styles.chipText, isActive && styles.activeText]}>
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
    backgroundColor: '#e5e7eb',
  },
  activeChip: {
    backgroundColor: '#6366f1',
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  activeText: {
    color: '#fff',
  },
});
