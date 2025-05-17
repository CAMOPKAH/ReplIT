import React, { useState, useEffect } from 'react';
import { FruitType, fruitColors, fruitSizes, fruitNames, fruitImages } from './FruitTypes';
import FruitTree from './FruitTree';
import { useAudio } from '@/lib/stores/useAudio';

interface SortingGameProps {
  sortingType: 'color' | 'size';
  onSuccess: () => void;
  onNextLevel: () => void;
  difficulty: number;
  maxCorrect: number;
}

const SortingGame: React.FC<SortingGameProps> = ({ 
  sortingType, 
  onSuccess, 
  onNextLevel,
  difficulty,
  maxCorrect
}) => {
  const [fruitsCollected, setFruitsCollected] = useState<Record<FruitType, number>>({
    [FruitType.APPLE]: 0,
    [FruitType.PEAR]: 0,
    [FruitType.BANANA]: 0,
    [FruitType.ORANGE]: 0,
    [FruitType.STRAWBERRY]: 0
  });
  const [totalCollected, setTotalCollected] = useState(0);
  const [targetCategory, setTargetCategory] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [showSortingBaskets, setShowSortingBaskets] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const { playSuccess } = useAudio();

  // Total fruits to collect in this level
  const maxFruits = Math.min(3 + difficulty, 10);

  // Setup the game based on sorting type
  useEffect(() => {
    // Reset state for new game
    setFruitsCollected({
      [FruitType.APPLE]: 0,
      [FruitType.PEAR]: 0,
      [FruitType.BANANA]: 0,
      [FruitType.ORANGE]: 0,
      [FruitType.STRAWBERRY]: 0
    });
    setTotalCollected(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    
    // For color sorting, pick a random color
    if (sortingType === 'color') {
      const colors = Array.from(new Set(Object.values(fruitColors)));
      const targetColor = colors[Math.floor(Math.random() * colors.length)];
      setTargetCategory(targetColor);
      speakMessage(`Собирай ${colorToRussian(targetColor)} фрукты`);
    } 
    // For size sorting, pick a random size
    else if (sortingType === 'size') {
      const sizes = Array.from(new Set(Object.values(fruitSizes)));
      const targetSize = sizes[Math.floor(Math.random() * sizes.length)];
      setTargetCategory(targetSize);
      speakMessage(`Собирай ${sizeToRussian(targetSize)} фрукты`);
    }
  }, [sortingType, difficulty]);

  // Handle fruit collection
  const handleFruitCollected = (type: FruitType) => {
    // Increment the collected count for this fruit type
    setFruitsCollected(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
    
    // Increment total collected
    setTotalCollected(prev => prev + 1);
    
    // Check if we need to show sorting baskets
    if (totalCollected + 1 >= maxFruits) {
      setShowSortingBaskets(true);
      speakMessage(`Теперь рассортируй фрукты`);
    }
  };

  // Handle sorting decision
  const handleSortingDecision = (fruitType: FruitType) => {
    let isCorrect = false;
    
    // For color sorting
    if (sortingType === 'color') {
      isCorrect = fruitColors[fruitType] === targetCategory;
    } 
    // For size sorting
    else if (sortingType === 'size') {
      isCorrect = fruitSizes[fruitType] === targetCategory;
    }
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setMessage(`Правильно! ${fruitNames[fruitType]} - ${sortingType === 'color' ? colorToRussian(fruitColors[fruitType]) : sizeToRussian(fruitSizes[fruitType])}`);
      speakMessage(`Правильно!`);
      
      // Check if player has reached required correct answers
      if (correctAnswers + 1 >= maxCorrect) {
        playSuccess();
        setMessage('Отлично! Ты справился с заданием!');
        speakMessage('Отлично! Ты справился с заданием!');
        setTimeout(() => {
          onSuccess();
          onNextLevel();
        }, 2000);
      }
    } else {
      setWrongAnswers(prev => prev + 1);
      setMessage(`Неправильно. ${fruitNames[fruitType]} - ${sortingType === 'color' ? colorToRussian(fruitColors[fruitType]) : sizeToRussian(fruitSizes[fruitType])}`);
      speakMessage(`Неправильно. Попробуй еще раз.`);
    }
  };

  // Convert color names to Russian
  const colorToRussian = (color: string): string => {
    const colorMap: Record<string, string> = {
      'red': 'красные',
      'green': 'зелёные',
      'yellow': 'жёлтые',
      'orange': 'оранжевые'
    };
    return colorMap[color] || color;
  };
  
  // Convert size names to Russian
  const sizeToRussian = (size: string): string => {
    const sizeMap: Record<string, string> = {
      'small': 'маленькие',
      'medium': 'средние',
      'large': 'большие'
    };
    return sizeMap[size] || size;
  };
  
  // Text-to-speech function
  const speakMessage = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'ru-RU';
    speechSynthesis.speak(speech);
  };

  return (
    <div className="sorting-game">
      {!showSortingBaskets ? (
        // Tree with fruits to collect
        <FruitTree
          maxFruits={maxFruits}
          onFruitCollected={handleFruitCollected}
          fruitsCollected={totalCollected}
        />
      ) : (
        // Sorting baskets interface
        <div className="sorting-baskets">
          <h2 className="sorting-instruction">
            {sortingType === 'color' 
              ? `Выбери ${colorToRussian(targetCategory)} фрукты` 
              : `Выбери ${sizeToRussian(targetCategory)} фрукты`}
          </h2>
          
          <div className="fruit-selection">
            {Object.values(FruitType).map(type => {
              // Only show fruits that were collected
              const count = fruitsCollected[type];
              if (count === 0) return null;
              
              // Create multiple instances of this fruit based on count
              return Array.from({ length: count }).map((_, idx) => (
                <div 
                  key={`${type}-${idx}`}
                  className="selectable-fruit"
                  onClick={() => handleSortingDecision(type)}
                >
                  <img src={fruitImages[type]} alt={fruitNames[type]} />
                  <span>{fruitNames[type]}</span>
                </div>
              ));
            })}
          </div>
          
          {message && (
            <div className="message-box">
              {message}
            </div>
          )}
          
          <div className="score-display">
            <div className="score-item correct">
              <span className="score-label">Правильно:</span>
              <span className="score-value">{correctAnswers}</span>
            </div>
            <div className="score-item wrong">
              <span className="score-label">Неправильно:</span>
              <span className="score-value">{wrongAnswers}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortingGame;