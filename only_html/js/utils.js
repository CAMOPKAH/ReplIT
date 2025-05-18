/**
 * Утилиты для игры
 */

// Создает элемент с заданными атрибутами и дочерними элементами
function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  
  // Установка атрибутов
  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  }
  
  // Добавление дочерних элементов
  if (Array.isArray(children)) {
    children.forEach(child => {
      if (child !== null && child !== undefined) {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      }
    });
  } else if (typeof children === 'string') {
    element.textContent = children;
  }
  
  return element;
}

// Генерирует случайное число в заданном диапазоне
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Проверяет, находится ли точка внутри окружности
function isPointInsideCircle(x, y, circleCenterX, circleCenterY, radius) {
  const dx = x - circleCenterX;
  const dy = y - circleCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < radius;
}

// Функция для перемешивания массива (алгоритм Fisher-Yates)
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}