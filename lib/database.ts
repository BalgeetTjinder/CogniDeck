import * as SQLite from 'expo-sqlite';
import { todayString } from './sm2';
import type { Card, Deck, DeckWithStats, Topic, TopicWithStats, Subtopic, SubtopicWithStats, ReviewRecord, DayActivity } from './types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('cognideck.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await initializeDatabase(db);
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS decks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6366F1',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deck_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS subtopics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subtopic_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      hint TEXT,
      easiness REAL NOT NULL DEFAULT 2.5,
      interval REAL NOT NULL DEFAULT 0,
      next_review TEXT NOT NULL DEFAULT (date('now')),
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS review_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL DEFAULT (date('now')),
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_cards_next_review ON cards(next_review);
    CREATE INDEX IF NOT EXISTS idx_cards_subtopic ON cards(subtopic_id);
    CREATE INDEX IF NOT EXISTS idx_topics_deck ON topics(deck_id);
    CREATE INDEX IF NOT EXISTS idx_subtopics_topic ON subtopics(topic_id);
    CREATE INDEX IF NOT EXISTS idx_review_history_date ON review_history(reviewed_at);
    CREATE INDEX IF NOT EXISTS idx_review_history_card ON review_history(card_id);
  `);
}

// ── Decks ──

export async function getDecks(): Promise<DeckWithStats[]> {
  const database = await getDatabase();
  const today = todayString();
  return database.getAllAsync<DeckWithStats>(`
    SELECT
      d.*,
      COUNT(c.id) as total_cards,
      SUM(CASE WHEN c.next_review <= ? THEN 1 ELSE 0 END) as due_today,
      COALESCE(AVG(c.easiness), 0) as avg_easiness
    FROM decks d
    LEFT JOIN topics t ON t.deck_id = d.id
    LEFT JOIN subtopics st ON st.topic_id = t.id
    LEFT JOIN cards c ON c.subtopic_id = st.id
    GROUP BY d.id
    ORDER BY d.updated_at DESC
  `, [today]);
}

export async function getDeck(id: number): Promise<Deck | null> {
  const database = await getDatabase();
  return database.getFirstAsync<Deck>('SELECT * FROM decks WHERE id = ?', [id]);
}

export async function createDeck(title: string, color: string): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    'INSERT INTO decks (title, color) VALUES (?, ?)',
    [title, color]
  );
  return result.lastInsertRowId;
}

export async function updateDeck(id: number, title: string, color: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE decks SET title = ?, color = ?, updated_at = datetime('now') WHERE id = ?",
    [title, color, id]
  );
}

export async function deleteDeck(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM decks WHERE id = ?', [id]);
}

// ── Topics ──

export async function getTopicsWithStats(deckId: number): Promise<TopicWithStats[]> {
  const database = await getDatabase();
  const today = todayString();

  const topics = await database.getAllAsync<TopicWithStats>(`
    SELECT
      t.*,
      COUNT(c.id) as total_cards,
      SUM(CASE WHEN c.next_review <= ? THEN 1 ELSE 0 END) as due_today,
      COALESCE(AVG(c.easiness), 0) as avg_easiness
    FROM topics t
    LEFT JOIN subtopics st ON st.topic_id = t.id
    LEFT JOIN cards c ON c.subtopic_id = st.id
    WHERE t.deck_id = ?
    GROUP BY t.id
    ORDER BY t.created_at ASC
  `, [today, deckId]);

  for (const topic of topics) {
    topic.subtopics = await getSubtopicsWithStats(topic.id);
  }

  return topics;
}

export async function createTopic(deckId: number, title: string): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    'INSERT INTO topics (deck_id, title) VALUES (?, ?)',
    [deckId, title]
  );
  return result.lastInsertRowId;
}

export async function updateTopic(id: number, title: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('UPDATE topics SET title = ? WHERE id = ?', [title, id]);
}

export async function deleteTopic(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM topics WHERE id = ?', [id]);
}

// ── Subtopics ──

export async function getSubtopicsWithStats(topicId: number): Promise<SubtopicWithStats[]> {
  const database = await getDatabase();
  const today = todayString();
  return database.getAllAsync<SubtopicWithStats>(`
    SELECT
      st.*,
      COUNT(c.id) as total_cards,
      SUM(CASE WHEN c.next_review <= ? THEN 1 ELSE 0 END) as due_today,
      COALESCE(AVG(c.easiness), 0) as avg_easiness
    FROM subtopics st
    LEFT JOIN cards c ON c.subtopic_id = st.id
    WHERE st.topic_id = ?
    GROUP BY st.id
    ORDER BY st.created_at ASC
  `, [today, topicId]);
}

export async function getSubtopicsByDeck(deckId: number): Promise<(Subtopic & { topic_title: string })[]> {
  const database = await getDatabase();
  return database.getAllAsync<Subtopic & { topic_title: string }>(`
    SELECT st.*, t.title as topic_title
    FROM subtopics st
    JOIN topics t ON t.id = st.topic_id
    WHERE t.deck_id = ?
    ORDER BY t.created_at ASC, st.created_at ASC
  `, [deckId]);
}

export async function createSubtopic(topicId: number, title: string): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    'INSERT INTO subtopics (topic_id, title) VALUES (?, ?)',
    [topicId, title]
  );
  return result.lastInsertRowId;
}

export async function deleteSubtopic(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM subtopics WHERE id = ?', [id]);
}

// ── Cards ──

export async function getDueCards(deckId: number): Promise<Card[]> {
  const database = await getDatabase();
  const today = todayString();
  return database.getAllAsync<Card>(`
    SELECT c.*
    FROM cards c
    JOIN subtopics st ON st.id = c.subtopic_id
    JOIN topics t ON t.id = st.topic_id
    WHERE t.deck_id = ? AND c.next_review <= ?
    ORDER BY c.easiness ASC, c.next_review ASC
  `, [deckId, today]);
}

export async function getDueCardsByTopic(topicId: number): Promise<Card[]> {
  const database = await getDatabase();
  const today = todayString();
  return database.getAllAsync<Card>(`
    SELECT c.*
    FROM cards c
    JOIN subtopics st ON st.id = c.subtopic_id
    WHERE st.topic_id = ? AND c.next_review <= ?
    ORDER BY c.easiness ASC, c.next_review ASC
  `, [topicId, today]);
}

export async function createCard(
  subtopicId: number,
  question: string,
  answer: string,
  hint?: string
): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    'INSERT INTO cards (subtopic_id, question, answer, hint) VALUES (?, ?, ?, ?)',
    [subtopicId, question, answer, hint ?? null]
  );
  return result.lastInsertRowId;
}

export async function updateCard(
  id: number,
  question: string,
  answer: string,
  hint?: string
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE cards SET question = ?, answer = ?, hint = ? WHERE id = ?',
    [question, answer, hint ?? null, id]
  );
}

export async function updateCardReview(
  id: number,
  easiness: number,
  interval: number,
  nextReview: string,
  status: string
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE cards SET easiness = ?, interval = ?, next_review = ?, status = ? WHERE id = ?',
    [easiness, interval, nextReview, status, id]
  );
}

export async function deleteCard(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM cards WHERE id = ?', [id]);
}

// ── Review History ──

export async function logReview(cardId: number, rating: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO review_history (card_id, rating) VALUES (?, ?)',
    [cardId, rating]
  );
}

export async function getStreak(): Promise<number> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ day: string }>(
    'SELECT DISTINCT reviewed_at as day FROM review_history ORDER BY reviewed_at DESC'
  );

  if (rows.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Streak must start from today or yesterday (if today not yet studied)
  if (rows[0].day !== todayStr && rows[0].day !== yesterdayStr) return 0;

  let streak = 0;
  let cursor = new Date(rows[0].day);
  cursor.setHours(0, 0, 0, 0);

  for (const row of rows) {
    const rowDate = new Date(row.day);
    rowDate.setHours(0, 0, 0, 0);
    const diff = Math.round((cursor.getTime() - rowDate.getTime()) / 86400000);

    if (diff === 0) {
      streak++;
    } else if (diff === 1) {
      streak++;
      cursor = rowDate;
    } else {
      break;
    }
  }

  return streak;
}

export async function getDayActivity(days: number): Promise<DayActivity[]> {
  const database = await getDatabase();
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split('T')[0];

  return database.getAllAsync<DayActivity>(`
    SELECT reviewed_at as date, COUNT(*) as count
    FROM review_history
    WHERE reviewed_at >= ?
    GROUP BY reviewed_at
    ORDER BY reviewed_at ASC
  `, [sinceStr]);
}

export async function getCardDistribution(): Promise<{ status: string; count: number }[]> {
  const database = await getDatabase();
  return database.getAllAsync<{ status: string; count: number }>(`
    SELECT status, COUNT(*) as count
    FROM cards
    GROUP BY status
    ORDER BY
      CASE status
        WHEN 'new' THEN 1
        WHEN 'learning' THEN 2
        WHEN 'reviewing' THEN 3
        WHEN 'mastered' THEN 4
        WHEN 'archived' THEN 5
      END
  `);
}

export async function getTotalReviewsToday(): Promise<number> {
  const database = await getDatabase();
  const today = todayString();
  const row = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM review_history WHERE reviewed_at = ?',
    [today]
  );
  return row?.count ?? 0;
}

// ── Hard Cards (learning / recently failed) ──

export async function getHardCards(deckId: number): Promise<Card[]> {
  const database = await getDatabase();
  return database.getAllAsync<Card>(`
    SELECT DISTINCT c.*
    FROM cards c
    JOIN subtopics st ON st.id = c.subtopic_id
    JOIN topics t ON t.id = st.topic_id
    LEFT JOIN review_history rh ON rh.card_id = c.id
    WHERE t.deck_id = ?
      AND (c.status IN ('learning', 'new') OR c.easiness < 2.0
           OR rh.id IN (
             SELECT rh2.id FROM review_history rh2
             WHERE rh2.card_id = c.id AND rh2.rating = 0
             ORDER BY rh2.reviewed_at DESC LIMIT 1
           ))
    ORDER BY c.easiness ASC
  `, [deckId]);
}

// ── Search ──

export async function searchCards(
  query: string,
  deckId?: number
): Promise<(Card & { deck_title: string; deck_color: string; deck_id: number; topic_title: string })[]> {
  const database = await getDatabase();
  const pattern = `%${query}%`;
  if (deckId) {
    return database.getAllAsync(`
      SELECT c.*, d.title as deck_title, d.color as deck_color, d.id as deck_id, t.title as topic_title
      FROM cards c
      JOIN subtopics st ON st.id = c.subtopic_id
      JOIN topics t ON t.id = st.topic_id
      JOIN decks d ON d.id = t.deck_id
      WHERE t.deck_id = ? AND (c.question LIKE ? OR c.answer LIKE ?)
      ORDER BY c.created_at DESC
    `, [deckId, pattern, pattern]);
  }
  return database.getAllAsync(`
    SELECT c.*, d.title as deck_title, d.color as deck_color, d.id as deck_id, t.title as topic_title
    FROM cards c
    JOIN subtopics st ON st.id = c.subtopic_id
    JOIN topics t ON t.id = st.topic_id
    JOIN decks d ON d.id = t.deck_id
    WHERE c.question LIKE ? OR c.answer LIKE ?
    ORDER BY c.created_at DESC
  `, [pattern, pattern]);
}

// ── Batch Operations ──

export async function deleteCards(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const database = await getDatabase();
  const placeholders = ids.map(() => '?').join(',');
  await database.runAsync(`DELETE FROM cards WHERE id IN (${placeholders})`, ids);
}

export async function moveCards(cardIds: number[], targetSubtopicId: number): Promise<void> {
  if (cardIds.length === 0) return;
  const database = await getDatabase();
  const placeholders = cardIds.map(() => '?').join(',');
  await database.runAsync(
    `UPDATE cards SET subtopic_id = ? WHERE id IN (${placeholders})`,
    [targetSubtopicId, ...cardIds]
  );
}

export async function bulkImportCards(
  subtopicId: number,
  pairs: { question: string; answer: string }[]
): Promise<number> {
  if (pairs.length === 0) return 0;
  const database = await getDatabase();
  let count = 0;
  for (const { question, answer } of pairs) {
    if (question.trim() && answer.trim()) {
      await database.runAsync(
        'INSERT INTO cards (subtopic_id, question, answer) VALUES (?, ?, ?)',
        [subtopicId, question.trim(), answer.trim()]
      );
      count++;
    }
  }
  return count;
}

// ── Settings (stored in SQLite for simplicity) ──

export async function initSettingsTable(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export async function getSetting(key: string): Promise<string | null> {
  const database = await getDatabase();
  await initSettingsTable();
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await getDatabase();
  await initSettingsTable();
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}

// ── Counts for notifications ──

export async function getTotalDueToday(): Promise<number> {
  const database = await getDatabase();
  const today = todayString();
  const row = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM cards WHERE next_review <= ?',
    [today]
  );
  return row?.count ?? 0;
}
