/**
 * Управление аудио для игры
 */
class AudioManager {
  constructor() {
    this.isMuted = false;
    this.backgroundMusic = new Audio('sounds/background.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.3;
    
    this.hitSound = new Audio('sounds/hit.mp3');
    this.hitSound.volume = 0.5;
    
    this.successSound = new Audio('sounds/success.mp3');
    this.successSound.volume = 0.5;
    
    this.nyamSound = new Audio('sounds/nyam.mp3');
    this.nyamSound.volume = 0.7;
    
    // Инициализация синтезатора речи
    this.synth = window.speechSynthesis;
    this.voices = [];
    
    // Загрузка доступных голосов
    this.loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = this.loadVoices.bind(this);
    }
    
    // Последнее произнесенное число
    this.lastPlayedCount = 0;
  }
  
  // Загрузка доступных голосов
  loadVoices() {
    this.voices = this.synth.getVoices();
    
    // Поиск русского голоса
    this.russianVoice = this.voices.find(voice => 
      voice.lang.includes('ru') || voice.name.includes('Russian')
    );
  }
  
  // Переключение звука
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.backgroundMusic.pause();
      this.synth.cancel();
    } else {
      this.backgroundMusic.play().catch(err => console.error('Error playing background music:', err));
    }
    
    return this.isMuted;
  }
  
  // Воспроизведение звуков
  playHit() {
    if (!this.isMuted) {
      this.hitSound.currentTime = 0;
      this.hitSound.play().catch(err => console.error('Error playing hit sound:', err));
    }
  }
  
  playSuccess() {
    if (!this.isMuted) {
      this.successSound.currentTime = 0;
      this.successSound.play().catch(err => console.error('Error playing success sound:', err));
    }
  }
  
  playNyam() {
    if (!this.isMuted) {
      this.nyamSound.currentTime = 0;
      this.nyamSound.play().catch(err => console.error('Error playing nyam sound:', err));
    }
  }
  
  // Произнесение текста голосом
  speak(text, rate = 1, pitch = 1) {
    if (this.isMuted || !this.synth) return;
    
    // Отмена текущей речи
    this.synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Установка голоса (предпочтительно русского)
    if (this.russianVoice) {
      utterance.voice = this.russianVoice;
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;
    
    this.synth.speak(utterance);
  }
  
  // Произносит число по-русски
  speakCount(num) {
    if (this.isMuted || !this.synth) return;
    
    if (num > 0 && num <= 10 && num !== this.lastPlayedCount) {
      const russianNumbers = [
        'Один', 'Два', 'Три', 'Четыре', 'Пять', 
        'Шесть', 'Семь', 'Восемь', 'Девять', 'Десять'
      ];
      
      this.speak(russianNumbers[num - 1] + '!', 1.1, 1.2);
      this.lastPlayedCount = num;
    }
  }
  
  // Озвучивает результаты игры
  speakSuccess() {
    setTimeout(() => {
      this.speak('Молодец! Правильно!', 0.9, 1.1);
    }, 500);
  }
  
  speakWrong() {
    setTimeout(() => {
      this.speak('Попробуй еще раз!', 0.9, 1);
    }, 300);
  }
}

// Создание глобального экземпляра
const audioManager = new AudioManager();