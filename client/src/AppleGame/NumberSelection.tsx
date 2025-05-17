import { useState, useEffect } from 'react';
import { useAudio } from '@/lib/stores/useAudio';
import AudioManager from './AudioManager';

interface NumberSelectionProps {
  correctNumber: number;
  onNumberSelected: (number: number) => void;
  incorrectAttempts: number;
  applesCollected: number;
}

const NumberSelection: React.FC<NumberSelectionProps> = ({ 
  correctNumber, 
  onNumberSelected, 
  incorrectAttempts,
  applesCollected
}) => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);
  const [isWrongAnswer, setIsWrongAnswer] = useState<boolean>(false);
  const [promptMessage, setPromptMessage] = useState<string>("Сколько яблок в корзине?");
  const { playSuccess, playHit } = useAudio();
  
  // Generate number options for selection
  useEffect(() => {
    generateNumberOptions();
    
    // Speak initial prompt after a brief delay
    const timer = setTimeout(() => {
      setPromptMessage("Сколько яблок в корзине?");
    }, 500);
    
    return () => clearTimeout(timer);
  }, [correctNumber]);
  
  // Show hint after 2 incorrect attempts
  useEffect(() => {
    if (incorrectAttempts >= 2) {
      setShowHint(true);
      
      // Reset wrong answer state to prevent multiple audio playbacks
      setIsWrongAnswer(false);
      
      // Set hint message with delay to allow previous speech to finish
      setTimeout(() => {
        setPromptMessage(`Посмотри на корзину: там ${correctNumber} яблок${correctNumber > 1 ? 'а' : ''}. Давай попробуем ещё раз!`);
      }, 500);
    }
  }, [incorrectAttempts, correctNumber]);
  
  const generateNumberOptions = () => {
    // Always include the correct number
    let options = [correctNumber];
    
    // Add one number below and one above, if possible
    if (correctNumber > 1) {
      options.push(correctNumber - 1);
    }
    options.push(correctNumber + 1);
    
    // Add one more option for variety (ensuring it's not already included)
    let extraNumber;
    do {
      extraNumber = Math.max(1, Math.floor(Math.random() * (correctNumber + 3)));
    } while (options.includes(extraNumber));
    options.push(extraNumber);
    
    // Shuffle the array
    options = options.sort(() => Math.random() - 0.5);
    
    setNumbers(options);
  };
  
  const handleNumberClick = (number: number) => {
    // Reset states
    setIsCorrectAnswer(false);
    setIsWrongAnswer(false);
    
    // Set new states based on selection
    if (number === correctNumber) {
      setIsCorrectAnswer(true);
      playSuccess();
    } else {
      setIsWrongAnswer(true);
      playHit(); // Using hit sound for incorrect answers
    }
    
    // Notify parent component
    onNumberSelected(number);
  };
  
  // Define colors for each number based on requirements
  const getNumberColor = (num: number): string => {
    switch (num) {
      case 2: return 'number-2'; // Blue
      case 3: return 'number-3'; // Yellow
      case 4: return 'number-4'; // Red
      case 5: return 'number-5'; // Green
      case 6: return 'number-6'; // Purple
      default: return ''; // Default styling
    }
  };

  return (
    <div className="number-selection">
      {showHint && (
        <div className="hint">
          Посмотри на корзину: там {correctNumber} яблок{correctNumber > 1 && 'а'}. Давай попробуем ещё раз!
        </div>
      )}
      
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

      <h2 className="prompt">{promptMessage}</h2>
      
      <div className="numbers">
        {numbers.map(number => (
          <button
            key={number}
            className={`number-option ${getNumberColor(number)}`}
            onClick={() => handleNumberClick(number)}
          >
            {number}
          </button>
        ))}
      </div>
      
      {/* Audio manager for speech prompts */}
      <AudioManager 
        currentCount={0}
        isCorrectAnswer={isCorrectAnswer}
        isWrongAnswer={isWrongAnswer}
        message={promptMessage}
      />
    </div>
  );
};

export default NumberSelection;
