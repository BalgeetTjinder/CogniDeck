import { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { Colors } from '../../../lib/colors';
import { getDeck, getTopicsWithStats } from '../../../lib/database';
import { KnowledgeGraph } from '../../../components/KnowledgeGraph';
import { EmptyState } from '../../../components/EmptyState';
import type { Deck, TopicWithStats } from '../../../lib/types';

export default function GraphScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const deckId = Number(id);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [topics, setTopics] = useState<TopicWithStats[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [d, t] = await Promise.all([
          getDeck(deckId),
          getTopicsWithStats(deckId),
        ]);
        setDeck(d);
        setTopics(t);
      })();
    }, [deckId])
  );

  if (!deck) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: `${deck.title} — Граф` }} />
      {topics.length === 0 ? (
        <EmptyState
          icon="git-network-outline"
          title="Нет данных"
          subtitle="Добавьте темы и карточки, чтобы увидеть граф знаний"
        />
      ) : (
        <KnowledgeGraph
          topics={topics}
          deckColor={deck.color}
          onStudyTopic={(topicId) => router.push(`/study/${deckId}?topicId=${topicId}`)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
});
