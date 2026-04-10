export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface Attribute {
  name: string;
  value: number;
  description: string;
  growth: number[]; // History for analytics
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'MAIN' | 'HIDDEN' | 'URGENT' | 'PENALTY' | 'MANDATORY';
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  isMandatory?: boolean;
  rewards: {
    xp: number;
    items?: string[];
    stats?: Partial<Record<string, number>>;
  };
  consequences?: string;
  deadline?: Date;
  progress: number;
  target: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  effect: string;
  usageLimit?: number;
  count: number;
}

export interface PlayerStats {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  rank: Rank;
  title: string;
  xp: number;
  xpToNext: number;
  vitality: number;
  energy: number;
  focus: number;
  discipline: number;
  
  // New Core Logic Stats
  readinessScore: number;
  fitnessScore: number;
  disciplineScore: number;
  streakCount: number;
}

export interface DailyLog {
  date: string;
  readiness: number;
  sleepHours: number;
  energyLevel: number;
  fatigueLevel: number;
  yesterdayLoad: number; // 0-10
  recoveryActions: boolean;
  questsAssigned: string[];
  questsCompleted: string[];
  xpGained: number;
  streak: number;
}

export interface ReadinessInputs {
  sleep: number;
  energy: number;
  fatigue: number;
  yesterdayLoad: number;
  recovery: boolean;
}

export interface SystemState {
  player: PlayerStats;
  attributes: Record<string, Attribute>;
  quests: Quest[];
  inventory: Item[];
  logs: string[];
  penaltyActive: boolean;
  penaltyCountdown: number;
  xpHistory: { date: string; xp: number }[];
  journey: DailyLog[];
  lastResetDate: string | null;
}
