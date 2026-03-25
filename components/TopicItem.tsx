import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';
import { TopicWithStats, getHealthColor } from '../lib/types';

interface TopicItemProps {
  topic: TopicWithStats;
  onStudy: () => void;
  onDelete: () => void;
  expanded: boolean;
  onToggle: () => void;
}

export function TopicItem({ topic, onStudy, onDelete, expanded, onToggle }: TopicItemProps) {
  const { colors } = useTheme();
  const healthColor = getHealthColor(topic.avg_easiness, topic.total_cards);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable style={styles.header} onPress={onToggle}>
        <View style={[styles.healthDot, { backgroundColor: healthColor, shadowColor: healthColor }]} />
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{topic.title}</Text>
          <Text style={[styles.count, { color: colors.textMuted }]}>{topic.total_cards} карт.</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>

      {expanded && (
        <View style={[styles.body, { borderTopColor: colors.border }]}>
          {topic.subtopics.map((sub) => {
            const subColor = getHealthColor(sub.avg_easiness, sub.total_cards);
            return (
              <View key={sub.id} style={styles.subtopic}>
                <View style={[styles.subDot, { backgroundColor: subColor }]} />
                <Text style={[styles.subTitle, { color: colors.textSecondary }]} numberOfLines={1}>{sub.title}</Text>
                <Text style={[styles.subCount, { color: colors.textMuted }]}>{sub.total_cards}</Text>
              </View>
            );
          })}

          <View style={styles.actions}>
            {topic.due_today > 0 && (
              <Pressable style={[styles.studyBtn, { backgroundColor: colors.primary }]} onPress={onStudy}>
                <Ionicons name="play" size={14} color="#fff" />
                <Text style={styles.studyBtnText}>Учить ({topic.due_today})</Text>
              </Pressable>
            )}
            <Pressable style={styles.deleteBtn} onPress={onDelete}>
              <Ionicons name="trash-outline" size={14} color={colors.danger} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  healthDot: {
    width: 8, height: 8, borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 3, elevation: 3,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  count: { fontSize: 13 },
  body: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1 },
  subtopic: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 18,
    gap: 8,
  },
  subDot: { width: 6, height: 6, borderRadius: 3 },
  subTitle: { fontSize: 14, flex: 1 },
  subCount: { fontSize: 13 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  studyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  studyBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  deleteBtn: { padding: 8 },
});
