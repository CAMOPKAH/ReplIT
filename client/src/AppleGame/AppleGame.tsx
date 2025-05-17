import { useState, useEffect } from 'react';
import { useAudio } from '@/lib/stores/useAudio';
import AppleTree from './AppleTree';
import NumberSelection from './NumberSelection';
import AudioManager from './AudioManager';
import { GameState } from './GameStates';
import './styles.css';

const AppleGame = () => {
  const [gameState, setGameState] = useState<GameState>('collecting');
  const [applesCollected, setApplesCollected] = useState<number>(0);
  const [maxApples, setMaxApples] = useState<number>(1); // Start with just 1 apple for easiest difficulty
  const [incorrectAttempts, setIncorrectAttempts] = useState<number>(0);
  const [correctAnswerStreak, setCorrectAnswerStreak] = useState<number>(0);
  const { toggleMute, isMuted } = useAudio();

  // When all apples are collected, transition to the number selection phase
  useEffect(() => {
    if (applesCollected > 0 && applesCollected === maxApples) {
      setTimeout(() => {
        setGameState('selecting');
      }, 1000); // Wait a moment after the last apple is collected
    }
  }, [applesCollected, maxApples]);

  const handleAppleCollected = () => {
    if (applesCollected < maxApples) {
      setApplesCollected(prev => prev + 1);
    }
  };

  const handleNumberSelected = (number: number) => {
    if (number === applesCollected) {
      // Correct number selected
      setGameState('success');
      
      // Increment correct answer streak
      setCorrectAnswerStreak(prev => prev + 1);
      
      // Reset for next round after a delay
      setTimeout(() => {
        resetGame();
      }, 3000);
    } else {
      // Incorrect number selected
      setIncorrectAttempts(prev => prev + 1);
      
      // Reset streak on incorrect answer
      setCorrectAnswerStreak(0);
    }
  };

  // Handle difficulty progression
  useEffect(() => {
    // If player has 3 correct answers in a row, increase difficulty
    if (correctAnswerStreak >= 3) {
      // Increase difficulty by adding one more apple (max 10)
      setMaxApples(prev => Math.min(prev + 1, 10));
      
      // Reset streak counter
      setCorrectAnswerStreak(0);
    }
  }, [correctAnswerStreak]);

  const resetGame = () => {
    setGameState('collecting');
    setApplesCollected(0);
    setIncorrectAttempts(0);
    // Difficulty is now handled by the correctAnswerStreak effect
  };

  // Messages to be spoken in different game states
  const gameMessages = {
    success: "Молодец! Ты правильно посчитал, сколько яблок собрал ёжик!",
    start: "Собери яблоки с дерева! Ёжик их съест."
  };

  return (
    <div className="apple-game">
      <button onClick={toggleMute} className="sound-button">
        {isMuted ? '🔇' : '🔊'}
      </button>
      
      {gameState === 'collecting' && (
        <>
          <AppleTree 
            maxApples={maxApples} 
            onAppleCollected={handleAppleCollected}
            applesCollected={applesCollected}
          />
          {/* Initial instruction audio */}
          {applesCollected === 0 && (
            <AudioManager 
              currentCount={0}
              message={gameMessages.start}
            />
          )}
        </>
      )}
      
      {gameState === 'selecting' && (
        <NumberSelection 
          correctNumber={applesCollected}
          onNumberSelected={handleNumberSelected}
          incorrectAttempts={incorrectAttempts}
          applesCollected={applesCollected}
        />
      )}
      
      {gameState === 'success' && (
        <div className="success-screen">
          <h1>Молодец!</h1>
          <p>Ты правильно посчитал, сколько яблок собрал ёжик!</p>
          <div className="success-count">
            <div className="success-number">{applesCollected}</div>
            <div className="success-apples">
              {Array.from({ length: applesCollected }).map((_, i) => (
                <img 
                  key={i} 
                  src="/assets/apple.svg" 
                  alt="Apple" 
                  className="success-apple"
                  style={{ 
                    left: `${(i % 5) * 40}px`, 
                    top: `${Math.floor(i / 5) * 40}px`,
                    zIndex: i
                  }} 
                />
              ))}
            </div>
          </div>
          {/* Success message audio */}
          <AudioManager 
            currentCount={0}
            isCorrectAnswer={true}
            message={gameMessages.success}
          />
        </div>
      )}
    </div>
  );
};

export default AppleGame;
