import { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../lib/colors';
import { WebNotSupported } from '../components/WebNotSupported';
import { seedDemoData } from '../lib/seed';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') { setReady(true); return; }
    seedDemoData().finally(() => setReady(true));
  }, []);

  if (Platform.OS === 'web') {
    return <WebNotSupported />;
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
          name="deck/[id]/graph"
          options={{ title: 'Граф знаний' }}
        />
        <Stack.Screen
          name="study/[deckId]"
          options={{ title: 'Сессия', headerBackTitle: 'Назад' }}
        />
      </Stack>
    </>
  );
}
