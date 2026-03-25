import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import { getDueCards, getDueCardsByTopic, getHardCards, updateCardReview, logReview } from '../../lib/database';
import { calculateSM2, getStatusFromHistory } from '../../lib/sm2';
import type { Card, Rating } from '../../lib/types';

export default function StudyScreen() {
  const { deckId, topicId, mode } = useLocalSearchParams<{
    deckId: string;
    topicId?: string;
    mode?: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();

  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ hard: 0, ok: 0, easy: 0 });

  const flipAnim = useRef(new Animated.Value(0)).current;
  const isHardMode = mode === 'hard';

  useEffect(() => {
    (async () => {
      let due: Card[];
      if (isHardMode) {
        due = await getHardCards(Number(deckId));
      } else if (topicId) {
        due = await getDueCardsByTopic(Number(topicId));
      } else {
        due = await getDueCards(Number(deckId));
      }
      setCards(due);
      setLoading(false);
      if (due.length === 0) setFinished(true);
    })();
  }, [deckId, topicId, isHardMode]);

  const currentCard = cards[currentIndex];
  const total = cards.length;
  const progress = total > 0 ? (currentIndex / total) : 0;

  const flipToAnswer = useCallback(() => {
    setShowAnswer(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [flipAnim]);

  const resetFlip = useCallback(() => {
    flipAnim.setValue(0);
    setShowAnswer(false);
    setShowHint(false);
  }, [flipAnim]);

  const handleRate = useCallback(async (rating: Rating) => {
    if (!currentCard) return;

    const impact = rating === 0
      ? Haptics.ImpactFeedbackStyle.Heavy
      : rating === 1
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(impact);

    const { easiness, interval, nextReview } = calculateSM2(
      currentCard.easiness,
      currentCard.interval,
      rating
    );
    const status = getStatusFromHistory(easiness, interval);

    await updateCardReview(currentCard.id, easiness, interval, nextReview, status);
    await logReview(currentCard.id, rating);

    setStats((prev) => ({
      hard: prev.hard + (rating === 0 ? 1 : 0),
      ok: prev.ok + (rating === 1 ? 1 : 0),
      easy: prev.easy + (rating === 2 ? 1 : 0),
    }));

    if (currentIndex + 1 >= total) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFinished(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      resetFlip();
    }
  }, [currentCard, currentIndex, total, resetFlip]);

  const headerTitle = isHardMode
    ? `Сложные · ${currentIndex + 1} / ${total}`
    : `${currentIndex + 1} / ${total}`;

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-90deg', '0deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Загрузка...' }} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Загрузка карточек...</Text>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Готово!' }} />
        <Ionicons name="checkmark-circle" size={72} color={colors.success} />
        <Text style={[styles.doneTitle, { color: colors.text }]}>
          {isHardMode ? 'Сложные пройдены!' : 'Сессия завершена!'}
        </Text>
        <Text style={[styles.doneSubtitle, { color: colors.textSecondary }]}>
          {total === 0
            ? (isHardMode ? 'Нет сложных карточек — отлично!' : 'Нет карточек для повторения сегодня')
            : `Повторено карточек: ${total}`}
        </Text>

        {total > 0 && (
          <View style={styles.statsRow}>
            <View style={[styles.statBadge, { backgroundColor: colors.dangerLight }]}>
              <Text style={[styles.statBadgeText, { color: colors.hard }]}>
                Сложно: {stats.hard}
              </Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: colors.warningLight }]}>
              <Text style={[styles.statBadgeText, { color: colors.ok }]}>
                Норм: {stats.ok}
              </Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.statBadgeText, { color: colors.easy }]}>
                Легко: {stats.easy}
              </Text>
            </View>
          </View>
        )}

        <Pressable style={[styles.backBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Вернуться</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: headerTitle }} />

      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, {
          width: `${progress * 100}%`,
          backgroundColor: isHardMode ? colors.danger : colors.primary,
        }]} />
      </View>

      {isHardMode && (
        <View style={[styles.modeBadge, { backgroundColor: colors.dangerLight }]}>
          <Ionicons name="flame" size={14} color={colors.danger} />
          <Text style={[styles.modeBadgeText, { color: colors.danger }]}>Режим: только сложные</Text>
        </View>
      )}

      {/* Flip card area */}
      <View style={styles.cardArea}>
        {/* Front (question) */}
        <Animated.View style={[
          styles.flipCard,
          {
            backgroundColor: colors.surface,
            transform: [{ perspective: 1000 }, { rotateY: frontRotate }],
            opacity: frontOpacity,
          },
        ]}>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>ВОПРОС</Text>
          <Text style={[styles.cardText, { color: colors.text }]}>{currentCard.question}</Text>

          {!showAnswer && currentCard.hint && !showHint && (
            <Pressable style={styles.hintBtn} onPress={() => setShowHint(true)}>
              <Ionicons name="bulb-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.hintBtnText, { color: colors.textSecondary }]}>Показать подсказку</Text>
            </Pressable>
          )}

          {showHint && currentCard.hint && (
            <View style={[styles.hintBox, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="bulb-outline" size={16} color={colors.warning} />
              <Text style={[styles.hintText, { color: colors.text }]}>{currentCard.hint}</Text>
            </View>
          )}
        </Animated.View>

        {/* Back (answer) */}
        <Animated.View style={[
          styles.flipCard,
          styles.flipCardBack,
          {
            backgroundColor: colors.surface,
            borderLeftColor: colors.primary,
            transform: [{ perspective: 1000 }, { rotateY: backRotate }],
            opacity: backOpacity,
          },
        ]}>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>ОТВЕТ</Text>
          <Text style={[styles.answerText, { color: colors.text }]}>{currentCard.answer}</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.questionReminder, { color: colors.textMuted }]}>
            {currentCard.question}
          </Text>
        </Animated.View>
      </View>

      {/* Bottom buttons */}
      {!showAnswer ? (
        <Pressable
          style={[styles.revealBtn, { backgroundColor: colors.primary }]}
          onPress={flipToAnswer}
        >
          <Ionicons name="eye-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.revealBtnText}>Показать ответ</Text>
        </Pressable>
      ) : (
        <View style={styles.ratingRow}>
          <Pressable
            style={[styles.rateBtn, { backgroundColor: colors.dangerLight }]}
            onPress={() => handleRate(0)}
          >
            <Ionicons name="close-circle-outline" size={18} color={colors.hard} />
            <Text style={[styles.rateBtnText, { color: colors.hard }]}>Сложно</Text>
          </Pressable>
          <Pressable
            style={[styles.rateBtn, { backgroundColor: colors.warningLight }]}
            onPress={() => handleRate(1)}
          >
            <Ionicons name="ellipse-outline" size={18} color={colors.ok} />
            <Text style={[styles.rateBtnText, { color: colors.ok }]}>Норм</Text>
          </Pressable>
          <Pressable
            style={[styles.rateBtn, { backgroundColor: colors.successLight }]}
            onPress={() => handleRate(2)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.easy} />
            <Text style={[styles.rateBtnText, { color: colors.easy }]}>Легко</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  loadingText: { fontSize: 16 },
  progressTrack: { height: 4 },
  progressFill: { height: 4, borderRadius: 2 },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  modeBadgeText: { fontSize: 12, fontWeight: '600' },

  cardArea: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  flipCard: {
    borderRadius: 20,
    padding: 28,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    backfaceVisibility: 'hidden',
  },
  flipCardBack: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    borderLeftWidth: 4,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
  },
  cardText: { fontSize: 22, fontWeight: '600', lineHeight: 30 },
  answerText: { fontSize: 20, lineHeight: 28 },
  divider: { height: 1, marginVertical: 16 },
  questionReminder: { fontSize: 13, fontStyle: 'italic', lineHeight: 18 },

  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  hintText: { flex: 1, fontSize: 14, lineHeight: 20 },
  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  hintBtnText: { fontSize: 14 },

  revealBtn: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 32,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  ratingRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  rateBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    gap: 4,
  },
  rateBtnText: { fontSize: 13, fontWeight: '700' },

  doneTitle: { fontSize: 24, fontWeight: '700', marginTop: 12 },
  doneSubtitle: { fontSize: 15, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  statBadgeText: { fontSize: 13, fontWeight: '600' },
  backBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
