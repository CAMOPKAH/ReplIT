import { useState, useEffect } from 'react';

interface HedgehogProps {
  isEating: boolean;
  position: number; // Horizontal position
}

const Hedgehog: React.FC<HedgehogProps> = ({ isEating, position }) => {
  const [animation, setAnimation] = useState<'idle' | 'eating'>('idle');
  const [positionX, setPositionX] = useState(position);

  // Update position when props change
  useEffect(() => {
    setPositionX(position);
  }, [position]);

  // Show eating animation when an apple falls
  useEffect(() => {
    if (isEating) {
      setAnimation('eating');
      
      // Return to idle state after animation
      const timer = setTimeout(() => {
        setAnimation('idle');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isEating]);

  return (
    <div 
      className="hedgehog-container"
      style={{ 
        left: `${positionX}px`,
        animation: animation === 'eating' ? 'hedgehog-jump 0.5s' : undefined
      }}
    >
      <img 
        src="/assets/3d-hedgehog.svg" 
        alt="Ёжик" 
        className={`hedgehog ${animation === 'eating' ? 'hedgehog-eating' : ''}`}
      />
    </div>
  );
};

export default Hedgehog;