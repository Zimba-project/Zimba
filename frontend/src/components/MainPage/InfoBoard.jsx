import React, { useRef, useState } from 'react';
import { FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

const { width } = Dimensions.get('window');
const SIDE_PADDING = 24;
const CARD_WIDTH = Math.min(340, Math.round(width * 0.78));

const getCardBgColor = (index) => {
    const colors = ['bg-primary-50 dark:bg-primary-200', 'bg-background-50 dark:bg-secondary-200'];
    return colors[index % colors.length];
};

const InfoCard = ({ item, onPress, index }) => (
    <TouchableOpacity
        style={styles.card}
        onPress={() => onPress && onPress(item)}
        activeOpacity={0.9}
    >
        <Box className={`${getCardBgColor(index)} rounded-xl overflow-hidden`} style={styles.cardContainer}>
            {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            ) : null}
            <Box style={styles.cardBody}>
                <Text size="md" className="text-typography-900 font-bold mb-1.5" numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
                <Text size="sm" className="text-typography-700" numberOfLines={3} ellipsizeMode="tail">{item.subtitle || ''}</Text>
            </Box>
        </Box>
    </TouchableOpacity>
);

const InfoBoard = ({ items = [], style, onCardPress }) => {
    const listRef = useRef(null);
    const [index, setIndex] = useState(0);

    const onMomentumScrollEnd = (ev) => {
        const offsetX = ev.nativeEvent.contentOffset.x;
        const newIndex = Math.round(offsetX / (CARD_WIDTH + 16));
        setIndex(newIndex);
    };

    return (
        <Box style={[styles.container, style]}>
            <FlatList
                ref={listRef}
                data={items}
                horizontal
                keyExtractor={(it) => it.id}
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 16}
                snapToAlignment="start"
                decelerationRate="fast"
                contentContainerStyle={styles.listContent}
                onMomentumScrollEnd={onMomentumScrollEnd}
                renderItem={({ item, index }) => <InfoCard item={item} onPress={onCardPress} index={index} />}
                ItemSeparatorComponent={() => <Box style={{ width: 16 }} />}
            />

            <Box style={styles.dots}>
                {items.map((_, i) => (
                    <Box key={i} className={i === index ? 'bg-primary-500' : 'bg-outline-200'} style={[styles.dot, i === index ? styles.dotActive : null]} />
                ))}
            </Box>
        </Box>
    );
};

const styles = StyleSheet.create({
    container: { paddingVertical: 12 },
    listContent: { paddingHorizontal: SIDE_PADDING },
    card: {
        width: CARD_WIDTH,
        height: 240,
        ...Platform.select({
            ios: { shadowOpacity: 0.08, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12 },
            android: { elevation: 3 },
        }),
    },
    cardContainer: { height: 240 },
    image: { width: '100%', height: 140 },
    cardBody: { padding: 12, height: 100 },
    dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
    dot: { width: 8, height: 8, borderRadius: 8, marginHorizontal: 6 },
    dotActive: { width: 18, borderRadius: 6 },
});

export default InfoBoard;