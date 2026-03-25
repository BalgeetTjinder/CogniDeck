import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';
import { DeckWithStats, getHealthColor } from '../lib/types';

interface DeckCardProps {
  deck: DeckWithStats;
  onPress: () => void;
}

export function DeckCard({ deck, onPress }: DeckCardProps) {
  const healthColor = getHealthColor(deck.avg_easiness, deck.total_cards);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.colorStripe, { backgroundColor: deck.color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{deck.title}</Text>
          <View style={[styles.healthDot, { backgroundColor: healthColor }]} />
        </View>
        <View style={styles.footer}>
          <View style={styles.stat}>
            <Ionicons name="documents-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.statText}>{deck.total_cards} карточек</Text>
          </View>
          {deck.due_today > 0 && (
            <View style={[styles.badge, { backgroundColor: deck.color + '18' }]}>
              <Text style={[styles.badgeText, { color: deck.color }]}>
                {deck.due_today} на сегодня
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  colorStripe: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  healthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
