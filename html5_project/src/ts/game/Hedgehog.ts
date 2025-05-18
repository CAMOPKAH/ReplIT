/**
 * Класс ёжика для игры
 */
export class Hedgehog {
  private container: HTMLElement;
  private element: HTMLDivElement | null = null;
  private hedgehogImage: HTMLImageElement | null = null;
  private position: number;
  private isEating: boolean = false;
  private moveIntervalId: number | null = null;
  
  /**
   * Конструктор ёжика
   * @param container HTML-элемент, в котором будет отображаться ёжик
   */
  constructor(container: HTMLElement) {
    this.container = container;
    this.position = window.innerWidth / 2;
    this.render();
  }
  
  /**
   * Создание и отрисовка элемента ёжика
   */
  private render(): void {
    // Создание контейнера для ёжика
    this.element = document.createElement('div');
    this.element.className = 'hedgehog-container';
    this.element.style.left = `${this.position}px`;
    
    // Создание изображения ёжика
    this.hedgehogImage = document.createElement('img');
    this.hedgehogImage.src = 'assets/images/3d-hedgehog.svg';
    this.hedgehogImage.alt = 'Ёжик';
    this.hedgehogImage.className = 'hedgehog';
    
    // Добавление изображения в контейнер
    this.element.appendChild(this.hedgehogImage);
    
    // Добавление ёжика в контейнер игры
    this.container.appendChild(this.element);
  }
  
  /**
   * Перемещение ёжика к указанной позиции (для ловли яблока)
   * @param targetX Х-координата цели (яблока)
   */
  public moveToApple(targetX: number): void {
    if (!this.element) return;
    
    // Очистка предыдущего интервала (если был)
    if (this.moveIntervalId !== null) {
      clearInterval(this.moveIntervalId);
    }
    
    // Целевая позиция (центр ёжика должен быть под яблоком)
    const finalTargetX = targetX - 75; // Смещение для центрирования ёжика под яблоком
    
    // Запуск интервала для плавного перемещения
    this.moveIntervalId = window.setInterval(() => {
      // Расчет расстояния до цели
      const distanceToTarget = finalTargetX - this.position;
      
      // Если очень близко к цели, устанавливаем точную позицию
      if (Math.abs(distanceToTarget) < 5) {
        this.position = finalTargetX;
        this.updatePosition();
        clearInterval(this.moveIntervalId as number);
        this.moveIntervalId = null;
        return;
      }
      
      // Иначе двигаемся в направлении цели
      const direction = Math.sign(distanceToTarget);
      // Скорость движения пропорциональна расстоянию (быстрее если дальше)
      const speed = Math.min(Math.abs(distanceToTarget), 15);
      
      // Обновление позиции
      this.position += direction * speed;
      this.updatePosition();
    }, 30);
  }
  
  /**
   * Обновление позиции элемента ёжика
   */
  private updatePosition(): void {
    if (this.element) {
      this.element.style.left = `${this.position}px`;
    }
  }
  
  /**
   * Показ анимации поедания яблока
   */
  public showEatingAnimation(): void {
    if (!this.element || !this.hedgehogImage || this.isEating) return;
    
    this.isEating = true;
    
    // Анимация подпрыгивания контейнера
    this.element.style.animation = 'hedgehog-jump 0.5s';
    
    // Анимация "поедания" для самого изображения ёжика
    this.hedgehogImage.classList.add('hedgehog-eating');
    
    // Возврат к обычному состоянию после анимации
    setTimeout(() => {
      if (this.element && this.hedgehogImage) {
        this.element.style.animation = '';
        this.hedgehogImage.classList.remove('hedgehog-eating');
        this.isEating = false;
      }
    }, 500);
  }
  
  /**
   * Очистка ресурсов ёжика
   */
  public cleanup(): void {
    if (this.moveIntervalId !== null) {
      clearInterval(this.moveIntervalId);
      this.moveIntervalId = null;
    }
    
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
      this.hedgehogImage = null;
    }
  }
}