import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface AppleProps {
  position: { x: number; y: number };
  collected: boolean;
  onClick: () => void;
}

const Apple: React.FC<AppleProps> = ({ position, collected, onClick }) => {
  const [isShaking, setIsShaking] = useState(false);
  const [fallingPosition, setFallingPosition] = useState({ x: position.x, y: position.y });
  const [rotation, setRotation] = useState(0);
  const [isFalling, setIsFalling] = useState(false);
  const [hasLanded, setHasLanded] = useState(false);
  const [finalPosition, setFinalPosition] = useState<{x: number, y: number} | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Add subtle animations to the apples that haven't been collected
  useEffect(() => {
    if (!collected) {
      const interval = setInterval(() => {
        // Make apples occasionally "wiggle" to invite interaction
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
      
      // Define where apples should fall to (near bottom of screen, at hedgehog level)
      const hedgehogLevel = viewportHeight - 160; // Hedgehog's top position
      const hedgehogBottomLevel = viewportHeight - 80; // Bottom/ground position
      const centerX = viewportWidth / 2;
      
      // Add randomness to where apples fall
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
          
          // If apple has reached hedgehog level, mark it as "landed" and keep it on the hedgehog's back
          if (newY >= hedgehogLevel && newY < hedgehogBottomLevel) {
            if (!hasLanded) {
              setHasLanded(true);
              // When the apple reaches the hedgehog, stop the falling animation
              if (intervalRef.current) {
                cancelAnimationFrame(intervalRef.current);
                intervalRef.current = null;
              }
              
              // Keep the apple at the hedgehog's back level
              newY = hedgehogLevel;
            } else {
              // Keep the apple fixed on hedgehog's back
              newY = hedgehogLevel;
            }
          }
          
          // If apple has fallen below hedgehog (past hedgehog), make it disappear
          if (newY >= hedgehogBottomLevel) {
            if (!hasLanded) {
              setHasLanded(true);
              // When the apple falls below hedgehog, we don't need to track it anymore
              if (intervalRef.current) {
                cancelAnimationFrame(intervalRef.current);
                intervalRef.current = null;
              }
            }
          }
          
          return { x: newX, y: newY };
        });
        
        // Continue animation until apple reaches hedgehog level
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

  // Style for apples based on their state
  const appleStyle: React.CSSProperties = {
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
      src="/assets/apple.svg" 
      alt="Apple" 
      className={`apple ${isShaking ? 'shake' : ''} ${isFalling ? 'apple-falling' : ''}`}
      style={appleStyle}
      onClick={handleClick}
    />
  );
};

export default Apple;
