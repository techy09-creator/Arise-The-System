/**
 * ARISE: THE SYSTEM - Audio Management Service
 * Handles premium sound design, preloading, and synthesized system sounds.
 */

export type SoundCategory = 'INTRO' | 'UI' | 'REWARDS' | 'SYSTEM' | 'GLITCH';

export interface SoundEffect {
  id: string;
  category: SoundCategory;
  url?: string;
  volume?: number;
  pitch?: number;
}

class AudioService {
  private isMuted: boolean = true;

  constructor() {
    // Audio disabled
  }

  private initContext() {
    // No-op
  }

  public toggleMute() {
    return true;
  }

  public getMuteState() {
    return true;
  }

  public playCardOpen() {}
  public playCardClose() {}
  public playTabSwitch() {}
  public playQuestCleared() {}
  public playPenalty() {}
}

export const audioService = new AudioService();
