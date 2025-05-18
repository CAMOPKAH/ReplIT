#!/bin/bash

# Простой скрипт для запуска HTML-версии игры "Яблоки и ёжик" локально,
# без необходимости устанавливать Node.js или другие зависимости

# Определяем переменные
HTML_DIR="src"
INDEX_FILE="$HTML_DIR/index.html"

# Проверяем наличие необходимых файлов
if [ ! -f "$INDEX_FILE" ]; then
  echo "Ошибка: Файл $INDEX_FILE не найден."
  exit 1
fi

# Определяем операционную систему и выбираем соответствующую команду
case "$(uname -s)" in
  Darwin)
    # MacOS
    open "$INDEX_FILE"
    ;;
  Linux)
    # Linux
    if command -v xdg-open > /dev/null; then
      xdg-open "$INDEX_FILE"
    elif command -v gnome-open > /dev/null; then
      gnome-open "$INDEX_FILE"
    else
      echo "Не удалось определить команду для открытия файла. Пожалуйста, откройте $INDEX_FILE вручную."
    fi
    ;;
  CYGWIN*|MINGW*|MSYS*)
    # Windows
    start "$INDEX_FILE"
    ;;
  *)
    # Неизвестная операционная система
    echo "Не удалось определить операционную систему. Пожалуйста, откройте $INDEX_FILE вручную."
    ;;
esac

echo "Запуск игры 'Яблоки и ёжик'..."
echo "Если браузер не открылся автоматически, пожалуйста, откройте файл $INDEX_FILE вручную."