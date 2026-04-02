import { prisma } from "./prisma";
import { LevelType } from "./types/learning";

const TOTAL_TOPICS = 8;
const LEVELS: LevelType[] = ['easy', 'medium', 'hard'];

export async function getLevelAccess(userId: string, grade: number) {
  
  const progress = await prisma.userProgress.findMany({
    where: { userId, grade, completed: true }
  });

  const status = LEVELS.map((level) => {
    const completedInLevel = progress.filter(p => p.level === level).length;
    
    
    const prevLevelIdx = LEVELS.indexOf(level) - 1;
    
    let isLocked = false;
    if (level !== 'easy') {
      const prevLevel = LEVELS[prevLevelIdx];
      const prevLevelCompleted = progress.filter(p => p.level === prevLevel).length;
      isLocked = prevLevelCompleted < TOTAL_TOPICS;
    }

    return {
      level,
      completedTopics: completedInLevel,
      isLocked
    };
  });

  return status;
}