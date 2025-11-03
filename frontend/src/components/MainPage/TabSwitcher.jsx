import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabSwitcher = ({ activeTab, onTabChange }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container]}>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'polls' && styles.activeTab]}
                onPress={() => onTabChange('polls')}
            >
                <Text style={[styles.label, activeTab === 'polls' && styles.activeLabel]}>
                    Polls
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tab, activeTab === 'discussions' && styles.activeTab]}
                onPress={() => onTabChange('discussions')}
            >
                <Text style={[styles.label, activeTab === 'discussions' && styles.activeLabel]}>
                    Discussions
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
    activeTab: { borderTopWidth: 3, borderTopColor: '#6366f1' },
    label: { fontSize: 16, color: '#666' },
    activeLabel: { color: '#6366f1', fontWeight: '600' },
});

export default TabSwitcher;