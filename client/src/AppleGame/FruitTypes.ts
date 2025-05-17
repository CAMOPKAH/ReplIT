// Типы фруктов
export enum FruitType {
  APPLE = 'apple',
  PEAR = 'pear',
  BANANA = 'banana',
  ORANGE = 'orange',
  STRAWBERRY = 'strawberry'
}

// Названия фруктов на русском языке
export const fruitNames = {
  [FruitType.APPLE]: 'яблоко',
  [FruitType.PEAR]: 'груша',
  [FruitType.BANANA]: 'банан',
  [FruitType.ORANGE]: 'апельсин',
  [FruitType.STRAWBERRY]: 'клубника'
};

// Многие варианты фруктов
export const fruitNamesPlural = {
  [FruitType.APPLE]: 'яблок',
  [FruitType.PEAR]: 'груш',
  [FruitType.BANANA]: 'бананов',
  [FruitType.ORANGE]: 'апельсинов',
  [FruitType.STRAWBERRY]: 'клубники'
};

// Пути к изображениям фруктов
export const fruitImages = {
  [FruitType.APPLE]: '/assets/apple.svg',
  [FruitType.PEAR]: '/assets/pear.svg',
  [FruitType.BANANA]: '/assets/banana.svg',
  [FruitType.ORANGE]: '/assets/orange.svg',
  [FruitType.STRAWBERRY]: '/assets/strawberry.svg'
};

// Цвета для каждого типа фруктов (для мини-игры с сортировкой)
export const fruitColors = {
  [FruitType.APPLE]: 'red',
  [FruitType.PEAR]: 'green',
  [FruitType.BANANA]: 'yellow',
  [FruitType.ORANGE]: 'orange',
  [FruitType.STRAWBERRY]: 'red'
};

// Размеры фруктов (для мини-игры с сортировкой)
export const fruitSizes = {
  [FruitType.APPLE]: 'medium',
  [FruitType.PEAR]: 'medium',
  [FruitType.BANANA]: 'large',
  [FruitType.ORANGE]: 'medium',
  [FruitType.STRAWBERRY]: 'small'
};

// Игровые режимы
export enum GameMode {
  COUNTING = 'counting',           // Обычный режим счета
  SORTING_BY_COLOR = 'sortColor',  // Сортировка по цвету
  SORTING_BY_SIZE = 'sortSize',    // Сортировка по размеру
  MATH_ADDITION = 'addition',      // Сложение
  MATH_SUBTRACTION = 'subtraction' // Вычитание
}

// Объект с названиями режимов игры на русском
export const gameModeNames = {
  [GameMode.COUNTING]: 'Счет',
  [GameMode.SORTING_BY_COLOR]: 'Сортировка по цвету',
  [GameMode.SORTING_BY_SIZE]: 'Сортировка по размеру',
  [GameMode.MATH_ADDITION]: 'Сложение',
  [GameMode.MATH_SUBTRACTION]: 'Вычитание'
};