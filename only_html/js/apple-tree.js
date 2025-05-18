/**
 * Компонент яблочного дерева
 */
class AppleTree {
  constructor(container) {
    this.container = container;
    this.apples = [];
    this.currentCount = 0;
    this.countVisible = false;
    this.counterElement = null;
    this.appleInAir = null;
    this.hedgehog = null;
    this.appleElements = [];
    this.collected = [];
    
    // Представления элементов
    this.treeElement = null;
    this.countVisibleTimeout = null;
    this.moveHedgehogInterval = null;
    
    // Характеристики для проверки размещения яблок
    this.foliageCircles = [
      { cx: 250, cy: 200, r: 42 },   // Top left foliage (moved more left)
      { cx: 330, cy: 150, r: 50 },   // Left-top foliage
      { cx: 400, cy: 130, r: 60 },   // Top center foliage
      { cx: 470, cy: 150, r: 50 },   // Right-top foliage
      { cx: 550, cy: 200, r: 42 },   // Top right foliage (moved more right)
      { cx: 290, cy: 180, r: 45 },   // Middle-left foliage (added)
      { cx: 510, cy: 180, r: 45 }    // Middle-right foliage (added)
    ];
    
    // Начальные позиции яблок
    this.topCrownPositions = [
      { x: 250, y: 180 },  // Top left crown (moved more left)
      { x: 330, y: 135 },  // Left-top crown
      { x: 400, y: 115 },  // Top center crown
      { x: 470, y: 135 },  // Right-top crown
      { x: 550, y: 180 },  // Top right crown (moved more right)
      { x: 340, y: 145 },  // Upper left-center crown
      { x: 370, y: 125 },  // Left of top-center crown
      { x: 430, y: 125 },  // Right of top-center crown
      { x: 460, y: 145 },  // Upper right-center crown
      { x: 400, y: 130 },  // Top-center crown
      { x: 290, y: 160 },  // Far left crown (added)
      { x: 510, y: 160 }   // Far right crown (added)
    ];
  }
  
  // Визуализация дерева и яблок
  render() {
    // Очищаем контейнер
    this.container.innerHTML = '';
    
    // Создаем контейнер дерева
    const treeContainer = createElement('div', { className: 'tree-container' });
    
    // Добавляем изображение дерева
    this.treeElement = createElement('img', {
      src: 'assets/isometric-tree.svg',
      alt: 'Яблочное дерево',
      className: 'tree-svg'
    });
    treeContainer.appendChild(this.treeElement);
    
    // Создаем и позиционируем ежика
    this.hedgehog = new Hedgehog(treeContainer);
    
    // Создаем счетчик собранных яблок
    const appleCounter = createElement('div', { className: 'apples-collected-counter' }, [
      createElement('img', { 
        src: 'assets/apple.svg', 
        alt: 'Яблоко', 
        className: 'apple-icon' 
      }),
      createElement('span', { className: 'apples-count' }, String(gameState.applesCollected))
    ]);
    treeContainer.appendChild(appleCounter);
    
    // Создаем невидимый в начале счетчик текущего числа
    this.counterElement = createElement('div', { 
      className: 'counter',
      style: { display: 'none' }
    }, String(this.currentCount));
    treeContainer.appendChild(this.counterElement);
    
    // Генерация и добавление яблок
    this.generateApples(gameState.maxApples);
    
    // Добавляем все в контейнер
    this.container.appendChild(treeContainer);
  }
  
  // Проверка, находится ли точка в области зеленой кроны дерева
  isInGreenFoliage(x, y) {
    return this.foliageCircles.some(circle => {
      const dx = x - circle.cx;
      const dy = y - circle.cy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance < circle.r;
    });
  }
  
  // Генерация яблок
  generateApples(count) {
    // Очищаем предыдущие яблоки
    this.apples = [];
    this.appleElements = [];
    
    // Перемешиваем позиции
    const shuffledPositions = shuffleArray([...this.topCrownPositions]);
    
    // Создаем новые яблоки
    for (let i = 0; i < Math.min(count, shuffledPositions.length); i++) {
      let validApplePosition = false;
      let finalX = 0, finalY = 0;
      let attempts = 0;
      
      // Пробуем до 5 раз найти позицию в зеленой части кроны
      while (!validApplePosition && attempts < 5) {
        const basePosition = shuffledPositions[i % shuffledPositions.length];
        
        // Проверяем, что координата y существует
        if (basePosition.y === undefined) {
          attempts++;
          continue;
        }
        
        // Случайные небольшие смещения для более естественного вида
        const randomOffsetX = Math.random() * 20 - 10;
        const randomOffsetY = Math.random() * 20 - 10;
        
        const candidateX = basePosition.x + randomOffsetX;
        const candidateY = basePosition.y + randomOffsetY;
        
        // Проверка, находится ли позиция в зеленой части кроны
        if (this.isInGreenFoliage(candidateX, candidateY)) {
          validApplePosition = true;
          finalX = candidateX;
          finalY = candidateY;
        }
        
        attempts++;
      }
      
      // Если не найдена подходящая позиция, используем позицию в центре круга кроны
      if (!validApplePosition) {
        const safeCircle = this.foliageCircles[i % this.foliageCircles.length];
        finalX = safeCircle.cx;
        finalY = safeCircle.cy;
      }
      
      // Создаем яблоко и добавляем его в DOM
      const treeContainer = this.container.querySelector('.tree-container');
      if (treeContainer) {
        const apple = new Apple(
          i, 
          { x: finalX, y: finalY }, 
          treeContainer, 
          this.handleAppleCollected.bind(this)
        );
        
        this.apples.push({
          id: i,
          x: finalX,
          y: finalY,
          collected: false,
          element: apple
        });
      }
    }
  }
  
