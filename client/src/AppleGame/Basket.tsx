import { useState, useEffect, useRef } from 'react';

interface BasketProps {
  position: { x: number };
  followFallingApple?: boolean; // Flag to determine if basket should follow falling apples
  fallingAppleX?: number; // X-coordinate of currently falling apple
}

const Basket: React.FC<BasketProps> = ({ position, followFallingApple = false, fallingAppleX }) => {
  const [isShaking, setIsShaking] = useState(false);
  const [currentX, setCurrentX] = useState(position.x);
  const basketRef = useRef<HTMLDivElement>(null);
  const targetXRef = useRef(position.x);
  const animationRef = useRef<number | null>(null);
  
  // Initial position from props
  useEffect(() => {
    if (!followFallingApple) {
      setCurrentX(position.x);
      targetXRef.current = position.x;
    }
  }, [position.x, followFallingApple]);
  
  // Follow apple when it's falling
  useEffect(() => {
    if (followFallingApple && fallingAppleX !== undefined) {
      // Set target position to follow the apple, but keep basket within viewport
      const basketWidth = basketRef.current?.clientWidth || 150;
      const halfBasketWidth = basketWidth / 2;
      
      // Calculate the viewport constraints
      const viewportWidth = window.innerWidth;
      const maxX = viewportWidth - basketWidth;
      
      // Adjust target to center basket under apple
      let newTargetX = fallingAppleX - halfBasketWidth;
      
      // Apply constraints to keep basket within viewport
      newTargetX = Math.max(0, Math.min(maxX, newTargetX));
      
      targetXRef.current = newTargetX;
    }
  }, [followFallingApple, fallingAppleX]);
  
  // Smooth movement animation
  useEffect(() => {
    // Skip animation if not following apple
    if (!followFallingApple) return;
    
    const animate = () => {
      // Use a simple easing function for smooth movement
      const dx = targetXRef.current - currentX;
      const speed = Math.abs(dx) * 0.1; // Speed proportional to distance
      const step = Math.min(Math.max(0.5, speed), 10); // Limit min/max speed
      
      if (Math.abs(dx) < 0.5) {
        // Close enough to target, stop animation
        setCurrentX(targetXRef.current);
      } else {
        // Move toward target
        setCurrentX(prevX => prevX + (dx > 0 ? step : -step));
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentX, followFallingApple]);
  
  // Add subtle animations to attract attention
  useEffect(() => {
    const interval = setInterval(() => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }, 4000);
    
    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      ref={basketRef}
      className={`basket-container ${isShaking ? 'shake' : ''}`}
      style={{ left: `${currentX}px` }}
    >
      <img src="/assets/basket.svg" alt="Basket" className="basket" />
    </div>
  );
};

export default Basket;
