import { AudioManager } from '../audio/AudioManager';
import { ResourceLoader } from '../utils/ResourceLoader';
import { GameState, GameStateType } from '../models/GameState';
import { Apple } from './Apple';
import { Hedgehog } from './Hedgehog';
import { NumberSelection } from './NumberSelection';

/**
 * Основной класс игры, объединяющий все компоненты
 */
export class Game {
  private container: HTMLElement;
  private audioManager: AudioManager;
  private resourceLoader: ResourceLoader;
  private gameState: GameState;
  
  // Элементы игры
  private mainMenuElement: HTMLElement | null = null;
  private gameFieldElement: HTMLElement | null = null;
  private treeContainer: HTMLElement | null = null;
  private hedgehog: Hedgehog | null = null;
  private apples: Apple[] = [];
  private numberSelection: NumberSelection | null = null;
  private soundButton: HTMLButtonElement | null = null;
  
  // Флаг, указывающий, что игра инициализирована
  private initialized: boolean = false;
  
  /**
   * Конструктор класса игры
   * @param container HTML-элемент, в котором будет отображаться игра
   * @param audioManager Менеджер аудио
   * @param resourceLoader Загрузчик ресурсов
   */
  constructor(
    container: HTMLElement,
    audioManager: AudioManager,
    resourceLoader: ResourceLoader
  ) {
    this.container = container;
    this.audioManager = audioManager;
    this.resourceLoader = resourceLoader;
    this.gameState = new GameState();
    
    // Инициализация обработчиков событий состояния игры
    this.initStateHandlers();
  }
  
  /**
   * Инициализация обработчиков изменения состояния игры
   */
  private initStateHandlers(): void {
    // Переход в главное меню
    this.gameState.onStateChange(GameStateType.MAIN_MENU, () => {
      this.showMainMenu();
    });
    
    // Переход в фазу сбора яблок
    this.gameState.onStateChange(GameStateType.COLLECTING, () => {
      this.showCollectingPhase();
    });
    
    // Переход в фазу выбора числа
    this.gameState.onStateChange(GameStateType.SELECTING, () => {
      this.showNumberSelectionPhase();
    });
    
    // Переход к экрану успеха
    this.gameState.onStateChange(GameStateType.SUCCESS, () => {
      this.showSuccessScreen();
    });
    
    // Показ подсказки
    this.gameState.onStateChange(GameStateType.HINT, () => {
      this.showHint();
    });
    
    // Переход к экрану повышения уровня
    this.gameState.onStateChange(GameStateType.LEVEL_UP, () => {
      this.showLevelUpScreen();
    });
  }
  
  /**
   * Начало игры
   */
  public start(): void {
    if (!this.initialized) {
      // Инициализация звуков
      this.audioManager.initSounds(
        this.resourceLoader.getSound('background') || 'assets/sounds/background.mp3',
        this.resourceLoader.getSound('hit') || 'assets/sounds/hit.mp3',
        this.resourceLoader.getSound('success') || 'assets/sounds/success.mp3',
        this.resourceLoader.getSound('nyam') || 'assets/sounds/nyam.mp3'
      );
      
      // Добавление кнопки звука
      this.createSoundButton();
      
      this.initialized = true;
    }
    
    // Переход в главное меню
    this.gameState.setState(GameStateType.MAIN_MENU);
  }
  
  /**
   * Создание кнопки управления звуком
   */
  private createSoundButton(): void {
    this.soundButton = document.createElement('button');
    this.soundButton.className = 'sound-button';
    this.soundButton.textContent = this.audioManager.getMuteState() ? '🔇' : '🔊';
    this.soundButton.addEventListener('click', this.toggleSound.bind(this));
    this.container.appendChild(this.soundButton);
  }
  
  /**
   * Переключение звука
   */
  private toggleSound(): void {
    const isMuted = this.audioManager.toggleMute();
    if (this.soundButton) {
      this.soundButton.textContent = isMuted ? '🔇' : '🔊';
    }
  }
  
  /**
   * Отображение главного меню
   */
  private showMainMenu(): void {
    // Очистка контейнера
    this.clearGameContainer();
    
    // Создание элемента главного меню
    this.mainMenuElement = document.createElement('div');
    this.mainMenuElement.id = 'main-menu';
    
    // Добавление заголовка
    const title = document.createElement('h1');
    title.className = 'game-title';
    title.textContent = 'Яблоки и ёжик';
    this.mainMenuElement.appendChild(title);
    
    // Добавление изображения ёжика
    const hedgehogImage = document.createElement('img');
    hedgehogImage.src = 'assets/images/3d-hedgehog.svg';
    hedgehogImage.alt = 'Ёжик';
    hedgehogImage.className = 'hedgehog-image';
    this.mainMenuElement.appendChild(hedgehogImage);
    
    // Добавление кнопки начала игры
    const startButton = document.createElement('button');
    startButton.className = 'start-button';
    startButton.textContent = 'Начать игру';
    startButton.addEventListener('click', () => {
      this.gameState.setState(GameStateType.COLLECTING);
    });
    this.mainMenuElement.appendChild(startButton);
    
    // Добавление инструкции
    const instruction = document.createElement('p');
    instruction.textContent = 'Собирай яблоки и учись считать вместе с ёжиком!';
    this.mainMenuElement.appendChild(instruction);
    
    // Добавление в контейнер
    this.container.appendChild(this.mainMenuElement);
  }
  
