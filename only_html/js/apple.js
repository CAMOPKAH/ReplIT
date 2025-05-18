/**
 * Компонент яблока
 */
class Apple {
  constructor(id, position, container, onCollected) {
    this.id = id;
    this.position = position;
    this.container = container;
    this.onCollected = onCollected;
    this.collected = false;
    this.isShaking = false;
    this.isFalling = false;
    this.hasLanded = false;
    this.rotation = 0;
    this.fallingPosition = { x: position.x, y: position.y };
    this.element = null;
    
    this.render();
    this.startWiggling();
  }
  
  render() {
    // Создание элемента яблока
    this.element = createElement('img', {
      src: 'assets/apple.svg',
      alt: 'Яблоко',
      className: 'apple',
      style: {
        left: `${this.position.x}px`,
        top: `${this.position.y}px`,
        transform: 'rotate(0deg)',
        zIndex: 5
      },
      onClick: () => this.handleClick()
    });
    
    this.container.appendChild(this.element);
  }
  
  // Обработка клика по яблоку
  handleClick() {
    if (this.collected || gameState.applesCollected >= gameState.maxApples) return;
    
    this.collected = true;
    this.startFallingAnimation();
    this.onCollected(this.id, this.position.x);
  }
  
  // Анимация покачивания яблока
  startWiggling() {
    if (this.collected) return;
    
    // Регулярно добавляем небольшое "покачивание" яблок
    this.wiggleInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        this.isShaking = true;
        this.element.classList.add('shake');
        
        setTimeout(() => {
          this.isShaking = false;
          this.element.classList.remove('shake');
        }, 500);
      }
    }, 2000);
  }
  
  // Анимация падения яблока
  startFallingAnimation() {
    if (this.isFalling) return;
    
    this.isFalling = true;
    this.element.classList.add('apple-falling');
    
    // Физические параметры падения
    let velocity = { x: 0, y: 0 };
    let gravity = 0.6;
    let friction = 0.98;
    let rotationSpeed = Math.random() * 5 - 2.5;
    
    // Расчет размеров окна
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Уровень, на котором находится ежик
    const hedgehogLevel = viewportHeight - 160;
    const hedgehogBottomLevel = viewportHeight - 80;
    const centerX = viewportWidth / 2;
    
    // Случайное отклонение, куда падает яблоко
    const randomOffsetX = (Math.random() - 0.5) * 150; // Случайное ±75px от центра
    const targetX = centerX + randomOffsetX;
    
    const animateFall = () => {
      // Рассчитываем притяжение к целевой X-координате
      const diffX = targetX - this.fallingPosition.x;
      const attractionForce = diffX * 0.003; // Слабая сила притяжения
      
      // Обновляем скорость с учетом гравитации и притяжения
      velocity.x += attractionForce;
      velocity.y += gravity;
      
      // Применяем сопротивление воздуха
      velocity.x *= friction;
      velocity.y *= friction;
      
      // Обновляем позицию на основе скорости
      this.fallingPosition.x += velocity.x;
      this.fallingPosition.y += velocity.y;
      
      // Обновляем вращение при падении
      this.rotation += rotationSpeed;
      
      // Обновляем стиль элемента
      if (this.element) {
        this.element.style.left = `${this.fallingPosition.x}px`;
        this.element.style.top = `${this.fallingPosition.y}px`;
        this.element.style.transform = `rotate(${this.rotation}deg)`;
        
        // Если яблоко достигло уровня ежика, считаем его "приземлившимся"
        if (this.fallingPosition.y >= hedgehogLevel && this.fallingPosition.y < hedgehogBottomLevel) {
          if (!this.hasLanded) {
            this.hasLanded = true;
            // После приземления яблока на ежика, скрываем яблоко
            setTimeout(() => {
              if (this.element) {
                this.element.style.opacity = '0';
                setTimeout(() => {
                  if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                  }
                }, 200);
              }
            }, 100);
            return;
          }
        }
        
        // Если яблоко упало ниже ежика (прошло мимо), скрываем его
        if (this.fallingPosition.y >= hedgehogBottomLevel) {
          if (!this.hasLanded) {
            this.hasLanded = true;
            if (this.element) {
              this.element.style.opacity = '0';
              setTimeout(() => {
                if (this.element && this.element.parentNode) {
                  this.element.parentNode.removeChild(this.element);
                }
              }, 200);
            }
            return;
          }
        }
      }
      
      // Продолжаем анимацию, если яблоко еще не приземлилось
      if (!this.hasLanded) {
        this.animationFrameId = requestAnimationFrame(animateFall);
      }
    };
    
    this.animationFrameId = requestAnimationFrame(animateFall);
  }
  
  // Метод для остановки всех анимаций и очистки ресурсов
  cleanup() {
    if (this.wiggleInterval) {
      clearInterval(this.wiggleInterval);
    }
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}