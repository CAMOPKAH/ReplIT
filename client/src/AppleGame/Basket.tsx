import { useState, useEffect } from 'react';

interface BasketProps {
  position: { x: number };
}

const Basket: React.FC<BasketProps> = ({ position }) => {
  const [isShaking, setIsShaking] = useState(false);
  
  // Add subtle animations to attract attention
  useEffect(() => {
    const interval = setInterval(() => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div 
      className={`basket-container ${isShaking ? 'shake' : ''}`}
      style={{ left: `${position.x}px` }}
    >
      <img src="/assets/basket.svg" alt="Basket" className="basket" />
    </div>
  );
};

export default Basket;
