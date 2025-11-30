import React from 'react';
import { ScrollView, StyleSheet, LayoutAnimation } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';

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
          <Pressable
            key={filter}
            onPress={() => handleSelect(filter)}
          >
            <Box className={isActive ? 'bg-primary-500' : 'bg-outline-200'} style={styles.chip}>
              <Text size="sm" className={isActive ? 'text-typography-0 font-medium' : 'text-typography-700 font-medium'}>
                {filter}
              </Text>
            </Box>
          </Pressable>
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
  },
});
