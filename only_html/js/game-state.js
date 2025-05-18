/**
 * Управление состоянием игры
 */
class GameState {
  constructor() {
    // Константы для состояний игры
    this.STATES = {
      COLLECTING: 'collecting',
      SELECTING: 'selecting',
      SUCCESS: 'success',
      HINT: 'hint'
    };
    
    // Текущее состояние
    this.currentState = this.STATES.COLLECTING;
    
    // Счетчики и настройки
    this.applesCollected = 0;
    this.maxApples = 1; // Начальное количество яблок (простейший уровень)
    this.incorrectAttempts = 0;
    this.correctAnswerStreak = 0;
    
    // Сообщения для озвучивания
    this.messages = {
      success: "Молодец! Ты правильно посчитал, сколько яблок собрал ёжик!",
      start: "Собери яблоки с дерева! Ёжик их съест."
    };
    
    // Обработчики изменения состояния
    this.stateChangeHandlers = {};
  }
  
  // Регистрация обработчика изменений состояния
  onStateChange(state, handler) {
    if (!this.stateChangeHandlers[state]) {
      this.stateChangeHandlers[state] = [];
    }
    this.stateChangeHandlers[state].push(handler);
  }
  
  // Установка нового состояния
  setState(newState) {
    const oldState = this.currentState;
    this.currentState = newState;
    
    // Запуск обработчиков для нового состояния
    if (this.stateChangeHandlers[newState]) {
      this.stateChangeHandlers[newState].forEach(handler => handler());
    }
    
    // Запуск обработчиков для "any" состояния
    if (this.stateChangeHandlers['any']) {
      this.stateChangeHandlers['any'].forEach(handler => handler(oldState, newState));
    }
    
    return this;
  }
  
  // Сбор яблока
  collectApple() {
    if (this.applesCollected < this.maxApples) {
      this.applesCollected++;
      
      // Если собраны все яблоки, переход к выбору числа
      if (this.applesCollected === this.maxApples) {
        setTimeout(() => {
          this.setState(this.STATES.SELECTING);
        }, 1000);
      }
    }
    
    return this;
  }
  
  // Выбор числа пользователем
  selectNumber(number) {
    if (number === this.applesCollected) {
      // Верный ответ
      this.correctAnswerStreak++;
      this.setState(this.STATES.SUCCESS);
      
      // Переход к следующему раунду через 3 секунды
      setTimeout(() => {
        this.resetForNextRound();
      }, 3000);
      
      return true;
    } else {
      // Неверный ответ
      this.incorrectAttempts++;
      this.correctAnswerStreak = 0;
      
      // Показать подсказку после 2-х неверных попыток
      if (this.incorrectAttempts >= 2) {
        this.setState(this.STATES.HINT);
      }
      
      return false;
    }
  }
  
  // Сброс для следующего раунда
  resetForNextRound() {
    // Если пользователь сделал 3 правильных ответа подряд, увеличиваем сложность
    if (this.correctAnswerStreak >= 3) {
      this.maxApples = Math.min(this.maxApples + 1, 10);
      this.correctAnswerStreak = 0;
    }
    
    this.applesCollected = 0;
    this.incorrectAttempts = 0;
    this.setState(this.STATES.COLLECTING);
  }
}

// Создание глобального экземпляра
const gameState = new GameState();