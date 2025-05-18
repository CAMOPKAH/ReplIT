/**
 * Основной класс игры, объединяющий все компоненты
 */
class AppleGame {
  constructor() {
    this.gameContainer = document.getElementById('game-container');
    this.soundButton = document.getElementById('sound-button');
    
    // Компоненты игры
    this.appleTree = null;
    this.numberSelection = null;
    this.successScreen = null;
    
    // Инициализация обработчиков событий и состояний
    this.initEventListeners();
    this.initGameStateHandlers();
    
    // Запуск игры
    this.start();
  }
  
  // Инициализация обработчиков событий
  initEventListeners() {
    // Обработчик кнопки звука
    if (this.soundButton) {
      this.soundButton.addEventListener('click', () => {
        const isMuted = audioManager.toggleMute();
        this.soundButton.textContent = isMuted ? '🔇' : '🔊';
      });
    }
    
    // Обработчик изменения размеров окна
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }
  
  // Обработчики изменения состояния игры
  initGameStateHandlers() {
    // Обработчик состояния сбора яблок
    gameState.onStateChange(gameState.STATES.COLLECTING, () => {
      this.showCollectingPhase();
    });
    
    // Обработчик состояния выбора числа
    gameState.onStateChange(gameState.STATES.SELECTING, () => {
      this.showNumberSelectionPhase();
    });
    
    // Обработчик состояния успеха
    gameState.onStateChange(gameState.STATES.SUCCESS, () => {
      this.showSuccessPhase();
    });
    
    // Обработчик состояния подсказки
    gameState.onStateChange(gameState.STATES.HINT, () => {
      // Здесь можно добавить логику для отображения подсказок,
      // но в текущей реализации это обрабатывается внутри NumberSelection
    });
  }
  
  // Запуск игры
  start() {
    // Озвучивание начального сообщения
    setTimeout(() => {
      audioManager.speak(gameState.messages.start);
    }, 1000);
    
    // Запуск фоновой музыки, если звук включен
    if (!audioManager.isMuted) {
      audioManager.backgroundMusic.play().catch(err => {
        console.warn('Автоматическое воспроизведение музыки заблокировано браузером.', err);
      });
    }
    
    // Показываем начальную фазу (сбор яблок)
    this.showCollectingPhase();
  }
  
  // Обработка изменения размера окна
  handleResize() {
    // Перерисовываем текущую фазу игры при изменении размера окна
    switch(gameState.currentState) {
      case gameState.STATES.COLLECTING:
        this.showCollectingPhase();
        break;
      case gameState.STATES.SELECTING:
        this.showNumberSelectionPhase();
        break;
      case gameState.STATES.SUCCESS:
        this.showSuccessPhase();
        break;
    }
  }
  
  // Показ фазы сбора яблок
  showCollectingPhase() {
    // Очищаем контейнер
    this.gameContainer.innerHTML = '';
    
    // Очищаем предыдущие компоненты
    if (this.numberSelection) {
      this.numberSelection.cleanup();
      this.numberSelection = null;
    }
    
    // Создаем новый компонент дерева с яблоками
    this.appleTree = new AppleTree(this.gameContainer);
    this.appleTree.render();
  }
  
  // Показ фазы выбора числа
  showNumberSelectionPhase() {
    // Очищаем предыдущие компоненты
    if (this.appleTree) {
      this.appleTree.cleanup();
      this.appleTree = null;
    }
    
    // Создаем компонент выбора числа
    this.numberSelection = new NumberSelection(this.gameContainer);
    this.numberSelection.render();
  }
  
  // Показ фазы успеха (правильный ответ)
  showSuccessPhase() {
    // Очищаем контейнер
    this.gameContainer.innerHTML = '';
    
    // Очищаем предыдущие компоненты
    if (this.numberSelection) {
      this.numberSelection.cleanup();
      this.numberSelection = null;
    }
    
    if (this.appleTree) {
      this.appleTree.cleanup();
      this.appleTree = null;
    }
    
    // Создаем экран успеха
    const successScreen = createElement('div', { className: 'success-screen' }, [
      createElement('h1', {}, 'Молодец!'),
      createElement('p', {}, 'Ты правильно посчитал, сколько яблок собрал ёжик!'),
      
      // Отображение количества
      createElement('div', { className: 'success-count' }, [
        createElement('div', { className: 'success-number' }, String(gameState.applesCollected)),
        
        // Контейнер для яблок
        (() => {
          const successApples = createElement('div', { className: 'success-apples' });
          
          // Добавление изображений яблок
          for (let i = 0; i < gameState.applesCollected; i++) {
            const appleImg = createElement('img', {
              src: 'assets/apple.svg',
              alt: 'Яблоко',
              className: 'success-apple',
              style: {
                left: `${(i % 5) * 40}px`,
                top: `${Math.floor(i / 5) * 40}px`,
                zIndex: i
              }
            });
            successApples.appendChild(appleImg);
          }
          
          return successApples;
        })()
      ])
    ]);
    
    this.gameContainer.appendChild(successScreen);
    
    // Воспроизводим звуковое сообщение успеха
    audioManager.speak(gameState.messages.success);
  }
}

// Запуск игры после полной загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
  const game = new AppleGame();
});