// script.js

// Массив всех возможных призов. При загрузке страницы они перемешиваются
// и случайным образом распределяются по подаркам.
const PRIZES = [
    "Сертификат на 2000 рублей в WB/Ozon",
    "Коробка новогодних конфет",
    "Купон на объятия",
    "Сертификат на 1000 рублей в WB/Ozon",
    "Премиум подписка Telegram на 3 месяца",
    "Новогодний Кешбэк! Попробуй снова..." // Приз-неудача
];

// Флаг, который предотвращает открытие нескольких подарков
let isPrizeRevealed = false;

// Глобальные ссылки на элементы DOM
let resetButton; 
let globalPrizeContainer; 
let prizeTextElement;     
let cardTitleElement;     

/**
 * Алгоритм перемешивания Фишера-Йейтса для равномерного распределения призов.
 * @param {Array} array - массив призов.
 */
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

// Запуск кода после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    
    // Инициализация ссылок на элементы модального окна
    resetButton = document.getElementById('resetButton'); 
    globalPrizeContainer = document.getElementById('globalPrizeContainer');
    prizeTextElement = globalPrizeContainer.querySelector('.prize-text');
    cardTitleElement = globalPrizeContainer.querySelector('.card-title'); 
    
    // Привязка обработчика к кнопке сброса
    resetButton.addEventListener('click', resetLottery);
    
    initializeLottery();
});

/**
 * Перемешивает и присваивает призы каждому подарку.
 */
function initializeLottery() {
    const boxes = document.querySelectorAll('.gift-box');
    
    const shuffledPrizes = shuffleArray(PRIZES);

    boxes.forEach((box, index) => {
        // Присваиваем рандомизированный приз атрибуту data-prize
        box.setAttribute('data-prize', shuffledPrizes[index]);
        
        // Добавляем обработчик клика только один раз
        if (!box.dataset.hasListener) {
             box.addEventListener('click', handleBoxClick);
             box.dataset.hasListener = 'true';
        }
    });
}

/**
 * Сбрасывает состояние лотереи и перераспределяет призы.
 */
function resetLottery() {
    isPrizeRevealed = false;
    
    // Скрываем модальное окно и кнопку
    if (globalPrizeContainer) {
        globalPrizeContainer.classList.remove('show');
    }
    if (resetButton) {
         resetButton.classList.remove('show-reset-button');
    }
    
    // Восстанавливаем праздничный заголовок и удаляем стиль неудачи
    if (cardTitleElement) {
        cardTitleElement.textContent = 'С Новым Годом!'; 
    }
    prizeTextElement.classList.remove('fail');
    
    // Сбрасываем визуальное состояние подарков
    const boxes = document.querySelectorAll('.gift-box');
    boxes.forEach(box => {
        box.classList.remove('opened', 'disabled');
        box.style.pointerEvents = 'auto';
    });
    
    initializeLottery();
    
    console.log("Лотерея сброшена. Призы перераспределены.");
}

/**
 * Обработчик клика по подарку.
 */
function handleBoxClick(event) {
    const clickedBox = event.currentTarget;

    // Проверка, можно ли открыть подарок
    if (isPrizeRevealed || clickedBox.classList.contains('opened')) {
        return;
    }

    isPrizeRevealed = true;
    clickedBox.classList.add('opened');

    const prizeText = clickedBox.getAttribute('data-prize');
    prizeTextElement.textContent = prizeText;
    
    // Определяем, является ли приз неудачей
    const isFailure = prizeText.startsWith('Новогодний');

    // Логика заголовка и стилей
    if (isFailure) {
        prizeTextElement.classList.add('fail');
        cardTitleElement.textContent = 'Ой, как жаль!'; // Изменяем заголовок
    } else {
        prizeTextElement.classList.remove('fail');
        cardTitleElement.textContent = 'С Новым Годом!'; 
    }
    
    // Запуск конфетти (Только если это НЕ неудача)
    if (!isFailure) {
        const boxRect = clickedBox.getBoundingClientRect();
        const x = boxRect.left + boxRect.width / 2;
        const y = boxRect.top + boxRect.height / 2;
    
        const xNormalized = x / window.innerWidth;
        const yNormalized = y / window.innerHeight;
    
        confetti({
            particleCount: 150, 
            spread: 90,         
            origin: { x: xNormalized, y: yNormalized - 0.1 },
            zIndex: 1002, 
            colors: ['#ffdd00', '#ff0000', '#00ff00', '#0000ff']
        });
    }

    disableOtherBoxes(clickedBox);
    
    // Показываем глобальную карточку и кнопку с задержкой
    if (resetButton && globalPrizeContainer) { 
        setTimeout(() => {
            globalPrizeContainer.classList.add('show');
            resetButton.classList.add('show-reset-button');
        }, 800); 
    }
}

/**
 * Отключает возможность кликать по остальным подаркам.
 */
function disableOtherBoxes(openedBox) {
    document.querySelectorAll('.gift-box').forEach(box => {
        if (box !== openedBox) {
            box.style.pointerEvents = 'none';
            box.classList.add('disabled');
        }
    });
}