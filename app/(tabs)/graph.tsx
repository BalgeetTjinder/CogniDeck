import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Svg, { Circle, Line, Defs, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { getDecks, getTopicsWithStats } from '../../lib/database';
import { getHealthColor, DeckWithStats, TopicWithStats } from '../../lib/types';
import { EmptyState } from '../../components/EmptyState';

interface DeckNode {
  id: number;
  title: string;
  color: string;
  x: number;
  y: number;
  r: number;
  healthColor: string;
  glowColor: string;
  totalCards: number;
  dueToday: number;
  topics: { title: string; healthColor: string; x: number; y: number; r: number; cards: number }[];
}

function getGlow(color: string): string {
  if (color === Colors.success) return Colors.successGlow;
  if (color === Colors.warning) return Colors.warningGlow;
  if (color === Colors.danger) return Colors.dangerGlow;
  return 'rgba(129, 140, 248, 0.3)';
}

export default function GlobalGraphScreen() {
  const router = useRouter();
  const [deckNodes, setDeckNodes] = useState<DeckNode[]>([]);
  const [loading, setLoading] = useState(true);

  const { width: screenWidth } = Dimensions.get('window');
  const graphW = screenWidth - 32;
  const graphH = graphW * 1.1;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const decks = await getDecks();
        const centerX = graphW / 2;
        const centerY = graphH / 2;
        const orbitR = Math.min(graphW, graphH) * 0.28;

        const nodes: DeckNode[] = [];

        for (let i = 0; i < decks.length; i++) {
          const deck = decks[i];
          const angle = (2 * Math.PI * i) / Math.max(decks.length, 1) - Math.PI / 2;
          const dx = centerX + (decks.length === 1 ? 0 : orbitR * Math.cos(angle));
          const dy = centerY + (decks.length === 1 ? 0 : orbitR * Math.sin(angle));
          const deckR = Math.max(40, Math.min(70, 40 + (deck.total_cards / Math.max(...decks.map(d => d.total_cards), 1)) * 30));
          const hc = getHealthColor(deck.avg_easiness, deck.total_cards);

          const topics = await getTopicsWithStats(deck.id);
          const topicNodes = topics.map((t, j) => {
            const tAngle = angle + ((j - (topics.length - 1) / 2) * 0.45);
            const tOrbit = deckR + 32;
            const tR = Math.max(14, Math.min(26, 14 + (t.total_cards / Math.max(...topics.map(x => x.total_cards), 1)) * 12));
            const tColor = getHealthColor(t.avg_easiness, t.total_cards);
            return {
              title: t.title.length > 8 ? t.title.slice(0, 7) + '…' : t.title,
              healthColor: tColor,
              x: dx + tOrbit * Math.cos(tAngle),
              y: dy + tOrbit * Math.sin(tAngle),
              r: tR,
              cards: t.total_cards,
            };
          });

          nodes.push({
            id: deck.id,
            title: deck.title,
            color: deck.color,
            x: dx, y: dy, r: deckR,
            healthColor: hc,
            glowColor: getGlow(hc),
            totalCards: deck.total_cards,
            dueToday: deck.due_today,
            topics: topicNodes,
          });
        }

        setDeckNodes(nodes);
        setLoading(false);
      })();
    }, [graphW, graphH])
  );

  if (!loading && deckNodes.length === 0) {
    return (
      <EmptyState
        icon="git-network-outline"
        title="Пока пусто"
        subtitle="Создайте колоду с карточками — граф знаний появится здесь"
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>Нажмите на колоду для подробностей</Text>

      <View style={styles.graphCard}>
        <View style={{ width: graphW, height: graphH }}>
          <Svg width={graphW} height={graphH} style={StyleSheet.absoluteFill}>
            <Defs>
              {deckNodes.map(d => (
                <RadialGradient key={`gd-${d.id}`} id={`deckGrad-${d.id}`} cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={d.healthColor} stopOpacity="0.5" />
                  <Stop offset="60%" stopColor={d.healthColor} stopOpacity="0.1" />
                  <Stop offset="100%" stopColor={d.healthColor} stopOpacity="0" />
                </RadialGradient>
              ))}
            </Defs>

            {/* Topic connections */}
            {deckNodes.flatMap(d =>
              d.topics.map((t, ti) => (
                <Line
                  key={`line-${d.id}-${ti}`}
                  x1={d.x} y1={d.y} x2={t.x} y2={t.y}
                  stroke={Colors.graphLine}
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
              ))
            )}

            {/* Topic nodes */}
            {deckNodes.flatMap(d =>
              d.topics.map((t, ti) => (
                <Circle
                  key={`tn-${d.id}-${ti}`}
                  cx={t.x} cy={t.y} r={t.r}
                  fill={t.healthColor + '20'}
                  stroke={t.healthColor}
                  strokeWidth={1}
                />
              ))
            )}
            {deckNodes.flatMap(d =>
              d.topics.map((t, ti) => (
                <SvgText
                  key={`tl-${d.id}-${ti}`}
                  x={t.x} y={t.y + 1}
                  textAnchor="middle" alignmentBaseline="central"
                  fontSize={8} fontWeight="500" fill={Colors.textSecondary}
                >
                  {t.title}
                </SvgText>
              ))
            )}

            {/* Deck glow */}
            {deckNodes.map(d => (
              <Circle
                key={`dglow-${d.id}`}
                cx={d.x} cy={d.y} r={d.r + 16}
                fill={`url(#deckGrad-${d.id})`}
              />
            ))}

            {/* Deck circles */}
            {deckNodes.map(d => (
              <Circle
                key={`dc-${d.id}`}
                cx={d.x} cy={d.y} r={d.r}
                fill={d.color + '30'}
                stroke={d.color}
                strokeWidth={2.5}
              />
            ))}

            {/* Deck labels */}
            {deckNodes.map(d => (
              <SvgText
                key={`dl-${d.id}`}
                x={d.x} y={d.y - 6}
                textAnchor="middle" alignmentBaseline="central"
                fontSize={12} fontWeight="700" fill={Colors.text}
              >
                {d.title.length > 14 ? d.title.slice(0, 13) + '…' : d.title}
              </SvgText>
            ))}
            {deckNodes.map(d => (
              <SvgText
                key={`dc2-${d.id}`}
                x={d.x} y={d.y + 10}
                textAnchor="middle" alignmentBaseline="central"
                fontSize={10} fill={Colors.textSecondary}
              >
                {d.totalCards} карт.
              </SvgText>
            ))}

            {/* Due badges */}
            {deckNodes.filter(d => d.dueToday > 0).map(d => (
              <Circle
                key={`dbadge-${d.id}`}
                cx={d.x + d.r * 0.6} cy={d.y - d.r * 0.6} r={12}
                fill={Colors.accent}
              />
            ))}
            {deckNodes.filter(d => d.dueToday > 0).map(d => (
              <SvgText
                key={`dbadget-${d.id}`}
                x={d.x + d.r * 0.6} y={d.y - d.r * 0.6 + 1}
                textAnchor="middle" alignmentBaseline="central"
                fontSize={10} fontWeight="700" fill="#fff"
              >
                {d.dueToday}
              </SvgText>
            ))}
          </Svg>

          {/* Native pressable overlays for deck nodes */}
          {deckNodes.map(d => (
            <Pressable
              key={`press-${d.id}`}
              style={{
                position: 'absolute',
                left: d.x - d.r,
                top: d.y - d.r,
                width: d.r * 2,
                height: d.r * 2,
                borderRadius: d.r,
              }}
              onPress={() => router.push(`/deck/${d.id}`)}
            />
          ))}
        </View>
      </View>

      {/* Quick summary */}
      <View style={styles.summaryRow}>
        {deckNodes.map(d => (
          <Pressable
            key={d.id}
            style={styles.summaryCard}
            onPress={() => router.push(`/deck/${d.id}`)}
          >
            <View style={[styles.summaryDot, { backgroundColor: d.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle} numberOfLines={1}>{d.title}</Text>
              <Text style={styles.summaryMeta}>
                {d.totalCards} карт.{d.dueToday > 0 ? ` · ${d.dueToday} на сегодня` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </Pressable>
        ))}
      </View>
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
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  graphCard: {
    backgroundColor: Colors.graphBg,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  summaryRow: {
    gap: 8,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  summaryMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
