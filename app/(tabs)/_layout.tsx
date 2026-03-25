import { Pressable } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 4,
        },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 24 },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'CogniDeck',
          tabBarLabel: 'Колоды',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="layers-outline" size={size} color={color} />
          ),
          headerRight: () => (
            <Pressable
              style={{ flexDirection: 'row', gap: 16, marginRight: 16 }}
              onPress={() => {}}
            >
              <Pressable onPress={() => router.push('/search')}>
                <Ionicons name="search-outline" size={24} color={colors.text} />
              </Pressable>
              <Pressable onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={24} color={colors.text} />
              </Pressable>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="graph"
        options={{
          title: 'Граф знаний',
          tabBarLabel: 'Граф',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-network-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Статистика',
          tabBarLabel: 'Прогресс',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
