
export type LevelType = 'easy' | 'medium' | 'hard';

export interface ProgressStatus {
  grade: number;
  level: LevelType;
  completedTopics: number;
  isLocked: boolean;
}