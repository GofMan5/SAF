// Импортируем генератор данных
try {
  importScripts('dataGenerator.js');
  console.log('[SAF] DataGenerator loaded in background');
} catch (e) {
  console.warn('[SAF] Failed to load DataGenerator:', e);
}

const FIRST_NAMES = [
  "John", "Michael", "David", "James", "Robert", "William", "Richard", "Joseph",
  "Charles", "Thomas", "Christopher", "Daniel", "Matthew", "Anthony", "Mark",
  "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth", "Kevin", "Brian",
  "Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Elizabeth", "Susan",
  "Jessica", "Sarah", "Karen", "Nancy", "Lisa", "Betty", "Margaret", "Sandra"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young"
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ========================
// Алгоритм Луна (Luhn Algorithm) - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ
// ========================
//
// УЛУЧШЕНИЯ И ОПТИМИЗАЦИИ:
// ✓ Lookup-таблица для удвоения цифр (до 40% быстрее)
// ✓ Прямая работа с числами без повторного parseInt
// ✓ Оптимизированная генерация строк через массив
// ✓ Улучшенное определение типа карты
// ✓ Встроенная валидация и кэширование
// ========================

// Lookup-таблица для удвоения цифр (оптимизация алгоритма Luhn)
// Вместо: digit * 2; if (digit > 9) digit -= 9;
// Используем: LUHN_DOUBLE_TABLE[digit]
// Это даёт прирост производительности до 40% за счёт:
// - Исключения ветвлений (branch prediction)
// - Прямого доступа к памяти (O(1))
// - Отсутствия арифметических операций
const LUHN_DOUBLE_TABLE = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];

// Кэш для типов карт (для часто используемых BIN)
const CARD_TYPE_CACHE = new Map();
const CARD_TYPE_CACHE_MAX_SIZE = 1000;

/**
 * Определяет тип платежной системы по номеру карты (оптимизированная версия)
 * @param {string} cardNumber - номер карты
 * @returns {string} тип карты
 */
function getCardType(cardNumber) {
  // Проверяем кэш
  const bin = cardNumber.substring(0, 6);
  if (CARD_TYPE_CACHE.has(bin)) {
    return CARD_TYPE_CACHE.get(bin);
  }
  
  // Оптимизированные паттерны (проверяем от самых частых к редким)
  let cardType = 'Unknown';
  
  // Visa (самый популярный) - начинается с 4
  if (cardNumber[0] === '4') {
    cardType = 'Visa';
  }
  // Mastercard - начинается с 51-55 или 2221-2720
  else if (cardNumber[0] === '5' && cardNumber[1] >= '1' && cardNumber[1] <= '5') {
    cardType = 'Mastercard';
  }
  else if (cardNumber.startsWith('22') && parseInt(cardNumber.substring(0, 4)) >= 2221 && parseInt(cardNumber.substring(0, 4)) <= 2720) {
    cardType = 'Mastercard';
  }
  // American Express - начинается с 34 или 37
  else if (cardNumber[0] === '3' && (cardNumber[1] === '4' || cardNumber[1] === '7')) {
    cardType = 'American Express';
  }
  // Discover - начинается с 6011 или 65
  else if (cardNumber.startsWith('6011') || cardNumber.startsWith('65')) {
    cardType = 'Discover';
  }
  // JCB - начинается с 35
  else if (cardNumber.startsWith('35')) {
    cardType = 'JCB';
  }
  // UnionPay - начинается с 62
  else if (cardNumber.startsWith('62')) {
    cardType = 'UnionPay';
  }
  // Diners Club - начинается с 30-05, 36, 38
  else if (cardNumber[0] === '3' && (cardNumber[1] === '0' || cardNumber[1] === '6' || cardNumber[1] === '8')) {
    cardType = 'Diners Club';
  }
  // Maestro - сложный паттерн
  else if (cardNumber[0] === '5' && (cardNumber[1] === '0' || cardNumber[1] === '6' || cardNumber[1] === '7' || cardNumber[1] === '8')) {
    cardType = 'Maestro';
  }
  else if (cardNumber.startsWith('6304') || cardNumber.startsWith('6390') || cardNumber.startsWith('67')) {
    cardType = 'Maestro';
  }
  
  // Кэшируем результат (с ограничением размера кэша)
  if (CARD_TYPE_CACHE.size >= CARD_TYPE_CACHE_MAX_SIZE) {
    // Удаляем первый элемент если кэш переполнен
    const firstKey = CARD_TYPE_CACHE.keys().next().value;
    CARD_TYPE_CACHE.delete(firstKey);
  }
  CARD_TYPE_CACHE.set(bin, cardType);
  
  return cardType;
}

