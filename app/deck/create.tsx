import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/theme';
import { DECK_COLORS } from '../../lib/types';
import { createDeck } from '../../lib/database';
import { ColorPicker } from '../../components/ColorPicker';

export default function CreateDeckScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(DECK_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await createDeck(trimmed, color);
      router.back();
    } catch (e) {
      console.error('Failed to create deck', e);
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Название колоды</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Например: Английский B2"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        <Text style={[styles.label, { marginTop: 24, color: colors.textSecondary }]}>Цвет</Text>
        <ColorPicker selected={color} onSelect={setColor} />
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
        <Text style={styles.saveBtnText}>Создать колоду</Text>
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
