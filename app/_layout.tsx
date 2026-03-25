import { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../lib/theme';
import { WebNotSupported } from '../components/WebNotSupported';
import { seedDemoData } from '../lib/seed';

function AppContent() {
  const { colors, mode } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') { setReady(true); return; }
    (async () => {
      const done = await AsyncStorage.getItem('onboarding_done');
      setNeedsOnboarding(done !== 'true');
      await seedDemoData();
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready || !needsOnboarding) return;
    if (segments[0] === 'onboarding') return;

    AsyncStorage.getItem('onboarding_done').then(done => {
      if (done === 'true') {
        setNeedsOnboarding(false);
      } else {
        router.replace('/onboarding');
      }
    });
  }, [ready, needsOnboarding, segments]);

  if (Platform.OS === 'web') {
    return <WebNotSupported />;
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="deck/create"
          options={{ title: 'Новая колода', presentation: 'modal' }}
        />
        <Stack.Screen
          name="deck/[id]/index"
          options={{ title: '' }}
        />
        <Stack.Screen
          name="deck/[id]/edit"
          options={{ title: 'Редактировать колоду', presentation: 'modal' }}
        />
        <Stack.Screen
          name="deck/[id]/add-topic"
          options={{ title: 'Новая тема', presentation: 'modal' }}
        />
        <Stack.Screen
          name="deck/[id]/add-subtopic"
          options={{ title: 'Новая подтема', presentation: 'modal' }}
        />
        <Stack.Screen
          name="deck/[id]/add-card"
          options={{ title: 'Новая карточка', presentation: 'modal' }}
        />
        <Stack.Screen
          name="deck/[id]/import"
          options={{ title: 'Импорт карточек', presentation: 'modal' }}
        />
        <Stack.Screen
          name="deck/[id]/graph"
          options={{ title: 'Граф знаний' }}
        />
        <Stack.Screen
          name="study/[deckId]"
          options={{ title: 'Сессия', headerBackTitle: 'Назад' }}
        />
        <Stack.Screen
          name="search"
          options={{ title: 'Поиск', presentation: 'modal' }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: 'Настройки', presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
