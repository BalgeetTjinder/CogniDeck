import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../lib/colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
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
          name="study/[deckId]"
          options={{ title: 'Сессия', headerBackTitle: 'Назад' }}
        />
      </Stack>
    </>
  );
}
