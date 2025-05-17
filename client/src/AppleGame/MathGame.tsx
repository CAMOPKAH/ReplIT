import React, { useState, useEffect } from 'react';
import { FruitType, fruitNames, fruitNamesPlural } from './FruitTypes';
import FruitTree from './FruitTree';
import { useAudio } from '@/lib/stores/useAudio';

interface MathGameProps {
  mathType: 'addition' | 'subtraction';
  onSuccess: () => void;
  onNextLevel: () => void;
  difficulty: number;
}

const MathGame: React.FC<MathGameProps> = ({ 
  mathType, 
  onSuccess, 
  onNextLevel,
  difficulty 
}) => {
  // Math equation values
  const [firstNumber, setFirstNumber] = useState(0);
  const [secondNumber, setSecondNumber] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  
  // Game state
  const [gamePhase, setGamePhase] = useState<'first' | 'second' | 'question'>('first');
  const [fruitsCollected, setFruitsCollected] = useState(0);
  const [message, setMessage] = useState('');
  const [options, setOptions] = useState<number[]>([]);
  const [fruitType, setFruitType] = useState<FruitType>(FruitType.APPLE);
  const [showMessage, setShowMessage] = useState(false);
  
  const { playSuccess } = useAudio();
  
  // Generate a random math problem based on difficulty
  useEffect(() => {
    // Reset game state
    setGamePhase('first');
    setFruitsCollected(0);
    setUserAnswer(null);
    
    // Choose a random fruit type for this problem
    const fruitTypes = Object.values(FruitType);
    setFruitType(fruitTypes[Math.floor(Math.random() * fruitTypes.length)]);
    
    // Generate numbers based on difficulty
    let num1: number, num2: number;
    
    if (mathType === 'addition') {
      // For addition, generate two numbers that add up to max 10
      const maxSum = Math.min(5 + difficulty, 10);
      num1 = Math.floor(Math.random() * (maxSum - 1)) + 1; // Between 1 and maxSum-1
      num2 = Math.floor(Math.random() * (maxSum - num1)) + 1; // Between 1 and (maxSum - num1)
      setCorrectAnswer(num1 + num2);
    } else {
      // For subtraction, first number always larger than second
      const maxFirst = Math.min(4 + difficulty, 10);
      num1 = Math.floor(Math.random() * maxFirst) + 1; // Between 1 and maxFirst
      num2 = Math.floor(Math.random() * num1) + 1; // Between 1 and num1
      setCorrectAnswer(num1 - num2);
    }
    
    setFirstNumber(num1);
    setSecondNumber(num2);
    
    // Set first instruction
    const countText = getCountText(num1, fruitType);
    speakMessage(`Собери ${countText}`);
  }, [mathType, difficulty]);
  
  // Generate answer options when we reach the question phase
  useEffect(() => {
    if (gamePhase === 'question') {
      const allOptions: number[] = [correctAnswer];
      
      // Generate 2 additional wrong answers
      while (allOptions.length < 3) {
        // Generate a wrong answer within ±3 of the correct answer, but not the same
        let wrongAnswer;
        do {
          const offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
          wrongAnswer = correctAnswer + offset;
          // Make sure it's a positive number and not already in options
        } while (wrongAnswer <= 0 || wrongAnswer > 10 || allOptions.includes(wrongAnswer));
        
        allOptions.push(wrongAnswer);
      }
      
      // Shuffle options
      setOptions(allOptions.sort(() => Math.random() - 0.5));
      
      // Set instruction for the question
      const questionText = mathType === 'addition'
        ? `Сколько будет ${firstNumber} плюс ${secondNumber}?`
        : `Сколько будет ${firstNumber} минус ${secondNumber}?`;
      
      speakMessage(questionText);
    }
  }, [gamePhase, correctAnswer, firstNumber, secondNumber, mathType]);
  
  // Handle fruit collection during the first and second phases
  const handleFruitCollected = (type: FruitType) => {
    setFruitsCollected(prev => prev + 1);
    
    // Check if we've collected enough for the current phase
    if (gamePhase === 'first') {
      if (fruitsCollected + 1 >= firstNumber) {
        // Move to second phase for addition
        if (mathType === 'addition') {
          setGamePhase('second');
          setFruitsCollected(0);
          
          // Wait a bit before next instruction
          setTimeout(() => {
            const countText = getCountText(secondNumber, fruitType);
            speakMessage(`Теперь собери ещё ${countText}`);
          }, 1500);
        } 
        // Skip to question for subtraction (we don't need to collect the second batch)
        else {
          setGamePhase('question');
        }
      }
    } 
    // For addition's second phase
    else if (gamePhase === 'second' && mathType === 'addition') {
      if (fruitsCollected + 1 >= secondNumber) {
        // Move to question phase
        setGamePhase('question');
      }
    }
  };
  
  // Handle answer selection
  const handleSelectAnswer = (answer: number) => {
    setUserAnswer(answer);
    
    if (answer === correctAnswer) {
      setShowMessage(true);
      setMessage('Правильно!');
      speakMessage('Правильно!');
      playSuccess();
      
      // Move to next level after delay
      setTimeout(() => {
        onSuccess();
        onNextLevel();
      }, 2000);
    } else {
      setShowMessage(true);
      setMessage(`Неправильно. Правильный ответ: ${correctAnswer}`);
      speakMessage(`Неправильно. Правильный ответ: ${correctAnswer}`);
      
      // Hide message after delay
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    }
  };
  
  // Get the proper text for counting fruits in Russian
  const getCountText = (count: number, type: FruitType): string => {
    const fruitBase = fruitNames[type];
    
    // Russian plural forms are complex
    if (count === 1) {
      return `${count} ${fruitBase}`;
    } else if (count >= 2 && count <= 4) {
      // For 2-4, use a different form
      return `${count} ${fruitBase}а`;
    } else {
      // For 0, 5-20
      return `${count} ${fruitNamesPlural[type]}`;
    }
  };
  
  // Text-to-speech function
  const speakMessage = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'ru-RU';
    speechSynthesis.speak(speech);
  };

  return (
    <div className="math-game">
      {gamePhase === 'question' ? (
        <div className="math-question">
          <div className="equation">
            <span className="number">{firstNumber}</span>
            <span className="operator">{mathType === 'addition' ? '+' : '-'}</span>
            <span className="number">{secondNumber}</span>
            <span className="equals">=</span>
            <span className="question-mark">?</span>
          </div>
          
          <div className="answer-options">
            {options.map((option, index) => (
              <button
                key={index}
                className={`answer-option ${userAnswer === option ? (option === correctAnswer ? 'correct' : 'wrong') : ''}`}
                onClick={() => handleSelectAnswer(option)}
                disabled={userAnswer !== null}
              >
                {option}
              </button>
            ))}
          </div>
          
          {showMessage && (
            <div className={`message ${userAnswer === correctAnswer ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
      ) : (
        <div className="fruit-collection-phase">
          <div className="phase-instruction">
            {gamePhase === 'first' ? (
              <h2>Собери {getCountText(firstNumber, fruitType)}</h2>
            ) : (
              <h2>Собери ещё {getCountText(secondNumber, fruitType)}</h2>
            )}
          </div>
          
          {/* Tree with fruits to collect */}
          <FruitTree
            maxFruits={gamePhase === 'first' ? firstNumber : secondNumber}
            onFruitCollected={handleFruitCollected}
            fruitsCollected={fruitsCollected}
            currentFruitType={fruitType}
          />
          
          {/* Progress indicator */}
          <div className="progress-indicator">
            <div className="progress-text">
              {fruitsCollected} / {gamePhase === 'first' ? firstNumber : secondNumber}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathGame;