import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { Deck, TopicWithStats } from '../../../lib/types';
import { getDeck, getTopicsWithStats, deleteTopic, getDueCards } from '../../../lib/database';
import { TopicItem } from '../../../components/TopicItem';
import { EmptyState } from '../../../components/EmptyState';

export default function DeckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const deckId = Number(id);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [topics, setTopics] = useState<TopicWithStats[]>([]);
  const [expandedTopicId, setExpandedTopicId] = useState<number | null>(null);
  const [totalDue, setTotalDue] = useState(0);

  const loadData = useCallback(async () => {
    const [deckData, topicsData, dueCards] = await Promise.all([
      getDeck(deckId),
      getTopicsWithStats(deckId),
      getDueCards(deckId),
    ]);
    setDeck(deckData);
    setTopics(topicsData);
    setTotalDue(dueCards.length);
  }, [deckId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDeleteTopic = (topic: TopicWithStats) => {
    Alert.alert(
      'Удалить тему?',
      `"${topic.title}" и все карточки внутри будут удалены.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await deleteTopic(topic.id);
            loadData();
          },
        },
      ]
    );
  };

  if (!deck) return null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: deck.title }} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Action bar */}
        <View style={styles.actionBar}>
          {totalDue > 0 && (
            <Pressable
              style={[styles.studyAllBtn, { backgroundColor: deck.color }]}
              onPress={() => router.push(`/study/${deckId}`)}
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.studyAllText}>Учить все ({totalDue})</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.iconBtn}
            onPress={() => router.push(`/deck/${deckId}/edit`)}
          >
            <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickBtn}
            onPress={() => router.push(`/deck/${deckId}/add-topic`)}
          >
            <Ionicons name="folder-open-outline" size={18} color={Colors.primary} />
            <Text style={styles.quickBtnText}>Тема</Text>
          </Pressable>
          <Pressable
            style={styles.quickBtn}
            onPress={() => router.push(`/deck/${deckId}/add-subtopic`)}
          >
            <Ionicons name="bookmark-outline" size={18} color={Colors.primary} />
            <Text style={styles.quickBtnText}>Подтема</Text>
          </Pressable>
          <Pressable
            style={styles.quickBtn}
            onPress={() => router.push(`/deck/${deckId}/add-card`)}
          >
            <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.quickBtnText}>Карточка</Text>
          </Pressable>
        </View>

        {/* Topics */}
        <View style={styles.topicsList}>
          {topics.length === 0 ? (
            <EmptyState
              icon="folder-open-outline"
              title="Нет тем"
              subtitle="Добавьте тему, затем подтему и карточки"
            />
          ) : (
            topics.map((topic) => (
              <TopicItem
                key={topic.id}
                topic={topic}
                expanded={expandedTopicId === topic.id}
                onToggle={() =>
                  setExpandedTopicId(expandedTopicId === topic.id ? null : topic.id)
                }
                onStudy={() => router.push(`/study/${deckId}?topicId=${topic.id}`)}
                onDelete={() => handleDeleteTopic(topic)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  studyAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  studyAllText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  topicsList: {
    flex: 1,
  },
});
