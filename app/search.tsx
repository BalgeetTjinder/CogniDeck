import { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';
import { searchCards } from '../lib/database';
import type { Card } from '../lib/types';

type SearchResult = Card & {
  deck_title: string;
  deck_color: string;
  deck_id: number;
  topic_title: string;
};

export default function SearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    const data = await searchCards(text.trim());
    setResults(data);
    setSearched(true);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Поиск',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Поиск по карточкам..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={results.length === 0 ? styles.emptyList : styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(`/deck/${item.deck_id}`)}
          >
            <View style={styles.resultHeader}>
              <View style={[styles.deckBadge, { backgroundColor: item.deck_color + '20' }]}>
                <View style={[styles.deckDot, { backgroundColor: item.deck_color }]} />
                <Text style={[styles.deckName, { color: item.deck_color }]} numberOfLines={1}>
                  {item.deck_title}
                </Text>
              </View>
              <Text style={[styles.topicName, { color: colors.textMuted }]} numberOfLines={1}>
                {item.topic_title}
              </Text>
            </View>
            <Text style={[styles.question, { color: colors.text }]} numberOfLines={2}>
              {highlightText(item.question, query)}
            </Text>
            <Text style={[styles.answer, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.answer}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          searched ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.surfaceHighlight} />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Ничего не найдено</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Попробуйте другой запрос
              </Text>
            </View>
          ) : query.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.surfaceHighlight} />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                Поиск по карточкам
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Введите вопрос или ответ для поиска
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

function highlightText(text: string, query: string): string {
  return text;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: { padding: 16, paddingBottom: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 8 },
  emptyList: { flex: 1 },
  resultCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    marginBottom: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deckDot: { width: 8, height: 8, borderRadius: 4 },
  deckName: { fontSize: 12, fontWeight: '600' },
  topicName: { fontSize: 11 },
  question: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  answer: { fontSize: 13, lineHeight: 18 },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 60,
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginTop: 8 },
  emptySubtitle: { fontSize: 14 },
});
