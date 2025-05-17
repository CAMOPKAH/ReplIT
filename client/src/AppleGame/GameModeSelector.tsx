import { useState, useEffect } from 'react';
import { GameMode, gameModeNames } from './FruitTypes';

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
  currentMode: GameMode;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ onSelectMode, currentMode }) => {
  const [showSelector, setShowSelector] = useState(false);
  
  const handleModeSelect = (mode: GameMode) => {
    onSelectMode(mode);
    setShowSelector(false);
    
    // Говорим название режима через синтез речи
    const speech = new SpeechSynthesisUtterance(gameModeNames[mode]);
    speech.lang = 'ru-RU';
    speechSynthesis.speak(speech);
  };
  
  // Закрыть селектор при нажатии на Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSelector(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <>
      <button 
        className="mode-selector-button"
        onClick={() => setShowSelector(!showSelector)}
      >
        {gameModeNames[currentMode]}
      </button>
      
      {showSelector && (
        <div className="game-mode-selector">
          <div className="game-mode-panel">
            <h2>Выберите режим игры</h2>
            <div className="mode-buttons">
              {Object.values(GameMode).map(mode => (
                <button
                  key={mode}
                  className={`mode-button ${currentMode === mode ? 'active' : ''}`}
                  onClick={() => handleModeSelect(mode)}
                >
                  {gameModeNames[mode]}
                </button>
              ))}
            </div>
            <button 
              className="close-button"
              onClick={() => setShowSelector(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GameModeSelector;