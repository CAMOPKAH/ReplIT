/**
 * Игра "Яблоки и ёжик" - образовательная игра для обучения счету
 * Автономная HTML5/JavaScript версия без сервера
 */

// Константы для состояний игры
const GAME_STATES = {
  LOADING: 'loading',
  MAIN_MENU: 'main_menu',
  COLLECTING: 'collecting',
  SELECTING: 'selecting',
  SUCCESS: 'success',
  HINT: 'hint',
  LEVEL_UP: 'level_up'
};

// Основной класс игры
class AppleGame {
  constructor() {
    // Игровые переменные
    this.currentState = GAME_STATES.LOADING;
    this.maxApples = 1;
    this.applesCollected = 0;
    this.incorrectAttempts = 0;
    this.correctAnswerStreak = 0;
    this.isMuted = false;
    this.resources = { images: {}, sounds: {} };
    this.gameContainer = document.getElementById('game-container');
    
    // Обработчики изменений состояния
    this.stateHandlers = {};
    
    // Настройка звуков
    this.setupAudio();
    
    // Загрузка ресурсов
    this.loadResources(() => {
      this.initGame();
    });
  }
  
  // Загрузка всех необходимых ресурсов
  loadResources(callback) {
    const imagesToLoad = [
      { id: 'tree', src: 'assets/images/isometric-tree.svg' },
      { id: 'apple', src: 'assets/images/apple.svg' },
      { id: 'hedgehog', src: 'assets/images/3d-hedgehog.svg' }
    ];
    
    const soundsToLoad = [
      { id: 'background', src: 'assets/sounds/background.mp3' },
      { id: 'hit', src: 'assets/sounds/hit.mp3' },
      { id: 'success', src: 'assets/sounds/success.mp3' },
      { id: 'nyam', src: 'assets/sounds/nyam.mp3' }
    ];
    
    let totalResources = imagesToLoad.length + soundsToLoad.length;
    let loadedResources = 0;
    
    // Обновление индикатора загрузки
    const updateProgress = () => {
      loadedResources++;
      const progress = Math.round((loadedResources / totalResources) * 100);
      const progressBar = document.getElementById('progress-bar');
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
      
      if (loadedResources === totalResources) {
        // Все ресурсы загружены
        setTimeout(() => {
          const loadingScreen = document.getElementById('loading-screen');
          if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
              loadingScreen.style.display = 'none';
              callback();
            }, 500);
          } else {
            callback();
          }
        }, 500);
      }
    };
    
    // Загрузка изображений
    imagesToLoad.forEach(img => {
      const image = new Image();
      image.onload = updateProgress;
      image.onerror = () => {
        console.error(`Failed to load image: ${img.src}`);
        updateProgress();
      };
      image.src = img.src;
      this.resources.images[img.id] = image;
    });
    
    // Загрузка звуков
    soundsToLoad.forEach(sound => {
      const audio = new Audio();
      audio.oncanplaythrough = updateProgress;
      audio.onerror = () => {
        console.error(`Failed to load sound: ${sound.src}`);
        updateProgress();
      };
      audio.src = sound.src;
      this.resources.sounds[sound.id] = audio;
    });
  }
  
  // Настройка аудио
  setupAudio() {
    // Синтез речи
    this.synth = window.speechSynthesis;
    this.russianVoice = null;
    
    // Загрузка доступных голосов
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      this.russianVoice = voices.find(voice => 
        voice.lang.includes('ru') || voice.name.includes('Russian')
      ) || null;
    };
    
    // Загрузка голосов (для Chrome нужен специальный обработчик)
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
    
    loadVoices();
    
    // Создание кнопки звука
    this.createSoundButton();
  }
  
  // Создание кнопки включения/выключения звука
  createSoundButton() {
    const soundButton = document.createElement('button');
    soundButton.id = 'sound-button';
    soundButton.className = 'sound-button';
    soundButton.textContent = '🔊';
    soundButton.addEventListener('click', () => this.toggleSound());
    this.gameContainer.appendChild(soundButton);
  }
  
  // Переключение звука
  toggleSound() {
    this.isMuted = !this.isMuted;
    
    const soundButton = document.getElementById('sound-button');
    if (soundButton) {
      soundButton.textContent = this.isMuted ? '🔇' : '🔊';
    }
    
    if (this.isMuted) {
      // Остановка всех звуков при выключении
      this.resources.sounds.background.pause();
      if (this.synth) {
        this.synth.cancel();
      }
    } else {
      // Возобновление фоновой музыки при включении
      this.playBackgroundMusic();
    }
  }
  
  // Воспроизведение фоновой музыки
  playBackgroundMusic() {
    if (this.isMuted) return;
    
    const music = this.resources.sounds.background;
    if (music) {
      music.loop = true;
      music.volume = 0.3;
      music.currentTime = 0;
      music.play().catch(err => console.warn('Автоматическое воспроизведение музыки заблокировано браузером:', err));
    }
  }
  
  // Воспроизведение звуковых эффектов
  playSound(id) {
    if (this.isMuted) return;
    
    const sound = this.resources.sounds[id];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.error(`Error playing sound ${id}:`, err));
    }
  }
  
  // Функция для озвучивания текста
  speak(text, rate = 1, pitch = 1) {
    if (this.isMuted || !this.synth) return;
    
    this.synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.russianVoice) {
      utterance.voice = this.russianVoice;
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;
    
    this.synth.speak(utterance);
  }
  
  // Озвучивание числа по-русски
  speakCount(num) {
    if (this.isMuted || !this.synth) return;
    
    if (num > 0 && num <= 10) {
      const russianNumbers = [
        'Один', 'Два', 'Три', 'Четыре', 'Пять', 
        'Шесть', 'Семь', 'Восемь', 'Девять', 'Десять'
      ];
      
      this.speak(russianNumbers[num - 1] + '!', 1.1, 1.2);
      this.playSound('hit');
    }
  }
  
  // Инициализация игры
  initGame() {
    // Регистрация обработчиков состояний
    this.registerStateHandlers();
    
    // Воспроизведение фоновой музыки
    this.playBackgroundMusic();
    
    // Переход в главное меню
    this.setState(GAME_STATES.MAIN_MENU);
  }
  
  // Регистрация обработчиков изменения состояния
  registerStateHandlers() {
    // Главное меню
    this.onStateChange(GAME_STATES.MAIN_MENU, () => {
      this.showMainMenu();
    });
    
    // Фаза сбора яблок
    this.onStateChange(GAME_STATES.COLLECTING, () => {
      this.showCollectingPhase();
    });
    
    // Фаза выбора числа
    this.onStateChange(GAME_STATES.SELECTING, () => {
      this.showNumberSelectionPhase();
    });
    
    // Экран успеха
    this.onStateChange(GAME_STATES.SUCCESS, () => {
      this.showSuccessScreen();
    });
    
    // Экран подсказки
    this.onStateChange(GAME_STATES.HINT, () => {
      this.showHint();
    });
    
    // Экран повышения уровня
    this.onStateChange(GAME_STATES.LEVEL_UP, () => {
      this.showLevelUpScreen();
    });
  }
  
  // Регистрация обработчика состояния
  onStateChange(state, handler) {
    if (!this.stateHandlers[state]) {
      this.stateHandlers[state] = [];
    }
    this.stateHandlers[state].push(handler);
  }
  
  // Изменение состояния игры
  setState(newState) {
    const oldState = this.currentState;
    this.currentState = newState;
    
    // Вызов обработчиков для нового состояния
    const handlers = this.stateHandlers[newState];
    if (handlers && handlers.length > 0) {
      handlers.forEach(handler => handler());
    }
  }
  
  // Показ главного меню
  showMainMenu() {
    // Очистка контейнера
    this.clearGameContainer();
    
    // Создание элемента главного меню
    const mainMenu = document.createElement('div');
    mainMenu.id = 'main-menu';
    
    // Заголовок
    const title = document.createElement('h1');
    title.className = 'game-title';
    title.textContent = 'Яблоки и ёжик';
    mainMenu.appendChild(title);
    
    // Изображение ёжика
    const hedgehog = document.createElement('img');
    hedgehog.src = 'assets/images/3d-hedgehog.svg';
    hedgehog.alt = 'Ёжик';
    hedgehog.className = 'hedgehog-image';
    mainMenu.appendChild(hedgehog);
    
    // Кнопка начала игры
    const startButton = document.createElement('button');
    startButton.className = 'start-button';
    startButton.textContent = 'Начать игру';
    startButton.addEventListener('click', () => {
      this.resetGame();
      this.setState(GAME_STATES.COLLECTING);
    });
    mainMenu.appendChild(startButton);
    
    // Добавление в контейнер
    this.gameContainer.appendChild(mainMenu);
  }
  
  // Очистка игрового контейнера (сохраняя кнопку звука)
  clearGameContainer() {
    // Сохраняем кнопку звука
    const soundButton = document.getElementById('sound-button');
    
    // Очищаем контейнер
    this.gameContainer.innerHTML = '';
    
    // Возвращаем кнопку звука
    if (soundButton) {
      this.gameContainer.appendChild(soundButton);
    }
  }
  
  // Сброс игры к начальным параметрам
  resetGame() {
    this.maxApples = 1;
    this.applesCollected = 0;
    this.incorrectAttempts = 0;
    this.correctAnswerStreak = 0;
  }
  
  // Показ фазы сбора яблок
  showCollectingPhase() {
    // Очистка контейнера
    this.clearGameContainer();
    
    // Создание контейнера для дерева
    const treeContainer = document.createElement('div');
    treeContainer.className = 'tree-container';
    
    // Добавление изображения дерева
    const tree = document.createElement('img');
    tree.src = 'assets/images/isometric-tree.svg';
    tree.alt = 'Яблочное дерево';
    tree.className = 'tree-svg';
    treeContainer.appendChild(tree);
    
    // Добавление счетчика яблок
    const counter = document.createElement('div');
    counter.className = 'apples-collected-counter';
    counter.innerHTML = `
      <img src="assets/images/apple.svg" alt="Яблоко" class="apple-icon">
      <span class="apples-count">${this.applesCollected}</span>
    `;
    treeContainer.appendChild(counter);
    
    // Создание ёжика
    const hedgehogContainer = document.createElement('div');
    hedgehogContainer.className = 'hedgehog-container';
    hedgehogContainer.style.left = '50%';
    hedgehogContainer.style.transform = 'translateX(-50%)';
    
    const hedgehog = document.createElement('img');
    hedgehog.src = 'assets/images/3d-hedgehog.svg';
    hedgehog.alt = 'Ёжик';
    hedgehog.className = 'hedgehog';
    
    hedgehogContainer.appendChild(hedgehog);
    treeContainer.appendChild(hedgehogContainer);
    
    // Генерация и добавление яблок
    this.generateApples(treeContainer);
    
    // Добавление контейнера в игровой контейнер
    this.gameContainer.appendChild(treeContainer);
    
    // Озвучивание инструкции
    setTimeout(() => {
      this.speak('Собери яблоки с дерева! Ёжик их съест.');
    }, 500);
  }
  
  // Генерация яблок на дереве
  generateApples(container) {
    // Массив для хранения данных о яблоках
    this.apples = [];
    
    // Определение областей для размещения яблок
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
    for (let i = 0; i < this.maxApples; i++) {
      // Выбор случайного круга для размещения
      const circleIndex = Math.floor(Math.random() * foliageCircles.length);
      const circle = foliageCircles[circleIndex];
      
      // Случайное смещение внутри круга
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * circle.r * 0.7;
      const x = circle.cx + Math.cos(angle) * distance;
      const y = circle.cy + Math.sin(angle) * distance;
      
      // Создание элемента яблока
      const apple = document.createElement('img');
      apple.src = 'assets/images/apple.svg';
      apple.alt = 'Яблоко';
      apple.className = 'apple';
      apple.style.left = `${x}px`;
      apple.style.top = `${y}px`;
      
      // Сохранение данных о яблоке
      this.apples.push({
        id: i,
        x: x,
        y: y,
        element: apple,
        collected: false
      });
      
      // Добавление обработчика клика для яблока
      apple.addEventListener('click', () => this.handleAppleClick(i));
      
      // Добавление яблока в контейнер
      container.appendChild(apple);
    }
  }
  
  // Обработка клика по яблоку
  handleAppleClick(id) {
    const apple = this.apples.find(a => a.id === id);
    if (!apple || apple.collected || this.applesCollected >= this.maxApples) return;
    
    // Отмечаем яблоко как собранное
    apple.collected = true;
    
    // Запускаем анимацию падения
    this.startAppleFalling(apple);
    
    // Увеличиваем счетчик собранных яблок
    this.applesCollected++;
    
    // Обновляем отображение счетчика
    const countElement = document.querySelector('.apples-count');
    if (countElement) {
      countElement.textContent = this.applesCollected.toString();
    }
    
    // Звуковые эффекты
    this.playSound('hit');
    this.speakCount(this.applesCollected);
    
    // Проверка условия перехода к следующей фазе
    if (this.applesCollected === this.maxApples) {
      setTimeout(() => {
        this.setState(GAME_STATES.SELECTING);
      }, 1000);
    }
  }
  
  // Анимация падения яблока
  startAppleFalling(apple) {
    if (!apple || !apple.element) return;
    
    // Добавляем класс для CSS-анимации падения
    apple.element.classList.add('apple-falling');
    
    // Получаем позицию ёжика
    const hedgehogElement = document.querySelector('.hedgehog-container');
    if (!hedgehogElement) return;
    
    // Целевая позиция (центр ёжика должен быть под яблоком)
    const targetX = apple.x - 75; // Смещение для центрирования ёжика под яблоком
    
    // Анимация движения ёжика к яблоку
    const moveHedgehog = () => {
      const hedgehogRect = hedgehogElement.getBoundingClientRect();
      const hedgehogX = hedgehogRect.left + window.scrollX;
      
      const distanceToTarget = targetX - hedgehogX;
      
      // Если очень близко к цели, устанавливаем точную позицию
      if (Math.abs(distanceToTarget) < 5) {
        hedgehogElement.style.left = `${targetX}px`;
        clearInterval(moveInterval);
        return;
      }
      
      // Иначе двигаемся в направлении цели
      const direction = Math.sign(distanceToTarget);
      const speed = Math.min(Math.abs(distanceToTarget), 15);
      
      const currentLeft = parseFloat(hedgehogElement.style.left) || hedgehogX;
      hedgehogElement.style.left = `${currentLeft + direction * speed}px`;
      hedgehogElement.style.transform = '';
    };
    
    // Запускаем интервал для движения ёжика
    const moveInterval = setInterval(moveHedge, 30);
    
    // Показываем анимацию поедания яблока через некоторое время
    setTimeout(() => {
      const hedgehogImg = hedgehogElement.querySelector('.hedgehog');
      if (hedgehogImg) {
        hedgehogImg.classList.add('hedgehog-eating');
        hedgehogElement.style.animation = 'hedgehog-jump 0.5s';
        
        // Воспроизводим звук поедания
        this.playSound('nyam');
        
        // Возвращаем ёжика в обычное состояние
        setTimeout(() => {
          hedgehogImg.classList.remove('hedgehog-eating');
          hedgehogElement.style.animation = '';
        }, 500);
      }
    }, 900);
  }
  
  // Показ фазы выбора числа
  showNumberSelectionPhase() {
    // Очистка контейнера
    this.clearGameContainer();
    
    // Создание контейнера для выбора числа
    const selectionContainer = document.createElement('div');
    selectionContainer.className = 'number-selection';
    
    // Добавление подсказки, если нужно
    if (this.incorrectAttempts >= 2) {
      const hint = document.createElement('div');
      hint.className = 'hint';
      hint.textContent = `Ёжик собрал ${this.applesCollected} яблок${this.applesCollected > 1 ? 'а' : ''}. Давай попробуем ещё раз!`;
      selectionContainer.appendChild(hint);
    }
    
    // Отображение собранных яблок
    const applesDisplay = document.createElement('div');
    applesDisplay.className = 'apples-display';
    
    const applesCollected = document.createElement('div');
    applesCollected.className = 'apples-collected';
    
    // Добавление изображений яблок
    for (let i = 0; i < this.applesCollected; i++) {
      const appleImg = document.createElement('img');
      appleImg.src = 'assets/images/apple.svg';
      appleImg.alt = 'Яблоко';
      appleImg.className = 'apple-collected';
      appleImg.style.left = `${(i % 5) * 40}px`;
      appleImg.style.top = `${Math.floor(i / 5) * 40}px`;
      appleImg.style.zIndex = `${i}`;
      applesCollected.appendChild(appleImg);
    }
    
    applesDisplay.appendChild(applesCollected);
    selectionContainer.appendChild(applesDisplay);
    
    // Добавление вопроса
    const prompt = document.createElement('h2');
    prompt.className = 'prompt';
    prompt.textContent = 'Сколько яблок собрал ёжик?';
    selectionContainer.appendChild(prompt);
    
    // Генерация и добавление вариантов ответа
    const numbers = this.generateNumberOptions();
    
    const numbersContainer = document.createElement('div');
    numbersContainer.className = 'numbers';
    
    numbers.forEach(number => {
      const button = document.createElement('button');
      button.className = `number-option ${this.getNumberColor(number)}`;
      button.textContent = number.toString();
      button.addEventListener('click', () => this.handleNumberClick(number));
      numbersContainer.appendChild(button);
    });
    
    selectionContainer.appendChild(numbersContainer);
    
    // Добавление в основной контейнер
    this.gameContainer.appendChild(selectionContainer);
    
    // Озвучивание вопроса
    setTimeout(() => {
      this.speak('Сколько яблок собрал ёжик?');
    }, 500);
  }
  
  // Генерация вариантов чисел для выбора
  generateNumberOptions() {
    // Всегда включаем правильное число
    let options = [this.applesCollected];
    
    // Добавляем число ниже и выше, если возможно
    if (this.applesCollected > 1) {
      options.push(this.applesCollected - 1);
    }
    options.push(this.applesCollected + 1);
    
    // Добавляем еще один вариант для разнообразия
    let extraNumber;
    do {
      extraNumber = Math.max(1, Math.floor(Math.random() * (this.applesCollected + 3)));
    } while (options.includes(extraNumber));
    options.push(extraNumber);
    
    // Перемешиваем варианты
    return this.shuffleArray(options);
  }
  
  // Перемешивание массива (алгоритм Фишера-Йейтса)
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  // Определение цвета для числа
  getNumberColor(num) {
    switch (num) {
      case 1: return 'number-1';
      case 2: return 'number-2';
      case 3: return 'number-3';
      case 4: return 'number-4';
      case 5: return 'number-5';
      case 6: return 'number-6';
      case 7: return 'number-7';
      case 8: return 'number-8';
      case 9: return 'number-9';
      case 10: return 'number-10';
      default: return '';
    }
  }
  
  // Обработка выбора числа
  handleNumberClick(number) {
    if (number === this.applesCollected) {
      // Правильный ответ
      this.correctAnswerStreak++;
      
      // Выделение правильного ответа
      this.highlightAnswer(number, true);
      
      // Звуковые эффекты
      this.playSound('success');
      setTimeout(() => {
        this.speak('Молодец! Правильно!', 0.9, 1.1);
      }, 300);
      
      // Переход к экрану успеха
      setTimeout(() => {
        this.setState(GAME_STATES.SUCCESS);
      }, 1000);
    } else {
      // Неправильный ответ
      this.incorrectAttempts++;
      this.correctAnswerStreak = 0;
      
      // Выделение неправильного ответа
      this.highlightAnswer(number, false);
      
      // Звуковые эффекты
      this.playSound('hit');
      setTimeout(() => {
        this.speak('Попробуй еще раз!', 0.9, 1);
      }, 300);
      
      // Показ подсказки после двух неверных попыток
      if (this.incorrectAttempts >= 2) {
        this.setState(GAME_STATES.HINT);
      }
    }
  }
  
  // Выделение выбранного ответа
  highlightAnswer(number, isCorrect) {
    const numberButtons = document.querySelectorAll('.number-option');
    numberButtons.forEach(button => {
      if (button.textContent === number.toString()) {
        if (isCorrect) {
          button.classList.add('correct');
          button.classList.add('bounce');
        } else {
          button.classList.add('incorrect');
          button.classList.add('shake');
          button.style.opacity = '0.5';
        }
      }
    });
  }
  
  // Показ подсказки
  showHint() {
    const selectionContainer = document.querySelector('.number-selection');
    if (!selectionContainer) return;
    
    // Проверяем, есть ли уже подсказка
    if (!document.querySelector('.hint')) {
      // Создание элемента подсказки
      const hint = document.createElement('div');
      hint.className = 'hint';
      hint.textContent = `Ёжик собрал ${this.applesCollected} яблок${this.applesCollected > 1 ? 'а' : ''}. Давай попробуем ещё раз!`;
      
      // Добавление подсказки в начало контейнера
      selectionContainer.insertBefore(hint, selectionContainer.firstChild);
    }
    
    // Подсветка правильного ответа
    const numberButtons = document.querySelectorAll('.number-option');
    numberButtons.forEach(button => {
      if (button.textContent === this.applesCollected.toString()) {
        button.classList.add('pulse');
        button.style.boxShadow = '0 0 15px 5px rgba(46, 204, 113, 0.7)';
      } else {
        button.style.opacity = '0.5';
      }
    });
    
    // Озвучивание подсказки
    this.speak(`Ёжик собрал ${this.applesCollected} яблок${this.applesCollected > 1 ? 'а' : ''}. Давай попробуем ещё раз!`);
  }
  
  // Показ экрана успеха
  showSuccessScreen() {
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
    successNumber.textContent = this.applesCollected.toString();
    successCount.appendChild(successNumber);
    
    // Отображение яблок
    const successApples = document.createElement('div');
    successApples.className = 'success-apples';
    
    for (let i = 0; i < this.applesCollected; i++) {
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
    this.gameContainer.appendChild(successScreen);
    
    // Озвучивание сообщения успеха
    this.speak('Молодец! Ты правильно посчитал, сколько яблок собрал ёжик!');
    
    // Проверка условия повышения уровня
    if (this.correctAnswerStreak >= 3 && this.maxApples < 10) {
      // Повышение уровня
      setTimeout(() => {
        this.setState(GAME_STATES.LEVEL_UP);
      }, 3000);
    } else {
      // Переход к следующему раунду
      setTimeout(() => {
        this.startNextRound();
      }, 3000);
    }
  }
  
  // Показ экрана повышения уровня
  showLevelUpScreen() {
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
      <p>Теперь будет <strong>${this.maxApples + 1}</strong> яблок!</p>
    `;
    levelUpScreen.appendChild(levelInfo);
    
    // Добавление в контейнер
    this.gameContainer.appendChild(levelUpScreen);
    
    // Озвучивание сообщения о повышении уровня
    this.speak('Отлично! Переходим на следующий уровень!');
    
    // Увеличение уровня сложности и сброс счетчика серии
    this.maxApples++;
    this.correctAnswerStreak = 0;
    
    // Переход к следующему раунду
    setTimeout(() => {
      this.startNextRound();
    }, 3000);
  }
  
  // Начало следующего раунда
  startNextRound() {
    this.applesCollected = 0;
    this.incorrectAttempts = 0;
    this.setState(GAME_STATES.COLLECTING);
  }
}

// Запуск игры после полной загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
  const game = new AppleGame();
});