  /**
   * Отображение фазы сбора яблок
   */
  private showCollectingPhase(): void {
    // Очистка контейнера
    this.clearGameContainer();
    
    // Создание игрового поля
    this.gameFieldElement = document.createElement('div');
    this.gameFieldElement.id = 'game-field';
    this.gameFieldElement.className = 'game-field';
    
    // Создание контейнера для дерева и яблок
    this.treeContainer = document.createElement('div');
    this.treeContainer.className = 'tree-container';
    
    // Добавление дерева
    const treeSvg = document.createElement('img');
    treeSvg.src = 'assets/images/isometric-tree.svg';
    treeSvg.alt = 'Яблочное дерево';
    treeSvg.className = 'tree-svg';
    this.treeContainer.appendChild(treeSvg);
    
    // Добавление ёжика
    this.hedgehog = new Hedgehog(this.treeContainer);
    
    // Добавление счетчика собранных яблок
    const applesCounter = document.createElement('div');
    applesCounter.className = 'apples-collected-counter';
    
    const appleIcon = document.createElement('img');
    appleIcon.src = 'assets/images/apple.svg';
    appleIcon.alt = 'Яблоко';
    appleIcon.className = 'apple-icon';
    applesCounter.appendChild(appleIcon);
    
    const applesCount = document.createElement('span');
    applesCount.className = 'apples-count';
    applesCount.textContent = '0';
    applesCounter.appendChild(applesCount);
    
    this.treeContainer.appendChild(applesCounter);
    
    // Генерация яблок
    this.generateApples();
    
    // Добавление контейнера дерева в игровое поле
    this.gameFieldElement.appendChild(this.treeContainer);
    
    // Добавление игрового поля в основной контейнер
    this.container.appendChild(this.gameFieldElement);
    
    // Озвучивание начального сообщения
    setTimeout(() => {
      this.audioManager.speak(this.gameState.getMessage());
    }, 500);
  }
  
  /**
   * Генерация яблок на дереве
   */
  private generateApples(): void {
    if (!this.treeContainer) return;
    
    // Очистка предыдущих яблок
    this.apples = [];
    
    // Определение параметров для расположения яблок
    const foliageCircles = [
      { cx: 250, cy: 200, r: 42 },
      { cx: 330, cy: 150, r: 50 },
      { cx: 400, cy: 130, r: 60 },
      { cx: 470, cy: 150, r: 50 },
      { cx: 550, cy: 200, r: 42 },
      { cx: 290, cy: 180, r: 45 },
      { cx: 510, cy: 180, r: 45 }
    ];
    
    // Создание яблок
    const maxApples = this.gameState.getMaxApples();
    for (let i = 0; i < maxApples; i++) {
      // Выбор случайного круга для размещения яблока
      const circleIndex = Math.floor(Math.random() * foliageCircles.length);
      const circle = foliageCircles[circleIndex];
      
      // Случайное смещение внутри круга
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * circle.r * 0.7;
      const x = circle.cx + Math.cos(angle) * distance;
      const y = circle.cy + Math.sin(angle) * distance;
      
      // Создание яблока
      const apple = new Apple(
        i,
        { x, y },
        this.treeContainer,
        this.handleAppleCollected.bind(this)
      );
      
      this.apples.push(apple);
    }
  }
  
  /**
   * Обработчик события сбора яблока
   * @param id Идентификатор собранного яблока
   * @param x X-координата яблока
   */
  private handleAppleCollected(id: number, x: number): void {
    // Сбор яблока в игровом состоянии
    this.gameState.collectApple();
    
    // Обновление счетчика на экране
    const applesCountElement = document.querySelector('.apples-count');
    if (applesCountElement) {
      applesCountElement.textContent = this.gameState.getApplesCollected().toString();
    }
    
    // Звуковые эффекты
    this.audioManager.playHit();
    this.audioManager.speakCount(this.gameState.getApplesCollected());
    
    // Анимация ежика
    if (this.hedgehog) {
      this.hedgehog.moveToApple(x);
      
      setTimeout(() => {
        if (this.hedgehog) {
          this.hedgehog.showEatingAnimation();
          this.audioManager.playNyam();
        }
      }, 900);
    }
  }
  
