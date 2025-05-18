import '../css/styles.css';
import { Game } from './game/Game';
import { ResourceLoader } from './utils/ResourceLoader';
import { AudioManager } from './audio/AudioManager';

// Список ресурсов для загрузки
const imagesToLoad = [
  { id: 'tree', src: 'assets/images/isometric-tree.svg' },
  { id: 'apple', src: 'assets/images/apple.svg' },
  { id: 'hedgehog', src: 'assets/images/3d-hedgehog.svg' },
];

const soundsToLoad = [
  { id: 'background', src: 'assets/sounds/background.mp3' },
  { id: 'hit', src: 'assets/sounds/hit.mp3' },
  { id: 'success', src: 'assets/sounds/success.mp3' },
  { id: 'nyam', src: 'assets/sounds/nyam.mp3' },
];

// Инициализация игры после полной загрузки документа
document.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.getElementById('game-container') as HTMLDivElement;
  const loadingScreen = document.getElementById('loading-screen') as HTMLDivElement;
  const progressBar = document.getElementById('progress-bar') as HTMLDivElement;
  
  // Инициализация менеджера аудио
  const audioManager = new AudioManager();
  
  // Инициализация загрузчика ресурсов
  const resourceLoader = new ResourceLoader();
  
  // Установка обработчика прогресса загрузки
  resourceLoader.onProgress = (progress: number) => {
    progressBar.style.width = `${progress}%`;
  };
  
  // Загрузка ресурсов и запуск игры
  resourceLoader.loadResources(imagesToLoad, soundsToLoad)
    .then(() => {
      // Скрытие экрана загрузки
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        
        // Запуск игры
        const game = new Game(gameContainer, audioManager, resourceLoader);
        game.start();
      }, 500);
    })
    .catch(error => {
      console.error('Error loading game resources:', error);
      alert('Ошибка при загрузке игры. Пожалуйста, перезагрузите страницу.');
    });
});