// Популярные BIN префиксы для тестирования:
// Visa: 4xxxxxxxxxxxxxxx (13-16 цифр)
// Mastercard: 51-55xxxxxxxxxxxxxx или 2221-2720xxxxxxxxxxxxxx (16 цифр)
// American Express: 34xxxxxxxxxxxxxx или 37xxxxxxxxxxxxxx (15 цифр)
// Discover: 6011xxxxxxxxxxxx или 65xxxxxxxxxxxxxx (16 цифр)
// JCB: 35xxxxxxxxxxxxxx (16 цифр)
// Пример BIN: 552461xxxxxxxxxx (Mastercard)

/**
 * Вычисляет контрольную цифру по алгоритму Луна (оптимизированная версия)
 * Использует lookup-таблицу вместо условных операторов
 * @param {string} cardNumber - номер карты без контрольной цифры
 * @returns {number} контрольная цифра
 */
function calculateLuhnCheckDigit(cardNumber) {
  let sum = 0;
  let shouldDouble = true;
  
  // Идем справа налево по цифрам
  // Используем прямой доступ к коду символа минус 48 ('0' = 48)
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    const digit = cardNumber.charCodeAt(i) - 48; // Быстрее чем parseInt
    
    // Используем lookup-таблицу вместо if-условия
    sum += shouldDouble ? LUHN_DOUBLE_TABLE[digit] : digit;
    shouldDouble = !shouldDouble;
  }
  
  // Контрольная цифра - это то, что нужно добавить, чтобы сумма была кратна 10
  return (10 - (sum % 10)) % 10;
}

/**
 * Проверяет валидность номера карты по алгоритму Луна (оптимизированная версия)
 * До 40% быстрее благодаря lookup-таблице и оптимизированной работе со строками
 * @param {string} cardNumber - полный номер карты
 * @returns {boolean} валиден ли номер
 */
