import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { getDueCards, getDueCardsByTopic, updateCardReview } from '../../lib/database';
import { calculateSM2, getStatusFromHistory } from '../../lib/sm2';
import type { Card, Rating } from '../../lib/types';

export default function StudyScreen() {
  const { deckId, topicId } = useLocalSearchParams<{ deckId: string; topicId?: string }>();
  const router = useRouter();

  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ hard: 0, ok: 0, easy: 0 });

  useEffect(() => {
    (async () => {
      const due = topicId
        ? await getDueCardsByTopic(Number(topicId))
        : await getDueCards(Number(deckId));
      setCards(due);
      setLoading(false);
      if (due.length === 0) setFinished(true);
    })();
  }, [deckId, topicId]);

  const currentCard = cards[currentIndex];
  const total = cards.length;
  const progress = total > 0 ? (currentIndex / total) : 0;

  const handleRate = useCallback(async (rating: Rating) => {
    if (!currentCard) return;

    const { easiness, interval, nextReview } = calculateSM2(
      currentCard.easiness,
      currentCard.interval,
      rating
    );
    const status = getStatusFromHistory(easiness, interval);

    await updateCardReview(currentCard.id, easiness, interval, nextReview, status);

    setStats((prev) => ({
      hard: prev.hard + (rating === 0 ? 1 : 0),
      ok: prev.ok + (rating === 1 ? 1 : 0),
      easy: prev.easy + (rating === 2 ? 1 : 0),
    }));

    if (currentIndex + 1 >= total) {
      setFinished(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setShowHint(false);
    }
  }, [currentCard, currentIndex, total]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Загрузка...' }} />
        <Text style={styles.loadingText}>Загрузка карточек...</Text>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Готово!' }} />
        <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
        <Text style={styles.doneTitle}>Сессия завершена!</Text>
        <Text style={styles.doneSubtitle}>
          {total === 0
            ? 'Нет карточек для повторения сегодня'
            : `Повторено карточек: ${total}`}
        </Text>

        {total > 0 && (
          <View style={styles.statsRow}>
            <View style={[styles.statBadge, { backgroundColor: Colors.dangerLight }]}>
              <Text style={[styles.statBadgeText, { color: Colors.hard }]}>
                Сложно: {stats.hard}
              </Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: Colors.warningLight }]}>
              <Text style={[styles.statBadgeText, { color: Colors.ok }]}>
                Норм: {stats.ok}
              </Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: Colors.successLight }]}>
              <Text style={[styles.statBadgeText, { color: Colors.easy }]}>
                Легко: {stats.easy}
              </Text>
            </View>
          </View>
        )}

        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Вернуться</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: `${currentIndex + 1} / ${total}` }}
      />

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Card */}
      <ScrollView
        contentContainerStyle={styles.cardContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ВОПРОС</Text>
          <Text style={styles.cardText}>{currentCard.question}</Text>
        </View>

        {showHint && currentCard.hint && (
          <View style={styles.hintBox}>
            <Ionicons name="bulb-outline" size={16} color={Colors.warning} />
            <Text style={styles.hintText}>{currentCard.hint}</Text>
          </View>
        )}

        {!showAnswer && currentCard.hint && !showHint && (
          <Pressable style={styles.hintBtn} onPress={() => setShowHint(true)}>
            <Ionicons name="bulb-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.hintBtnText}>Показать подсказку</Text>
          </Pressable>
        )}

        {showAnswer && (
          <View style={styles.answerCard}>
            <Text style={styles.cardLabel}>ОТВЕТ</Text>
            <Text style={styles.answerText}>{currentCard.answer}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom buttons */}
      {!showAnswer ? (
        <Pressable
          style={styles.revealBtn}
          onPress={() => setShowAnswer(true)}
        >
          <Text style={styles.revealBtnText}>Показать ответ</Text>
        </Pressable>
      ) : (
        <View style={styles.ratingRow}>
          <Pressable
            style={[styles.rateBtn, { backgroundColor: Colors.dangerLight }]}
            onPress={() => handleRate(0)}
          >
            <Text style={[styles.rateBtnText, { color: Colors.hard }]}>Сложно</Text>
          </Pressable>
          <Pressable
            style={[styles.rateBtn, { backgroundColor: Colors.warningLight }]}
            onPress={() => handleRate(1)}
          >
            <Text style={[styles.rateBtnText, { color: Colors.ok }]}>Нормально</Text>
          </Pressable>
          <Pressable
            style={[styles.rateBtn, { backgroundColor: Colors.successLight }]}
            onPress={() => handleRate(2)}
          >
            <Text style={[styles.rateBtnText, { color: Colors.easy }]}>Легко</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,
    gap: 8,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },

  progressTrack: {
    height: 4,
    backgroundColor: Colors.border,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },

  cardContainer: {
    flexGrow: 1,
    padding: 20,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 1,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 28,
  },
  answerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  answerText: {
    fontSize: 18,
    color: Colors.text,
    lineHeight: 26,
  },

  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.warningLight,
    borderRadius: 12,
    padding: 14,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  hintBtnText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  revealBtn: {
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  revealBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  ratingRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  rateBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  rateBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  doneTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  doneSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
