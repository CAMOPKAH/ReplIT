import { useEffect, useRef } from 'react';
import { useAudio } from '@/lib/stores/useAudio';

interface AudioManagerProps {
  currentCount: number;
  isCorrectAnswer?: boolean;
  isWrongAnswer?: boolean;
  message?: string;
}

// Component to handle all audio playback in the game using Speech Synthesis
const AudioManager: React.FC<AudioManagerProps> = ({ 
  currentCount, 
  isCorrectAnswer = false,
  isWrongAnswer = false,
  message
}) => {
  const { isMuted } = useAudio();
  const lastPlayedCountRef = useRef<number>(0);
  const synth = useRef<SpeechSynthesis | null>(null);
  const voices = useRef<SpeechSynthesisVoice[]>([]);
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synth.current = window.speechSynthesis;
      
      // Load available voices
      const loadVoices = () => {
        const availableVoices = synth.current?.getVoices() || [];
        
        // Find Russian voice for the counting
        const russianVoice = availableVoices.find(voice => 
          voice.lang.includes('ru') || voice.name.includes('Russian')
        );
        
        if (russianVoice) {
          voices.current = [russianVoice];
        } else {
          // Use default voice if Russian not available
          voices.current = availableVoices;
        }
      };
      
      // Chrome needs to wait for voices to be loaded
      if (synth.current.onvoiceschanged !== undefined) {
        synth.current.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
    }
    
    // Clean up on unmount
    return () => {
      if (synth.current) {
        synth.current.cancel();
      }
    };
  }, []);
  
  // Function to speak text
  const speak = (text: string, rate = 1, pitch = 1) => {
    if (synth.current && !isMuted) {
      // Cancel any ongoing speech
      synth.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice (prefer Russian if available)
      if (voices.current.length > 0) {
        utterance.voice = voices.current[0];
      }
      
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1;
      
      synth.current.speak(utterance);
    }
  };
  
  // Convert number to Russian word for counting
  const getCountText = (num: number): string => {
    const russianNumbers = [
      'Один', 'Два', 'Три', 'Четыре', 'Пять', 
      'Шесть', 'Семь', 'Восемь', 'Девять', 'Десять'
    ];
    
    if (num >= 1 && num <= 10) {
      return russianNumbers[num - 1] + '!';
    }
    return num.toString();
  };
  
  // Play counting sounds when the count changes
  useEffect(() => {
    if (isMuted || !synth.current) return;
    
    if (currentCount > 0 && currentCount <= 10 && currentCount !== lastPlayedCountRef.current) {
      speak(getCountText(currentCount), 1.1, 1.2); // Slightly faster rate for counting
      lastPlayedCountRef.current = currentCount;
      
      // Also play the regular sound
      const audio = new Audio('/sounds/hit.mp3');
      audio.volume = 0.3; // Lower volume to avoid overlapping with speech
      audio.play().catch(err => console.error('Audio play error:', err));
    }
  }, [currentCount, isMuted]);
  
  // Play feedback sounds and speech for correct/wrong answers
  useEffect(() => {
    if (isMuted || !synth.current) return;
    
    if (isCorrectAnswer) {
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.4;
      audio.play().catch(err => console.error('Audio play error:', err));
      
      // Congratulatory message
      setTimeout(() => {
        speak('Молодец! Правильно!', 0.9, 1.1);
      }, 500);
    } else if (isWrongAnswer) {
      const audio = new Audio('/sounds/hit.mp3');
      audio.play().catch(err => console.error('Audio play error:', err));
      
      // Try again message
      setTimeout(() => {
        speak('Попробуй еще раз!', 0.9, 1);
      }, 300);
    }
  }, [isCorrectAnswer, isWrongAnswer, isMuted]);
  
  // Speak any provided message
  useEffect(() => {
    if (message && !isMuted && synth.current) {
      speak(message, 0.9, 1);
    }
  }, [message, isMuted]);
  
  // This component doesn't render anything, it just manages audio
  return null;
};

export default AudioManager;
