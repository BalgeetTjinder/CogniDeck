import { getDatabase } from './database';

export async function seedDemoData(): Promise<void> {
  const db = await getDatabase();

  // Run only if no decks exist
  const existing = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM decks');
  if (existing && existing.count > 0) return;

  // ── Deck 1: English B2 ──
  const { lastInsertRowId: d1 } = await db.runAsync(
    "INSERT INTO decks (title, color) VALUES (?, ?)", ['Английский B2', '#6366F1']
  );

  // Topics
  const { lastInsertRowId: t1 } = await db.runAsync(
    "INSERT INTO topics (deck_id, title) VALUES (?, ?)", [d1, 'Времена глаголов']
  );
  const { lastInsertRowId: t2 } = await db.runAsync(
    "INSERT INTO topics (deck_id, title) VALUES (?, ?)", [d1, 'Фразовые глаголы']
  );
  const { lastInsertRowId: t3 } = await db.runAsync(
    "INSERT INTO topics (deck_id, title) VALUES (?, ?)", [d1, 'Лексика']
  );

  // Subtopics
  const { lastInsertRowId: st1 } = await db.runAsync(
    "INSERT INTO subtopics (topic_id, title) VALUES (?, ?)", [t1, 'Present Perfect']
  );
  const { lastInsertRowId: st2 } = await db.runAsync(
    "INSERT INTO subtopics (topic_id, title) VALUES (?, ?)", [t1, 'Past Simple']
  );
  const { lastInsertRowId: st3 } = await db.runAsync(
    "INSERT INTO subtopics (topic_id, title) VALUES (?, ?)", [t2, 'Move on / off / up']
  );
  const { lastInsertRowId: st4 } = await db.runAsync(
    "INSERT INTO subtopics (topic_id, title) VALUES (?, ?)", [t3, 'Business English']
  );

  // Cards for st1 (Present Perfect) — хорошо усвоены
  const ppCards = [
    ['Как образуется Present Perfect?', 'have/has + Past Participle', 'Вспомни вспомогательный глагол'],
    ['Переведи: "Я уже видел этот фильм"', 'I have already seen this film', null],
    ['Когда НЕ используем Present Perfect?', 'Когда есть конкретное прошедшее время (yesterday, in 2020)', null],
    ['Как сказать "Она только что пришла"?', 'She has just arrived', 'Используй just'],
    ['Переведи: "Ты когда-нибудь был в Лондоне?"', 'Have you ever been to London?', null],
  ];
  for (const [q, a, h] of ppCards) {
    await db.runAsync(
      "INSERT INTO cards (subtopic_id, question, answer, hint, easiness, interval, next_review, status) VALUES (?, ?, ?, ?, ?, ?, date('now', '+7 days'), 'mastered')",
      [st1, q, a, h, 2.8, 14]
    );
  }

  // Cards for st2 (Past Simple) — среднее
  const psCards = [
    ['Глагол "go" в Past Simple?', 'went', null],
    ['Как образуется вопрос в Past Simple?', 'Did + subject + infinitive?', 'Вспомни вспомогательный глагол did'],
    ['Переведи: "Они не пришли вчера"', 'They did not come yesterday', null],
    ['Неправильная форма "buy"?', 'bought', null],
  ];
  for (const [q, a, h] of psCards) {
    await db.runAsync(
      "INSERT INTO cards (subtopic_id, question, answer, hint, easiness, interval, next_review, status) VALUES (?, ?, ?, ?, ?, ?, date('now'), 'reviewing')",
      [st2, q, a, h, 2.1, 3]
    );
  }

  // Cards for st3 (Phrasal verbs) — сложные, нужно учить
  const pvCards = [
    ['Что значит "move on"?', 'двигаться дальше, переходить к следующему', null],
    ['Что значит "give up"?', 'сдаваться, бросать', null],
    ['Что значит "look into"?', 'расследовать, изучать', 'to investigate'],
    ['Что значит "put off"?', 'откладывать', null],
    ['Что значит "carry out"?', 'выполнять, проводить', 'to perform/execute'],
    ['Что значит "turn down"?', 'отказать, отклонить', null],
  ];
  for (const [q, a, h] of pvCards) {
    await db.runAsync(
      "INSERT INTO cards (subtopic_id, question, answer, hint, easiness, interval, next_review, status) VALUES (?, ?, ?, ?, ?, ?, date('now'), 'learning')",
      [st3, q, a, h, 1.5, 1]
    );
  }

  // Cards for st4 (Business) — новые
  const bizCards = [
    ['Что значит "stakeholder"?', 'заинтересованная сторона, участник процесса', null],
    ['Переведи: "Let us touch base"', 'Давайте свяжемся / обсудим', null],
    ['Что значит "KPI"?', 'Key Performance Indicator — ключевой показатель эффективности', null],
  ];
  for (const [q, a, h] of bizCards) {
    await db.runAsync(
      "INSERT INTO cards (subtopic_id, question, answer, hint, easiness, interval, next_review, status) VALUES (?, ?, ?, ?, ?, ?, date('now'), 'new')",
      [st4, q, a, h, 2.5, 0]
    );
  }

  // ── Deck 2: React Native ──
  const { lastInsertRowId: d2 } = await db.runAsync(
    "INSERT INTO decks (title, color) VALUES (?, ?)", ['React Native', '#06B6D4']
  );

  const { lastInsertRowId: t4 } = await db.runAsync(
    "INSERT INTO topics (deck_id, title) VALUES (?, ?)", [d2, 'Основы']
  );
  const { lastInsertRowId: t5 } = await db.runAsync(
    "INSERT INTO topics (deck_id, title) VALUES (?, ?)", [d2, 'Навигация']
  );
  const { lastInsertRowId: t6 } = await db.runAsync(
    "INSERT INTO topics (deck_id, title) VALUES (?, ?)", [d2, 'Хуки']
  );

  const { lastInsertRowId: st5 } = await db.runAsync(
    "INSERT INTO subtopics (topic_id, title) VALUES (?, ?)", [t4, 'Компоненты']
  );
  const { lastInsertRowId: st6 } = await db.runAsync(
    "INSERT INTO subtopics (topic_id, title) VALUES (?, ?)", [t4, 'StyleSheet']
  );
  const { lastInsertRowId: st7 } = await db.runAsync(
    "INSERT INTO subtopics (topic_id, title) VALUES (?, ?)", [t5, 'Expo Router']
  );
  const { lastInsertRowId: st8 } = await db.runAsync(
    "INSERT INTO subtopics (topic_id, title) VALUES (?, ?)", [t6, 'useState / useEffect']
  );

  const componentCards = [
    ['Чем View отличается от ScrollView?', 'View не прокручивается. ScrollView позволяет скроллить контент, выходящий за экран.', null],
    ['Какой компонент используется для длинных списков?', 'FlatList — оптимизирован для больших данных, рендерит только видимые элементы', 'Не ScrollView!'],
    ['Что делает Pressable?', 'Универсальный компонент для нажатий с поддержкой состояний pressed, hovered и т.д.', null],
    ['Чем Text отличается от TextInput?', 'Text — только отображение, TextInput — редактируемое поле ввода', null],
    ['Что такое SafeAreaView?', 'Компонент, учитывающий вырезы и отступы (notch, status bar) устройства', null],
  ];
  for (const [q, a, h] of componentCards) {
    await db.runAsync(
      "INSERT INTO cards (subtopic_id, question, answer, hint, easiness, interval, next_review, status) VALUES (?, ?, ?, ?, ?, ?, date('now', '+3 days'), 'reviewing')",
      [st5, q, a, h, 2.2, 3]
    );
  }

  const styleCards = [
    ['Как создать стиль в React Native?', 'StyleSheet.create({ ... }) — компилируется в нативные стили', null],
    ['Какая система вёрстки используется в RN?', 'Flexbox, по умолчанию direction: column', null],
    ['Как задать тень на Android?', 'elevation: число (iOS использует shadow* свойства)', null],
  ];
  for (const [q, a, h] of styleCards) {
    await db.runAsync(
      "INSERT INTO cards (subtopic_id, question, answer, hint, easiness, interval, next_review, status) VALUES (?, ?, ?, ?, ?, ?, date('now'), 'learning')",
      [st6, q, a, h, 1.8, 1]
    );
  }

  const routerCards = [
    ['Что такое file-based routing в Expo Router?', 'Структура папки app/ автоматически создаёт маршруты — файл app/about.tsx → /about', null],
    ['Как сделать динамический маршрут?', 'Назвать файл [id].tsx — параметр доступен через useLocalSearchParams()', 'Квадратные скобки'],
    ['Как открыть экран как модальное окно?', 'В Stack.Screen задать presentation: "modal"', null],
    ['Что делает useFocusEffect?', 'Запускает эффект каждый раз при фокусе на экране (в отличие от useEffect)', null],
  ];
  for (const [q, a, h] of routerCards) {
    await db.runAsync(
      "INSERT INTO cards (subtopic_id, question, answer, hint, easiness, interval, next_review, status) VALUES (?, ?, ?, ?, ?, ?, date('now'), 'new')",
      [st7, q, a, h, 2.5, 0]
    );
  }

  const hookCards = [
    ['В чём разница useState и useRef?', 'useState вызывает ре-рендер при изменении, useRef — нет', null],
    ['Когда использовать useCallback?', 'Когда функция передаётся как prop или в зависимости другого хука — мемоизирует её', null],
    ['Что делает второй аргумент useEffect?', 'Массив зависимостей — эффект запускается только при изменении этих значений', 'Пустой массив = только при монтировании'],
  ];
  for (const [q, a, h] of hookCards) {
    await db.runAsync(
      "INSERT INTO cards (subtopic_id, question, answer, hint, easiness, interval, next_review, status) VALUES (?, ?, ?, ?, ?, ?, date('now'), 'new')",
      [st8, q, a, h, 2.5, 0]
    );
  }

  // ── Fake review history (last 30 days) ──
  const activityPattern = [3,0,5,8,4,0,0,6,7,3,2,0,9,5,4,1,0,8,6,3,0,4,5,7,2,0,3,6,8,4];
  const today = new Date();

  // Get first card id for logging
  const firstCard = await db.getFirstAsync<{ id: number }>('SELECT id FROM cards LIMIT 1');
  if (firstCard) {
    for (let i = activityPattern.length - 1; i >= 0; i--) {
      const count = activityPattern[i];
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      for (let j = 0; j < count; j++) {
        const rating = Math.floor(Math.random() * 3);
        await db.runAsync(
          'INSERT INTO review_history (card_id, rating, reviewed_at) VALUES (?, ?, ?)',
          [firstCard.id, rating, dateStr]
        );
      }
    }
  }
}
