import { useState, useEffect, useRef } from 'react';
import { useAudio } from '@/lib/stores/useAudio';
import Apple from './Apple';
import Basket from './Basket';
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
  const [basketPosition, setBasketPosition] = useState({ x: 0 });
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [countVisible, setCountVisible] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playHit } = useAudio();

  // Define fixed apple positions on tree branches
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight * 0.7; // Place apples on upper 70% of tree
      
      // Fixed positions that look like apples hanging from branches
      const fixedPositions = [
        { x: 260, y: 250 },   // Left side branches
        { x: 290, y: 180 },
        { x: 320, y: 170 },
        { x: 370, y: 150 },   // Middle branches
        { x: 450, y: 140 },
        { x: 510, y: 180 },   // Right side branches
        { x: 550, y: 220 },
        { x: 270, y: 270 },
        { x: 320, y: 240 },
        { x: 480, y: 240 },
      ];
      
      // Use only the number of positions we need for the current maxApples setting
      const applePositions: ApplePosition[] = [];
      
      for (let index = 0; index < Math.min(maxApples, fixedPositions.length); index++) {
        const position = fixedPositions[index];
        
        applePositions.push({
          id: index,
          x: position.x,
          y: position.y,
          collected: false
        });
      }
      
      setApples(applePositions);
      
      // Position basket in the middle
      setBasketPosition({ x: containerWidth / 2 - 75 });
    }
  }, [maxApples]);

  // Handle apple collection
  const handleAppleClick = (id: number) => {
    if (applesCollected >= maxApples) return;
    
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
    
    // Hide counter after a short delay
    setTimeout(() => {
      setCountVisible(false);
    }, 1000);
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
      
      {/* Basket at the bottom */}
      <Basket position={basketPosition} />
      
      {/* Number counter */}
      {countVisible && (
        <div className="counter">{currentCount}</div>
      )}
      
      {/* Audio manager for counting sounds */}
      <AudioManager 
        currentCount={currentCount} 
      />
    </div>
  );
};

export default AppleTree;
