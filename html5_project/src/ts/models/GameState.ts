/**
 * Перечисление возможных состояний игры
 */
export enum GameStateType {
  LOADING = 'loading',
  MAIN_MENU = 'main_menu',
  COLLECTING = 'collecting',
  SELECTING = 'selecting',
  SUCCESS = 'success',
  HINT = 'hint',
  LEVEL_UP = 'level_up'
}

/**
 * Класс для хранения состояния игры и основных параметров
 */
export class GameState {
  // Текущее состояние игры
  private currentState: GameStateType = GameStateType.LOADING;
  
  // Счетчики игры
  private maxApples: number = 1;
  private applesCollected: number = 0;
  private incorrectAttempts: number = 0;
  private correctAnswerStreak: number = 0;
  
  // Сообщения для различных состояний игры
  private messages = {
    start: "Собери яблоки с дерева! Ёжик их съест.",
    question: "Сколько яблок собрал ёжик?",
    success: "Молодец! Ты правильно посчитал, сколько яблок собрал ёжик!",
    hint: "Ёжик собрал {count} яблок{suffix}. Давай попробуем ещё раз!",
    levelUp: "Отлично! Переходим на следующий уровень!"
  };
  
  // Определение типов для обработчиков событий
  private stateHandlers: Record<GameStateType, (() => void)[]> = {
    [GameStateType.LOADING]: [],
    [GameStateType.MAIN_MENU]: [],
    [GameStateType.COLLECTING]: [],
    [GameStateType.SELECTING]: [],
    [GameStateType.SUCCESS]: [],
    [GameStateType.HINT]: [],
    [GameStateType.LEVEL_UP]: []
  };
  
  // Обработчики для событий "any"
  private anyStateHandlers: ((oldState: GameStateType, newState: GameStateType) => void)[] = [];
  
  /**
   * Получение текущего состояния игры
   */
  public getState(): GameStateType {
    return this.currentState;
  }
  
  /**
   * Установка нового состояния игры
   * @param newState Новое состояние
   */
  public setState(newState: GameStateType): void {
    const oldState = this.currentState;
    this.currentState = newState;
    
    // Вызов обработчиков для нового состояния
    this.notifyStateChange(newState);
    
    // Вызов обработчиков для любого состояния
    this.notifyAnyStateChange(oldState, newState);
  }
  
  /**
   * Регистрация обработчика изменения состояния для конкретного состояния
   * @param state Состояние игры для обработки
   * @param handler Функция обработчик
   */
  public onStateChange(state: GameStateType, handler: () => void): void;
  
  /**
   * Регистрация обработчика изменения для любого изменения состояния
   * @param state Специальное значение 'any'
   * @param handler Функция обработчик, получающая старое и новое состояния
   */
  public onStateChange(state: 'any', handler: (oldState: GameStateType, newState: GameStateType) => void): void;
  
  /**
   * Реализация методов регистрации обработчиков
   */
  public onStateChange(
    state: GameStateType | 'any', 
    handler: (() => void) | ((oldState: GameStateType, newState: GameStateType) => void)
  ): void {
    if (state === 'any') {
      this.anyStateHandlers.push(handler as (oldState: GameStateType, newState: GameStateType) => void);
    } else {
      this.stateHandlers[state].push(handler as () => void);
    }
  }
  
  /**
   * Уведомление всех зарегистрированных обработчиков об изменении состояния
   * @param state Состояние, для которого вызываются обработчики
   */
  private notifyStateChange(state: GameStateType): void {
    const handlers = this.stateHandlers[state];
    if (handlers && handlers.length > 0) {
      handlers.forEach((handler: () => void) => {
        handler();
      });
    }
  }
  
  /**
   * Уведомление обработчиков "any" об изменении состояния
   * @param oldState Предыдущее состояние
   * @param newState Новое состояние
   */
  private notifyAnyStateChange(oldState: GameStateType, newState: GameStateType): void {
    if (this.anyStateHandlers.length > 0) {
      this.anyStateHandlers.forEach((handler: (oldState: GameStateType, newState: GameStateType) => void) => {
        handler(oldState, newState);
      });
    }
  }
  
  /**
   * Получение максимального количества яблок на текущем уровне
   */
  public getMaxApples(): number {
    return this.maxApples;
  }
  
  /**
   * Получение количества собранных яблок
   */
  public getApplesCollected(): number {
    return this.applesCollected;
  }
  
  /**
   * Получение количества неправильных попыток
   */
  public getIncorrectAttempts(): number {
    return this.incorrectAttempts;
  }
  
  /**
   * Получение сообщения для текущего состояния
   * @param state Опциональное указание состояния
   */
  public getMessage(state?: GameStateType): string {
    const currentState = state || this.currentState;
    
    switch (currentState) {
      case GameStateType.COLLECTING:
        return this.messages.start;
      case GameStateType.SELECTING:
        return this.messages.question;
      case GameStateType.SUCCESS:
        return this.messages.success;
      case GameStateType.HINT:
        // Вставка правильного числа и окончания в сообщение-подсказку
        const count = this.applesCollected;
        const suffix = count > 1 ? "а" : "";
        return this.messages.hint.replace('{count}', count.toString()).replace('{suffix}', suffix);
      case GameStateType.LEVEL_UP:
        return this.messages.levelUp;
      default:
        return "";
    }
  }
  
  /**
   * Сбор яблока
   */
  public collectApple(): void {
    if (this.applesCollected < this.maxApples) {
      this.applesCollected++;
      
      // Проверка условия автоматического перехода к выбору числа
      if (this.applesCollected === this.maxApples) {
        setTimeout(() => {
          this.setState(GameStateType.SELECTING);
        }, 1000);
      }
    }
  }
  
  /**
   * Проверка выбранного числа
   * @param number Выбранное число
   * @returns true если ответ правильный, false если неправильный
   */
  public checkNumber(number: number): boolean {
    if (number === this.applesCollected) {
      // Правильный ответ
      this.correctAnswerStreak++;
      this.setState(GameStateType.SUCCESS);
      
      // Планирование перехода к следующему уровню
      setTimeout(() => {
        this.resetForNextRound();
      }, 3000);
      
      return true;
    } else {
      // Неправильный ответ
      this.incorrectAttempts++;
      this.correctAnswerStreak = 0;
      
      // Показать подсказку после 2-х неправильных попыток
      if (this.incorrectAttempts >= 2) {
        this.setState(GameStateType.HINT);
      }
      
      return false;
    }
  }
  
  /**
   * Сброс состояния для нового раунда
   */
  private resetForNextRound(): void {
    // Проверка условия повышения уровня сложности
    if (this.correctAnswerStreak >= 3 && this.maxApples < 10) {
      this.maxApples++; // Увеличиваем сложность
      this.correctAnswerStreak = 0; // Сбрасываем счетчик
      this.setState(GameStateType.LEVEL_UP);
      
      // Задержка перед началом нового уровня
      setTimeout(() => {
        this.applesCollected = 0;
        this.incorrectAttempts = 0;
        this.setState(GameStateType.COLLECTING);
      }, 3000);
    } else {
      // Обычный сброс для нового раунда
      this.applesCollected = 0;
      this.incorrectAttempts = 0;
      this.setState(GameStateType.COLLECTING);
    }
  }
  
  /**
   * Сброс игры к начальному состоянию
   */
  public resetGame(): void {
    this.maxApples = 1;
    this.applesCollected = 0;
    this.incorrectAttempts = 0;
    this.correctAnswerStreak = 0;
    this.setState(GameStateType.MAIN_MENU);
  }
}