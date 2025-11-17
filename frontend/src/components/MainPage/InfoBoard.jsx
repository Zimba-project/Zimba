import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import useThemedStyles from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeProvider';

const { width } = Dimensions.get('window');
const SIDE_PADDING = 24;
const CARD_WIDTH = Math.min(340, Math.round(width * 0.78));

// InfoCard is rendered inside InfoBoard so it can use themed styles/colors

const InfoBoard = ({ items = [], style, onCardPress }) => {
    const listRef = useRef(null);
    const [index, setIndex] = useState(0);
    const { colors } = useTheme();
    const t = useThemedStyles((c) => ({
        container: { paddingVertical: 12 },
        listContent: { paddingHorizontal: SIDE_PADDING },
        card: {
            width: CARD_WIDTH,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: c.surface,
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12 },
                android: { elevation: 3 },
            }),
        },
        image: { width: '100%', height: 140 },
        cardBody: { padding: 12 },
        cardTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 6 },
        cardSubtitle: { fontSize: 13, color: c.muted },
        dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
        dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: c.border, marginHorizontal: 6 },
        dotActive: { backgroundColor: c.primary, width: 18, borderRadius: 6 },
    }));

    const InfoCard = ({ item, onPress }) => (
        <TouchableOpacity
            style={[t.card, { backgroundColor: item.background || colors.surface }]}
            onPress={() => onPress && onPress(item)}
            activeOpacity={0.9}
        >
            {item.image ? (
                <Image source={{ uri: item.image }} style={t.image} resizeMode="cover" />
            ) : null}
            <View style={t.cardBody}>
                <Text style={t.cardTitle} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
                {item.subtitle ? <Text style={t.cardSubtitle} numberOfLines={3} ellipsizeMode="tail">{item.subtitle}</Text> : null}
            </View>
        </TouchableOpacity>
    );

    const onMomentumScrollEnd = (ev) => {
        const offsetX = ev.nativeEvent.contentOffset.x;
        const newIndex = Math.round(offsetX / (CARD_WIDTH + 16));
        setIndex(newIndex);
    };

    return (
        <View style={[t.container, style]}>
            <FlatList
                ref={listRef}
                data={items}
                horizontal
                keyExtractor={(it) => it.id}
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 16}
                snapToAlignment="start"
                decelerationRate="fast"
                contentContainerStyle={t.listContent}
                onMomentumScrollEnd={onMomentumScrollEnd}
                renderItem={({ item }) => <InfoCard item={item} onPress={onCardPress} />}
                ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            />

            <View style={t.dots}>
                {items.map((_, i) => (
                    <View key={i} style={[t.dot, i === index ? t.dotActive : null]} />
                ))}
            </View>
        </View>
    );
};
export default InfoBoard;