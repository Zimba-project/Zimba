import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#14b8a6', '#ec4899'];

const PollResults = ({ options }) => {
  const themeFromProvider = useTheme();
  const t = getTheme(themeFromProvider?.theme);

  const totalVotes = options.reduce((sum, opt) => sum + Number(opt.votes || 0), 0);

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={[styles.totalVotes, { color: t.text }]}>
        Total votes: {totalVotes}
      </Text>

      {/* Stacked bar */}
      <View style={[styles.stackedBarBackground, { backgroundColor: t.inputBackground }]}>
        {options.map((opt, index) => {
          const percent = totalVotes > 0 ? (Number(opt.votes || 0) / totalVotes) * 100 : 0;
          return (
            <View
              key={opt.id}
              style={[
                styles.stackedBarSegment,
                {
                  width: `${percent}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Row of options below the bar */}
      <View style={styles.optionsRow}>
        {options.map((opt, index) => {
          const percent = totalVotes > 0 ? (Number(opt.votes || 0) / totalVotes) * 100 : 0;
          return (
            <View key={opt.id} style={styles.optionItem}>
              <View
                style={[
                  styles.colorBox,
                  { backgroundColor: COLORS[index % COLORS.length] },
                ]}
              />
              <Text style={[styles.optionText, { color: t.text }]}>
                {opt.text} ({Math.round(percent)}%)
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stackedBarBackground: {
    width: '100%',
    height: 24,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  stackedBarSegment: {
    height: '100%',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 4,
  },
  optionText: {
    fontSize: 14,
  },
  totalVotes: {
    fontWeight: '700',
    fontSize: 14,
  },
});

export default PollResults;
