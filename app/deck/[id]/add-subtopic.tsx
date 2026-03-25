import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { getTopicsWithStats, createSubtopic } from '../../../lib/database';
import type { TopicWithStats } from '../../../lib/types';

export default function AddSubtopicScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const deckId = Number(id);

  const [topics, setTopics] = useState<TopicWithStats[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getTopicsWithStats(deckId);
      setTopics(data);
      if (data.length > 0) setSelectedTopicId(data[0].id);
    })();
  }, [deckId]);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed || !selectedTopicId || saving) return;
    setSaving(true);
    try {
      await createSubtopic(selectedTopicId, trimmed);
      router.back();
    } catch (e) {
      console.error('Failed to create subtopic', e);
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Тема</Text>
        <View style={styles.topicPicker}>
          {topics.map((t) => (
            <Pressable
              key={t.id}
              style={[
                styles.topicChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selectedTopicId === t.id && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedTopicId(t.id)}
            >
              <Text
                style={[
                  styles.topicChipText,
                  { color: colors.text },
                  selectedTopicId === t.id && { color: '#fff', fontWeight: '600' },
                ]}
                numberOfLines={1}
              >
                {t.title}
              </Text>
            </Pressable>
          ))}
        </View>

        {topics.length === 0 && (
          <Text style={[styles.hint, { color: colors.warning }]}>Сначала создайте тему в колоде</Text>
        )}

        <Text style={[styles.label, { marginTop: 24, color: colors.textSecondary }]}>Название подтемы</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Например: Present Perfect"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />
      </View>

      <Pressable
        style={[
          styles.saveBtn,
          { backgroundColor: colors.primary },
          (!title.trim() || !selectedTopicId) && styles.saveBtnDisabled,
        ]}
        onPress={handleSave}
        disabled={!title.trim() || !selectedTopicId || saving}
      >
        <Text style={styles.saveBtnText}>Добавить подтему</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topicPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  topicChipText: {
    fontSize: 14,
  },
  hint: {
    marginTop: 12,
    fontSize: 13,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  saveBtn: {
    marginHorizontal: 20,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
