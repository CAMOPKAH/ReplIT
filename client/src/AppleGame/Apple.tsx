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
      let bounce = 0.6;
      let friction = 0.98;
      let rotationSpeed = Math.random() * 5 - 2.5;

      // Calculate basket position more precisely
      // We're targeting the center of the viewport horizontally
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // The basket's position
      const basketTop = viewportHeight * 0.75;
      const basketWidth = 150;
      const basketCenterX = viewportWidth / 2;
      const basketLeft = basketCenterX - basketWidth / 2;
      const basketRight = basketLeft + basketWidth;
      
      // Calculate random final resting position within basket
      // This will be where the apple ends up - randomly distributed in the basket
      const basketBottomY = basketTop - 10; // Slightly above basket line
      const randomOffsetX = (Math.random() * basketWidth * 0.6) - (basketWidth * 0.3); // Within central 60% of basket
      const finalRestX = basketCenterX + randomOffsetX;
      
      // Slightly attract the apple toward the basket as it falls
      const targetX = basketCenterX;
      
      const animate = () => {
        setFallingPosition(prev => {
          // Add a slight attraction toward the basket center
          const diffX = targetX - prev.x;
          const attractionForce = diffX * 0.005; // Subtle force
          
          // Update velocity with gravity and attraction
          velocity.x += attractionForce;
          velocity.y += gravity;
          
          // Apply air resistance
          velocity.x *= friction;
          velocity.y *= friction;
          
          // Update position based on velocity
          let newX = prev.x + velocity.x;
          let newY = prev.y + velocity.y;
          
          // Check for basket collision
          if (newY >= basketTop && newX >= basketLeft && newX <= basketRight) {
            if (!hasLanded) {
              // First bounce in the basket
              velocity.y = -velocity.y * bounce;
              velocity.x *= friction;
              
              if (Math.abs(velocity.y) < 2) {
                setHasLanded(true);
                // Save final resting position for the apple in the basket
                setFinalPosition({ 
                  x: finalRestX, 
                  y: basketBottomY + (Math.random() * 5) // Small random Y variation
                });
              }
            } else {
              // Apple has come to rest in the basket
              // Gradually move toward final position
              const restX = finalPosition?.x || newX;
              const restY = finalPosition?.y || basketBottomY;
              
              // Slow down movement to final rest position
              newX = newX + (restX - newX) * 0.1;
              newY = restY;
              
              velocity.y = 0;
              velocity.x = 0;
            }
          }
          
          // Apply rotation during falling
          setRotation(prev => prev + rotationSpeed);
          
          return { x: newX, y: newY };
        });
        
        // Continue animation until it's fully settled
        if (!hasLanded || (hasLanded && !finalPosition)) {
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
  }, [collected, isFalling, hasLanded, finalPosition]);

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
    zIndex: hasLanded ? 10 : 5, // Ensure landed apples are visible in the basket
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
