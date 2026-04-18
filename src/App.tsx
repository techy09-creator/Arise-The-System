import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Shield, 
  Zap, 
  Target, 
  Activity, 
  BarChart3, 
  Package, 
  ScrollText, 
  AlertTriangle,
  ChevronRight,
  Plus,
  Lock,
  Trophy,
  History,
  Settings,
  Moon,
  Battery,
  Flame,
  CheckCircle2,
  Camera,
  X,
  ArrowUpDown,
  ShieldCheck
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from 'recharts';
import { format, isSameDay } from 'date-fns';
import { cn } from './lib/utils';
import { useSystem } from './hooks/useSystem';
import { Attribute, Rank, PlayerStats } from './types/system';
import { HolographicPanel, GlitchButton, ProgressBar, SystemOverlay, ProjectionTransition, GlitchProjection } from './components/SystemUI';
import { SystemIntro } from './components/SystemIntro';

type Screen = 'STATUS' | 'QUESTS' | 'ATTRIBUTES' | 'RANK' | 'ANALYTICS' | 'INVENTORY' | 'LOGS' | 'PENALTY' | 'JOURNEY' | 'DEBUG';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('STATUS');
  const [isInitializing, setIsInitializing] = useState(true);
  const { 
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
    updateProfile,
    useItem
  } = useSystem();
  const [showResetModal, setShowResetModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showQuestProtocol, setShowQuestProtocol] = useState(false);
  const [showRecoveryProtocol, setShowRecoveryProtocol] = useState(false);
  const [showRankProgress, setShowRankProgress] = useState(false);
  const [questSort, setQuestSort] = useState<'TITLE' | 'REWARD' | 'DEADLINE'>('TITLE');

  const sortedQuests = [...state.quests].sort((a, b) => {
    if (questSort === 'TITLE') {
      return a.title.localeCompare(b.title);
    }
    if (questSort === 'REWARD') {
      // Primary sort by XP
      if (b.rewards.xp !== a.rewards.xp) {
        return b.rewards.xp - a.rewards.xp;
      }
      // Secondary sort by number of items
      const aItems = a.rewards.items?.length || 0;
      const bItems = b.rewards.items?.length || 0;
      return bItems - aItems;
    }
    if (questSort === 'DEADLINE') {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      const dateA = new Date(a.deadline);
      const dateB = new Date(b.deadline);
      return dateA.getTime() - dateB.getTime();
    }
    return 0;
  });

  // Check if reset is needed
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (state.lastResetDate !== today) {
      setShowResetModal(true);
    }
  }, [state.lastResetDate]);

  // Handle screen changes with glitch
  const navigate = (screen: Screen) => {
    triggerGlitch('high');
    setCurrentScreen(screen);
  };

  const getRankColor = (rank: Rank) => {
    switch (rank) {
      case 'S': return 'text-yellow-400 border-yellow-500/50';
      case 'A': return 'text-red-400 border-red-500/50';
      case 'B': return 'text-purple-400 border-purple-500/50';
      case 'C': return 'text-cyan-400 border-cyan-500/50';
      case 'D': return 'text-green-400 border-green-500/50';
      default: return 'text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className={cn(
      "relative min-h-screen w-full bg-system-bg text-slate-300 font-sans overflow-hidden transition-all duration-300",
      isGlitching && "glitch-active",
      state.penaltyActive && "border-4 border-red-500/20"
    )}>
      <AnimatePresence mode="wait">
        {isInitializing && (
          <SystemIntro 
            onComplete={() => {
              setIsInitializing(false);
              triggerGlitch('high');
            }} 
            playerName={state.player.name}
          />
        )}
      </AnimatePresence>

      <SystemOverlay />
      
      {/* Decorative HUD Elements - Simplified */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[7px] font-mono text-cyan-500/10 tracking-[1.5em] uppercase">
          Arise: The System Monitoring Active
        </div>
      </div>

      {/* Dramatic Overlays */}
      <AnimatePresence>
        {activeOverlay && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <div className={cn(
              "relative px-16 py-10 border-y-4 flex flex-col items-center",
              activeOverlay === 'PENALTY' ? "border-red-500 bg-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.3)]" : 
              activeOverlay === 'HEALED' ? "border-green-500 bg-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.3)]" :
              "border-cyan-500 bg-cyan-500/20 shadow-[0_0_50px_rgba(34,211,238,0.3)]"
            )}>
              <div className="absolute inset-0 scanlines opacity-50" />
              <motion.span 
                animate={{ opacity: [1, 0.4, 1], scale: [1, 1.02, 1] }}
                transition={{ duration: 0.15, repeat: Infinity }}
                className={cn(
                  "text-5xl font-mono font-black tracking-tighter uppercase hologram-glow-cyan",
                  activeOverlay === 'PENALTY' ? "text-red-500 hologram-glow-red" : 
                  activeOverlay === 'HEALED' ? "text-green-400 hologram-glow-green" :
                  "text-cyan-400"
                )}
              >
                {activeOverlay.replace('_', ' ')}
              </motion.span>
              <span className="text-xs font-mono tracking-[0.8em] text-white/80 mt-4 flicker">
                {activeOverlay === 'LEVEL_UP' ? "EVOLUTION PROTOCOL: INITIALIZED" : "SYSTEM AUTHORITY: GRANTED"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Reset Modal */}
      <AnimatePresence>
        {showResetModal && (
          <DailyResetModal 
            onComplete={(inputs) => {
              dailyReset(inputs);
              setShowResetModal(false);
            }} 
          />
        )}
      </AnimatePresence>

      {/* Player Card / Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <PlayerCardModal 
            player={state.player}
            onSave={(name, avatar) => {
              triggerGlitch('high');
              updateProfile(name, avatar);
              setShowProfileModal(false);
            }}
            onClose={() => {
              triggerGlitch('high');
              setShowProfileModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirmation && (
          <ResetConfirmationModal 
            onConfirm={() => {
              clearSystemData();
              setShowResetConfirmation(false);
              setShowProfileModal(false);
              setShowResetModal(false);
              navigate('STATUS');
            }}
            onCancel={() => {
              setShowResetConfirmation(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="pt-16 pb-24 px-4 h-screen overflow-y-auto custom-scrollbar relative z-10">
      <AnimatePresence>
        {showQuestProtocol && (
          <QuestProtocolModal onClose={() => {
            triggerGlitch('low');
            setShowQuestProtocol(false);
          }} />
        )}
      </AnimatePresence>

        <AnimatePresence>
          {showRecoveryProtocol && (
            <RecoveryProtocolModal 
              level={state.player.level} 
              onClose={() => {
                triggerGlitch('low');
                setShowRecoveryProtocol(false);
              }} 
              onAcknowledge={() => {
                triggerGlitch('low');
                setShowRecoveryProtocol(false);
                triggerOverlay('HEALED');
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRankProgress && (
            <RankProgressModal 
              rank={state.player.rank}
              level={state.player.level}
              onClose={() => {
                triggerGlitch('low');
                setShowRankProgress(false);
              }}
            />
          )}
        </AnimatePresence>

        <ProjectionTransition isVisible={currentScreen === 'STATUS'}>
          <div className="space-y-4">
            {/* Level & XP */}
            <HolographicPanel 
              title="Core Status" 
              showScanlines 
              onClick={() => {
                triggerGlitch('high');
                setShowProfileModal(true);
              }}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-3">
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="w-16 h-16 rounded-sm border border-cyan-500/30 bg-cyan-500/5 overflow-hidden shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                    {state.player.avatar ? (
                      <img src={state.player.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-cyan-500/10 text-cyan-400 font-mono text-2xl">
                        {(state.player.name || '??').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-[7px] font-mono tracking-tight uppercase whitespace-nowrap bg-black/40 px-1.5 py-0.5 rounded-sm border border-white/5">
                    <span className="text-cyan-400">Player-ID : </span>
                    <span className="text-white">{state.player.name}</span>
                  </div>
                </div>
                
                <div className="flex-1 w-full flex flex-row justify-between items-end sm:items-center gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-bold text-white tracking-tighter text-sharp leading-none">LVL {state.player.level}</span>
                      <span className={cn("px-1.5 py-0.5 border rounded-sm text-[8px] font-bold leading-none", getRankColor(state.player.rank))}>
                        {state.player.rank} RANK
                      </span>
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-cyan-500/50 uppercase text-sharp mt-1">{state.player.title}</span>
                  </div>
                  
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[7px] font-bold text-cyan-500/30 uppercase text-sharp mb-0.5">XP PROGRESS</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-bold text-cyan-400 text-sharp leading-none">{Math.floor((state.player.xp / state.player.xpToNext) * 100)}</span>
                      <span className="text-[10px] font-bold text-cyan-400/50">%</span>
                    </div>
                  </div>
                </div>
              </div>
              <ProgressBar value={state.player.xp} max={state.player.xpToNext} />
            </HolographicPanel>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <HolographicPanel title="Readiness" className="p-2">
                <div className="flex flex-col items-center py-1">
                  <Activity className="w-4 h-4 text-cyan-400 mb-1" />
                  <span className="text-xl font-bold text-white text-sharp">{state.player.readinessScore}%</span>
                  <span className="text-[7px] text-cyan-500/40 uppercase font-bold">Daily Sync</span>
                </div>
              </HolographicPanel>
              <HolographicPanel title="Fitness" className="p-2">
                <div className="flex flex-col items-center py-1">
                  <Flame className="w-4 h-4 text-orange-400 mb-1" />
                  <span className="text-xl font-bold text-white text-sharp">{Math.floor(state.player.fitnessScore)}</span>
                  <span className="text-[7px] text-orange-500/40 uppercase font-bold">Condition</span>
                </div>
              </HolographicPanel>
              <HolographicPanel title="Discipline" className="p-2">
                <div className="flex flex-col items-center py-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mb-1" />
                  <span className="text-xl font-bold text-white text-sharp">{state.player.disciplineScore}</span>
                  <span className="text-[7px] text-green-500/40 uppercase font-bold">Consistency</span>
                </div>
              </HolographicPanel>
            </div>

            {/* Vitality & Energy */}
            <div className="grid grid-cols-2 gap-4">
              <HolographicPanel title="Vitality" className="bg-red-500/[0.02] border-red-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-3 h-3 text-red-500/40" />
                  <span className="text-2xl font-bold text-white text-sharp">{state.player.vitality}%</span>
                </div>
                <ProgressBar value={state.player.vitality} max={100} color="bg-red-500" showSegments={false} />
              </HolographicPanel>
              <HolographicPanel title="Energy" className="bg-cyan-500/[0.02] border-cyan-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3 h-3 text-cyan-500/40" />
                  <span className="text-2xl font-bold text-white text-sharp">{state.player.energy}%</span>
                </div>
                <ProgressBar value={state.player.energy} max={100} color="bg-cyan-500" showSegments={false} />
              </HolographicPanel>
            </div>

            {/* Quick Quests */}
            <HolographicPanel title="Active Quests">
              <div className="space-y-2">
                {state.quests.filter(q => q.status === 'IN_PROGRESS').length > 0 ? (
                  state.quests.filter(q => q.status === 'IN_PROGRESS').map(quest => (
                    <div key={quest.id} className="p-2 border border-white/10 bg-white/5 rounded-sm flex justify-between items-center group active:bg-cyan-500/10 transition-colors cursor-pointer">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-cyan-500/50 uppercase text-sharp">{quest.type}</span>
                        <span className="text-xs font-bold tracking-tight text-white text-sharp">{quest.title}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-white/20 group-active:text-cyan-400" />
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center">
                    <span className="text-[10px] text-white/20 uppercase tracking-widest">All Quests Cleared</span>
                  </div>
                )}
              </div>
              <GlitchButton variant="ghost" size="sm" fullWidth className="mt-3" onClick={() => navigate('QUESTS')}>
                View All Missions
              </GlitchButton>
            </HolographicPanel>
          </div>
        </ProjectionTransition>

        <ProjectionTransition isVisible={currentScreen === 'QUESTS'}>
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-white uppercase tracking-tighter text-sharp">Quest Log</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-sm p-1">
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  <select 
                    value={questSort}
                    onChange={(e) => setQuestSort(e.target.value as any)}
                    className="bg-transparent text-[8px] font-bold text-white uppercase outline-none cursor-pointer"
                  >
                    <option value="TITLE" className="bg-system-bg">Title</option>
                    <option value="REWARD" className="bg-system-bg">Reward</option>
                    <option value="DEADLINE" className="bg-system-bg">Deadline</option>
                  </select>
                </div>
                <div className="px-2 py-1 bg-cyan-500/15 border border-cyan-500/30 rounded-sm text-[9px] font-bold text-cyan-400 text-sharp">
                  {state.quests.filter(q => q.status === 'IN_PROGRESS').length} ACTIVE
                </div>
              </div>
            </div>

            {sortedQuests.map(quest => (
              <HolographicPanel 
                key={quest.id} 
                title={quest.type} 
                accent={quest.type === 'URGENT' || quest.type === 'PENALTY' ? 'red' : 'cyan'}
                className={cn(
                  "p-2",
                  quest.status === 'COMPLETED' && "opacity-20 grayscale",
                  quest.type === 'URGENT' && "border-red-500/30 shadow-red-950/50"
                )}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-bold tracking-tight text-white uppercase text-sharp">{quest.title}</h3>
                    {quest.status === 'COMPLETED' && <Trophy className="w-3 h-3 text-yellow-500/50" />}
                  </div>
                  <p className="text-[10px] text-white/70 leading-tight">{quest.description}</p>
                  
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] text-white/70">{quest.status === 'COMPLETED' ? 'COMPLETED' : 'CURRENT OBJECTIVE'}</p>
                    <span className="text-[10px] font-mono font-bold text-cyan-400">
                      {quest.progress} / {quest.target} {quest.title.includes('RUNNING') ? 'KM' : 'REPS'}
                    </span>
                  </div>
                  <ProgressBar 
                    value={quest.progress} 
                    max={quest.target} 
                    color={quest.type === 'URGENT' ? 'bg-red-500' : 'bg-cyan-500'} 
                  />

                  <div className="flex justify-between items-center pt-1">
                    <div className="flex gap-2">
                      <div className="text-[9px] font-bold text-cyan-500/60 text-sharp">XP +{quest.rewards.xp}</div>
                      <div className="text-[9px] font-bold text-cyan-500/60 text-sharp">PTS +{quest.rewards.points}</div>
                    </div>
                    {quest.status === 'IN_PROGRESS' && (
                      <div className="flex gap-2">
                        {state.player.rank === 'S' && (
                          <GlitchButton 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 py-0 text-[8px]" 
                            onClick={() => updateQuestProgress(quest.id, Math.ceil(quest.target / 10))}
                          >
                            +10
                          </GlitchButton>
                        )}
                        <GlitchButton size="sm" className="h-6 px-3 py-0 text-[10px]" onClick={() => completeQuest(quest.id)}>
                          Claim
                        </GlitchButton>
                      </div>
                    )}
                  </div>
                </div>
              </HolographicPanel>
            ))}
          </div>
        </ProjectionTransition>

        <ProjectionTransition isVisible={currentScreen === 'ATTRIBUTES'}>
          <div className="space-y-4">
            <HolographicPanel title="Attribute Matrix" showScanlines>
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white uppercase tracking-tighter text-sharp">Matrix Sync</span>
                  <span className="text-[9px] font-bold text-cyan-500/40 uppercase text-sharp">System Analysis Active</span>
                </div>
                <div className="w-8 h-8 rounded-full border border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center">
                  <Target className="w-4 h-4 text-cyan-400/60" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {(Object.entries(state.attributes || {}) as [string, Attribute][]).map(([key, attr]) => (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider text-sharp">{attr.name}</span>
                        <span className="text-sm font-bold text-cyan-400 text-sharp">{Math.round(attr.value || 0)}</span>
                      </div>
                      <ProgressBar value={Math.round(attr.value || 0)} max={100} showSegments={false} />
                    </div>
                  </div>
                ))}
              </div>
            </HolographicPanel>

            <HolographicPanel title="Growth Radar">
              <div className="h-64 w-full flex items-center justify-center">
                {state.attributes && Object.keys(state.attributes).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={(Object.values(state.attributes || {}) as Attribute[]).map(a => ({ 
                      subject: a?.name || 'Unknown', 
                      A: Math.round(a?.value || 0), 
                      fullMark: 100 
                    }))}>
                      <PolarGrid stroke="rgba(34, 211, 238, 0.2)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(34, 211, 238, 0.6)', fontSize: 10 }} />
                      <Radar
                        name="Player"
                        dataKey="A"
                        stroke="#22d3ee"
                        fill="#22d3ee"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-[10px] font-mono text-cyan-500/20 uppercase text-center border border-dashed border-cyan-500/10 w-full h-full flex items-center justify-center rounded-sm">
                    Initializing Matrix...
                  </div>
                )}
              </div>
            </HolographicPanel>
          </div>
        </ProjectionTransition>

        <ProjectionTransition isVisible={currentScreen === 'ANALYTICS'}>
          <div className="space-y-4">
            <HolographicPanel title="Performance Data" showScanlines>
              <div className="space-y-6">
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-cyan-400/80 uppercase mb-2">Readiness History</span>
                  <div className="h-48 w-full flex items-center justify-center">
                    {state.journey && state.journey.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={state.journey.slice().reverse()}>
                          <defs>
                            <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} axisLine={false} tickLine={false} />
                          <YAxis hide domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(34, 211, 238, 0.2)', fontSize: '10px' }}
                            itemStyle={{ color: '#22d3ee' }}
                          />
                          <Area type="monotone" dataKey="readiness" stroke="#22d3ee" fillOpacity={1} fill="url(#colorReadiness)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-[10px] font-mono text-cyan-500/20 uppercase text-center border border-dashed border-cyan-500/10 w-full h-full flex items-center justify-center rounded-sm">
                        No performance data logged
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 border border-white/5 bg-white/5 rounded-sm">
                    <span className="text-[8px] font-mono text-cyan-500/40 uppercase block mb-1">Avg Readiness</span>
                    <span className="text-lg font-mono font-bold text-cyan-400 hologram-glow-cyan">
                      {(state.journey?.length || 0) > 0 
                        ? Math.floor(state.journey.reduce((acc, curr) => acc + (curr?.readiness || 0), 0) / state.journey.length) 
                        : 0}%
                    </span>
                  </div>
                  <div className="p-2 border border-white/5 bg-white/5 rounded-sm">
                    <span className="text-[8px] font-mono text-cyan-500/40 uppercase block mb-1">Current Streak</span>
                    <span className="text-lg font-mono font-bold text-cyan-400 hologram-glow-cyan">{state.player.streakCount} DAYS</span>
                  </div>
                </div>
              </div>
            </HolographicPanel>

            <HolographicPanel title="System Logs" showScanlines className="h-64 overflow-y-auto custom-scrollbar">
              <div className="space-y-2 font-mono text-[9px]">
                {state.logs.map((log, i) => (
                  <div key={i} className="flex gap-2 items-start border-l border-cyan-500/20 pl-2 py-0.5">
                    <span className="text-cyan-500/30 shrink-0">[{format(new Date(), 'HH:mm')}]</span>
                    <span className="opacity-70">{log}</span>
                  </div>
                ))}
              </div>
            </HolographicPanel>
          </div>
        </ProjectionTransition>

        <ProjectionTransition isVisible={currentScreen === 'INVENTORY'}>
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-mono font-bold text-cyan-400 uppercase tracking-tighter hologram-glow-cyan">Inventory</h2>
              <div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-sm text-[10px] font-mono text-cyan-400">
                {state.inventory.length} ITEMS
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {state.inventory.map(item => (
                <HolographicPanel 
                  key={item.id} 
                  title={item.rarity}
                  className={cn(
                    "p-2",
                    item.rarity === 'COMMON' && "border-slate-500/10",
                    item.rarity === 'RARE' && "border-cyan-500/30 shadow-cyan-500/5",
                    item.rarity === 'EPIC' && "border-purple-500/30 shadow-purple-500/5",
                    item.rarity === 'LEGENDARY' && "border-yellow-500/30 shadow-yellow-500/5"
                  )}
                >
                  <div className="space-y-1">
                    <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-sm flex items-center justify-center mx-auto mb-1">
                      <Package className={cn(
                        "w-5 h-5",
                        item.rarity === 'COMMON' && "text-slate-500",
                        item.rarity === 'RARE' && "text-cyan-500",
                        item.rarity === 'EPIC' && "text-purple-500",
                        item.rarity === 'LEGENDARY' && "text-yellow-500"
                      )} />
                    </div>
                    <h3 className="text-[8px] font-bold text-white uppercase text-center truncate">{item.name}</h3>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[9px] font-mono text-cyan-400/60">x{item.count}</span>
                      <button 
                        onClick={() => {
                          useItem(item.id);
                          if (item.name.toUpperCase().includes('RECOVERY')) {
                            setShowRecoveryProtocol(true);
                          }
                        }}
                        className="text-[8px] font-bold text-cyan-400 hover:text-white transition-colors"
                      >
                        USE
                      </button>
                    </div>
                  </div>
                </HolographicPanel>
              ))}
            </div>
          </div>
        </ProjectionTransition>

        <ProjectionTransition isVisible={currentScreen === 'RANK'}>
          <div className="space-y-4">
            <HolographicPanel title="Rank Journey" showScanlines>
              <div className="relative py-4">
                {/* Vertical Line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-cyan-500/10" />
                
                <div className="space-y-6">
                  {[
                    { rank: 'S', label: 'THE SOVEREIGN', criteria: 'LVL 101+' },
                    { rank: 'A', label: 'THE COMMANDER', criteria: 'LVL 81 - 100' },
                    { rank: 'B', label: 'THE VETERAN', criteria: 'LVL 61 - 80' },
                    { rank: 'C', label: 'THE AWAKENED', criteria: 'LVL 41 - 60' },
                    { rank: 'D', label: 'THE NOVICE', criteria: 'LVL 21 - 40' },
                    { rank: 'E', label: 'THE UNKNOWN', criteria: 'LVL 1 - 20' },
                  ].map((step, i) => {
                    const isCurrent = state.player.rank === step.rank;
                    const ranks = ['E', 'D', 'C', 'B', 'A', 'S'];
                    const isCompleted = ranks.indexOf(state.player.rank) > ranks.indexOf(step.rank as Rank);
                    const isLocked = ranks.indexOf(state.player.rank) < ranks.indexOf(step.rank as Rank);

                    return (
                      <div key={i} className="relative pl-10">
                        <div className={cn(
                          "absolute left-3 top-1 w-2.5 h-2.5 rounded-full border-2 -translate-x-1/2 z-10",
                          isCurrent ? "bg-cyan-500 border-white animate-pulse" : 
                          isCompleted ? "bg-cyan-500/30 border-cyan-500/50" : 
                          "bg-system-bg border-white/10"
                        )} />
                        
                        <div 
                          className={cn(
                            "p-2 border rounded-sm transition-all relative overflow-hidden",
                            isCurrent ? "border-cyan-500/40 bg-cyan-500/5 shadow-[0_0_10px_rgba(34,211,238,0.1)] cursor-pointer hover:bg-cyan-500/10" :
                            isCompleted ? "border-white/5 bg-white/5 opacity-50" :
                            "border-white/5 bg-transparent opacity-20"
                          )}
                          onClick={() => isCurrent && setShowRankProgress(true)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-mono font-bold text-white tracking-widest">{step.rank} RANK</span>
                              <span className="text-[8px] font-mono text-cyan-500/40 uppercase">{step.label}</span>
                              <span className="text-[7px] font-mono text-white/20 mt-1">{step.criteria}</span>
                            </div>
                            {isLocked && <Lock className="w-3 h-3 text-white/10" />}
                            {isCurrent && <ChevronRight className="w-3 h-3 text-cyan-400" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </HolographicPanel>

            <HolographicPanel title="System Control" accent={state.penaltyActive ? 'red' : 'cyan'}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-white/60 uppercase">Protocol Status</span>
                  <span className={cn(
                    "text-[10px] font-mono",
                    state.penaltyActive ? "text-red-500 hologram-glow-red" : "text-cyan-400 hologram-glow-cyan"
                  )}>
                    {state.penaltyActive ? "RESTRICTED" : "OPTIMAL"}
                  </span>
                </div>
                <div className="pt-4 space-y-2">
                  <GlitchButton 
                    variant={state.penaltyActive ? "danger" : "ghost"} 
                    fullWidth 
                    onClick={() => {
                      setShowResetModal(true);
                    }}
                  >
                    {state.penaltyActive ? "INITIATE RESTORATION" : "MANUAL SYSTEM SYNC"}
                  </GlitchButton>
                  <GlitchButton variant="ghost" fullWidth onClick={() => navigate('LOGS')}>
                    Access System Logs
                  </GlitchButton>
                  <GlitchButton variant="ghost" fullWidth onClick={() => {
                    triggerGlitch('low');
                    setShowQuestProtocol(true);
                  }}>
                    Quest System Protocol
                  </GlitchButton>
                </div>
              </div>
            </HolographicPanel>
          </div>
        </ProjectionTransition>

        <ProjectionTransition isVisible={currentScreen === 'DEBUG'}>
          <div className="space-y-4">
            <HolographicPanel title="System Debug Console" showScanlines>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-cyan-500/60 uppercase">Load Demo Profile</span>
                    <div className="grid grid-cols-1 gap-2">
                      <GlitchButton variant="ghost" size="sm" onClick={() => seedDemoData('BEGINNER')}>Beginner</GlitchButton>
                      <GlitchButton variant="ghost" size="sm" onClick={() => seedDemoData('RECOVERING')}>Recovering</GlitchButton>
                      <GlitchButton variant="ghost" size="sm" onClick={() => seedDemoData('ELITE')}>Elite</GlitchButton>
                      <GlitchButton variant="danger" size="sm" onClick={() => seedDemoData('PENALTY')}>Penalty State</GlitchButton>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-cyan-500/60 uppercase">System Metrics</span>
                    <div className="space-y-1 text-[9px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-white/40">Rank Eval:</span>
                        <span className="text-cyan-400">{debugInfo.rankEvaluation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Readiness Cat:</span>
                        <span className="text-cyan-400">{debugInfo.readinessCategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Fitness Score:</span>
                        <span className="text-cyan-400">{state.player.fitnessScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Streak:</span>
                        <span className="text-cyan-400">{state.player.streakCount}</span>
                      </div>
                    </div>
                    <div className="pt-4">
                      <GlitchButton variant="danger" fullWidth size="sm" onClick={() => {
                        setShowResetConfirmation(true);
                      }}>
                        WIPE SYSTEM DATA
                      </GlitchButton>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-cyan-500/60 uppercase">Raw State Data</span>
                  <div className="p-2 bg-black/40 border border-white/5 rounded-sm h-48 overflow-y-auto custom-scrollbar">
                    <pre className="text-[8px] text-cyan-500/80 leading-tight">
                      {JSON.stringify(state, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </HolographicPanel>
            <GlitchButton variant="primary" fullWidth onClick={() => navigate('STATUS')}>
              Exit Debug Mode
            </GlitchButton>
          </div>
        </ProjectionTransition>

        <ProjectionTransition isVisible={currentScreen === 'LOGS'}>
          <div className="space-y-4">
            <HolographicPanel title="System Logs" showScanlines className="h-[calc(100vh-250px)]">
              <div className="space-y-4 font-mono text-[10px]">
                {state.logs.map((log, i) => (
                  <div key={i} className="flex gap-3 items-start border-l border-cyan-500/20 pl-3 py-1">
                    <span className="text-cyan-500/40 shrink-0">[{format(new Date(), 'HH:mm:ss')}]</span>
                    <span className="opacity-80 leading-relaxed">{log}</span>
                  </div>
                ))}
              </div>
            </HolographicPanel>
            <GlitchButton variant="ghost" fullWidth onClick={triggerGlitch}>
              Refresh System Cache
            </GlitchButton>
            <GlitchButton variant="danger" fullWidth onClick={() => {
              setShowResetConfirmation(true);
            }}>
              RESET SYSTEM DATA
            </GlitchButton>
          </div>
        </ProjectionTransition>
      </main>

      {/* Bottom Tactical Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 px-4 py-2 border-t border-white/5 bg-system-bg/98 backdrop-blur-xl">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <NavButton active={currentScreen === 'STATUS'} onClick={() => navigate('STATUS')} icon={<User />} label="Status" />
          <NavButton active={currentScreen === 'QUESTS'} onClick={() => navigate('QUESTS')} icon={<Target />} label="Quests" />
          <NavButton active={currentScreen === 'ATTRIBUTES'} onClick={() => navigate('ATTRIBUTES')} icon={<Shield />} label="Matrix" />
          <NavButton active={currentScreen === 'ANALYTICS'} onClick={() => navigate('ANALYTICS')} icon={<BarChart3 />} label="Data" />
          <NavButton active={currentScreen === 'INVENTORY'} onClick={() => navigate('INVENTORY')} icon={<Package />} label="Items" />
          <NavButton active={currentScreen === 'RANK' || currentScreen === 'LOGS'} onClick={() => navigate('RANK')} icon={<Settings />} label="System" />
        </div>
      </nav>

      {/* Global CSS for custom scrollbar and other tweaks */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.2); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.4); }
      `}} />
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300 relative",
        active ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
      )}
    >
      <div className={cn(
        "w-7 h-7 flex items-center justify-center rounded-sm border transition-all",
        active ? "border-cyan-500/30 bg-cyan-500/5" : "border-transparent"
      )}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
      </div>
      <span className="text-[8px] font-bold uppercase tracking-tight text-sharp">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-active"
          className="absolute -bottom-1 w-3 h-0.5 bg-cyan-500 shadow-[0_0_5px_#22d3ee]"
        />
      )}
    </button>
  );
}

function ResetConfirmationModal({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
    >
      <GlitchProjection className="w-full max-w-sm">
        <HolographicPanel title="CRITICAL SYSTEM OVERRIDE" className="p-6 space-y-6 border-red-500/30">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-xl font-bold uppercase tracking-tighter text-sharp">Wipe Protocol</h2>
            </div>
            <p className="text-[10px] text-red-500/60 uppercase tracking-widest leading-relaxed">
              Warning: This action will permanently delete all player progress, levels, ranks, and logs. This cannot be undone.
            </p>
          </div>

          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-sm space-y-3">
            <p className="text-xs font-mono text-red-400/80 leading-relaxed">
              Are you sure you want to reset all player data and restore system defaults?
            </p>
          </div>

          <div className="flex gap-3">
            <GlitchButton variant="ghost" className="flex-1" onClick={onCancel}>
              CANCEL
            </GlitchButton>
            <GlitchButton variant="danger" className="flex-1" onClick={onConfirm}>
              RESET DATA
            </GlitchButton>
          </div>
        </HolographicPanel>
      </GlitchProjection>
    </motion.div>
  );
}

function DailyResetModal({ onComplete }: { onComplete: (inputs: any) => void }) {
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [fatigue, setFatigue] = useState(3);
  const [yesterdayLoad, setYesterdayLoad] = useState(5);
  const [recovery, setRecovery] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
    >
      <GlitchProjection className="w-full max-w-sm">
        <HolographicPanel title="DAILY SYSTEM SYNC" className="p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter text-sharp">Readiness Input</h2>
            <p className="text-[10px] text-cyan-500/60 uppercase tracking-widest">Calibrating daily parameters...</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/60 uppercase flex items-center gap-2">
                  <Moon className="w-3 h-3" /> Sleep Duration
                </span>
                <span className="text-sm font-bold text-cyan-400">{sleep}h</span>
              </div>
              <input 
                type="range" min="4" max="12" step="0.5" value={sleep} 
                onChange={(e) => setSleep(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/60 uppercase flex items-center gap-2">
                  <Battery className="w-3 h-3" /> Energy Level
                </span>
                <span className="text-sm font-bold text-cyan-400">{energy}/10</span>
              </div>
              <input 
                type="range" min="1" max="10" step="1" value={energy} 
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/60 uppercase flex items-center gap-2">
                  <Flame className="w-3 h-3" /> Fatigue/Soreness
                </span>
                <span className="text-sm font-bold text-red-400">{fatigue}/10</span>
              </div>
              <input 
                type="range" min="1" max="10" step="1" value={fatigue} 
                onChange={(e) => setFatigue(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/60 uppercase flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Yesterday Load
                </span>
                <span className="text-sm font-bold text-cyan-400">{yesterdayLoad}/10</span>
              </div>
              <input 
                type="range" min="1" max="10" step="1" value={yesterdayLoad} 
                onChange={(e) => setYesterdayLoad(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-white/5 bg-white/5 rounded-sm">
              <span className="text-[10px] font-bold text-white/60 uppercase">Recovery Actions Performed?</span>
              <button 
                onClick={() => {
                  setRecovery(!recovery);
                }}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative",
                  recovery ? "bg-cyan-500" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                  recovery ? "left-6" : "left-1"
                )} />
              </button>
            </div>
          </div>

          <GlitchButton fullWidth onClick={() => onComplete({ sleep, energy, fatigue, yesterdayLoad, recovery })}>
            Initialize Daily Protocol
          </GlitchButton>
        </HolographicPanel>
      </GlitchProjection>
    </motion.div>
  );
}

function PlayerCardModal({ player, onSave, onClose }: { player: PlayerStats, onSave: (name: string, avatar: string) => void, onClose: () => void }) {
  const [name, setName] = useState(player.name);
  const [avatar, setAvatar] = useState(player.avatar || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('System Designation Required');
      return;
    }
    onSave(name.trim(), avatar);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit to 1MB to avoid localStorage issues
      if (file.size > 1024 * 1024) {
        setError('Image too large (Max 1MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
    >
      <GlitchProjection className="max-w-md w-full relative">
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <HolographicPanel title="PLAYER IDENTITY CARD" showScanlines>
          <div className="space-y-6">
            {/* Profile Preview */}
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-sm border-2 border-cyan-500/30 bg-cyan-500/5 p-1 overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  {avatar ? (
                    <img src={avatar} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-cyan-500/10 text-cyan-400 font-mono text-3xl">
                      {(name || '??').substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-cyan-400" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              
              <div className="text-center">
                <div className="text-[8px] font-mono text-cyan-500/50 uppercase tracking-[0.3em]">Current Status</div>
                <div className="text-xl font-black text-white tracking-tight uppercase">{name || 'UNDEFINED'}</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 border border-cyan-500/30 bg-cyan-500/10">{player.rank} RANK</span>
                  <span className="text-[10px] font-mono text-white/60">LVL {player.level}</span>
                </div>
                <div className="text-[8px] font-mono text-white/20 mt-2 tracking-widest uppercase">ID: {player.id}</div>
              </div>
            </div>

            {/* Edit Fields */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">System Designation</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter Name..."
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                {error && <p className="text-[8px] font-mono text-red-500 uppercase mt-1">{error}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">Identity Matrix (Image)</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 text-[10px] font-mono text-cyan-400 hover:bg-cyan-500/20 transition-all">
                      <Camera className="w-3 h-3" />
                      UPLOAD IMAGE
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  {avatar && (
                    <button 
                      onClick={() => setAvatar('')}
                      className="px-3 py-2 text-[10px] font-mono text-red-400 border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-all"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <GlitchButton variant="ghost" fullWidth onClick={onClose}>
                CANCEL
              </GlitchButton>
              <GlitchButton variant="primary" fullWidth onClick={handleSave}>
                SAVE CHANGES
              </GlitchButton>
            </div>
          </div>
        </HolographicPanel>
      </GlitchProjection>
    </motion.div>
  );
}

function QuestProtocolModal({ onClose }: { onClose: () => void }) {
  const questData = [
    { rank: 'E', lvl: '1', push: '5', sit: '5', sq: '5', run: '1K' },
    { rank: 'D', lvl: '21', push: '24', sit: '24', sq: '24', run: '2K' },
    { rank: 'C', lvl: '41', push: '43', sit: '43', sq: '43', run: '4K' },
    { rank: 'B', lvl: '61', push: '62', sit: '62', sq: '62', run: '6K' },
    { rank: 'A', lvl: '81', push: '81', sit: '81', sq: '81', run: '8K' },
    { rank: 'S', lvl: '100+', push: '100', sit: '100', sq: '100', run: '10K' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <GlitchProjection className="w-full max-w-md">
        <HolographicPanel title="QUEST SYSTEM PROTOCOL" className="p-6 bg-slate-900/50" showScanlines>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-tighter">Mission Parameter Matrix</span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[10px] font-mono text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2 px-1 text-cyan-500/60 uppercase">Rank</th>
                    <th className="py-2 px-1 text-cyan-500/60 uppercase">Lvl</th>
                    <th className="py-2 px-1 text-cyan-500/60 uppercase text-center">Push/Sit/Sq</th>
                    <th className="py-2 px-1 text-cyan-500/60 uppercase text-right">Run</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {questData.map((row) => (
                    <tr key={row.rank} className="hover:bg-cyan-500/5 transition-colors">
                      <td className="py-2 px-1 font-bold text-white">{row.rank} Rank</td>
                      <td className="py-2 px-1 text-white/60">{row.lvl}</td>
                      <td className="py-2 px-1 text-center font-bold text-cyan-400 hologram-glow-cyan">{row.push}</td>
                      <td className="py-2 px-1 text-right font-bold text-yellow-500">{row.run}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest leading-relaxed">
              * Objective targets scale linearly between rank thresholds. 
              Individual readiness scores apply a ±20% protocol adjustment.
            </p>

            <GlitchButton fullWidth onClick={onClose} className="mt-4">
              CLOSE INTERFACE
            </GlitchButton>
          </div>
        </HolographicPanel>
      </GlitchProjection>
    </motion.div>
  );
}

function RecoveryProtocolModal({ level, onClose, onAcknowledge }: { level: number; onClose: () => void; onAcknowledge: () => void }) {
  const getProtocol = (lvl: number) => {
    // ... logic remains same
    if (lvl <= 20) return { 
      food: "Standard Nutrition: Lean Protein, Brown Rice, Steamed Greens.", 
      rest: "8 Hours Optimized Sleep Cycle.",
      accent: "text-green-400"
    };
    if (lvl <= 40) return { 
      food: "Enhanced Bio-Fuel: Chicken Breast, Sweet Potato, Omega-3 Supplements.", 
      rest: "7.5 Hours Rest + 20min Tactical Nap.",
      accent: "text-cyan-400"
    };
    if (lvl <= 60) return { 
      food: "Advanced Metabolic Kit: Grass-fed Beef, Complex Carbs, BCAAs.", 
      rest: "7 Hours Deep Sleep + Post-Workout Bio-Sync.",
      accent: "text-blue-400"
    };
    if (lvl <= 80) return { 
      food: "Elite Performance Matrix: Nutrient-Dense Superfoods, Electrolyte Infusion.", 
      rest: "6.5 Hours Compressed Rest Protocol.",
      accent: "text-purple-400"
    };
    return { 
      food: "Sovereign Essence Protocol: Strategic Synthesized Macronutrients.", 
      rest: "5 Hours Hyper-Recovery Meditation.",
      accent: "text-yellow-400"
    };
  };

  const protocol = getProtocol(level);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <GlitchProjection className="w-full max-w-sm">
        <HolographicPanel title="RECOVERY PROTOCOL ANALYST" className="p-6 bg-slate-900/50" showScanlines accent="cyan">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-white uppercase tracking-tighter">Bio-Metric Optimization</span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">Recommended Nutritional Intake</span>
                <p className={cn("text-xs font-mono font-bold leading-relaxed", protocol.accent)}>
                  {protocol.food}
                </p>
              </div>

              <div className="space-y-1 py-2 border-y border-white/5">
                <span className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">Restoration Schedule</span>
                <p className="text-xs font-mono text-white/80 font-bold">
                  {protocol.rest}
                </p>
              </div>

              <div className="bg-cyan-500/5 p-3 border border-cyan-500/10 rounded-sm">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span className="text-[9px] font-bold text-cyan-400 uppercase">System Status</span>
                </div>
                <p className="text-[10px] text-white/60 font-mono italic">
                  "Optimal recovery detected. Vitality levels recalibrating to the current host level ({level}). Proceed with designated rest protocols."
                </p>
              </div>
            </div>

            <GlitchButton fullWidth onClick={onAcknowledge} className="mt-2">
              ACKNOWLEDGE PROTOCOL
            </GlitchButton>
          </div>
        </HolographicPanel>
      </GlitchProjection>
    </motion.div>
  );
}

function RankProgressModal({ rank, level, onClose }: { rank: Rank; level: number; onClose: () => void }) {
  const thresholds: Record<Rank, { min: number; next: number; title: string }> = {
    'E': { min: 1, next: 21, title: 'Ascension to D-Rank' },
    'D': { min: 21, next: 41, title: 'Ascension to C-Rank' },
    'C': { min: 41, next: 61, title: 'Ascension to B-Rank' },
    'B': { min: 61, next: 81, title: 'Ascension to A-Rank' },
    'A': { min: 81, next: 101, title: 'Ascension to S-Rank' },
    'S': { min: 101, next: 101, title: 'Sovereign Status' }
  };

  const current = thresholds[rank];
  const progress = rank === 'S' || level >= current.next ? 100 : Math.min(100, Math.max(0, ((level - current.min) / (current.next - current.min)) * 100));
  const levelsLeft = Math.max(0, current.next - level);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <GlitchProjection className="w-full max-w-sm">
        <HolographicPanel title="RANK ASCENSION TRACKER" className="p-6 bg-slate-900/50" showScanlines accent="cyan">
          <div className="space-y-6">
             <div className="text-center space-y-2">
               <span className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">{current.title}</span>
               <div className="text-4xl font-bold text-white tracking-tighter text-sharp">
                 {rank === 'S' ? 'MAX' : `${Math.floor(progress)}%`}
               </div>
             </div>

             <div className="space-y-2">
               <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase">
                 <span>Current: LVL {level}</span>
                 <span>Target: LVL {current.next}</span>
               </div>
               <ProgressBar value={progress} max={100} color="cyan" />
             </div>

             <div className="bg-cyan-500/5 p-4 border border-cyan-500/10 rounded-sm space-y-3">
               <div className="flex items-center gap-2">
                 <Target className="w-3 h-3 text-cyan-400" />
                 <span className="text-[10px] font-bold text-cyan-400 uppercase">Requirement Analysis</span>
               </div>
               <p className="text-[10px] text-white/80 font-mono leading-relaxed">
                 {rank === 'S' ? 
                   "Host has attained Sovereign Status. No further rank ascension parameters identified." :
                   `System requires ${levelsLeft} more level gain${levelsLeft !== 1 ? 's' : ''} to initialize the rank re-evaluation protocol.`
                 }
               </p>
             </div>

             <GlitchButton fullWidth onClick={onClose}>
               RETURN TO COMMAND
             </GlitchButton>
          </div>
        </HolographicPanel>
      </GlitchProjection>
    </motion.div>
  );
}
