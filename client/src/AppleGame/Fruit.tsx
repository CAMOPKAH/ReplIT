import { useState, useEffect, useRef } from 'react';
import { FruitType, fruitImages } from './FruitTypes';

interface FruitProps {
  type: FruitType;
  position: { x: number; y: number };
  collected: boolean;
  onClick: () => void;
}

const Fruit: React.FC<FruitProps> = ({ type, position, collected, onClick }) => {
  const [isShaking, setIsShaking] = useState(false);
  const [fallingPosition, setFallingPosition] = useState({ x: position.x, y: position.y });
  const [rotation, setRotation] = useState(0);
  const [isFalling, setIsFalling] = useState(false);
  const [hasLanded, setHasLanded] = useState(false);
  const [finalPosition, setFinalPosition] = useState<{x: number, y: number} | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Add subtle animations to the fruits that haven't been collected
  useEffect(() => {
    if (!collected) {
      const interval = setInterval(() => {
        // Make fruits occasionally "wiggle" to invite interaction
        if (Math.random() > 0.8) {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
        }
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [collected]);

  // Handle the falling animation when collected
  useEffect(() => {
    if (collected && !isFalling) {
      setIsFalling(true);
      
      // Start the falling physics simulation
      let velocity = { x: 0, y: 0 };
      let gravity = 0.6;
      let friction = 0.98;
      let rotationSpeed = Math.random() * 5 - 2.5;

      // Calculate viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Define where fruits should fall to (near bottom of screen, at hedgehog level)
      const hedgehogLevel = viewportHeight - 120; // Approx. where hedgehog is
      const centerX = viewportWidth / 2;
      
      // Add randomness to where fruits fall
      const randomOffsetX = (Math.random() - 0.5) * 150; // Random ±75px from center
      const targetX = centerX + randomOffsetX;
      
      const animate = () => {
        setFallingPosition(prev => {
          // Add a slight attraction toward target X
          const diffX = targetX - prev.x;
          const attractionForce = diffX * 0.003; // Subtle force
          
          // Update velocity with gravity and attraction
          velocity.x += attractionForce;
          velocity.y += gravity;
          
          // Apply air resistance
          velocity.x *= friction;
          velocity.y *= friction;
          
          // Update position based on velocity
          let newX = prev.x + velocity.x;
          let newY = prev.y + velocity.y;
          
          // Apply rotation during falling
          setRotation(prev => prev + rotationSpeed);
          
          // If fruit has reached hedgehog level, mark it as "landed"
          if (newY >= hedgehogLevel) {
            if (!hasLanded) {
              setHasLanded(true);
              // When the fruit reaches the hedgehog, we don't need to track it anymore
              if (intervalRef.current) {
                cancelAnimationFrame(intervalRef.current);
                intervalRef.current = null;
              }
            }
            // Keep it at hedgehog level
            newY = hedgehogLevel;
          }
          
          return { x: newX, y: newY };
        });
        
        // Continue animation until fruit reaches hedgehog level
        if (!hasLanded && intervalRef.current) {
          intervalRef.current = requestAnimationFrame(animate);
        }
      };
      
      intervalRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
      }
    };
  }, [collected, isFalling, hasLanded]);

  // Handle the click interaction
  const handleClick = () => {
    if (!collected) {
      onClick();
    }
  };

  // Style for fruits based on their state
  const fruitStyle: React.CSSProperties = {
    left: `${fallingPosition.x}px`,
    top: `${fallingPosition.y}px`,
    transform: `rotate(${rotation}deg)`,
    pointerEvents: collected ? 'none' as const : 'auto' as const,
    zIndex: 5,
    width: '40px',
    height: '40px',
    // Make apple completely disappear when eaten by hedgehog
    opacity: hasLanded ? 0 : 1,
    transition: hasLanded ? 'opacity 0.2s' : 'none',
    display: hasLanded ? 'none' : 'block', // Remove from DOM after transition
  };

  return (
    <img 
      src={fruitImages[type]} 
      alt={type} 
      className={`fruit ${isShaking ? 'shake' : ''} ${isFalling ? 'fruit-falling' : ''}`}
      style={fruitStyle}
      onClick={handleClick}
    />
  );
};

export default Fruit;