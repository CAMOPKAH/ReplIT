import { useState, useEffect, useRef } from 'react';
import { useAudio } from '@/lib/stores/useAudio';
import Apple from './Apple';
import Basket from './Basket';

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

  // Generate apple positions when component mounts
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight * 0.7; // Place apples on upper 70% of tree
      
      // Generate apple positions - randomized but ensuring they're visible on the tree
      const applePositions: ApplePosition[] = [];
      
      for (let index = 0; index < maxApples; index++) {
        // Create a semi-random pattern that looks natural on the tree
        const section = containerWidth / (maxApples + 1);
        let x = section * (index + 1) + (Math.random() * 40 - 20); // Add some randomness
        let y = 100 + Math.random() * (containerHeight - 150); // Keep apples within tree bounds
        
        // Ensure apples are not too close to each other
        if (index > 0) {
          const prevApple = applePositions[index - 1];
          while (Math.abs(x - prevApple.x) < 50) {
            x = section * (index + 1) + (Math.random() * 40 - 20);
          }
        }
        
        applePositions.push({
          id: index,
          x,
          y,
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
    </div>
  );
};

export default AppleTree;
