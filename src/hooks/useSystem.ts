import { useState, useCallback, useEffect, useMemo } from 'react';
import { SystemState, Quest, Item, PlayerStats, Attribute, Rank, DailyLog, ReadinessInputs } from '../types/system';
import { subDays, format, isSameDay, parseISO, differenceInDays } from 'date-fns';

const INITIAL_XP_TO_NEXT = (level: number) => level * 500;

const INITIAL_STATE: SystemState = {
  player: {
    id: "PX-001",
    name: "PLAYER PX-001",
    avatar: "",
    level: 1,
    rank: "E",
    title: "THE AWAKENED",
    xp: 0,
    xpToNext: INITIAL_XP_TO_NEXT(1),
    vitality: 100,
    energy: 100,
    focus: 100,
    discipline: 100,
    readinessScore: 80,
    fitnessScore: 10,
    disciplineScore: 50,
    streakCount: 0,
  },
  attributes: {
    strength: { name: "Strength", value: 10, description: "Physical power and striking force.", growth: [10] },
    endurance: { name: "Endurance", value: 10, description: "Stamina and resistance to damage.", growth: [10] },
    agility: { name: "Agility", value: 10, description: "Movement speed and reaction time.", growth: [10] },
    discipline: { name: "Discipline", value: 10, description: "Mental fortitude and habit consistency.", growth: [10] },
    focus: { name: "Focus", value: 10, description: "Concentration and cognitive processing.", growth: [10] },
    knowledge: { name: "Knowledge", value: 10, description: "Information retention and system understanding.", growth: [10] },
  },
  quests: [],
  inventory: [
    { id: "i1", name: "RECOVERY POTION", description: "Instantly restores 50% Vitality.", rarity: "COMMON", effect: "VITALITY +50%", count: 3 },
  ],
  logs: ["Arise: The System initialized. Welcome, Player PX-001."],
  penaltyActive: false,
  penaltyCountdown: 0,
  xpHistory: [],
  journey: [],
  lastResetDate: format(new Date(), 'yyyy-MM-dd'),
};

