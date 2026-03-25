export type CardStatus = 'new' | 'learning' | 'reviewing' | 'mastered' | 'archived';

export type Rating = 0 | 1 | 2;

export interface Deck {
  id: number;
  title: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface DeckWithStats extends Deck {
  total_cards: number;
  due_today: number;
  avg_easiness: number;
}

export interface Topic {
  id: number;
  deck_id: number;
  title: string;
  created_at: string;
}

export interface TopicWithStats extends Topic {
  total_cards: number;
  due_today: number;
  avg_easiness: number;
  subtopics: SubtopicWithStats[];
}

export interface Subtopic {
  id: number;
  topic_id: number;
  title: string;
  created_at: string;
}

export interface SubtopicWithStats extends Subtopic {
  total_cards: number;
  due_today: number;
  avg_easiness: number;
}

export interface Card {
  id: number;
  subtopic_id: number;
  question: string;
  answer: string;
  hint: string | null;
  easiness: number;
  interval: number;
  next_review: string;
  status: CardStatus;
  created_at: string;
}

export interface ReviewRecord {
  id: number;
  card_id: number;
  rating: number;
  reviewed_at: string;
}

export interface DayActivity {
  date: string;
  count: number;
}

export const STATUS_LABELS: Record<string, string> = {
  new: 'Новые',
  learning: 'Изучаются',
  reviewing: 'Закрепляются',
  mastered: 'Усвоены',
  archived: 'Архив',
};

export const STATUS_COLORS: Record<string, string> = {
  new: '#64748B',
  learning: '#F87171',
  reviewing: '#FBBF24',
  mastered: '#34D399',
  archived: '#818CF8',
};

export const DECK_COLORS = [
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#22C55E', // green
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#64748B', // slate
];

export function getHealthColor(avgEasiness: number, totalCards: number): string {
  if (totalCards === 0) return '#64748B';
  if (avgEasiness >= 2.2) return '#34D399';
  if (avgEasiness >= 1.7) return '#FBBF24';
  return '#F87171';
}