  // Обработка сбора яблока
  handleAppleCollected(id, xPosition) {
    if (gameState.applesCollected >= gameState.maxApples) return;
    
    // Обновляем состояние яблока на "собранное"
    this.apples = this.apples.map(apple => 
      apple.id === id ? { ...apple, collected: true } : apple
    );
    
    // Установка яблока в воздухе для отслеживания ежиком
    this.appleInAir = { id, x: xPosition };
    this.moveHedgehogToCatchApple();
    
    // Инкремент счетчика с визуальным и звуковым сопровождением
    this.currentCount++;
    this.showCounter();
    audioManager.playHit();
    audioManager.speakCount(this.currentCount);
    
    // Оповещение игрового состояния о сборе яблока
    gameState.collectApple();
    
    // Обновляем счетчик собранных яблок в UI
    const appleCountElement = this.container.querySelector('.apples-count');
    if (appleCountElement) {
      appleCountElement.textContent = String(gameState.applesCollected);
    }
  }
  
  // Показ счетчика собранных яблок
  showCounter() {
    if (this.counterElement) {
      this.counterElement.textContent = String(this.currentCount);
      this.counterElement.style.display = 'flex';
      this.countVisible = true;
      
      // Скрыть счетчик через некоторое время
      clearTimeout(this.countVisibleTimeout);
      this.countVisibleTimeout = setTimeout(() => {
        this.counterElement.style.display = 'none';
        this.countVisible = false;
      }, 1500);
    }
  }
  
  // Движение ежика для ловли падающего яблока
  moveHedgehogToCatchApple() {
    if (!this.appleInAir || !this.hedgehog) return;
    
    // Очищаем предыдущий интервал
    if (this.moveHedgehogInterval) {
      clearInterval(this.moveHedgehogInterval);
    }
    
    // Запуск перемещения ежика к яблоку
    this.moveHedgehogInterval = setInterval(() => {
      // Расчет целевой позиции (центр ежика должен быть под яблоком)
      const targetX = this.appleInAir.x - 75;
      
      // Текущая позиция
      const currentPos = this.hedgehog.position;
      
      // Определение направления и скорости
      const distanceToTarget = targetX - currentPos;
      const direction = Math.sign(distanceToTarget);
      // Двигаемся быстрее, если находимся дальше
      const speed = Math.min(Math.abs(distanceToTarget), 15);
      
      // Если очень близко к цели, переходим сразу к ней
      if (Math.abs(distanceToTarget) < 5) {
        this.hedgehog.setPosition(targetX);
        clearInterval(this.moveHedgehogInterval);
      } else {
        // Иначе двигаемся к ней
        this.hedgehog.setPosition(currentPos + (direction * speed));
      }
    }, 30);
    
    // Показываем анимацию поедания, когда яблоко достигает ежика
    setTimeout(() => {
      if (this.hedgehog) {
        this.hedgehog.showEatingAnimation();
        audioManager.playNyam();
      }
      
      // Сброс состояния падения яблока
      setTimeout(() => {
        if (this.moveHedgehogInterval) {
          clearInterval(this.moveHedgehogInterval);
          this.moveHedgehogInterval = null;
        }
        this.appleInAir = null;
      }, 500);
    }, 900);
  }
  
  // Очистка ресурсов компонента
  cleanup() {
    // Остановка таймеров и интервалов
    if (this.countVisibleTimeout) {
      clearTimeout(this.countVisibleTimeout);
    }
    
    if (this.moveHedgehogInterval) {
      clearInterval(this.moveHedgehogInterval);
    }
    
    // Очистка яблок
    this.apples.forEach(apple => {
      if (apple.element) {
        apple.element.cleanup();
      }
    });
    
    // Удаление ежика
    if (this.hedgehog) {
      this.hedgehog.remove();
    }
    
    // Очистка контейнера
    this.container.innerHTML = '';
  }
}