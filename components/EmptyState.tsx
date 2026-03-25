import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.surfaceLight} />
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  title: { fontSize: 18, fontWeight: '600', marginTop: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
