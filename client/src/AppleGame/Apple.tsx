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
      let gravity = 0.5;
      let bounce = 0.6;
      let friction = 0.99;
      let rotationSpeed = Math.random() * 5 - 2.5;
      
      // The basket's approximate position - this will need to be adjusted
      const basketTop = window.innerHeight * 0.85;
      const basketWidth = 150;
      const basketLeft = window.innerWidth / 2 - basketWidth / 2;
      const basketRight = basketLeft + basketWidth;
      
      const animate = () => {
        setFallingPosition(prev => {
          // Update position based on velocity
          let newX = prev.x + velocity.x;
          let newY = prev.y + velocity.y;
          
          // Add gravity effect
          velocity.y += gravity;
          
          // Apply air resistance
          velocity.x *= friction;
          velocity.y *= friction;
          
          // Check for basket collision
          if (newY >= basketTop && newX >= basketLeft && newX <= basketRight) {
            if (!hasLanded) {
              // First bounce in the basket
              velocity.y = -velocity.y * bounce;
              velocity.x *= friction;
              
              if (Math.abs(velocity.y) < 2) {
                setHasLanded(true);
              }
            } else {
              // Apple has come to rest in the basket
              newY = basketTop - 5; // Rest slightly above the basket line
              velocity.y = 0;
              velocity.x = 0;
            }
          }
          
          // Apply rotation during falling
          setRotation(prev => prev + rotationSpeed);
          
          return { x: newX, y: newY };
        });
        
        // Continue animation if apple is still moving
        if (!hasLanded) {
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

  return (
    <img 
      src="/assets/apple.svg" 
      alt="Apple" 
      className={`apple ${isShaking ? 'shake' : ''} ${isFalling ? 'apple-falling' : ''}`}
      style={{
        left: `${fallingPosition.x}px`,
        top: `${fallingPosition.y}px`,
        transform: `rotate(${rotation}deg)`,
        opacity: hasLanded ? 0 : 1, // Fade out after landing in basket
        pointerEvents: collected ? 'none' : 'auto',
      }}
      onClick={handleClick}
    />
  );
};

export default Apple;
