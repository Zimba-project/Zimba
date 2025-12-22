import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';

const COLORS = [
  '#3b82f6',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#14b8a6',
  '#ec4899',
];

const PollResults = ({ options }) => {
  const themeFromProvider = useTheme();
  const t = getTheme(themeFromProvider?.theme);

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <Box
      style={[
        styles.card,
        {
          backgroundColor: t.cardBackground,
          shadowColor: '#000',
        },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>
        Poll Results
      </Text>

      <Text style={[styles.subtitle, { color: t.text }]}>
        {totalVotes} total votes
      </Text>

      <Box style={{ marginTop: 12 }}>
        {options.map((opt, index) => {
          const percent = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
          const color = COLORS[index % COLORS.length];

          return (
            <Box key={opt.id} style={styles.optionContainer}>
              {/* Label Row */}
              <Box style={styles.optionHeader}>
                <Text style={[styles.optionLabel, { color: t.text }]}>
                  {opt.text}
                </Text>
                <Text style={[styles.percentText, { color: t.text }]}>
                  {Math.round(percent)}%
                </Text>
              </Box>

              {/* Progress Bar */}
              <Box
                style={[
                  styles.progressBackground,
                  { backgroundColor: t.inputBackground },
                ]}
              >
                <Box
                  style={[
                    styles.progressFill,
                    {
                      width: `${percent}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </Box>

              {/* Votes */}
              <Text style={[styles.voteText, { color: t.text }]}>
                {opt.votes} vote{opt.votes !== 1 ? 's' : ''}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  optionContainer: {
    marginBottom: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  percentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBackground: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  voteText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default PollResults;
