import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../lib/colors';
import { getSubtopicsByDeck, createCard } from '../../../lib/database';
import type { Subtopic } from '../../../lib/types';

export default function AddCardScreen() {
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Подтема</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipRow}>
            {subtopics.map((st) => (
              <Pressable
                key={st.id}
                style={[
                  styles.chip,
                  selectedSubtopicId === st.id && styles.chipActive,
                ]}
                onPress={() => setSelectedSubtopicId(st.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedSubtopicId === st.id && styles.chipTextActive,
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
          <Text style={styles.warning}>Сначала создайте тему и подтему</Text>
        )}

        <Text style={[styles.label, { marginTop: 20 }]}>Вопрос</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Что нужно вспомнить?"
          placeholderTextColor={Colors.textLight}
          value={question}
          onChangeText={setQuestion}
          multiline
          textAlignVertical="top"
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Ответ</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Правильный ответ"
          placeholderTextColor={Colors.textLight}
          value={answer}
          onChangeText={setAnswer}
          multiline
          textAlignVertical="top"
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Подсказка (необязательно)</Text>
        <TextInput
          style={styles.input}
          placeholder="Подсказка при затруднении"
          placeholderTextColor={Colors.textLight}
          value={hint}
          onChangeText={setHint}
        />
      </ScrollView>

      <View style={styles.buttons}>
        <Pressable
          style={[styles.addMoreBtn, !canSave && styles.btnDisabled]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          <Text style={styles.addMoreText}>+ Ещё карточку</Text>
        </Pressable>
        <Pressable
          style={styles.doneBtn}
          onPress={handleSaveAndClose}
        >
          <Text style={styles.doneBtnText}>Готово</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  form: {
    padding: 20,
    paddingBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.text,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  warning: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.warning,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  addMoreText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  doneBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
