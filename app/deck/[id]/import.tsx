import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../lib/theme';
import { getSubtopicsByDeck, bulkImportCards } from '../../../lib/database';
import type { Subtopic } from '../../../lib/types';

export default function ImportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const deckId = Number(id);

  const [text, setText] = useState('');
  const [subtopics, setSubtopics] = useState<(Subtopic & { topic_title: string })[]>([]);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<number | null>(null);

  useEffect(() => {
    getSubtopicsByDeck(deckId).then(data => {
      setSubtopics(data);
      if (data.length > 0) setSelectedSubtopicId(data[0].id);
    });
  }, [deckId]);

  const parsePairs = () => {
    return text
      .split('\n')
      .filter(line => line.includes(';'))
      .map(line => {
        const idx = line.indexOf(';');
        return {
          question: line.substring(0, idx).trim(),
          answer: line.substring(idx + 1).trim(),
        };
      })
      .filter(p => p.question && p.answer);
  };

  const preview = parsePairs();

  const handleImport = async () => {
    if (!selectedSubtopicId) {
      Alert.alert('Ошибка', 'Выберите подтему для импорта');
      return;
    }
    if (preview.length === 0) {
      Alert.alert('Ошибка', 'Нет корректных пар вопрос;ответ');
      return;
    }

    const count = await bulkImportCards(selectedSubtopicId, preview);
    Alert.alert('Готово', `Импортировано ${count} карточек`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Импорт карточек',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>ПОДТЕМА</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
        >
          {subtopics.map(st => (
            <Pressable
              key={st.id}
              style={[
                styles.chip,
                { borderColor: colors.border, backgroundColor: colors.surface },
                selectedSubtopicId === st.id && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
              ]}
              onPress={() => setSelectedSubtopicId(st.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colors.textSecondary },
                  selectedSubtopicId === st.id && { color: colors.primary },
                ]}
                numberOfLines={1}
              >
                {st.topic_title} › {st.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          ТЕКСТ (формат: вопрос;ответ на каждой строке)
        </Text>
        <TextInput
          style={[styles.textArea, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          }]}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
          placeholder={"What is React?;JavaScript library for UI\nWhat is JSX?;Syntax extension for JS"}
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
        />

        {preview.length > 0 && (
          <>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              ПРЕДПРОСМОТР ({preview.length} карточек)
            </Text>
            {preview.slice(0, 5).map((p, i) => (
              <View
                key={i}
                style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.previewQ, { color: colors.text }]} numberOfLines={1}>
                  Q: {p.question}
                </Text>
                <Text style={[styles.previewA, { color: colors.textSecondary }]} numberOfLines={1}>
                  A: {p.answer}
                </Text>
              </View>
            ))}
            {preview.length > 5 && (
              <Text style={[styles.moreText, { color: colors.textMuted }]}>
                ...и ещё {preview.length - 5}
              </Text>
            )}
          </>
        )}

        <Pressable
          style={[
            styles.importBtn,
            { backgroundColor: preview.length > 0 ? colors.primary : colors.surfaceHighlight },
          ]}
          onPress={handleImport}
          disabled={preview.length === 0}
        >
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.importBtnText}>
            Импортировать {preview.length > 0 ? `(${preview.length})` : ''}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 4,
  },
  chipScroll: { marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 160,
  },
  previewCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 6,
  },
  previewQ: { fontSize: 14, fontWeight: '600' },
  previewA: { fontSize: 13, marginTop: 4 },
  moreText: { fontSize: 13, textAlign: 'center', marginTop: 4 },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
  },
  importBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
