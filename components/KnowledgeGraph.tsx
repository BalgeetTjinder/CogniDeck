import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Modal } from 'react-native';
import Svg, { Circle, Line, Defs, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';
import { TopicWithStats, getHealthColor } from '../lib/types';

interface KnowledgeGraphProps {
  topics: TopicWithStats[];
  deckColor: string;
  onStudyTopic: (topicId: number) => void;
  compact?: boolean;
}

interface BubbleData {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  color: string;
  glowColor: string;
  totalCards: number;
  dueToday: number;
  avgEasiness: number;
  type: 'topic' | 'subtopic';
  topicId: number;
  parentX?: number;
  parentY?: number;
}

function getGlowColor(color: string): string {
  if (color === '#34D399' || color === '#22C55E') return 'rgba(52, 211, 153, 0.4)';
  if (color === '#FBBF24' || color === '#F59E0B') return 'rgba(251, 191, 36, 0.4)';
  if (color === '#F87171' || color === '#EF4444') return 'rgba(248, 113, 113, 0.4)';
  return 'rgba(129, 140, 248, 0.3)';
}

function layoutBubbles(topics: TopicWithStats[], width: number, height: number): BubbleData[] {
  const bubbles: BubbleData[] = [];
  if (topics.length === 0) return bubbles;

  const maxCards = Math.max(...topics.flatMap(t => [t.total_cards, ...t.subtopics.map(s => s.total_cards)]), 1);
  const centerX = width / 2;
  const centerY = height / 2;

  const topicCount = topics.length;
  const orbitRadius = Math.min(width, height) * (topicCount <= 3 ? 0.25 : 0.32);

  topics.forEach((topic, i) => {
    const angle = (2 * Math.PI * i) / topicCount - Math.PI / 2;
    const topicR = Math.max(32, Math.min(60, 32 + (topic.total_cards / maxCards) * 28));
    const tx = centerX + orbitRadius * Math.cos(angle);
    const ty = centerY + orbitRadius * Math.sin(angle);
    const color = getHealthColor(topic.avg_easiness, topic.total_cards);

    bubbles.push({
      id: `topic-${topic.id}`,
      label: topic.title.length > 12 ? topic.title.slice(0, 11) + '…' : topic.title,
      x: tx, y: ty, r: topicR,
      color,
      glowColor: getGlowColor(color),
      totalCards: topic.total_cards,
      dueToday: topic.due_today,
      avgEasiness: topic.avg_easiness,
      type: 'topic',
      topicId: topic.id,
    });

    const subCount = topic.subtopics.length;
    topic.subtopics.forEach((sub, j) => {
      const spread = subCount > 1 ? 0.5 : 0;
      const subAngle = angle + ((j - (subCount - 1) / 2) * spread);
      const subOrbit = topicR + 30;
      const subR = Math.max(16, Math.min(30, 16 + (sub.total_cards / maxCards) * 14));
      const subColor = getHealthColor(sub.avg_easiness, sub.total_cards);

      bubbles.push({
        id: `sub-${sub.id}`,
        label: sub.title.length > 8 ? sub.title.slice(0, 7) + '…' : sub.title,
        x: tx + subOrbit * Math.cos(subAngle),
        y: ty + subOrbit * Math.sin(subAngle),
        r: subR,
        color: subColor,
        glowColor: getGlowColor(subColor),
        totalCards: sub.total_cards,
        dueToday: sub.due_today,
        avgEasiness: sub.avg_easiness,
        type: 'subtopic',
        topicId: topic.id,
        parentX: tx,
        parentY: ty,
      });
    });
  });

  return bubbles;
}

export function KnowledgeGraph({ topics, deckColor, onStudyTopic, compact }: KnowledgeGraphProps) {
  const { colors } = useTheme();
  const { width: screenWidth } = Dimensions.get('window');
  const graphSize = compact ? screenWidth - 48 : screenWidth - 32;
  const [selected, setSelected] = useState<BubbleData | null>(null);

  const bubbles = useMemo(() => layoutBubbles(topics, graphSize, graphSize), [topics, graphSize]);
  const connections = useMemo(() =>
    bubbles.filter(b => b.type === 'subtopic' && b.parentX != null),
    [bubbles]
  );

  if (topics.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.graphCard, { backgroundColor: colors.graphBg, borderColor: colors.border }, compact && styles.graphCardCompact]}>
        <View style={{ width: graphSize, height: graphSize }}>
        <Svg width={graphSize} height={graphSize} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Defs>
            {bubbles.map((b) => (
              <RadialGradient key={`g-${b.id}`} id={`grad-${b.id}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={b.color} stopOpacity="0.5" />
                <Stop offset="70%" stopColor={b.color} stopOpacity="0.15" />
                <Stop offset="100%" stopColor={b.color} stopOpacity="0" />
              </RadialGradient>
            ))}
          </Defs>

          {/* Connection lines */}
          {connections.map((b) => (
            <Line
              key={`line-${b.id}`}
              x1={b.parentX!}
              y1={b.parentY!}
              x2={b.x}
              y2={b.y}
              stroke={colors.graphLine}
              strokeWidth={1.5}
              strokeDasharray="4,4"
            />
          ))}

          {/* Glow circles */}
          {bubbles.map((b) => (
            <Circle
              key={`glow-${b.id}`}
              cx={b.x}
              cy={b.y}
              r={b.r + (b.type === 'topic' ? 12 : 6)}
              fill={`url(#grad-${b.id})`}
            />
          ))}

          {/* Main circles */}
          {bubbles.map((b) => (
            <Circle
              key={`node-${b.id}`}
              cx={b.x}
              cy={b.y}
              r={b.r}
              fill={b.color + '25'}
              stroke={b.color}
              strokeWidth={b.type === 'topic' ? 2 : 1.5}
            />
          ))}

          {/* Due badges */}
          {bubbles.filter(b => b.dueToday > 0 && b.type === 'topic').map((b) => (
            <Circle
              key={`badge-${b.id}`}
              cx={b.x + b.r * 0.65}
              cy={b.y - b.r * 0.65}
              r={10}
              fill={colors.accent}
            />
          ))}
          {bubbles.filter(b => b.dueToday > 0 && b.type === 'topic').map((b) => (
            <SvgText
              key={`badge-t-${b.id}`}
              x={b.x + b.r * 0.65}
              y={b.y - b.r * 0.65 + 1}
              textAnchor="middle"
              alignmentBaseline="central"
              fontSize={9}
              fontWeight="700"
              fill="#fff"
            >
              {b.dueToday}
            </SvgText>
          ))}

          {/* Labels */}
          {bubbles.map((b) => (
            <SvgText
              key={`label-${b.id}`}
              x={b.x}
              y={b.y + 1}
              textAnchor="middle"
              alignmentBaseline="central"
              fontSize={b.type === 'topic' ? 11 : 8}
              fontWeight={b.type === 'topic' ? '700' : '500'}
              fill={colors.text}
            >
              {b.label}
            </SvgText>
          ))}
        </Svg>

        {/* Native pressable overlays */}
        {bubbles.map((b) => (
          <Pressable
            key={`press-${b.id}`}
            style={{
              position: 'absolute',
              left: b.x - b.r,
              top: b.y - b.r,
              width: b.r * 2,
              height: b.r * 2,
              borderRadius: b.r,
            }}
            onPress={() => setSelected(b)}
          />
        ))}
        </View>
      </View>

      {/* Legend */}
      {!compact && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>Усвоено</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>В процессе</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>Сложно</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBadge, { backgroundColor: colors.accent }]} />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>На сегодня</Text>
          </View>
        </View>
      )}

      {/* Detail modal */}
      <Modal visible={!!selected} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setSelected(null)}>
          <Pressable style={[styles.modal, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={(e) => e.stopPropagation()}>
            {selected && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {topics.find(t => t.id === selected.topicId)?.title ?? ''}
                  </Text>
                  {selected.type === 'subtopic' && (
                    <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>{selected.label}</Text>
                  )}
                </View>

                <View style={[styles.modalStats, { backgroundColor: colors.backgroundLight }]}>
                  <View style={styles.modalStat}>
                    <Text style={[styles.modalStatNum, { color: colors.text }]}>{selected.totalCards}</Text>
                    <Text style={[styles.modalStatLabel, { color: colors.textMuted }]}>Карточек</Text>
                  </View>
                  <View style={[styles.modalStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.modalStat}>
                    <Text style={[styles.modalStatNum, { color: selected.dueToday > 0 ? colors.accent : colors.text }]}>
                      {selected.dueToday}
                    </Text>
                    <Text style={[styles.modalStatLabel, { color: colors.textMuted }]}>На сегодня</Text>
                  </View>
                  <View style={[styles.modalStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.modalStat}>
                    <Text style={[styles.modalStatNum, { color: selected.color }]}>
                      {selected.avgEasiness.toFixed(1)}
                    </Text>
                    <Text style={[styles.modalStatLabel, { color: colors.textMuted }]}>Лёгкость</Text>
                  </View>
                </View>

                {selected.dueToday > 0 && (
                  <Pressable
                    style={[styles.modalStudyBtn, { backgroundColor: deckColor }]}
                    onPress={() => {
                      setSelected(null);
                      onStudyTopic(selected.topicId);
                    }}
                  >
                    <Ionicons name="play" size={18} color="#fff" />
                    <Text style={styles.modalStudyText}>Начать изучение</Text>
                  </Pressable>
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 16 },
  graphCard: {
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
  },
  graphCardCompact: { borderRadius: 20 },
  legend: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendBadge: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSubtitle: { fontSize: 13, marginTop: 4 },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  modalStat: { alignItems: 'center', gap: 4, flex: 1 },
  modalStatDivider: { width: 1, height: 32 },
  modalStatNum: { fontSize: 24, fontWeight: '800' },
  modalStatLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalStudyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  modalStudyText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
