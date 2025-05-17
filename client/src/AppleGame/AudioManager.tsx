import { useEffect, useRef } from 'react';
import { useAudio } from '@/lib/stores/useAudio';

interface AudioData {
  count1: HTMLAudioElement | null;
  count2: HTMLAudioElement | null;
  count3: HTMLAudioElement | null;
  count4: HTMLAudioElement | null;
  count5: HTMLAudioElement | null;
  count6: HTMLAudioElement | null;
  count7: HTMLAudioElement | null;
  count8: HTMLAudioElement | null;
  count9: HTMLAudioElement | null;
  count10: HTMLAudioElement | null;
  correct: HTMLAudioElement | null;
  wrong: HTMLAudioElement | null;
}

interface AudioManagerProps {
  currentCount: number;
  isCorrectAnswer?: boolean;
  isWrongAnswer?: boolean;
}

// Component to handle all audio playback in the game
const AudioManager: React.FC<AudioManagerProps> = ({ 
  currentCount, 
  isCorrectAnswer = false,
  isWrongAnswer = false
}) => {
  const audioRef = useRef<AudioData>({
    count1: null,
    count2: null,
    count3: null,
    count4: null,
    count5: null,
    count6: null,
    count7: null,
    count8: null,
    count9: null,
    count10: null,
    correct: null,
    wrong: null
  });
  
  const { isMuted } = useAudio();
  const lastPlayedCountRef = useRef<number>(0);
  
  // Load audio objects on component mount
  useEffect(() => {
    // In a real application, we would load actual voice recordings
    // Here we're simulating with existing sounds
    const createAudio = (src: string): HTMLAudioElement => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      return audio;
    };
    
    // Setup number counting audio
    audioRef.current = {
      count1: createAudio('/sounds/hit.mp3'),
      count2: createAudio('/sounds/hit.mp3'),
      count3: createAudio('/sounds/hit.mp3'),
      count4: createAudio('/sounds/hit.mp3'),
      count5: createAudio('/sounds/hit.mp3'),
      count6: createAudio('/sounds/hit.mp3'),
      count7: createAudio('/sounds/hit.mp3'),
      count8: createAudio('/sounds/hit.mp3'),
      count9: createAudio('/sounds/hit.mp3'),
      count10: createAudio('/sounds/hit.mp3'),
      correct: createAudio('/sounds/success.mp3'),
      wrong: createAudio('/sounds/hit.mp3'),
    };
    
    // Clean up on unmount
    return () => {
      Object.values(audioRef.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);
  
  // Play counting sounds when the count changes
  useEffect(() => {
    if (isMuted) return;
    
    if (currentCount > 0 && currentCount <= 10 && currentCount !== lastPlayedCountRef.current) {
      const countAudio = audioRef.current[`count${currentCount}` as keyof AudioData];
      if (countAudio) {
        countAudio.currentTime = 0;
        countAudio.play().catch(err => console.error('Audio play error:', err));
        lastPlayedCountRef.current = currentCount;
      }
    }
  }, [currentCount, isMuted]);
  
  // Play feedback sounds for correct/wrong answers
  useEffect(() => {
    if (isMuted) return;
    
    if (isCorrectAnswer && audioRef.current.correct) {
      audioRef.current.correct.currentTime = 0;
      audioRef.current.correct.play().catch(err => console.error('Audio play error:', err));
    } else if (isWrongAnswer && audioRef.current.wrong) {
      audioRef.current.wrong.currentTime = 0;
      audioRef.current.wrong.play().catch(err => console.error('Audio play error:', err));
    }
  }, [isCorrectAnswer, isWrongAnswer, isMuted]);
  
  // This component doesn't render anything, it just manages audio
  return null;
};

export default AudioManager;
