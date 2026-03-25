import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { getSubtopicsByDeck, createCard } from '../../../lib/database';
import type { Subtopic } from '../../../lib/types';

export default function AddCardScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const deckId = Number(id);

  const [subtopics, setSubtopics] = useState<(Subtopic & { topic_title: string })[]>([]);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<number | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getSubtopicsByDeck(deckId);
      setSubtopics(data);
      if (data.length > 0) setSelectedSubtopicId(data[0].id);
    })();
  }, [deckId]);

  const handleSave = async () => {
    const q = question.trim();
    const a = answer.trim();
    if (!q || !a || !selectedSubtopicId || saving) return;
    setSaving(true);
    try {
      await createCard(selectedSubtopicId, q, a, hint.trim() || undefined);
      setQuestion('');
      setAnswer('');
      setHint('');
      setSaving(false);
    } catch (e) {
      console.error('Failed to create card', e);
      setSaving(false);
    }
  };

  const handleSaveAndClose = async () => {
    const q = question.trim();
    const a = answer.trim();
    if (q && a && selectedSubtopicId) {
      setSaving(true);
      await createCard(selectedSubtopicId, q, a, hint.trim() || undefined);
    }
    router.back();
  };

  const canSave = question.trim() && answer.trim() && selectedSubtopicId;

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.surface,
      color: colors.text,
      borderColor: colors.border,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: colors.textSecondary }]}>Подтема</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipRow}>
            {subtopics.map((st) => (
              <Pressable
                key={st.id}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selectedSubtopicId === st.id && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setSelectedSubtopicId(st.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.text },
                    selectedSubtopicId === st.id && { color: '#fff', fontWeight: '600' },
                  ]}
                  numberOfLines={1}
                >
                  {st.topic_title} / {st.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {subtopics.length === 0 && (
          <Text style={[styles.warning, { color: colors.warning }]}>Сначала создайте тему и подтему</Text>
        )}

        <Text style={[styles.label, { marginTop: 20, color: colors.textSecondary }]}>Вопрос</Text>
        <TextInput
          style={[...inputStyle, styles.inputMultiline]}
          placeholder="Что нужно вспомнить?"
          placeholderTextColor={colors.textMuted}
          value={question}
          onChangeText={setQuestion}
          multiline
          textAlignVertical="top"
        />

        <Text style={[styles.label, { marginTop: 16, color: colors.textSecondary }]}>Ответ</Text>
        <TextInput
          style={[...inputStyle, styles.inputMultiline]}
          placeholder="Правильный ответ"
          placeholderTextColor={colors.textMuted}
          value={answer}
          onChangeText={setAnswer}
          multiline
          textAlignVertical="top"
        />

        <Text style={[styles.label, { marginTop: 16, color: colors.textSecondary }]}>Подсказка (необязательно)</Text>
        <TextInput
          style={inputStyle}
          placeholder="Подсказка при затруднении"
          placeholderTextColor={colors.textMuted}
          value={hint}
          onChangeText={setHint}
        />
      </ScrollView>

      <View style={styles.buttons}>
        <Pressable
          style={[
            styles.addMoreBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primary,
            },
            !canSave && styles.btnDisabled,
          ]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          <Text style={[styles.addMoreText, { color: colors.primary }]}>+ Ещё карточку</Text>
        </Pressable>
        <Pressable style={[styles.doneBtn, { backgroundColor: colors.primary }]} onPress={handleSaveAndClose}>
          <Text style={styles.doneBtnText}>Готово</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
    paddingBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipScroll: {
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
  warning: {
    marginTop: 8,
    fontSize: 13,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  inputMultiline: {
    minHeight: 80,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 8,
  },
  addMoreBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  addMoreText: {
    fontSize: 15,
    fontWeight: '700',
  },
  doneBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
