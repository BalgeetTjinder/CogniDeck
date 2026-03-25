import { useCallback, useState } from 'react';
import { View, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';
import { DeckWithStats } from '../../lib/types';
import { getDecks, deleteDeck } from '../../lib/database';
import { DeckCard } from '../../components/DeckCard';
import { EmptyState } from '../../components/EmptyState';

export default function HomeScreen() {
  const router = useRouter();
  const [decks, setDecks] = useState<DeckWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDecks = useCallback(async () => {
    try {
      const data = await getDecks();
      setDecks(data);
    } catch (e) {
      console.error('Failed to load decks', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDecks();
    }, [loadDecks])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DeckCard
            deck={item}
            onPress={() => router.push(`/deck/${item.id}`)}
          />
        )}
        contentContainerStyle={decks.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="layers-outline"
              title="Пока нет колод"
              subtitle="Нажмите + чтобы создать первую колоду для изучения"
            />
          )
        }
      />

      <Pressable
        style={styles.fab}
        onPress={() => router.push('/deck/create')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingTop: 12,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
