import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';

export function WebNotSupported() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Ionicons name="phone-portrait-outline" size={72} color={colors.primaryLight} />
      <Text style={[styles.title, { color: colors.primary }]}>CogniDeck</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Приложение предназначено для мобильных устройств
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.step, { color: colors.text }]}>1. Установите Expo Go из Play Store или App Store</Text>
        <Text style={[styles.step, { color: colors.text }]}>2. Откройте Expo Go на телефоне</Text>
        <Text style={[styles.step, { color: colors.text }]}>3. Отсканируйте QR-код из терминала</Text>
      </View>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Браузерная версия не поддерживает локальную базу данных SQLite
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 10,
    width: '100%',
    maxWidth: 360,
    marginTop: 8,
    borderWidth: 1,
  },
  step: {
    fontSize: 14,
    lineHeight: 20,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
