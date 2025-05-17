import { useState, useEffect } from 'react';
import { useAudio } from '@/lib/stores/useAudio';
import { useGame } from '@/lib/stores/useGame';
import FruitTree from './FruitTree';
import NumberSelection from './NumberSelection';
import AudioManager from './AudioManager';
import GameModeSelector from './GameModeSelector';
import SortingGame from './SortingGame';
import MathGame from './MathGame';
import { GameMode, FruitType } from './FruitTypes';
import './styles.css';

export default function AppleGame() {
  // Game state
  const [gameState, setGameState] = useState<'collecting' | 'selecting' | 'success' | 'hint'>('collecting');
  const [applesCollected, setApplesCollected] = useState(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [level, setLevel] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.COUNTING);
  const { start: startGame, phase } = useGame();
  
  // Audio initialization
  const { setBackgroundMusic, setHitSound, setSuccessSound, isMuted, toggleMute } = useAudio();
  
  // Compute max apples based on level (1-10)
  const maxApples = Math.min(level, 10);
  const requiredCorrectAnswers = 3; // Need 3 correct answers to advance

  // Initialize audio on component mount
  useEffect(() => {
    const backgroundMusic = new Audio('/sounds/background.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.2;
    setBackgroundMusic(backgroundMusic);
    
    const hitSound = new Audio('/sounds/hit.mp3');
    hitSound.volume = 0.6;
    setHitSound(hitSound);
    
    const successSound = new Audio('/sounds/success.mp3');
    successSound.volume = 0.7;
    setSuccessSound(successSound);
    
    // Start the game
    startGame();
    
    // Initial instruction
    const speech = new SpeechSynthesisUtterance('Собирай фрукты!');
    speech.lang = 'ru-RU';
    setTimeout(() => {
      speechSynthesis.speak(speech);
    }, 1000);
  }, [setBackgroundMusic, setHitSound, setSuccessSound, startGame]);

  // Reset game state when changing game mode
  useEffect(() => {
    handleReset();
  }, [gameMode]);

  // Handle apple collection
  const handleAppleCollected = (type: FruitType) => {
    setApplesCollected(prevCount => {
      const newCount = prevCount + 1;
      
      // Check if we've collected all apples for this round
      if (newCount >= maxApples && gameMode === GameMode.COUNTING) {
        setGameState('selecting');
        const speech = new SpeechSynthesisUtterance('Сколько фруктов ты собрал?');
        speech.lang = 'ru-RU';
        setTimeout(() => {
          speechSynthesis.speak(speech);
        }, 1000);
      }
      
      return newCount;
    });
  };

  // Handle number selection in counting mode
  const handleNumberSelected = (number: number) => {
    if (number === maxApples) {
      // Correct answer
      setGameState('success');
      setCorrectAnswers(prev => prev + 1);
      setIncorrectAttempts(0);
      
      // Check if player should advance to next level
      if (correctAnswers + 1 >= requiredCorrectAnswers) {
        setShowLevelComplete(true);
        const speech = new SpeechSynthesisUtterance('Отлично! Ты перешёл на новый уровень!');
        speech.lang = 'ru-RU';
        setTimeout(() => {
          speechSynthesis.speak(speech);
          setLevel(prev => Math.min(prev + 1, 10));
          setCorrectAnswers(0);
        }, 1000);
      }
    } else {
      // Incorrect answer
      setIncorrectAttempts(prev => prev + 1);
      
      // After 2 incorrect attempts, show a hint
      if (incorrectAttempts + 1 >= 2) {
        setGameState('hint');
      }
    }
  };

  // Reset game state for a new round
  const handleReset = () => {
    setGameState('collecting');
    setApplesCollected(0);
    setIncorrectAttempts(0);
    setShowLevelComplete(false);
  };

  // Handle game mode selection
  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    setLevel(1); // Reset level when changing modes
    setCorrectAnswers(0);
  };

  // Handle completion of sorting or math games
  const handleGameSuccess = () => {
    setCorrectAnswers(prev => prev + 1);
  };

  // Advance to next level in sorting or math games
  const handleNextLevel = () => {
    if (correctAnswers + 1 >= requiredCorrectAnswers) {
      setShowLevelComplete(true);
      const speech = new SpeechSynthesisUtterance('Отлично! Ты перешёл на новый уровень!');
      speech.lang = 'ru-RU';
      setTimeout(() => {
        speechSynthesis.speak(speech);
        setLevel(prev => Math.min(prev + 1, 10));
        setCorrectAnswers(0);
        setShowLevelComplete(false);
      }, 2000);
    }
  };

  // If the game hasn't started yet, show nothing
  if (phase !== 'playing') {
    return null;
  }

  // Render the appropriate game component based on mode
  const renderGameContent = () => {
    switch (gameMode) {
      case GameMode.COUNTING:
        return (
          <>
            {gameState === 'collecting' && (
              <FruitTree 
                maxFruits={maxApples} 
                onFruitCollected={handleAppleCollected} 
                fruitsCollected={applesCollected}
              />
            )}
            
            {gameState === 'selecting' && (
              <NumberSelection 
                correctNumber={maxApples}
                onNumberSelected={handleNumberSelected}
                incorrectAttempts={incorrectAttempts}
                applesCollected={applesCollected}
              />
            )}
            
            {(gameState === 'success' || gameState === 'hint') && (
              <div className="result-screen">
                {gameState === 'success' ? (
                  <div className="success-message">
                    <h2>Правильно!</h2>
                    <p>Ты собрал {maxApples} {maxApples === 1 ? 'фрукт' : (maxApples >= 2 && maxApples <= 4) ? 'фрукта' : 'фруктов'}</p>
                    
                    <AudioManager 
                      currentCount={applesCollected} 
                      isCorrectAnswer={true} 
                      message={`Правильно! ${maxApples}!`}
                    />
                    
                    {showLevelComplete ? (
                      <div className="level-up">
                        <h3>Уровень пройден!</h3>
                        <p>Следующий уровень: {level + 1}</p>
                        <button className="next-level-button" onClick={handleReset}>
                          Продолжить
                        </button>
                      </div>
                    ) : (
                      <button className="reset-button" onClick={handleReset}>
                        Играть снова
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="hint-message">
                    <h2>Подсказка</h2>
                    <p>Посчитай внимательно, сколько фруктов ты собрал.</p>
                    <div className="fruit-counter">
                      {Array.from({ length: maxApples }).map((_, index) => (
                        <img 
                          key={index} 
                          src="/assets/apple.svg" 
                          alt="apple" 
                          className="hint-apple" 
                        />
                      ))}
                    </div>
                    <AudioManager 
                      currentCount={applesCollected} 
                      isWrongAnswer={true} 
                      message={`Давай посчитаем вместе! ${Array.from({ length: maxApples }).map((_, i) => i + 1).join(', ')}`}
                    />
                    <button className="try-again-button" onClick={() => setGameState('selecting')}>
                      Попробовать снова
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        );
        
      case GameMode.SORTING_BY_COLOR:
        return (
          <SortingGame 
            sortingType="color"
            onSuccess={handleGameSuccess}
            onNextLevel={handleNextLevel}
            difficulty={level}
            maxCorrect={requiredCorrectAnswers}
          />
        );
        
      case GameMode.SORTING_BY_SIZE:
        return (
          <SortingGame 
            sortingType="size"
            onSuccess={handleGameSuccess}
            onNextLevel={handleNextLevel}
            difficulty={level}
            maxCorrect={requiredCorrectAnswers}
          />
        );
        
      case GameMode.MATH_ADDITION:
        return (
          <MathGame 
            mathType="addition"
            onSuccess={handleGameSuccess}
            onNextLevel={handleNextLevel}
            difficulty={level}
          />
        );
        
      case GameMode.MATH_SUBTRACTION:
        return (
          <MathGame 
            mathType="subtraction"
            onSuccess={handleGameSuccess}
            onNextLevel={handleNextLevel}
            difficulty={level}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="apple-game">
      <div className="game-header">
        <div className="level-indicator">Уровень: {level}</div>
        <GameModeSelector onSelectMode={handleModeSelect} currentMode={gameMode} />
        <button className="sound-toggle" onClick={toggleMute}>
          {isMuted ? 'Включить звук' : 'Выключить звук'}
        </button>
      </div>
      
      {renderGameContent()}
    </div>
  );
}