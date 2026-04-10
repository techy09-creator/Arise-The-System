import { useState, useCallback } from 'react';

export function useSound() {
  const [isMuted] = useState(true);

  const toggleMute = useCallback(() => {
    return true;
  }, []);

  const playCardOpen = useCallback(() => {}, []);
  const playCardClose = useCallback(() => {}, []);
  const playTabSwitch = useCallback(() => {}, []);
  const playQuestCleared = useCallback(() => {}, []);
  const playPenalty = useCallback(() => {}, []);

  return {
    isMuted,
    toggleMute,
    playCardOpen,
    playCardClose,
    playTabSwitch,
    playQuestCleared,
    playPenalty
  };
}