  /**
   * Отображение фазы выбора числа
   */
  private showNumberSelectionPhase(): void {
    // Очистка контейнера
    this.clearGameContainer();
    
    // Создание компонента выбора числа
    this.numberSelection = new NumberSelection(
      this.container,
      this.gameState.getApplesCollected(),
      this.handleNumberSelected.bind(this),
      this.gameState.getIncorrectAttempts()
    );
    
    // Озвучивание вопроса
    setTimeout(() => {
      this.audioManager.speak(this.gameState.getMessage());
    }, 500);
  }
  
  /**
   * Обработчик выбора числа
   * @param number Выбранное число
   */
  private handleNumberSelected(number: number): void {
    const isCorrect = this.gameState.checkNumber(number);
    
    if (isCorrect) {
      this.audioManager.playSuccess();
      this.audioManager.speakSuccess();
    } else {
      this.audioManager.playHit();
      this.audioManager.speakWrong();
    }
  }
  
  /**
   * Отображение экрана успеха
   */
  private showSuccessScreen(): void {
    // Очистка контейнера
    this.clearGameContainer();
    
    // Создание экрана успеха
    const successScreen = document.createElement('div');
    successScreen.className = 'success-screen';
    
    // Заголовок
    const title = document.createElement('h1');
    title.textContent = 'Молодец!';
    successScreen.appendChild(title);
    
    // Текст поздравления
    const message = document.createElement('p');
    message.textContent = 'Ты правильно посчитал, сколько яблок собрал ёжик!';
    successScreen.appendChild(message);
    
    // Визуализация собранных яблок
    const successCount = document.createElement('div');
    successCount.className = 'success-count';
    
    // Отображение числа
    const successNumber = document.createElement('div');
    successNumber.className = 'success-number';
    successNumber.textContent = this.gameState.getApplesCollected().toString();
    successCount.appendChild(successNumber);
    
    // Отображение яблок
    const successApples = document.createElement('div');
    successApples.className = 'success-apples';
    
    for (let i = 0; i < this.gameState.getApplesCollected(); i++) {
      const appleImg = document.createElement('img');
      appleImg.src = 'assets/images/apple.svg';
      appleImg.alt = 'Яблоко';
      appleImg.className = 'success-apple';
      appleImg.style.left = `${(i % 5) * 40}px`;
      appleImg.style.top = `${Math.floor(i / 5) * 40}px`;
      appleImg.style.zIndex = `${i}`;
      successApples.appendChild(appleImg);
    }
    
    successCount.appendChild(successApples);
    successScreen.appendChild(successCount);
    
    // Добавление в контейнер
    this.container.appendChild(successScreen);
    
    // Озвучивание сообщения успеха
    this.audioManager.speak(this.gameState.getMessage());
  }
  
  /**
   * Отображение подсказки
   */
  private showHint(): void {
    if (!this.numberSelection) return;
    
    // Добавление подсказки в компонент выбора числа
    this.numberSelection.showHint(this.gameState.getMessage(GameStateType.HINT));
    
    // Озвучивание подсказки
    this.audioManager.speak(this.gameState.getMessage(GameStateType.HINT));
  }
  
  /**
   * Отображение экрана повышения уровня
   */
  private showLevelUpScreen(): void {
    // Очистка контейнера
    this.clearGameContainer();
    
    // Создание экрана повышения уровня
    const levelUpScreen = document.createElement('div');
    levelUpScreen.className = 'success-screen level-up-screen';
    
    // Заголовок
    const title = document.createElement('h1');
    title.textContent = 'Отлично!';
    levelUpScreen.appendChild(title);
    
    // Текст о повышении уровня
    const message = document.createElement('p');
    message.textContent = 'Переходим на следующий уровень!';
    levelUpScreen.appendChild(message);
    
    // Информация о повышении уровня
    const levelInfo = document.createElement('div');
    levelInfo.className = 'level-info';
    levelInfo.innerHTML = `
      <p>Теперь будет <strong>${this.gameState.getMaxApples()}</strong> яблок!</p>
    `;
    levelUpScreen.appendChild(levelInfo);
    
    // Добавление в контейнер
    this.container.appendChild(levelUpScreen);
    
    // Озвучивание сообщения о повышении уровня
    this.audioManager.speak(this.gameState.getMessage());
  }
  
  /**
   * Очистка игрового контейнера
   */
  private clearGameContainer(): void {
    // Удаление элементов игры
    if (this.mainMenuElement && this.mainMenuElement.parentNode) {
      this.mainMenuElement.parentNode.removeChild(this.mainMenuElement);
      this.mainMenuElement = null;
    }
    
    if (this.gameFieldElement && this.gameFieldElement.parentNode) {
      this.gameFieldElement.parentNode.removeChild(this.gameFieldElement);
      this.gameFieldElement = null;
      this.treeContainer = null;
    }
    
    if (this.numberSelection) {
      this.numberSelection.cleanup();
      this.numberSelection = null;
    }
    
    // Очистка контейнера, но сохранение кнопки звука
    const soundButton = this.soundButton;
    this.container.innerHTML = '';
    
    if (soundButton) {
      this.container.appendChild(soundButton);
      this.soundButton = soundButton;
    }
  }
}