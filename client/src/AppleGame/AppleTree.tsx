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

  // Define fixed apple positions on the green parts of the tree with validation
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      
      // Define foliage circles from the SVG for validation
      const foliageCircles = [
        { cx: 280, cy: 230, r: 50 },   // Left lower foliage
        { cx: 330, cy: 170, r: 60 },   // Left upper foliage
        { cx: 400, cy: 150, r: 70 },   // Top center foliage
        { cx: 470, cy: 170, r: 60 },   // Right upper foliage
        { cx: 520, cy: 230, r: 50 },   // Right lower foliage
        { cx: 350, cy: 200, r: 65 },   // Left-center foliage
        { cx: 450, cy: 200, r: 65 },   // Right-center foliage
      ];
      
      // Starting positions that should be on the crown/top of the tree
      const topCrownPositions = [
        { x: 330, y: 130 },  // Left upper crown
        { x: 360, y: 110 },  // Left-top crown
        { x: 400, y: 100 },  // Top center crown
        { x: 440, y: 110 },  // Right-top crown
        { x: 470, y: 130 },  // Right upper crown
        { x: 380, y: 140 },  // Upper center-left crown
        { x: 420, y: 140 },  // Upper center-right crown
        { x: 400, y: 125 },  // Top-center crown
      ];
      
      // Function to check if a point is inside any of the foliage circles
      const isInGreenFoliage = (x: number, y: number): boolean => {
        return foliageCircles.some(circle => {
          // Calculate distance from point to circle center
          const dx = x - circle.cx;
          const dy = y - circle.cy;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Point is inside the circle if distance is less than radius
          return distance < circle.r;
        });
      };
      
      // Use only the number of positions we need for the current maxApples setting
      const applePositions: ApplePosition[] = [];
      
      // Shuffle the positions to make it more interesting
      const shuffledPositions = [...topCrownPositions].sort(() => Math.random() - 0.5);
      
      // Create apples with position validation
      for (let index = 0; index < Math.min(maxApples, shuffledPositions.length); index++) {
        let validApplePosition = false;
        let finalX = 0, finalY = 0;
        let attempts = 0;
        
        // Try up to 5 times to find a valid position in green foliage
        while (!validApplePosition && attempts < 5) {
          const basePosition = shuffledPositions[index % shuffledPositions.length];
          
          // Use smaller random offsets to stay more likely within green area
          const randomOffsetX = Math.random() * 20 - 10;
          const randomOffsetY = Math.random() * 20 - 10;
          
          const candidateX = basePosition.x + randomOffsetX;
          const candidateY = basePosition.y + randomOffsetY;
          
          // Check if this position is in green foliage
          if (isInGreenFoliage(candidateX, candidateY)) {
            validApplePosition = true;
            finalX = candidateX;
            finalY = candidateY;
          }
          
          attempts++;
        }
        
        // If no valid position found after attempts, use a safe position at a foliage center
        if (!validApplePosition) {
          const safeCircle = foliageCircles[index % foliageCircles.length];
          finalX = safeCircle.cx;
          finalY = safeCircle.cy;
        }
        
        applePositions.push({
          id: index,
          x: finalX,
          y: finalY,
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
