import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/colors';

export function WebNotSupported() {
  return (
    <View style={styles.container}>
      <Ionicons name="phone-portrait-outline" size={72} color={Colors.primaryLight} />
      <Text style={styles.title}>CogniDeck</Text>
      <Text style={styles.subtitle}>
        Приложение предназначено для мобильных устройств
      </Text>
      <View style={styles.card}>
        <Text style={styles.step}>1. Установите Expo Go из Play Store или App Store</Text>
        <Text style={styles.step}>2. Откройте Expo Go на телефоне</Text>
        <Text style={styles.step}>3. Отсканируйте QR-код из терминала</Text>
      </View>
      <Text style={styles.hint}>
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
    backgroundColor: Colors.background,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 10,
    width: '100%',
    maxWidth: 360,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  step: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  hint: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