export function useSystem() {
  const generateDailyQuests = useCallback((readiness: number, fitness: number, level: number, streak: number, penaltyActive: boolean): Quest[] => {
    const quests: Quest[] = [];
    const timestamp = Date.now();

    // Base difficulty multiplier
    const diffMult = readiness > 85 ? 1.2 : readiness < 40 ? 0.6 : 1.0;
    
    if (penaltyActive) {
      quests.push({
        id: `q_pen_${timestamp}`,
        title: "PENALTY: RESTORATION PROTOCOL",
        description: "Complete 200 push-ups, 200 sit-ups, 200 squats, and a 15km run to lift the penalty.",
        type: 'PENALTY',
        status: 'IN_PROGRESS',
        isMandatory: true,
        rewards: { xp: 500, stats: { discipline: 2 } },
        progress: 0,
        target: 715,
      });
      return quests;
    }

    const baseQuests = [
      { key: 'pushups', title: "PUSH-UPS", target: 100, stat: 'strength' },
      { key: 'situps', title: "SIT-UPS", target: 100, stat: 'strength' },
      { key: 'squats', title: "SQUATS", target: 100, stat: 'strength' },
      { key: 'running', title: "RUNNING", target: 10, stat: 'endurance' },
    ];

    baseQuests.forEach((bq, i) => {
      const adjustedTarget = Math.floor(bq.target * diffMult);
      quests.push({
        id: `q_sjw_${i}_${timestamp}`,
        title: `DAILY QUEST: ${bq.title}`,
        description: `Complete ${adjustedTarget} ${bq.title.toLowerCase()} to build ${bq.stat}.`,
        type: 'DAILY',
        status: 'IN_PROGRESS',
        isMandatory: true,
        rewards: { xp: 100, stats: { [bq.stat]: 1 } },
        progress: 0,
        target: adjustedTarget,
      });
    });

    return quests;
  }, []);

  const getInitialState = useCallback((): SystemState => {
    const state = JSON.parse(JSON.stringify(INITIAL_STATE));
    state.quests = generateDailyQuests(state.player.readinessScore, state.player.fitnessScore, state.player.level, state.player.streakCount, state.penaltyActive);
    state.lastResetDate = format(new Date(), 'yyyy-MM-dd');
    return state;
  }, [generateDailyQuests]);

  const [state, setState] = useState<SystemState>(() => {
    try {
      const saved = localStorage.getItem('system_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.player || !parsed.attributes || !Array.isArray(parsed.quests)) {
          return getInitialState();
        }
        return {
          ...parsed,
          player: { ...INITIAL_STATE.player, ...parsed.player },
          quests: (parsed.quests || []).map((q: any) => ({
            ...q,
            deadline: q.deadline ? new Date(q.deadline) : undefined
          }))
        };
      }
    } catch (e) {
      console.error("Failed to load system state:", e);
    }
    return getInitialState();
  });

  const [isGlitching, setIsGlitching] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<'QUEST_ISSUED' | 'QUEST_CLEARED' | 'PENALTY' | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('system_state', JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save system state to localStorage (likely quota exceeded):", e);
      // If it's a quota error, we might want to warn the user or clear some non-essential data
      // but for now we just log it to prevent the app from crashing.
    }
  }, [state]);

  const triggerGlitch = useCallback((intensity: 'low' | 'high' = 'low') => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), intensity === 'high' ? 400 : 200);
  }, []);

  const triggerOverlay = useCallback((type: 'QUEST_ISSUED' | 'QUEST_CLEARED' | 'PENALTY') => {
    setActiveOverlay(type);
    // Only trigger glitch for penalty or issued, success has its own chime
    if (type !== 'QUEST_CLEARED') {
      triggerGlitch('medium');
    }
    setTimeout(() => setActiveOverlay(null), 3000);
  }, [triggerGlitch]);

  // CORE LOGIC METHODS

  const calculateXPToNext = (level: number) => level * 500;

  const calculateReadiness = (inputs: ReadinessInputs): { score: number; category: 'RECOVERY' | 'LIGHT' | 'NORMAL' | 'PEAK' } => {
    // Score calculation (0-100)
    // Sleep: 0-10 hours (ideal 8)
    const sleepScore = Math.min(100, (inputs.sleep / 8) * 100);
    // Energy: 1-10
    const energyScore = inputs.energy * 10;
    // Fatigue: 1-10 (inverse)
    const fatigueScore = (11 - inputs.fatigue) * 10;
    // Yesterday Load: 1-10 (inverse for readiness)
    const loadScore = (11 - inputs.yesterdayLoad) * 10;
    // Recovery Bonus
    const recoveryBonus = inputs.recovery ? 15 : 0;

    const rawScore = (sleepScore * 0.4) + (energyScore * 0.2) + (fatigueScore * 0.2) + (loadScore * 0.2) + recoveryBonus;
    const score = Math.max(0, Math.min(100, Math.floor(rawScore)));

    let category: 'RECOVERY' | 'LIGHT' | 'NORMAL' | 'PEAK' = 'NORMAL';
    if (score < 30) category = 'RECOVERY';
    else if (score < 60) category = 'LIGHT';
    else if (score < 85) category = 'NORMAL';
    else category = 'PEAK';

    return { score, category };
  };

  const calculateFitnessScore = (journey: DailyLog[]): number => {
    if (journey.length === 0) return 10;
    
    const last30Days = journey.slice(0, 30);
    const completionRate = last30Days.reduce((acc, log) => {
      const rate = log.questsAssigned.length > 0 ? log.questsCompleted.length / log.questsAssigned.length : 1;
      return acc + rate;
    }, 0) / last30Days.length;

    const consistencyBonus = journey.length > 7 ? Math.min(20, journey[0].streak * 2) : 0;
    
    return Math.min(100, Math.floor(completionRate * 80 + consistencyBonus));
  };

  const evaluateRank = (player: PlayerStats, attributes: Record<string, Attribute>): Rank => {
    if (!player || !attributes) return 'E';
    const { level = 1, fitnessScore = 0, disciplineScore = 0 } = player;
    const attrValues = Object.values(attributes || {});
    const avgAttr = attrValues.length > 0 
      ? attrValues.reduce((acc, a) => acc + (a?.value || 0), 0) / attrValues.length 
      : 0;

    if (level >= 101 && fitnessScore >= 90 && disciplineScore >= 95 && avgAttr >= 80) return 'S';
    if (level >= 81 && fitnessScore >= 80 && disciplineScore >= 85 && avgAttr >= 60) return 'A';
    if (level >= 61 && fitnessScore >= 70 && disciplineScore >= 75 && avgAttr >= 45) return 'B';
    if (level >= 41 && fitnessScore >= 55 && disciplineScore >= 60 && avgAttr >= 30) return 'C';
    if (level >= 21 && fitnessScore >= 35 && disciplineScore >= 40 && avgAttr >= 20) return 'D';
    return 'E';
  };

  const dailyReset = useCallback((inputs: ReadinessInputs) => {
    const { score: readiness, category } = calculateReadiness(inputs);
    
    setState(prev => {
      const failedMandatory = prev.quests.some(q => q.isMandatory && q.status !== 'COMPLETED');
      let penaltyActive = prev.penaltyActive;
      let logs = [...prev.logs];
      let streakCount = prev.player.streakCount;

      if (failedMandatory) {
        penaltyActive = true;
        streakCount = 0;
        logs = ["PENALTY PROTOCOL INITIATED. MANDATORY QUEST FAILED.", ...logs];
        triggerOverlay('PENALTY');
      } else if (prev.quests.length > 0) {
        streakCount += 1;
        if (penaltyActive) {
          logs = ["PENALTY PROTOCOL TERMINATED. SYSTEM RESTORED.", ...logs];
          penaltyActive = false;
        }
      }

      const fitnessScore = calculateFitnessScore(prev.journey);
      const newQuests = generateDailyQuests(readiness, fitnessScore, prev.player.level, streakCount, penaltyActive);
      
      const newLog: DailyLog = {
        date: format(new Date(), 'yyyy-MM-dd'),
        readiness,
        sleepHours: inputs.sleep,
        energyLevel: inputs.energy,
        fatigueLevel: inputs.fatigue,
        yesterdayLoad: inputs.yesterdayLoad,
        recoveryActions: inputs.recovery,
        questsAssigned: newQuests.map(q => q.id),
        questsCompleted: [],
        xpGained: 0,
        streak: streakCount,
      };

      return {
        ...prev,
        player: {
          ...prev.player,
          readinessScore: readiness,
          fitnessScore,
          streakCount,
          energy: readiness,
        },
        quests: newQuests,
        penaltyActive,
        journey: [newLog, ...prev.journey],
        lastResetDate: format(new Date(), 'yyyy-MM-dd'),
        logs: [`New day initialized. Readiness: ${readiness}% (${category})`, ...logs]
      };
    });

    triggerOverlay('QUEST_ISSUED');
  }, [triggerOverlay]);

  const updateQuestProgress = useCallback((questId: string, amount: number) => {
    setState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest || quest.status !== 'IN_PROGRESS') return prev;

      const newProgress = Math.min(quest.target, quest.progress + amount);
      const isCompleted = newProgress >= quest.target;

      if (isCompleted) {
        // We'll handle completion in the next tick or via a separate call if needed, 
        // but for now let's just update progress and status
        triggerGlitch('low');
        
        // If it's the last step, we trigger the full completion logic
        // (This is a bit simplified, ideally we'd separate progress from completion)
      }

      return {
        ...prev,
        quests: prev.quests.map(q => q.id === questId ? { 
          ...q, 
          progress: newProgress,
          status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS'
        } : q)
      };
    });
  }, [triggerGlitch]);

  const completeQuest = useCallback((questId: string) => {
    setState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest || quest.status === 'COMPLETED') return prev;

      triggerOverlay('QUEST_CLEARED');

      let newXP = prev.player.xp + quest.rewards.xp;
      let newLevel = prev.player.level;
      let newXPToNext = prev.player.xpToNext;

      // Level up logic
      while (newXP >= newXPToNext) {
        newXP -= newXPToNext;
        newLevel += 1;
        newXPToNext = calculateXPToNext(newLevel);
      }

        const newAttributes = { ...prev.attributes };
        if (quest.rewards.stats) {
          Object.entries(quest.rewards.stats).forEach(([key, val]) => {
            if (newAttributes[key]) {
              const newValue = (newAttributes[key].value || 0) + val;
              newAttributes[key] = {
                ...newAttributes[key],
                value: newValue,
                growth: [...(newAttributes[key].growth || []), newValue].slice(-10)
              };
            }
          });
        }

      const newPlayer = {
        ...prev.player,
        xp: newXP,
        level: newLevel,
        xpToNext: newXPToNext,
        rank: evaluateRank({ ...prev.player, level: newLevel }, newAttributes),
        disciplineScore: Math.min(100, prev.player.disciplineScore + (quest.isMandatory ? 2 : 1)),
      };

      return {
        ...prev,
        player: newPlayer,
        attributes: newAttributes,
        quests: prev.quests.map(q => q.id === questId ? { ...q, status: 'COMPLETED', progress: q.target } : q),
        logs: [`Quest '${quest.title}' cleared. +${quest.rewards.xp} XP`, ...prev.logs],
        xpHistory: [{ date: format(new Date(), 'MMM dd'), xp: quest.rewards.xp }, ...prev.xpHistory].slice(0, 7)
      };
    });
  }, [triggerGlitch, triggerOverlay]);

  const debugInfo = useMemo(() => ({
    state,
    rankEvaluation: evaluateRank(state?.player, state?.attributes),
    readinessCategory: calculateReadiness({
      sleep: 8,
      energy: 7,
      fatigue: 3,
      yesterdayLoad: 5,
      recovery: true
    }).category,
  }), [state]);

  const seedDemoData = (profile: 'BEGINNER' | 'RECOVERING' | 'ELITE' | 'PENALTY') => {
    setState(prev => {
      switch (profile) {
        case 'BEGINNER': return INITIAL_STATE;
        case 'RECOVERING': return {
          ...prev,
          player: { ...prev.player, readinessScore: 25, level: 5 },
          penaltyActive: false,
          quests: generateDailyQuests(25, 20, 5, 0, false)
        };
        case 'ELITE': return {
          ...prev,
          player: { ...prev.player, level: 85, rank: 'A', fitnessScore: 90, disciplineScore: 95 },
          penaltyActive: false,
          quests: generateDailyQuests(95, 90, 85, 15, false)
        };
        case 'PENALTY': return {
          ...prev,
          penaltyActive: true,
          quests: generateDailyQuests(50, 50, 10, 0, true)
        };
        default: return prev;
      }
    });
  };

  const clearSystemData = () => {
    localStorage.removeItem('system_state');
    const resetState = getInitialState();
    resetState.logs = ["System reset complete. New protocol initiated. Welcome, Player PX-001."];
    setState(resetState);
    triggerGlitch('high');
    console.log("DEBUG: System data cleared and state reset to initial.");
  };

  const clearLogs = () => {
    setState(prev => ({
      ...prev,
      logs: ["System logs cleared. Protocol restarted."]
    }));
    triggerGlitch('low');
  };

  const updateProfile = (name: string, avatar: string) => {
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        name,
        avatar
      },
      logs: [`Profile updated: ${name}`, ...prev.logs]
    }));
    triggerGlitch('low');
  };

  return { 
    state, 
    isGlitching, 
    activeOverlay, 
    debugInfo,
    triggerGlitch, 
    triggerOverlay, 
    completeQuest, 
    updateQuestProgress,
    dailyReset,
    seedDemoData,
    clearSystemData,
    clearLogs,
    updateProfile
  };
}
