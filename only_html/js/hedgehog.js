/**
 * Компонент ежика
 */
class Hedgehog {
  constructor(containerElement) {
    this.container = containerElement;
    this.position = window.innerWidth / 2;
    this.isEating = false;
    this.element = null;
    
    this.render();
  }
  
  render() {
    // Создание элемента ежика
    this.element = createElement('div', {
      className: 'hedgehog-container',
      style: {
        left: `${this.position}px`
      }
    }, [
      createElement('img', {
        src: 'assets/3d-hedgehog.svg',
        alt: 'Ёжик',
        className: 'hedgehog'
      })
    ]);
    
    this.container.appendChild(this.element);
  }
  
  // Обновление позиции ежика
  setPosition(newPosition) {
    this.position = newPosition;
    if (this.element) {
      this.element.style.left = `${this.position}px`;
    }
  }
  
  // Анимация поедания яблока
  showEatingAnimation() {
    if (!this.element) return;
    
    this.isEating = true;
    const hedgehogImg = this.element.querySelector('.hedgehog');
    
    if (hedgehogImg) {
      // Добавить классы анимации
      hedgehogImg.classList.add('hedgehog-eating');
      this.element.style.animation = 'hedgehog-jump 0.5s';
      
      // Вернуть в нормальное состояние после анимации
      setTimeout(() => {
        hedgehogImg.classList.remove('hedgehog-eating');
        this.element.style.animation = '';
        this.isEating = false;
      }, 500);
    }
  }
  
  // Удаление элемента ежика из DOM
  remove() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}