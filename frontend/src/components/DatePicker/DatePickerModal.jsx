import React from 'react';
import { View, Modal, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';

/**
 * Generic date picker modal.
 * Props:
 * - visible: boolean
 * - value: Date | null
 * - onConfirm: (date: Date, { close: boolean }) => void
 * - onCancel: () => void
 * - theme: 'light' | 'dark'
 * - t: theme tokens
 * - mode: 'date' | 'time' | 'datetime' (default: 'date')
 * - title: string (header text)
 * - maximumDate?: Date
 * - minimumDate?: Date
 */
export function DatePickerModal({
    visible,
    value,
    onConfirm,
    onCancel,
    theme,
    t,
    mode = 'date',
    title = 'Select Date',
    maximumDate,
    minimumDate,
}) {
    if (!visible) return null;

    const initialValue = value || new Date();

    if (Platform.OS === 'ios') {
        return (
            <Modal visible transparent animationType="slide" onRequestClose={onCancel}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ padding: 16, borderRadius: 12, width: '90%', backgroundColor: t.cardBackground }}>
                        <Text style={{ color: t.text, fontWeight: '600', marginBottom: 8 }}>{title}</Text>
                        <DateTimePicker
                            value={initialValue}
                            mode={mode}
                            display={mode === 'time' ? 'spinner' : 'spinner'}
                            maximumDate={maximumDate}
                            minimumDate={minimumDate}
                            onChange={(_, selectedDate) => {
                                if (selectedDate) onConfirm(selectedDate, { close: false });
                            }}
                            themeVariant={theme === 'dark' ? 'dark' : 'light'}
                        />
                        <HStack className="justify-end" style={{ marginTop: 12, gap: 8 }}>
                            <Button variant="outline" action="secondary" onPress={onCancel} style={{ borderRadius: 8 }}>
                                <Text style={{ color: t.text }}>Cancel</Text>
                            </Button>
                            <Button action="primary" variant="solid" onPress={() => onConfirm(initialValue, { close: true })} style={{ borderRadius: 8, backgroundColor: t.accent }}>
                                <ButtonText>Done</ButtonText>
                            </Button>
                        </HStack>
                    </View>
                </View>
            </Modal>
        );
    }

    // Android inline picker
    return (
        <DateTimePicker
            value={initialValue}
            mode={mode}
            display={mode === 'time' ? 'clock' : 'calendar'}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            onChange={(_, selectedDate) => {
                if (selectedDate) onConfirm(selectedDate, { close: true });
            }}
            themeVariant={theme === 'dark' ? 'dark' : 'light'}
        />
    );
}
