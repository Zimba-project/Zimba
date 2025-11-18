import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Keyboard, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

export const EndTimePicker = ({ endTime, setEndTime }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');

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
    <View style={styles.container}>
      <Text style={styles.label}>End Time</Text>
      <TouchableOpacity style={styles.timeBox} onPress={handlePress}>
        <Text style={styles.timeText}>
          {endTime ? format(endTime, 'PPPp') : 'Select date and time'}
        </Text>
        {endTime && (
          <TouchableOpacity onPress={() => setEndTime(null)} style={styles.clearIcon}>
            <Ionicons name="close-circle" size={18} color="#dc2626" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={endTime || new Date()}
          mode={pickerMode}
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
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
    color: '#111',
  },
  timeBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#111',
    fontSize: 15,
    flex: 1,
  },
  clearIcon: {
    marginLeft: 12,
  },
});
