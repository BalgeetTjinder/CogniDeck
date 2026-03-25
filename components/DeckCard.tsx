import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';
import { DeckWithStats, getHealthColor } from '../lib/types';

interface DeckCardProps {
  deck: DeckWithStats;
  onPress: () => void;
}

export function DeckCard({ deck, onPress }: DeckCardProps) {
  const { colors } = useTheme();
  const healthColor = getHealthColor(deck.avg_easiness, deck.total_cards);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.colorStripe, { backgroundColor: deck.color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{deck.title}</Text>
          <View style={[styles.healthDot, { backgroundColor: healthColor, shadowColor: healthColor }]} />
        </View>
        <View style={styles.footer}>
          <View style={styles.stat}>
            <Ionicons name="documents-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.statText, { color: colors.textMuted }]}>{deck.total_cards} карточек</Text>
          </View>
          {deck.due_today > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.accent + '20' }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>
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
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  colorStripe: { width: 5 },
  content: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: { fontSize: 17, fontWeight: '700', flex: 1, marginRight: 8 },
  healthDot: {
    width: 10, height: 10, borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 4, elevation: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 13 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: '600' },
});
