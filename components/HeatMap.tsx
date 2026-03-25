import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../lib/theme';
import type { DayActivity } from '../lib/types';

interface HeatMapProps {
  data: DayActivity[];
  weeks: number;
}

export function HeatMap({ data, weeks }: HeatMapProps) {
  const { colors, mode } = useTheme();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const countMap = new Map(data.map((d) => [d.date, d.count]));
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const endDate = new Date(today);
  const startDate = new Date(today);
  const dayOfWeek = (today.getDay() + 6) % 7;
  startDate.setDate(today.getDate() - dayOfWeek - (weeks - 1) * 7);

  const getIntensity = (count: number): string => {
    if (count === 0) return colors.border;
    const ratio = count / Math.max(maxCount, 1);
    if (mode === 'dark') {
      if (ratio > 0.75) return '#166534';
      if (ratio > 0.5) return '#22C55E';
      if (ratio > 0.25) return '#86EFAC';
      return '#BBF7D0';
    }
    if (ratio > 0.75) return '#166534';
    if (ratio > 0.5) return '#22C55E';
    if (ratio > 0.25) return '#86EFAC';
    return '#D1FAE5';
  };

  const columns: { date: string; count: number }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: { date: string; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(startDate);
      cell.setDate(startDate.getDate() + w * 7 + d);
      if (cell > endDate) {
        col.push({ date: '', count: 0 });
      } else {
        const dateStr = cell.toISOString().split('T')[0];
        col.push({ date: dateStr, count: countMap.get(dateStr) ?? 0 });
      }
    }
    columns.push(col);
  }

  const dayLabels = ['Пн', '', 'Ср', '', 'Пт', '', ''];

  return (
    <View style={styles.container}>
      <View style={styles.dayLabels}>
        {dayLabels.map((label, i) => (
          <Text key={i} style={[styles.dayLabel, { color: colors.textMuted }]}>{label}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {columns.map((col, ci) => (
          <View key={ci} style={styles.column}>
            {col.map((day, di) => (
              <View
                key={di}
                style={[
                  styles.cell,
                  {
                    backgroundColor: day.date
                      ? getIntensity(day.count)
                      : 'transparent',
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 4 },
  dayLabels: { justifyContent: 'space-between', paddingVertical: 1 },
  dayLabel: { fontSize: 9, height: 13, lineHeight: 13, width: 16 },
  grid: { flexDirection: 'row', gap: 3, flex: 1 },
  column: { flex: 1, gap: 3 },
  cell: { aspectRatio: 1, borderRadius: 3 },
});
