import React, { useState } from 'react';
import { Keyboard, Platform, StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../utils/theme';

export const EndTimePicker = ({ endTime, setEndTime }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); // ✅ no type annotation

  const { theme } = useTheme();
  const t = getTheme(theme);

  const handlePress = () => {
    Keyboard.dismiss();
    setPickerMode('date');
    setShowPicker(true);
  };

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }

    if (selectedDate) {
      if (pickerMode === 'date') {
        const currentTime = endTime || new Date();
        const newDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          currentTime.getHours(),
          currentTime.getMinutes()
        );
        setEndTime(newDate);

        if (Platform.OS === 'android') {
          setPickerMode('time');
          setShowPicker(true);
        }
      } else {
        const currentDate = endTime || new Date();
        const newDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          selectedDate.getHours(),
          selectedDate.getMinutes()
        );
        setEndTime(newDate);

        if (Platform.OS === 'android') {
          setShowPicker(false);
        }
      }

      if (Platform.OS === 'ios') {
        setEndTime(selectedDate);
      }
    }
  };

  return (
    <Box style={styles.container}>
      <Text style={[styles.label, { color: t.text }]}>End Time</Text>
      <Pressable
        style={[
          styles.timeBox,
          { backgroundColor: t.cardBackground, borderColor: t.secondaryText },
        ]}
        onPress={handlePress}
      >
        <Text style={[styles.timeText, { color: t.text }]}>
          {endTime ? format(endTime, 'PPPp') : 'Select date and time'}
        </Text>
        {endTime && (
          <Pressable onPress={() => setEndTime(null)} style={styles.clearIcon}>
            <Ionicons name="close-circle" size={18} color={t.error || '#dc2626'} />
          </Pressable>
        )}
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={endTime || new Date()}
          mode={pickerMode}
          display="default"
          onChange={handleChange}
          themeVariant={theme === 'dark' ? 'dark' : 'light'}
        />
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 6,
  },
  timeBox: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 15,
    flex: 1,
  },
  clearIcon: {
    marginLeft: 12,
  },
});
