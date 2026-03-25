import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../lib/colors';
import { getDeck, updateDeck } from '../../../lib/database';
import { ColorPicker } from '../../../components/ColorPicker';
import { DECK_COLORS } from '../../../lib/types';

export default function EditDeckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const deckId = Number(id);

  const [title, setTitle] = useState('');
  const [color, setColor] = useState(DECK_COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const deck = await getDeck(deckId);
      if (deck) {
        setTitle(deck.title);
        setColor(deck.color);
      }
    })();
  }, [deckId]);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await updateDeck(deckId, trimmed, color);
      router.back();
    } catch (e) {
      console.error('Failed to update deck', e);
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.form}>
        <Text style={styles.label}>Название колоды</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        <Text style={[styles.label, { marginTop: 24 }]}>Цвет</Text>
        <ColorPicker selected={color} onSelect={setColor} />
      </View>

      <Pressable
        style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={!title.trim() || saving}
      >
        <Text style={styles.saveBtnText}>Сохранить</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  saveBtn: {
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: Colors.primary,
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
