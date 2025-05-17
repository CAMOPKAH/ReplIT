import { useState, useEffect } from 'react';
import { useAudio } from '@/lib/stores/useAudio';
import AppleTree from './AppleTree';
import NumberSelection from './NumberSelection';
import { GameState } from './GameStates';
import './styles.css';

const AppleGame = () => {
  const [gameState, setGameState] = useState<GameState>('collecting');
  const [applesCollected, setApplesCollected] = useState<number>(0);
  const [maxApples, setMaxApples] = useState<number>(5); // Default, can be adjusted for difficulty levels
  const [incorrectAttempts, setIncorrectAttempts] = useState<number>(0);
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
      
      // Reset for next round after a delay
      setTimeout(() => {
        resetGame();
      }, 3000);
    } else {
      // Incorrect number selected
      setIncorrectAttempts(prev => prev + 1);
    }
  };

  const resetGame = () => {
    setGameState('collecting');
    setApplesCollected(0);
    setIncorrectAttempts(0);
    // Could adjust difficulty here by changing maxApples
  };

  return (
    <div className="apple-game">
      <button onClick={toggleMute} className="sound-button">
        {isMuted ? '🔇' : '🔊'}
      </button>
      
      {gameState === 'collecting' && (
        <AppleTree 
          maxApples={maxApples} 
          onAppleCollected={handleAppleCollected}
          applesCollected={applesCollected}
        />
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
          <p>Ты правильно посчитал яблоки!</p>
          <div className="basket-display">
            <img src="/assets/basket.svg" alt="Basket" className="basket-success" />
            <div className="apples-in-basket">
              {Array.from({ length: applesCollected }).map((_, i) => (
                <img 
                  key={i} 
                  src="/assets/apple.svg" 
                  alt="Apple" 
                  className="apple-in-basket"
                  style={{ 
                    left: `${10 + (i * 15)}px`, 
                    top: `${10 + (Math.sin(i) * 5)}px`,
                    zIndex: i
                  }} 
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppleGame;
