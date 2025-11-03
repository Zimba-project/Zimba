import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');
const SIDE_PADDING = 24;
const CARD_WIDTH = Math.min(340, Math.round(width * 0.78));

const InfoCard = ({ item, onPress }) => (
    <TouchableOpacity
        style={[styles.card, { backgroundColor: item.background || '#fff' }]}
        onPress={() => onPress && onPress(item)}
        activeOpacity={0.9}
    >
        {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        ) : null}
        <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
            {item.subtitle ? <Text style={styles.cardSubtitle} numberOfLines={3} ellipsizeMode="tail">{item.subtitle}</Text> : null}
        </View>
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
        <View style={[styles.container, style]}>
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
                renderItem={({ item }) => <InfoCard item={item} onPress={onCardPress} />}
                ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            />

            <View style={styles.dots}>
                {items.map((_, i) => (
                    <View key={i} style={[styles.dot, i === index ? styles.dotActive : null]} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingVertical: 12 },
    listContent: { paddingHorizontal: SIDE_PADDING },
    card: {
        width: CARD_WIDTH,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12 },
            android: { elevation: 3 },
        }),
    },
    image: { width: '100%', height: 140 },
    cardBody: { padding: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 6 },
    cardSubtitle: { fontSize: 13, color: '#374151' },
    dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
    dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: '#e5e7eb', marginHorizontal: 6 },
    dotActive: { backgroundColor: '#6366f1', width: 18, borderRadius: 6 },
});

export default InfoBoard;
