/**
 * Компонент выбора числа
 */
class NumberSelection {
  constructor(container) {
    this.container = container;
    this.numbers = [];
    this.showHint = false;
    this.promptMessage = "Сколько яблок собрал ёжик?";
    this.element = null;
  }
  
  render() {
    this.generateNumberOptions();
    
    // Очищаем контейнер
    this.container.innerHTML = '';
    
    // Создаем основной элемент
    this.element = createElement('div', { className: 'number-selection' });
    
    // Добавляем подсказку, если нужно
    if (this.showHint) {
      const hintElement = createElement('div', { className: 'hint' },
        `Ёжик собрал ${gameState.applesCollected} яблок${gameState.applesCollected > 1 ? 'а' : ''}. Давай попробуем ещё раз!`
      );
      this.element.appendChild(hintElement);
    }
    
    // Отображаем собранные яблоки
    const applesDisplay = createElement('div', { className: 'apples-display' });
    const applesCollected = createElement('div', { className: 'apples-collected' });
    
    // Создаем изображения собранных яблок
    for (let i = 0; i < gameState.applesCollected; i++) {
      const appleImg = createElement('img', {
        src: 'assets/apple.svg',
        alt: 'Яблоко',
        className: 'apple-collected',
        style: {
          left: `${(i % 5) * 40}px`,
          top: `${Math.floor(i / 5) * 40}px`,
          zIndex: i
        }
      });
      applesCollected.appendChild(appleImg);
    }
    
    applesDisplay.appendChild(applesCollected);
    this.element.appendChild(applesDisplay);
    
    // Добавляем заголовок/подсказку
    const prompt = createElement('h2', { className: 'prompt' }, this.promptMessage);
    this.element.appendChild(prompt);
    
    // Создаем кнопки с числами
    const numbersContainer = createElement('div', { className: 'numbers' });
    this.numbers.forEach(number => {
      const button = createElement('button', {
        className: `number-option ${this.getNumberColor(number)}`,
        onClick: () => this.handleNumberClick(number)
      }, String(number));
      numbersContainer.appendChild(button);
    });
    
    this.element.appendChild(numbersContainer);
    this.container.appendChild(this.element);
    
    // Озвучиваем вопрос через небольшую задержку
    setTimeout(() => {
      audioManager.speak(this.promptMessage);
    }, 500);
  }
  
  // Генерация вариантов чисел для выбора
  generateNumberOptions() {
    const correctNumber = gameState.applesCollected;
    
    // Всегда включаем правильное число
    let options = [correctNumber];
    
    // Добавляем число ниже и выше, если возможно
    if (correctNumber > 1) {
      options.push(correctNumber - 1);
    }
    options.push(correctNumber + 1);
    
    // Добавляем еще один вариант для разнообразия
    let extraNumber;
    do {
      extraNumber = Math.max(1, Math.floor(Math.random() * (correctNumber + 3)));
    } while (options.includes(extraNumber));
    options.push(extraNumber);
    
    // Перемешиваем массив
    options = shuffleArray(options);
    
    this.numbers = options;
  }
  
  // Обработка выбора числа
  handleNumberClick(number) {
    const isCorrect = gameState.selectNumber(number);
    
    if (isCorrect) {
      audioManager.playSuccess();
      audioManager.speakSuccess();
    } else {
      audioManager.playHit();
      audioManager.speakWrong();
      
      // Если это привело к показу подсказки, обновляем состояние и перерисовываем компонент
      if (gameState.incorrectAttempts >= 2 && !this.showHint) {
        this.showHint = true;
        this.render();
      }
    }
  }
  
  // Определение цвета для каждого числа
  getNumberColor(num) {
    switch (num) {
      case 2: return 'number-2'; // Синий
      case 3: return 'number-3'; // Желтый
      case 4: return 'number-4'; // Красный
      case 5: return 'number-5'; // Зеленый
      case 6: return 'number-6'; // Фиолетовый
      default: return ''; // Стиль по умолчанию
    }
  }
  
  // Очистка ресурсов
  cleanup() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}