import React from 'react';
import { View, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';

export function BirthdatePicker({
    visible,
    value,
    onConfirm,
    onCancel,
    theme,
    t,
}) {
    if (!visible) return null;

    if (Platform.OS === 'ios') {
        return (
            <Modal visible transparent animationType="slide" onRequestClose={onCancel}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ padding: 16, borderRadius: 12, width: '90%', backgroundColor: t.cardBackground }}>
                        <Text style={{ color: t.text, fontWeight: '600', marginBottom: 8 }}>Select Birthdate</Text>
                        <DateTimePicker
                            value={value || new Date(2000, 0, 1)}
                            mode="date"
                            display="spinner"
                            maximumDate={new Date()}
                            onChange={(_, selectedDate) => {
                                if (selectedDate) onConfirm(selectedDate, { close: false });
                            }}
                            themeVariant={theme === 'dark' ? 'dark' : 'light'}
                        />
                        <HStack className="justify-end" style={{ marginTop: 12, gap: 8 }}>
                            <Button variant="outline" action="secondary" onPress={onCancel} style={{ borderRadius: 8 }}>
                                <Text style={{ color: t.text }}>Cancel</Text>
                            </Button>
                            <Button action="primary" variant="solid" onPress={() => onConfirm(value, { close: true })} style={{ borderRadius: 8, backgroundColor: t.accent }}>
                                <ButtonText>Done</ButtonText>
                            </Button>
                        </HStack>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <DateTimePicker
            value={value || new Date(2000, 0, 1)}
            mode="date"
            display="calendar"
            maximumDate={new Date()}
            onChange={(_, selectedDate) => {
                if (selectedDate) onConfirm(selectedDate, { close: true });
            }}
            themeVariant={theme === 'dark' ? 'dark' : 'light'}
        />
    );
}
