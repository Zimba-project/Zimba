import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Linking } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';

// Shows votes/comments/views on the left and compact icon actions (share/save) on the right
const StatsBar = ({ votes, comments, views, onShare, onSave, share }) => {

    const handleShare = async () => {
        try {
            // If a custom onShare handler is provided, prefer it
            if (typeof onShare === 'function') {
                onShare();
                return;
            }

            // If a share object is provided, use the system share sheet
            // share: { message?: string, url?: string, title?: string }
            if (share && (share.message || share.url)) {
                const content = {};
                if (share.message) content.message = share.message;
                if (share.url) content.url = share.url;
                if (share.title) content.title = share.title;

                await Share.share(content);
                return;
            }

            // Fallback: open WhatsApp if installed (example deep link)
            const whatsappUrl = 'whatsapp://send?text=' + encodeURIComponent('Check this out!');
            const canOpen = await Linking.canOpenURL(whatsappUrl);
            if (canOpen) {
                await Linking.openURL(whatsappUrl);
                return;
            }

            // Last fallback: open generic share with a simple message
            await Share.share({ message: 'Check this out!' });
        } catch (err) {
            console.warn('Share failed', err);
        }
    };

    return (
        <View style={styles.row}>
            <View style={styles.leftItems}>
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
                {views !== undefined && (
                    <View style={styles.item}>
                        <Icon name="eye" size={16} color="#6366f1" />
                        <Text style={styles.label}>{views.toLocaleString()} Views</Text>
                    </View>
                )}
            </View>

            <View style={styles.actions}>
                {(onShare || share) && (
                    <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                        <Icon name="share-2" size={18} color="#6366f1" />
                    </TouchableOpacity>
                )}
                {onSave && (
                    <TouchableOpacity onPress={onSave} style={styles.iconButton}>
                        <Icon name="bookmark" size={18} color="#6366f1" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    leftItems: { flexDirection: 'row', alignItems: 'center' },
    item: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
    label: { marginLeft: 6, fontSize: 13, color: '#4b5563' },
    actions: { flexDirection: 'row', alignItems: 'center' },
    iconButton: { paddingHorizontal: 8, paddingVertical: 4 },
});

export default StatsBar;