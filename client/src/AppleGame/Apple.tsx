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
      
      // Define where apples should fall to (bottom of screen)
      const groundLevel = viewportHeight + 50; // Below the visible area
      const centerX = viewportWidth / 2;
      
      // Add randomness to where apples fall
      const randomOffsetX = (Math.random() - 0.5) * 100; // Random ±50px from center
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
          
          // If apple has fallen below screen, mark it as "landed" and hide it
          if (newY >= groundLevel) {
            if (!hasLanded) {
              setHasLanded(true);
              // When the apple exits the screen, we don't need to track it anymore
              if (intervalRef.current) {
                cancelAnimationFrame(intervalRef.current);
                intervalRef.current = null;
              }
            }
            // Keep it off-screen
            newY = groundLevel;
          }
          
          return { x: newX, y: newY };
        });
        
        // Continue animation until apple is off-screen
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
    opacity: hasLanded ? 0 : 1, // Fade out when it falls off screen
    transition: hasLanded ? 'opacity 0.3s' : 'none',
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
