import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';

const StatsBar = ({ votes, comments }) => (
    <View style={styles.row}>
        {votes !== undefined && (
            <View style={styles.item}>
                <Icon name="bar-chart-2" size={16} color="#6366f1" />
                <Text style={styles.label}>{votes.toLocaleString()} Votes</Text>
            </View>
        )}
        {comments !== undefined && (
            <View style={styles.item}>
                <Icon name="message-circle" size={16} color="#6366f1" />
                <Text style={styles.label}>{comments} Comments</Text>
            </View>
        )}
    </View>
);

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    item: { flexDirection: 'row', alignItems: 'center' },
    label: { marginLeft: 6, fontSize: 13, color: '#4b5563' },
});

export default StatsBar;