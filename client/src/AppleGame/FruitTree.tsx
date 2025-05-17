import { useState, useEffect, useRef } from 'react';
import { useAudio } from '@/lib/stores/useAudio';
import Fruit from './Fruit';
import Hedgehog from './Hedgehog';
import AudioManager from './AudioManager';
import { FruitType, fruitNames, fruitNamesPlural } from './FruitTypes';

interface FruitPosition {
  id: number;
  x: number;
  y: number;
  type: FruitType;
  collected: boolean;
}

interface FruitTreeProps {
  maxFruits: number;
  onFruitCollected: (type: FruitType) => void;
  fruitsCollected: number;
  currentFruitType?: FruitType; // Optional: to specify a specific fruit type for the current round
}

const FruitTree: React.FC<FruitTreeProps> = ({ 
  maxFruits, 
  onFruitCollected,
  fruitsCollected,
  currentFruitType = FruitType.APPLE // Default to apple if not specified
}) => {
  const [fruits, setFruits] = useState<FruitPosition[]>([]);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [countVisible, setCountVisible] = useState<boolean>(false);
  const [hedgehogPosition, setHedgehogPosition] = useState(window.innerWidth / 2);
  const [isHedgehogEating, setIsHedgehogEating] = useState(false);
  const [fruitInAir, setFruitInAir] = useState<{id: number, x: number, type: FruitType} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playHit, playNyam, setNyamSound } = useAudio();
  
  // Initialize nyam sound
  useEffect(() => {
    const nyamSound = new Audio('/sounds/nyam.mp3');
    nyamSound.volume = 0.7;
    setNyamSound(nyamSound);
  }, [setNyamSound]);

  // Define fixed fruit positions on the green parts of the tree
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      
      // Fixed positions that are guaranteed to be on the green foliage
      // These coordinates match the center points of the tree foliage circles in the SVG
      const foliagePositions = [
        { x: 280, y: 230 },  // Left lower foliage
        { x: 330, y: 170 },  // Left upper foliage
        { x: 400, y: 150 },  // Top center foliage
        { x: 470, y: 170 },  // Right upper foliage
        { x: 520, y: 230 },  // Right lower foliage
        { x: 300, y: 250 },  // Left middle foliage
        { x: 500, y: 250 },  // Right middle foliage
        { x: 350, y: 200 },  // Left-center foliage
        { x: 450, y: 200 },  // Right-center foliage
        { x: 380, y: 180 },  // Upper-center extra position
      ];
      
      // Use only the number of positions we need for the current maxFruits setting
      const fruitPositions: FruitPosition[] = [];
      
      // Shuffle the positions to make it more interesting
      const shuffledPositions = [...foliagePositions].sort(() => Math.random() - 0.5);
      
      // Get all available fruit types for variety, or use the specified type
      const fruitTypes = currentFruitType ? [currentFruitType] : Object.values(FruitType);
      
      for (let index = 0; index < Math.min(maxFruits, shuffledPositions.length); index++) {
        // Add slight randomness within the foliage circle
        const basePosition = shuffledPositions[index];
        
        // Add small random offsets (±15px) to make fruits not all at the center of foliage
        const randomOffsetX = Math.random() * 30 - 15;
        const randomOffsetY = Math.random() * 30 - 15;
        
        // Select a random fruit type if no specific type is required
        const fruitType = currentFruitType || fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
        
        fruitPositions.push({
          id: index,
          x: basePosition.x + randomOffsetX,
          y: basePosition.y + randomOffsetY,
          type: fruitType,
          collected: false
        });
      }
      
      setFruits(fruitPositions);
    }
  }, [maxFruits, currentFruitType]);

  // Effect to move hedgehog to catch the falling fruit
  useEffect(() => {
    if (fruitInAir) {
      // Move hedgehog to catch the fruit
      // Hedgehog runs to the fruit's position
      const moveHedgehogInterval = setInterval(() => {
        // Calculate the target position (center of hedgehog should be under the fruit)
        const targetX = fruitInAir.x - 75;
        
        // Current position
        setHedgehogPosition(prev => {
          // Determine direction and speed
          const distanceToTarget = targetX - prev;
          const direction = Math.sign(distanceToTarget);
          // Move faster if further away
          const speed = Math.min(Math.abs(distanceToTarget), 15);
          
          // If very close to target, snap to it
          if (Math.abs(distanceToTarget) < 5) {
            return targetX;
          }
          
          // Otherwise move towards it
          return prev + (direction * speed);
        });
      }, 30);
      
      // Show eating animation after fruit reaches the hedgehog (at around bottom of screen)
      const eatTimer = setTimeout(() => {
        setIsHedgehogEating(true);
        // Play nyam sound when hedgehog eats a fruit
        playNyam();
        
        // Reset eating animation
        setTimeout(() => {
          setIsHedgehogEating(false);
          setFruitInAir(null);
        }, 500);
      }, 900); // Slightly shorter timing for better synchronization with fall animation
      
      return () => {
        clearTimeout(eatTimer);
        clearInterval(moveHedgehogInterval);
      };
    }
  }, [fruitInAir, playNyam]);
  
  // Handle fruit collection
  const handleFruitClick = (id: number) => {
    if (fruitsCollected >= maxFruits) return;
    
    // Find the clicked fruit to get its position and type
    const clickedFruit = fruits.find(fruit => fruit.id === id);
    if (!clickedFruit) return;
    
    // Set the current fruit in air for hedgehog to track
    setFruitInAir({ 
      id: clickedFruit.id, 
      x: clickedFruit.x,
      type: clickedFruit.type
    });
    
    // Mark fruit as collected
    setFruits(prev => prev.map(fruit => 
      fruit.id === id ? { ...fruit, collected: true } : fruit
    ));
    
    // Increment counter with visual and audio feedback
    const newCount = currentCount + 1;
    setCurrentCount(newCount);
    setCountVisible(true);
    playHit();
    
    // Trigger parent callback with fruit type
    onFruitCollected(clickedFruit.type);
    
    // Hide counter after a delay
    setTimeout(() => {
      setCountVisible(false);
    }, 1500);
  };

  return (
    <div ref={containerRef} className="tree-container">
      <img src="/assets/appletree.svg" alt="Fruit Tree" className="tree-svg" />
      
      {/* Render fruits */}
      {fruits.map(fruit => (
        <Fruit
          key={fruit.id}
          type={fruit.type}
          position={{ x: fruit.x, y: fruit.y }}
          collected={fruit.collected}
          onClick={() => handleFruitClick(fruit.id)}
        />
      ))}
      
      {/* Fruits collected counter in top right corner */}
      <div className="fruits-collected-counter">
        <img src={currentFruitType ? `/assets/${currentFruitType}.svg` : "/assets/apple.svg"} alt="Фрукт" className="fruit-icon" />
        <span className="fruits-count">{fruitsCollected}</span>
      </div>
      
      {/* Number counter */}
      {countVisible && (
        <div className="counter">{currentCount}</div>
      )}
      
      {/* Hedgehog that eats the fruits */}
      <Hedgehog 
        isEating={isHedgehogEating}
        position={hedgehogPosition}
      />
      
      {/* Audio manager for counting sounds */}
      <AudioManager 
        currentCount={currentCount} 
      />
    </div>
  );
};

export default FruitTree;