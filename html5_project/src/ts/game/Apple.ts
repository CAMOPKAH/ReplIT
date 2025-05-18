/**
 * Интерфейс для позиции объекта
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Класс яблока для игры
 */
export class Apple {
  private id: number;
  private position: Position;
  private container: HTMLElement;
  private collected: boolean = false;
  private element: HTMLImageElement | null = null;
  private isShaking: boolean = false;
  private isFalling: boolean = false;
  private hasLanded: boolean = false;
  private rotation: number = 0;
  private fallingPosition: Position;
  private animationFrameId: number | null = null;
  private intervalId: number | null = null;
  private onCollectedCallback: (id: number, x: number) => void;
  
  /**
   * Конструктор яблока
   * @param id Уникальный идентификатор яблока
   * @param position Начальная позиция на дереве
   * @param container HTML-элемент, в котором будет отображаться яблоко
   * @param onCollected Функция обратного вызова при сборе яблока
   */
  constructor(
    id: number,
    position: Position,
    container: HTMLElement,
    onCollected: (id: number, x: number) => void
  ) {
    this.id = id;
    this.position = { ...position };
    this.fallingPosition = { ...position };
    this.container = container;
    this.onCollectedCallback = onCollected;
    
    this.render();
    this.startWiggling();
  }
  
  /**
   * Создание и отрисовка элемента яблока
   */
  private render(): void {
    // Создание элемента яблока
    this.element = document.createElement('img');
    this.element.src = 'assets/images/apple.svg';
    this.element.alt = 'Яблоко';
    this.element.className = 'apple';
    
    // Установка стилей
    this.element.style.left = `${this.position.x}px`;
    this.element.style.top = `${this.position.y}px`;
    this.element.style.transform = 'rotate(0deg)';
    this.element.style.zIndex = '5';
    
    // Добавление обработчика клика
    this.element.addEventListener('click', this.handleClick.bind(this));
    
    // Добавление в контейнер
    this.container.appendChild(this.element);
  }
  
  /**
   * Обработчик нажатия на яблоко
   */
  private handleClick(): void {
    if (this.collected) return;
    
    this.collected = true;
    this.startFallingAnimation();
    this.onCollectedCallback(this.id, this.position.x);
  }
  
  /**
   * Запуск анимации покачивания яблока
   */
  private startWiggling(): void {
    if (this.collected) return;
    
    // Регулярно добавляем небольшое "покачивание" яблок
    this.intervalId = window.setInterval(() => {
      if (Math.random() > 0.8) {
        this.isShaking = true;
        if (this.element) {
          this.element.classList.add('shake');
        }
        
        setTimeout(() => {
          this.isShaking = false;
          if (this.element) {
            this.element.classList.remove('shake');
          }
        }, 500);
      }
    }, 2000);
  }
  
  /**
   * Запуск анимации падения яблока
   */
  private startFallingAnimation(): void {
    if (this.isFalling || !this.element) return;
    
    this.isFalling = true;
    this.element.classList.add('apple-falling');
    
    // Физические параметры падения
    let velocity = { x: 0, y: 0 };
    const gravity = 0.6;
    const friction = 0.98;
    const rotationSpeed = Math.random() * 5 - 2.5;
    
    // Расчет размеров окна
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Определение уровня ёжика (где яблоко должно быть поймано)
    const hedgehogLevel = viewportHeight - 160;
    const hedgehogBottomLevel = viewportHeight - 80;
    
    // Случайное отклонение точки падения от центра
    const centerX = viewportWidth / 2;
    const randomOffsetX = (Math.random() - 0.5) * 150; // Случайное ±75px от центра
    const targetX = centerX + randomOffsetX;
    
    // Функция анимации падения
    const animate = () => {
      // Проверка, что элемент все еще существует
      if (!this.element) {
        this.stopFallingAnimation();
        return;
      }
      
      // Расчет притяжения к целевой X-координате
      const diffX = targetX - this.fallingPosition.x;
      const attractionForce = diffX * 0.003; // Слабая сила притяжения
      
      // Обновление скорости с учетом гравитации и притяжения
      velocity.x += attractionForce;
      velocity.y += gravity;
      
      // Применение сопротивления воздуха
      velocity.x *= friction;
      velocity.y *= friction;
      
      // Обновление позиции
      this.fallingPosition.x += velocity.x;
      this.fallingPosition.y += velocity.y;
      
      // Обновление вращения
      this.rotation += rotationSpeed;
      
      // Обновление стилей элемента
      this.element.style.left = `${this.fallingPosition.x}px`;
      this.element.style.top = `${this.fallingPosition.y}px`;
      this.element.style.transform = `rotate(${this.rotation}deg)`;
      
      // Проверка, достигло ли яблоко уровня ежика
      if (this.fallingPosition.y >= hedgehogLevel && this.fallingPosition.y < hedgehogBottomLevel) {
        if (!this.hasLanded) {
          this.hasLanded = true;
          this.stopFallingAnimation();
          
          // После приземления яблока на ежика, скрываем яблоко
          setTimeout(() => {
            if (this.element) {
              this.element.style.opacity = '0';
              setTimeout(() => this.cleanup(), 200);
            }
          }, 100);
          
          return;
        }
      }
      
      // Проверка, упало ли яблоко ниже ежика (мимо)
      if (this.fallingPosition.y >= hedgehogBottomLevel) {
        if (!this.hasLanded) {
          this.hasLanded = true;
          this.stopFallingAnimation();
          
          // Если яблоко упало мимо, просто скрываем его
          if (this.element) {
            this.element.style.opacity = '0';
            setTimeout(() => this.cleanup(), 200);
          }
          
          return;
        }
      }
      
      // Продолжение анимации
      if (!this.hasLanded) {
        this.animationFrameId = window.requestAnimationFrame(animate);
      }
    };
    
    // Запуск анимации
    this.animationFrameId = window.requestAnimationFrame(animate);
  }
  
  /**
   * Остановка анимации падения
   */
  private stopFallingAnimation(): void {
    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Очистка ресурсов яблока
   */
  public cleanup(): void {
    this.stopFallingAnimation();
    
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}