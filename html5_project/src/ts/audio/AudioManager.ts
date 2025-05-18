/**
 * Класс для управления аудио в игре
 */
export class AudioManager {
  private isMuted: boolean = false;
  private backgroundMusic: HTMLAudioElement | null = null;
  private hitSound: HTMLAudioElement | null = null;
  private successSound: HTMLAudioElement | null = null;
  private nyamSound: HTMLAudioElement | null = null;
  
  // Для синтеза речи
  private synth: SpeechSynthesis | null = null;
  private russianVoice: SpeechSynthesisVoice | null = null;
  private lastPlayedCount: number = 0;
  
  constructor() {
    // Инициализация Web Speech API, если доступно
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      
      // Chrome требует ожидания загрузки голосов
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = this.loadVoices.bind(this);
      }
    }
  }
  
  /**
   * Загрузка доступных голосов для синтеза речи
   */
  private loadVoices(): void {
    if (!this.synth) return;
    
    const availableVoices = this.synth.getVoices();
    
    // Поиск русского голоса для озвучивания
    this.russianVoice = availableVoices.find(voice => 
      voice.lang.includes('ru') || voice.name.includes('Russian')
    ) || null;
  }
  
  /**
   * Инициализация звуков игры
   * @param backgroundSrc Путь к фоновой музыке
   * @param hitSrc Путь к звуку удара/клика
   * @param successSrc Путь к звуку успеха
   * @param nyamSrc Путь к звуку поедания яблока
   */
  public initSounds(
    backgroundSrc: string | HTMLAudioElement,
    hitSrc: string | HTMLAudioElement,
    successSrc: string | HTMLAudioElement,
    nyamSrc: string | HTMLAudioElement
  ): void {
    // Загрузка фоновой музыки
    if (typeof backgroundSrc === 'string') {
      this.backgroundMusic = new Audio(backgroundSrc);
    } else {
      this.backgroundMusic = backgroundSrc;
    }
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.3;
    
    // Загрузка звука удара/клика
    if (typeof hitSrc === 'string') {
      this.hitSound = new Audio(hitSrc);
    } else {
      this.hitSound = hitSrc;
    }
    this.hitSound.volume = 0.5;
    
    // Загрузка звука успеха
    if (typeof successSrc === 'string') {
      this.successSound = new Audio(successSrc);
    } else {
      this.successSound = successSrc;
    }
    this.successSound.volume = 0.5;
    
    // Загрузка звука поедания
    if (typeof nyamSrc === 'string') {
      this.nyamSound = new Audio(nyamSrc);
    } else {
      this.nyamSound = nyamSrc;
    }
    this.nyamSound.volume = 0.7;
  }
  
  /**
   * Переключение звука (включение/выключение)
   * @returns текущее состояние звука (true - выключен, false - включен)
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      // Остановка всех звуков при выключении
      if (this.backgroundMusic) {
        this.backgroundMusic.pause();
      }
      if (this.synth) {
        this.synth.cancel();
      }
    } else {
      // Возобновление фоновой музыки при включении
      if (this.backgroundMusic) {
        this.backgroundMusic.play().catch(err => 
          console.error('Error playing background music:', err)
        );
      }
    }
    
    return this.isMuted;
  }
  
  /**
   * Получение текущего состояния звука
   * @returns true если звук выключен, false если включен
   */
  public getMuteState(): boolean {
    return this.isMuted;
  }
  
  /**
   * Воспроизведение звука удара/клика
   */
  public playHit(): void {
    if (this.isMuted || !this.hitSound) return;
    
    this.hitSound.currentTime = 0;
    this.hitSound.play().catch(err => 
      console.error('Error playing hit sound:', err)
    );
  }
  
  /**
   * Воспроизведение звука успеха
   */
  public playSuccess(): void {
    if (this.isMuted || !this.successSound) return;
    
    this.successSound.currentTime = 0;
    this.successSound.play().catch(err => 
      console.error('Error playing success sound:', err)
    );
  }
  
  /**
   * Воспроизведение звука поедания
   */
  public playNyam(): void {
    if (this.isMuted || !this.nyamSound) return;
    
    this.nyamSound.currentTime = 0;
    this.nyamSound.play().catch(err => 
      console.error('Error playing nyam sound:', err)
    );
  }
  
  /**
   * Озвучивание текста с помощью синтеза речи
   * @param text текст для озвучивания
   * @param rate скорость речи (по умолчанию 1)
   * @param pitch высота голоса (по умолчанию 1)
   */
  public speak(text: string, rate: number = 1, pitch: number = 1): void {
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
  
  /**
   * Озвучивание числа по-русски
   * @param num число для озвучивания (от 1 до 10)
   */
  public speakCount(num: number): void {
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
  
  /**
   * Озвучивание успешного ответа
   */
  public speakSuccess(): void {
    setTimeout(() => {
      this.speak('Молодец! Правильно!', 0.9, 1.1);
    }, 500);
  }
  
  /**
   * Озвучивание неправильного ответа
   */
  public speakWrong(): void {
    setTimeout(() => {
      this.speak('Попробуй еще раз!', 0.9, 1);
    }, 300);
  }
}