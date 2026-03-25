import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { createTopic } from '../../../lib/database';

export default function AddTopicScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const deckId = Number(id);

  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await createTopic(deckId, trimmed);
      router.back();
    } catch (e) {
      console.error('Failed to create topic', e);
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Название темы</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Например: Времена глаголов"
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
          !title.trim() && styles.saveBtnDisabled,
        ]}
        onPress={handleSave}
        disabled={!title.trim() || saving}
      >
        <Text style={styles.saveBtnText}>Добавить тему</Text>
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
