import React from 'react';
import { View, Text, TouchableOpacity, Share, Linking } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import useThemedStyles from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeProvider';

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

    const { colors } = useTheme();
    const t = useThemedStyles((c) => ({
        row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
        leftItems: { flexDirection: 'row', alignItems: 'center' },
        item: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
        label: { marginLeft: 6, fontSize: 13, color: c.muted },
        actions: { flexDirection: 'row', alignItems: 'center' },
        iconButton: { paddingHorizontal: 8, paddingVertical: 4 },
    }));

    const iconColor = colors.primary;

    return (
        <View style={t.row}>
            <View style={t.leftItems}>
                {votes !== undefined && (
                    <View style={t.item}>
                        <Icon name="bar-chart-2" size={16} color={iconColor} />
                        <Text style={t.label}>{votes.toLocaleString()} Votes</Text>
                    </View>
                )}
                {comments !== undefined && (
                    <View style={t.item}>
                        <Icon name="message-circle" size={16} color={iconColor} />
                        <Text style={t.label}>{comments} Comments</Text>
                    </View>
                )}
                {views !== undefined && (
                    <View style={t.item}>
                        <Icon name="eye" size={16} color={iconColor} />
                        <Text style={t.label}>{views.toLocaleString()} Views</Text>
                    </View>
                )}
            </View>

            <View style={t.actions}>
                {(onShare || share) && (
                    <TouchableOpacity onPress={handleShare} style={t.iconButton}>
                        <Icon name="share-2" size={18} color={iconColor} />
                    </TouchableOpacity>
                )}
                {onSave && (
                    <TouchableOpacity onPress={onSave} style={t.iconButton}>
                        <Icon name="bookmark" size={18} color={iconColor} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};
export default StatsBar;