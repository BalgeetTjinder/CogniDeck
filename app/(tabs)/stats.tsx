import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { getStreak, getDayActivity, getCardDistribution, getTotalReviewsToday } from '../../lib/database';
import { HeatMap } from '../../components/HeatMap';
import { EmptyState } from '../../components/EmptyState';
import type { DayActivity } from '../../lib/types';
import { STATUS_LABELS, STATUS_COLORS } from '../../lib/types';

export default function StatsScreen() {
  const [streak, setStreak] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [activity, setActivity] = useState<DayActivity[]>([]);
  const [distribution, setDistribution] = useState<{ status: string; count: number }[]>([]);
  const [totalCards, setTotalCards] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [s, t, a, d] = await Promise.all([
          getStreak(),
          getTotalReviewsToday(),
          getDayActivity(84),
          getCardDistribution(),
        ]);
        setStreak(s);
        setTodayCount(t);
        setActivity(a);
        setDistribution(d);
        setTotalCards(d.reduce((sum, item) => sum + item.count, 0));
      })();
    }, [])
  );

  if (totalCards === 0 && activity.length === 0) {
    return (
      <EmptyState
        icon="stats-chart-outline"
        title="Нет данных"
        subtitle="Начните изучать карточки — статистика появится здесь"
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Streak and today */}
      <View style={styles.topCards}>
        <View style={styles.statCard}>
          <Ionicons name="flame-outline" size={28} color="#F97316" />
          <Text style={styles.statNum}>{streak}</Text>
          <Text style={styles.statLabel}>
            {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} подряд
          </Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done-outline" size={28} color={Colors.primary} />
          <Text style={styles.statNum}>{todayCount}</Text>
          <Text style={styles.statLabel}>повторено сегодня</Text>
        </View>
      </View>

      {/* Heatmap */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Активность</Text>
        <View style={styles.heatmapCard}>
          <HeatMap data={activity} weeks={12} />
        </View>
      </View>

      {/* Distribution */}
      {totalCards > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Распределение карточек</Text>
          <View style={styles.distCard}>
            {/* Bar */}
            <View style={styles.barContainer}>
              {distribution.map((item) => {
                const pct = (item.count / totalCards) * 100;
                if (pct < 1) return null;
                return (
                  <View
                    key={item.status}
                    style={[
                      styles.barSegment,
                      {
                        width: `${pct}%`,
                        backgroundColor: STATUS_COLORS[item.status] ?? Colors.textMuted,
                      },
                    ]}
                  />
                );
              })}
            </View>

            {/* Labels */}
            <View style={styles.distList}>
              {distribution.map((item) => (
                <View key={item.status} style={styles.distItem}>
                  <View
                    style={[
                      styles.distDot,
                      { backgroundColor: STATUS_COLORS[item.status] ?? Colors.textMuted },
                    ]}
                  />
                  <Text style={styles.distLabel}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Text>
                  <Text style={styles.distCount}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
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
    padding: 16,
    paddingBottom: 40,
  },
  topCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statNum: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  heatmapCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  distCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  barContainer: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: Colors.borderLight,
  },
  barSegment: {
    height: '100%',
  },
  distList: {
    gap: 10,
  },
  distItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  distLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  distCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});
