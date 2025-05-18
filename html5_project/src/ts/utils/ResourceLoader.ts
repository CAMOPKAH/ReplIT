/**
 * Класс для загрузки и управления ресурсами игры (изображения и звуки)
 */
export class ResourceLoader {
  private images: Map<string, HTMLImageElement> = new Map();
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private totalResources: number = 0;
  private loadedResources: number = 0;
  
  // Callback для отслеживания прогресса загрузки
  public onProgress: (progress: number) => void = () => {};
  
  /**
   * Загружает все необходимые ресурсы для игры
   * @param imageList Список изображений для загрузки
   * @param soundList Список звуков для загрузки
   * @returns Promise который разрешается после загрузки всех ресурсов
   */
  public loadResources(
    imageList: { id: string, src: string }[],
    soundList: { id: string, src: string }[]
  ): Promise<void> {
    this.totalResources = imageList.length + soundList.length;
    this.loadedResources = 0;
    
    return new Promise<void>((resolve, reject) => {
      // Если нет ресурсов для загрузки
      if (this.totalResources === 0) {
        resolve();
        return;
      }
      
      // Массив промисов для всех ресурсов
      const promises: Promise<void>[] = [];
      
      // Загрузка изображений
      imageList.forEach(img => {
        const promise = this.loadImage(img.id, img.src);
        promises.push(promise);
      });
      
      // Загрузка звуков
      soundList.forEach(sound => {
        const promise = this.loadSound(sound.id, sound.src);
        promises.push(promise);
      });
      
      // Ожидание загрузки всех ресурсов
      Promise.all(promises)
        .then(() => resolve())
        .catch(error => reject(error));
    });
  }
  
  /**
   * Загружает отдельное изображение
   * @param id Идентификатор изображения
   * @param src Путь к изображению
   * @returns Promise который разрешается после загрузки изображения
   */
  private loadImage(id: string, src: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.images.set(id, img);
        this.resourceLoaded();
        resolve();
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });
  }
  
  /**
   * Загружает отдельный звуковой файл
   * @param id Идентификатор звука
   * @param src Путь к звуковому файлу
   * @returns Promise который разрешается после загрузки звука
   */
  private loadSound(id: string, src: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const audio = new Audio();
      
      audio.oncanplaythrough = () => {
        this.sounds.set(id, audio);
        this.resourceLoaded();
        resolve();
      };
      
      audio.onerror = () => {
        reject(new Error(`Failed to load sound: ${src}`));
      };
      
      audio.src = src;
      audio.load();
    });
  }
  
  /**
   * Обновляет счетчик загруженных ресурсов и вызывает callback прогресса
   */
  private resourceLoaded(): void {
    this.loadedResources++;
    const progress = Math.round((this.loadedResources / this.totalResources) * 100);
    this.onProgress(progress);
  }
  
  /**
   * Получает изображение по идентификатору
   * @param id Идентификатор изображения
   * @returns HTMLImageElement или undefined если изображение не найдено
   */
  public getImage(id: string): HTMLImageElement | undefined {
    return this.images.get(id);
  }
  
  /**
   * Получает звуковой файл по идентификатору
   * @param id Идентификатор звука
   * @returns HTMLAudioElement или undefined если звук не найден
   */
  public getSound(id: string): HTMLAudioElement | undefined {
    return this.sounds.get(id);
  }
  
  /**
   * Очищает все загруженные ресурсы из памяти
   */
  public clearResources(): void {
    this.images.clear();
    this.sounds.clear();
  }
}