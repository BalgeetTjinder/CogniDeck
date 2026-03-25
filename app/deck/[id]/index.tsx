import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../lib/colors';
import { Deck, TopicWithStats } from '../../../lib/types';
import { getDeck, getTopicsWithStats, deleteTopic, getDueCards } from '../../../lib/database';
import { KnowledgeGraph } from '../../../components/KnowledgeGraph';
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
      <Stack.Screen
        options={{
          title: deck.title,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero graph */}
        {topics.length > 0 && (
          <View style={styles.heroSection}>
            <KnowledgeGraph
              topics={topics}
              deckColor={deck.color}
              onStudyTopic={(topicId) => router.push(`/study/${deckId}?topicId=${topicId}`)}
              compact
            />
          </View>
        )}

        {/* Study CTA */}
        {totalDue > 0 && (
          <Pressable
            style={[styles.studyCTA, { backgroundColor: deck.color }]}
            onPress={() => router.push(`/study/${deckId}`)}
          >
            <View style={styles.studyCTALeft}>
              <Ionicons name="play-circle" size={28} color="#fff" />
              <View>
                <Text style={styles.studyCTATitle}>Начать сессию</Text>
                <Text style={styles.studyCTACount}>{totalDue} карточек на сегодня</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
          </Pressable>
        )}

        {/* Quick actions */}
        <View style={styles.actions}>
          <Pressable
            style={styles.actionBtn}
            onPress={() => router.push(`/deck/${deckId}/add-topic`)}
          >
            <Ionicons name="folder-open-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>Тема</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => router.push(`/deck/${deckId}/add-subtopic`)}
          >
            <Ionicons name="bookmark-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>Подтема</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => router.push(`/deck/${deckId}/add-card`)}
          >
            <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>Карточка</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => router.push(`/deck/${deckId}/edit`)}
          >
            <Ionicons name="settings-outline" size={20} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* Topics list */}
        <View style={styles.topicsSection}>
          <Text style={styles.sectionTitle}>Темы</Text>
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
  heroSection: {
    marginBottom: 16,
  },
  studyCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  studyCTALeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  studyCTATitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  studyCTACount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  topicsSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
});
