import React from 'react';
import { StyleSheet, TouchableOpacity, Share, Linking } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { BarChart3, MessageCircle, Eye, Share2, Bookmark } from 'lucide-react-native';

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
        <Box style={styles.row}>
            <Box style={styles.leftItems}>
                {votes !== undefined && (
                    <Box style={styles.item}>
                        <Icon as={BarChart3} size="sm" className="text-primary-500" />
                        <Text size="sm" className="text-typography-700 ml-1.5">{votes.toLocaleString()} Votes</Text>
                    </Box>
                )}
                {comments !== undefined && (
                    <Box style={styles.item}>
                        <Icon as={MessageCircle} size="sm" className="text-primary-500" />
                        <Text size="sm" className="text-typography-700 ml-1.5">{comments} Comments</Text>
                    </Box>
                )}
                {views !== undefined && (
                    <Box style={styles.item}>
                        <Icon as={Eye} size="sm" className="text-primary-500" />
                        <Text size="sm" className="text-typography-700 ml-1.5">{views.toLocaleString()} Views</Text>
                    </Box>
                )}
            </Box>

            <Box style={styles.actions}>
                {(onShare || share) && (
                    <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                        <Icon as={Share2} size="md" className="text-primary-500" />
                    </TouchableOpacity>
                )}
                {onSave && (
                    <TouchableOpacity onPress={onSave} style={styles.iconButton}>
                        <Icon as={Bookmark} size="md" className="text-primary-500" />
                    </TouchableOpacity>
                )}
            </Box>
        </Box>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    leftItems: { flexDirection: 'row', alignItems: 'center' },
    item: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
    actions: { flexDirection: 'row', alignItems: 'center' },
    iconButton: { paddingHorizontal: 8, paddingVertical: 4 },
});

export default StatsBar;