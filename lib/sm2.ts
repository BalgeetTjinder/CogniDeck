import { Rating } from './types';

interface SM2Result {
  easiness: number;
  interval: number;
  nextReview: string;
}

export function calculateSM2(
  easiness: number,
  interval: number,
  rating: Rating
): SM2Result {
  let newEasiness = easiness;
  let newInterval = interval;

  switch (rating) {
    case 0: // Hard
      newInterval = 1;
      newEasiness = Math.max(1.3, easiness - 0.2);
      break;
    case 1: // OK
      newInterval = Math.max(1, Math.ceil(interval * 1.2));
      break;
    case 2: // Easy
      newInterval = Math.max(1, Math.ceil(interval * easiness));
      newEasiness = Math.min(3.5, easiness + 0.1);
      break;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  const nextReviewStr = nextReview.toISOString().split('T')[0];

  return {
    easiness: Math.round(newEasiness * 100) / 100,
    interval: newInterval,
    nextReview: nextReviewStr,
  };
}

export function getStatusFromHistory(easiness: number, interval: number): string {
  if (interval <= 1) return 'learning';
  if (interval <= 7) return 'reviewing';
  if (interval <= 30) return 'mastered';
  return 'archived';
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}
