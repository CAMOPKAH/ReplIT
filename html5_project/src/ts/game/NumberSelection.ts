/**
 * Класс для компонента выбора числа
 */
export class NumberSelection {
  private container: HTMLElement;
  private correctNumber: number;
  private onNumberSelected: (number: number) => void;
  private incorrectAttempts: number;
  private element: HTMLDivElement | null = null;
  private hintElement: HTMLDivElement | null = null;
  
  /**
   * Конструктор компонента выбора числа
   * @param container HTML-элемент, в котором будет отображаться компонент
   * @param correctNumber Правильное число для выбора
   * @param onNumberSelected Функция обратного вызова при выборе числа
   * @param incorrectAttempts Количество неправильных попыток
   */
  constructor(
    container: HTMLElement,
    correctNumber: number,
    onNumberSelected: (number: number) => void,
    incorrectAttempts: number = 0
  ) {
    this.container = container;
    this.correctNumber = correctNumber;
    this.onNumberSelected = onNumberSelected;
    this.incorrectAttempts = incorrectAttempts;
    
    this.render();
  }
  
  /**
   * Создание и отрисовка компонента выбора числа
   */
  private render(): void {
    // Создание контейнера для выбора числа
    this.element = document.createElement('div');
    this.element.className = 'number-selection';
    
    // Добавление подсказки, если уже были неправильные попытки
    if (this.incorrectAttempts >= 2) {
      this.showHint(`Ёжик собрал ${this.correctNumber} яблок${this.correctNumber > 1 ? 'а' : ''}. Давай попробуем ещё раз!`);
    }
    
    // Добавление отображения собранных яблок
    const applesDisplay = document.createElement('div');
    applesDisplay.className = 'apples-display';
    
    const applesCollected = document.createElement('div');
    applesCollected.className = 'apples-collected';
    
    // Добавление изображений яблок
    for (let i = 0; i < this.correctNumber; i++) {
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
    this.element.appendChild(applesDisplay);
    
    // Добавление вопроса
    const prompt = document.createElement('h2');
    prompt.className = 'prompt';
    prompt.textContent = 'Сколько яблок собрал ёжик?';
    this.element.appendChild(prompt);
    
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
    
    this.element.appendChild(numbersContainer);
    
    // Добавление в контейнер
    this.container.appendChild(this.element);
  }
  
  /**
   * Генерация вариантов чисел для выбора
   * @returns Массив чисел для выбора
   */
  private generateNumberOptions(): number[] {
    // Всегда включаем правильное число
    let options = [this.correctNumber];
    
    // Добавляем число ниже и выше, если возможно
    if (this.correctNumber > 1) {
      options.push(this.correctNumber - 1);
    }
    options.push(this.correctNumber + 1);
    
    // Добавляем еще один вариант для разнообразия
    let extraNumber;
    do {
      extraNumber = Math.max(1, Math.floor(Math.random() * (this.correctNumber + 3)));
    } while (options.includes(extraNumber));
    options.push(extraNumber);
    
    // Перемешиваем варианты
    return this.shuffleArray(options);
  }
  
  /**
   * Перемешивание массива (алгоритм Фишера-Йейтса)
   * @param array Исходный массив
   * @returns Перемешанный массив
   */
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  /**
   * Определение цвета для числа
   * @param num Число
   * @returns Класс CSS для цвета
   */
  private getNumberColor(num: number): string {
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
  
  /**
   * Обработчик нажатия на кнопку с числом
   * @param number Выбранное число
   */
  private handleNumberClick(number: number): void {
    // Уведомление о выбранном числе
    this.onNumberSelected(number);
    
    // Визуальная реакция на выбор
    const numberButtons = this.element?.querySelectorAll('.number-option');
    if (numberButtons) {
      numberButtons.forEach(button => {
        if (button.textContent === number.toString()) {
          if (number === this.correctNumber) {
            // Правильный ответ
            button.classList.add('correct');
            button.classList.add('bounce');
          } else {
            // Неверный ответ
            button.classList.add('incorrect');
            button.classList.add('shake');
            
            // Уменьшение прозрачности неправильной кнопки
            (button as HTMLElement).style.opacity = '0.5';
            
            // Блокировка повторного нажатия на неправильный ответ
            button.setAttribute('disabled', 'true');
          }
        }
      });
    }
  }
  
  /**
   * Показ подсказки
   * @param message Текст подсказки
   */
  public showHint(message: string): void {
    // Если подсказка уже отображается, просто обновляем текст
    if (this.hintElement) {
      this.hintElement.textContent = message;
      return;
    }
    
    // Создание элемента подсказки
    this.hintElement = document.createElement('div');
    this.hintElement.className = 'hint';
    this.hintElement.textContent = message;
    
    // Добавление подсказки в компонент
    if (this.element) {
      this.element.insertBefore(this.hintElement, this.element.firstChild);
    }
    
    // Подсветка правильного ответа
    const numberButtons = this.element?.querySelectorAll('.number-option');
    if (numberButtons) {
      numberButtons.forEach(button => {
        if (button.textContent === this.correctNumber.toString()) {
          button.classList.add('pulse');
          (button as HTMLElement).style.boxShadow = '0 0 15px 5px rgba(46, 204, 113, 0.7)';
        } else {
          // Затемнение неправильных ответов
          (button as HTMLElement).style.opacity = '0.5';
        }
      });
    }
  }
  
  /**
   * Очистка ресурсов компонента
   */
  public cleanup(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
      this.hintElement = null;
    }
  }
}