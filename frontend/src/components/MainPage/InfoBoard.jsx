import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { useTheme } from '@/components/ui/ThemeProvider/ThemeProvider';
import { getTheme } from '../../utils/theme';

const { width } = Dimensions.get('window');
const SIDE_PADDING = 24;
const CARD_WIDTH = Math.min(340, Math.round(width * 0.78));

const InfoCard = ({ item, onPress, t }) => (
  <TouchableOpacity
    style={[
      styles.card,
      { backgroundColor: item.background || t.cardBackground },
    ]}
    onPress={() => onPress && onPress(item)}
    activeOpacity={0.9}
  >
    {item.image ? (
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
    ) : null}
    <View style={styles.cardBody}>
      <Text
        style={[styles.cardTitle, { color: t.text }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {item.title}
      </Text>
      {item.subtitle ? (
        <Text
          style={[styles.cardSubtitle, { color: t.text }]}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {item.subtitle}
        </Text>
      ) : null}
    </View>
  </TouchableOpacity>
);

const InfoBoard = ({ items = [], style, onCardPress }) => {
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  const { theme } = useTheme();
  const t = getTheme(theme);

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
        renderItem={({ item, index }) => (
        <InfoCard item={{...item,background: index % 2 === 0 ? t.infoCardBackground : t.infoCardBackgroundAlt,}}
            onPress={onCardPress}
            t={t}/>)}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
      />

      <View style={styles.dots}>
        {items.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: t.inputBorder },
              i === index && { backgroundColor: t.accent, width: 18, borderRadius: 6 },
            ]}
          />
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  image: { width: '100%', height: 140 },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  cardSubtitle: { fontSize: 13 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 8, marginHorizontal: 6 },
});

export default InfoBoard;