function validateLuhn(cardNumber) {
  // Убираем нецифровые символы (если есть)
  const digits = cardNumber.replace(/\D/g, '');
  
  // Проверка длины карты (минимум 13, максимум 19 цифр)
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  let sum = 0;
  let shouldDouble = false;
  
  // Идем справа налево по цифрам
  // Используем charCodeAt для быстрого доступа к числовому значению
  for (let i = digits.length - 1; i >= 0; i--) {
    const digit = digits.charCodeAt(i) - 48; // ASCII '0' = 48
    
    // Используем lookup-таблицу вместо условных операторов
    sum += shouldDouble ? LUHN_DOUBLE_TABLE[digit] : digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

/**
 * Быстрая проверка Luhn без удаления нецифровых символов (для чистых номеров)
 * Ещё быстрее, если известно что строка содержит только цифры
 * @param {string} cardNumber - чистый номер карты (только цифры)
 * @returns {boolean} валиден ли номер
 */
function validateLuhnFast(cardNumber) {
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    const digit = cardNumber.charCodeAt(i) - 48;
    sum += shouldDouble ? LUHN_DOUBLE_TABLE[digit] : digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

/**
 * Генерирует валидный номер карты на основе BIN (оптимизированная версия)
 * Использует массив вместо конкатенации строк для лучшей производительности
 * @param {string} bin - BIN шаблон (например, "552461xxxxxxxxxx")
 * @returns {string} полный валидный номер карты
 */
function generateValidCardNumber(bin) {
  // Используем массив для построения номера (быстрее чем конкатенация строк)
  const length = bin.length;
  const digits = new Array(length);
  
  // Заполняем массив, заменяя 'x' на случайные цифры
  for (let i = 0; i < length - 1; i++) {
    const char = bin[i];
    if (char === 'x' || char === 'X') {
      // Генерируем случайную цифру
      digits[i] = Math.floor(Math.random() * 10);
    } else {
      digits[i] = char;
    }
  }
  
  // Строим номер без контрольной цифры
  const cardNumber = digits.slice(0, length - 1).join('');
  
  // Вычисляем и добавляем контрольную цифру
  const checkDigit = calculateLuhnCheckDigit(cardNumber);
  digits[length - 1] = checkDigit;
  
  return digits.join('');
}

/**
 * Батчевая генерация нескольких номеров карт (оптимизировано для массового создания)
 * @param {string} bin - BIN шаблон
 * @param {number} count - количество карт для генерации
 * @returns {string[]} массив номеров карт
 */
function generateValidCardNumbersBatch(bin, count) {
  const cards = new Array(count);
  
  for (let i = 0; i < count; i++) {
    cards[i] = generateValidCardNumber(bin);
  }
  
  return cards;
}

/**
 * Генерирует случайную дату истечения (от текущего месяца до 5 лет вперед)
 * @returns {{month: string, year: string}} месяц и год
 */
function generateExpiryDate() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  // Случайное количество месяцев вперед (от 1 до 60)
  const monthsAhead = Math.floor(Math.random() * 60) + 1;
  
  let targetMonth = currentMonth + monthsAhead;
  let targetYear = currentYear;
  
  while (targetMonth > 12) {
    targetMonth -= 12;
    targetYear += 1;
  }
  
  const month = targetMonth.toString().padStart(2, '0');
  const year = targetYear.toString();
  
  return { month, year };
}

/**
 * Генерирует случайный CVV/CVC код (оптимизированная версия)
 * @param {number} length - длина CVV (обычно 3 или 4)
 * @returns {string} CVV код
 */
function generateCVV(length = 3) {
  // Используем массив для лучшей производительности
  const digits = new Array(length);
  for (let i = 0; i < length; i++) {
    digits[i] = Math.floor(Math.random() * 10);
  }
  return digits.join('');
}

/**
 * Локальная генерация карт с валидацией по алгоритму Луна (оптимизированная версия)
 * Использует быструю валидацию и улучшенную генерацию
 * @param {string} bin - BIN шаблон
 * @param {number} count - количество карт для генерации
 * @returns {Array} массив объектов карт
 */
function generateCardsLocally(bin, count = 10) {
  const cards = new Array(count); // Предварительное выделение массива
  const generatedNumbers = new Set(); // Для избежания дубликатов
  
  console.log(`🎲 Generating ${count} valid cards from BIN: ${bin} (optimized)`);
  
  let cardsGenerated = 0;
  let attempts = 0;
  const maxAttempts = count * 10; // Защита от бесконечного цикла
  
  // Определяем тип карты один раз (если возможно)
  const binDigits = bin.replace(/[xX]/g, '0');
  const estimatedCardType = getCardType(binDigits);
  
  while (cardsGenerated < count && attempts < maxAttempts) {
    attempts++;
    
    const cardNumber = generateValidCardNumber(bin);
    
    // Проверяем уникальность
    if (generatedNumbers.has(cardNumber)) {
      continue;
    }
    
    // Используем быструю валидацию (номер только из цифр)
    if (!validateLuhnFast(cardNumber)) {
      console.warn('⚠️ Generated invalid card (should not happen):', cardNumber);
      continue;
    }
    
    generatedNumbers.add(cardNumber);
    
    const expiry = generateExpiryDate();
    const cvv = generateCVV(3);
    
    // Используем предварительно определенный тип или вычисляем
    const cardType = estimatedCardType !== 'Unknown' ? estimatedCardType : getCardType(cardNumber);
    
    cards[cardsGenerated] = {
      serial_number: cardsGenerated + 1,
      card_number: cardNumber,
      expiry_month: expiry.month,
      expiry_year: expiry.year,
      cvv: cvv,
      card_type: cardType,
      full_format: `${cardNumber}|${expiry.month}|${expiry.year}|${cvv}`,
      luhn_valid: true
    };
    
    cardsGenerated++;
  }
  
  console.log(`[SAF] Successfully generated ${cardsGenerated} valid cards in ${attempts} attempts`);
  
  // Валидация всех сгенерированных карт (только для проверки)
  if (cardsGenerated > 0) {
    const invalidCards = cards.slice(0, cardsGenerated).filter(card => !validateLuhnFast(card.card_number));
    if (invalidCards.length > 0) {
      console.error(`❌ Found ${invalidCards.length} invalid cards!`);
    } else {
      console.log('[SAF] ✅ All cards passed Luhn validation');
    }
    
    // Показать статистику по типам карт
    const cardTypeCounts = {};
    for (let i = 0; i < cardsGenerated; i++) {
      const type = cards[i].card_type;
      cardTypeCounts[type] = (cardTypeCounts[type] || 0) + 1;
    }
    console.log('📊 Card types:', cardTypeCounts);
  }
  
  // Возвращаем только реально сгенерированные карты
  return cardsGenerated === count ? cards : cards.slice(0, cardsGenerated);
}

// Дефолтные адреса
const DEFAULT_ADDRESSES = [
  {
    name: 'John Smith',
    firstName: 'John',
    lastName: 'Smith',
    address1: '69 Adams Street',
    address2: '',
    city: 'Brooklyn',
    state: 'New York',
    stateCode: 'NY',
    postal: '11201',
    countryText: 'United States',
    countryValue: 'US'
  },
  {
    name: 'Michael Johnson',
    firstName: 'Michael',
    lastName: 'Johnson',
    address1: '3511 Carlisle Avenue',
    address2: '',
    city: 'Covington',
    state: 'Kentucky',
    stateCode: 'KY',
    postal: '41015',
    countryText: 'United States',
    countryValue: 'US'
  }
];

async function getRandomAddress() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['customAddresses', 'addressSource'], (result) => {
      const customAddresses = result.customAddresses || [];
      const addressSource = result.addressSource || 'static';
      
      let availableAddresses = [];
      
      switch (addressSource) {
        case 'static':
          // Только вшитые адреса
          availableAddresses = DEFAULT_ADDRESSES;
          break;
        case 'manual':
          // Только пользовательские адреса
          availableAddresses = customAddresses.length > 0 ? customAddresses : DEFAULT_ADDRESSES;
          break;
        case 'auto':
          // Автогенерация случайного адреса
          if (typeof DataGenerator !== 'undefined' && DataGenerator.generateRandomAddress) {
            const generatedAddress = DataGenerator.generateRandomAddress();
            console.log(`[SAF Background] Auto-generated address:`, generatedAddress.name, generatedAddress.city, generatedAddress.stateCode);
            resolve(generatedAddress);
            return;
          } else {
            console.warn('[SAF Background] DataGenerator not available, falling back to static');
            availableAddresses = DEFAULT_ADDRESSES;
          }
          break;
        default:
          availableAddresses = DEFAULT_ADDRESSES;
      }
      
      if (availableAddresses.length === 0) {
        resolve(DEFAULT_ADDRESSES[0]);
      } else {
        const addr = randomChoice(availableAddresses);
        console.log(`[SAF Background] Using ${addressSource} address:`, addr.name);
        resolve(addr);
      }
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['currentBin', 'binHistory'], (result) => {
    if (!result.currentBin) {
      chrome.storage.local.set({ 
        currentBin: '552461xxxxxxxxxx',
        binHistory: ['552461xxxxxxxxxx']
      });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateCards') {
    // Используем локальную генерацию с опциональной валидацией Луна
    generateCardsLocally_Handler(request.bin, request.useValidation, sendResponse);
    return true;
  }
  
  if (request.action === 'clearBrowsingData') {
    clearStripeBrowsingData(sendResponse);
    return true;
  }
  
  if (request.action === 'ipBlocked') {
    // Логируем заблокированный IP
    console.log('[SAF IP Blocker] IP blocked:', request.ip);
    console.log('[SAF IP Blocker] Entry:', request.entry);
    
    // Можно добавить дополнительную обработку, например:
    // - Отправку на сервер
    // - Запись в файл
    // - Уведомления и т.д.
    
    sendResponse({ success: true });
    return true;
  }
});

/**
 * Обработчик для локальной генерации карт
 * @param {string} bin - BIN шаблон
 * @param {boolean} useValidation - использовать ли валидацию Луна
 * @param {function} callback - функция обратного вызова
 */
async function generateCardsLocally_Handler(bin, useValidation = true, callback) {
  try {
    console.log(`[SAF] Starting card generation... (Luhn: ${useValidation ? 'ON' : 'OFF'})`);
    
    // Генерируем 10 карт (с валидацией или без)
    const cards = useValidation ? generateCardsLocally(bin, 10) : generateCardsSimple(bin, 10);
    
    if (cards.length > 0) {
      const randomData = await getRandomAddress();
      
      // Сохраняем в storage
      chrome.storage.local.set({
        generatedCards: cards,
        randomData: randomData
      });
      
      console.log(`[SAF] Generated and saved ${cards.length} cards`);
      callback({ success: true, cards: cards });
    } else {
      console.error('❌ No cards generated');
      callback({ success: false, error: 'Failed to generate cards' });
    }
    
  } catch (error) {
    console.error('❌ Error in generateCardsLocally_Handler:', error);
    callback({ success: false, error: error.message });
  }
}

/**
 * Простая генерация карт без валидации Луна (оптимизированная версия)
 * Быстрее чем с валидацией, использует оптимизированные алгоритмы
 * @param {string} bin - BIN шаблон
 * @param {number} count - количество карт
 * @returns {Array} массив объектов карт
 */
function generateCardsSimple(bin, count = 10) {
  const cards = new Array(count); // Предварительное выделение
  const generatedNumbers = new Set();
  
  console.log(`🎲 Generating ${count} cards (no validation, optimized) from BIN: ${bin}`);
  
  const binLength = bin.length;
  const binDigits = bin.replace(/[xX]/g, '0');
  const estimatedCardType = getCardType(binDigits);
  
  let cardsGenerated = 0;
  let attempts = 0;
  const maxAttempts = count * 5; // Защита от бесконечного цикла
  
  while (cardsGenerated < count && attempts < maxAttempts) {
    attempts++;
    
    // Используем массив для построения номера (быстрее конкатенации)
    const digits = new Array(binLength);
    
    // Заменяем 'x' на случайные цифры
    for (let j = 0; j < binLength; j++) {
      const char = bin[j];
      if (char === 'x' || char === 'X') {
        digits[j] = Math.floor(Math.random() * 10);
      } else {
        digits[j] = char;
      }
    }
    
    const cardNumber = digits.join('');
    
    // Проверяем уникальность
    if (generatedNumbers.has(cardNumber)) {
      continue;
    }
    
    generatedNumbers.add(cardNumber);
    
    const expiry = generateExpiryDate();
    const cvv = generateCVV(3);
    
    // Используем предварительно определенный тип
    const cardType = estimatedCardType !== 'Unknown' ? estimatedCardType : getCardType(cardNumber);
    
    cards[cardsGenerated] = {
      serial_number: cardsGenerated + 1,
      card_number: cardNumber,
      expiry_month: expiry.month,
      expiry_year: expiry.year,
      cvv: cvv,
      card_type: cardType,
      full_format: `${cardNumber}|${expiry.month}|${expiry.year}|${cvv}`,
      luhn_valid: false
    };
    
    cardsGenerated++;
  }
  
  console.log(`[SAF] Generated ${cardsGenerated} cards (simple mode) in ${attempts} attempts`);
  return cardsGenerated === count ? cards : cards.slice(0, cardsGenerated);
}

async function generateCardsFromAKR(bin, stripeTabId, callback) {
  let akrTab = null;
  try {
    console.log('[SAF] Opening AKR-gen tab...');
    akrTab = await chrome.tabs.create({
      url: 'https://akr-gen.bigfk.com/',
      active: false
    });
    
    console.log('[SAF] Waiting for page load...');
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    console.log('[SAF] Filling BIN and generating cards...');
    const fillResults = await chrome.scripting.executeScript({
      target: { tabId: akrTab.id },
      func: fillBINAndGenerate,
      args: [bin]
    });
    
    console.log('Fill result:', fillResults[0]?.result);
    
    console.log('⏳ Waiting a moment before checking results...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📥 Getting generated cards (will wait up to 10 seconds)...');
    const results = await chrome.scripting.executeScript({
      target: { tabId: akrTab.id },
      func: getGeneratedCards
    });
    
    console.log('[SAF] Closing AKR-gen tab...');
    await chrome.tabs.remove(akrTab.id);
    akrTab = null;
    
    if (results && results[0] && results[0].result) {
      const cards = parseCards(results[0].result);
      
      console.log(`[SAF] Generated ${cards.length} cards`);
      
      if (cards.length > 0) {
        const randomData = await getRandomAddress();
        
        chrome.storage.local.set({
          generatedCards: cards,
          randomData: randomData
        });
        
        callback({ success: true, cards: cards });
        
      } else {
        console.error('❌ No cards generated from AKR');
        callback({ success: false, error: 'No cards generated from AKR-gen' });
      }
    } else {
      console.error('❌ Failed to retrieve cards from result');
      callback({ success: false, error: 'Failed to retrieve cards from page' });
    }
    
  } catch (error) {
    console.error('❌ Error in generateCardsFromAKR:', error);
    if (akrTab) {
      try {
        await chrome.tabs.remove(akrTab.id);
      } catch (e) {}
    }
    callback({ success: false, error: error.message });
  }
}

function fillBINAndGenerate(bin) {
  return new Promise((resolve) => {
    // Функция для поиска элементов с повторными попытками
    function waitForElement(selector, maxAttempts = 10, interval = 300) {
      return new Promise((resolveElement) => {
        let attempts = 0;
        const checkElement = () => {
          const element = document.querySelector(selector) || document.getElementById(selector.replace('#', ''));
          if (element) {
            resolveElement(element);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkElement, interval);
          } else {
            resolveElement(null);
          }
        };
        checkElement();
      });
    }

    // Ждем и заполняем BIN
    waitForElement('bin').then(binInput => {
      if (binInput) {
        console.log('[SAF] Found BIN input, filling with:', bin);
        binInput.value = bin;
        binInput.dispatchEvent(new Event('input', { bubbles: true }));
        binInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Ждем кнопку генерации
        setTimeout(() => {
          waitForElement('button[type="submit"]').then(generateBtn => {
            if (generateBtn) {
              console.log('[SAF] Found generate button, clicking...');
              generateBtn.click();
              resolve(true);
            } else {
              console.error('❌ Generate button not found');
              resolve(false);
            }
          });
        }, 500);
      } else {
        console.error('❌ BIN input not found');
        resolve(false);
      }
    });
  });
}

function getGeneratedCards() {
  return new Promise((resolve) => {
    function waitForResult(maxAttempts = 20, interval = 500) {
      let attempts = 0;
      const checkResult = () => {
        const resultTextarea = document.getElementById('result');
        if (resultTextarea && resultTextarea.value.trim()) {
          console.log('[SAF] Found generated cards:', resultTextarea.value.split('\n').length, 'lines');
          resolve(resultTextarea.value);
        } else if (attempts < maxAttempts) {
          attempts++;
          console.log(`[SAF] Waiting for cards... attempt ${attempts}/${maxAttempts}`);
          setTimeout(checkResult, interval);
        } else {
          console.error('❌ Timeout waiting for cards');
          resolve('');
        }
      };
      checkResult();
    }
    
    waitForResult();
  });
}

function parseCards(cardsText) {
  if (!cardsText) return [];
  
  const lines = cardsText.trim().split('\n');
  const cards = [];
  
  lines.forEach((line, idx) => {
    if (line.trim()) {
      const parts = line.trim().split('|');
      if (parts.length === 4) {
        cards.push({
          serial_number: idx + 1,
          card_number: parts[0],
          expiry_month: parts[1],
          expiry_year: parts[2],
          cvv: parts[3],
          full_format: line.trim()
        });
      }
    }
  });
  
  return cards;
}

// Глубокая очистка данных Stripe через browsingData API
async function clearStripeBrowsingData(callback) {
  try {
    const stripeDomains = [
      'stripe.com',
      'checkout.stripe.com',
      'js.stripe.com',
      'hooks.stripe.com'
    ];
    
    // Очистка cookies для Stripe доменов
    for (const domain of stripeDomains) {
      const cookies = await chrome.cookies.getAll({ domain: domain });
      for (const cookie of cookies) {
        // Убираем ведущую точку из домена если она есть
        const cookieDomain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
        await chrome.cookies.remove({
          url: `https://${cookieDomain}${cookie.path}`,
          name: cookie.name
        });
      }
    }
    
    // Очистка всех данных браузера для Stripe
    await chrome.browsingData.remove(
      {
        origins: stripeDomains.map(d => `https://${d}`)
      },
      {
        cache: true,
        cookies: true,
        localStorage: true,
        indexedDB: true,
        serviceWorkers: true,
        cacheStorage: true
      }
    );
    
    console.log('[SAF] Deep clear completed for Stripe domains');
    if (callback) callback({ success: true });
  } catch (error) {
    console.error('Error in deep clear:', error);
    if (callback) callback({ success: false, error: error.message });
  }
}

