import { useState, useEffect, useRef } from 'react';
import { useAudio } from '@/lib/stores/useAudio';
import Apple from './Apple';
import Hedgehog from './Hedgehog';
import AudioManager from './AudioManager';

interface ApplePosition {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

interface AppleTreeProps {
  maxApples: number;
  onAppleCollected: () => void;
  applesCollected: number;
}

const AppleTree: React.FC<AppleTreeProps> = ({ 
  maxApples, 
  onAppleCollected,
  applesCollected 
}) => {
  const [apples, setApples] = useState<ApplePosition[]>([]);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [countVisible, setCountVisible] = useState<boolean>(false);
  const [hedgehogPosition, setHedgehogPosition] = useState(window.innerWidth / 2);
  const [isHedgehogEating, setIsHedgehogEating] = useState(false);
  const [appleInAir, setAppleInAir] = useState<{id: number, x: number} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playHit, playNyam, setNyamSound } = useAudio();
  
  // Initialize nyam sound
  useEffect(() => {
    const nyamSound = new Audio('/sounds/nyam.mp3');
    nyamSound.volume = 0.7;
    setNyamSound(nyamSound);
  }, [setNyamSound]);

  // Define fixed apple positions on the green parts of the tree
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
      
      // Use only the number of positions we need for the current maxApples setting
      const applePositions: ApplePosition[] = [];
      
      // Shuffle the positions to make it more interesting
      const shuffledPositions = [...foliagePositions].sort(() => Math.random() - 0.5);
      
      for (let index = 0; index < Math.min(maxApples, shuffledPositions.length); index++) {
        // Add slight randomness within the foliage circle
        const basePosition = shuffledPositions[index];
        
        // Add small random offsets (±15px) to make apples not all at the center of foliage
        const randomOffsetX = Math.random() * 30 - 15;
        const randomOffsetY = Math.random() * 30 - 15;
        
        applePositions.push({
          id: index,
          x: basePosition.x + randomOffsetX,
          y: basePosition.y + randomOffsetY,
          collected: false
        });
      }
      
      setApples(applePositions);
    }
  }, [maxApples]);

  // Effect to move hedgehog to catch the falling apple
  useEffect(() => {
    if (appleInAir) {
      // Move hedgehog to catch the apple
      // Hedgehog runs to the apple's position
      const moveHedgehogInterval = setInterval(() => {
        // Calculate the target position (center of hedgehog should be under the apple)
        const targetX = appleInAir.x - 75;
        
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
      
      // Show eating animation after apple reaches the hedgehog (at around bottom of screen)
      const eatTimer = setTimeout(() => {
        setIsHedgehogEating(true);
        // Play nyam sound when hedgehog eats an apple
        playNyam();
        
        // Reset eating animation
        setTimeout(() => {
          setIsHedgehogEating(false);
          setAppleInAir(null);
        }, 500);
      }, 900); // Slightly shorter timing for better synchronization with fall animation
      
      return () => {
        clearTimeout(eatTimer);
        clearInterval(moveHedgehogInterval);
      };
    }
  }, [appleInAir, playNyam]);
  
  // Handle apple collection
  const handleAppleClick = (id: number) => {
    if (applesCollected >= maxApples) return;
    
    // Find the clicked apple to get its position
    const clickedApple = apples.find(apple => apple.id === id);
    if (!clickedApple) return;
    
    // Set the current apple in air for hedgehog to track
    setAppleInAir({ id: clickedApple.id, x: clickedApple.x });
    
    // Mark apple as collected
    setApples(prev => prev.map(apple => 
      apple.id === id ? { ...apple, collected: true } : apple
    ));
    
    // Increment counter with visual and audio feedback
    const newCount = currentCount + 1;
    setCurrentCount(newCount);
    setCountVisible(true);
    playHit();
    
    // Trigger parent callback
    onAppleCollected();
    
    // Hide counter after a delay
    setTimeout(() => {
      setCountVisible(false);
    }, 1500);
  };

  return (
    <div ref={containerRef} className="tree-container">
      <img src="/assets/appletree.svg" alt="Apple Tree" className="tree-svg" />
      
      {/* Render apples */}
      {apples.map(apple => (
        <Apple
          key={apple.id}
          position={{ x: apple.x, y: apple.y }}
          collected={apple.collected}
          onClick={() => handleAppleClick(apple.id)}
        />
      ))}
      
      {/* Apples collected counter in top left corner */}
      <div className="apples-collected-counter">
        <img src="/assets/apple.svg" alt="Яблоко" className="apple-icon" />
        <span className="apples-count">{applesCollected}</span>
      </div>
      
      {/* Number counter */}
      {countVisible && (
        <div className="counter">{currentCount}</div>
      )}
      
      {/* Hedgehog that eats the apples */}
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

export default AppleTree;
