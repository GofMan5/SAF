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
// Алгоритм Луна (Luhn Algorithm) и генерация валидных карт
// ========================

/**
 * Определяет тип платежной системы по номеру карты
 * @param {string} cardNumber - номер карты
 * @returns {string} тип карты
 */
function getCardType(cardNumber) {
  const patterns = {
    'Visa': /^4/,
    'Mastercard': /^5[1-5]/,
    'American Express': /^3[47]/,
    'Discover': /^6(?:011|5)/,
    'JCB': /^35/,
    'Diners Club': /^3(?:0[0-5]|[68])/,
    'Maestro': /^(?:5[0678]\d\d|6304|6390|67\d\d)/,
    'UnionPay': /^62/
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) {
      return type;
    }
  }
  
  return 'Unknown';
}

// Популярные BIN префиксы для тестирования:
// Visa: 4xxxxxxxxxxxxxxx (13-16 цифр)
// Mastercard: 51-55xxxxxxxxxxxxxx или 2221-2720xxxxxxxxxxxxxx (16 цифр)
// American Express: 34xxxxxxxxxxxxxx или 37xxxxxxxxxxxxxx (15 цифр)
// Discover: 6011xxxxxxxxxxxx или 65xxxxxxxxxxxxxx (16 цифр)
// JCB: 35xxxxxxxxxxxxxx (16 цифр)
// Пример BIN: 552461xxxxxxxxxx (Mastercard)

/**
 * Вычисляет контрольную цифру по алгоритму Луна
 * @param {string} cardNumber - номер карты без контрольной цифры
 * @returns {number} контрольная цифра
 */
function calculateLuhnCheckDigit(cardNumber) {
  let sum = 0;
  let shouldDouble = true;
  
  // Идем справа налево по цифрам
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  // Контрольная цифра - это то, что нужно добавить, чтобы сумма была кратна 10
  return (10 - (sum % 10)) % 10;
}

/**
 * Проверяет валидность номера карты по алгоритму Луна
 * @param {string} cardNumber - полный номер карты
 * @returns {boolean} валиден ли номер
 */
function validateLuhn(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

/**
 * Генерирует валидный номер карты на основе BIN
 * @param {string} bin - BIN шаблон (например, "552461xxxxxxxxxx")
 * @returns {string} полный валидный номер карты
 */
function generateValidCardNumber(bin) {
  // Заменяем 'x' на случайные цифры, оставляя последнюю позицию для контрольной суммы
  let cardNumber = '';
  
  for (let i = 0; i < bin.length - 1; i++) {
    if (bin[i] === 'x' || bin[i] === 'X') {
      cardNumber += Math.floor(Math.random() * 10);
    } else {
      cardNumber += bin[i];
    }
  }
  
  // Вычисляем и добавляем контрольную цифру
  const checkDigit = calculateLuhnCheckDigit(cardNumber);
  cardNumber += checkDigit;
  
  return cardNumber;
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
 * Генерирует случайный CVV/CVC код
 * @param {number} length - длина CVV (обычно 3 или 4)
 * @returns {string} CVV код
 */
function generateCVV(length = 3) {
  let cvv = '';
  for (let i = 0; i < length; i++) {
    cvv += Math.floor(Math.random() * 10);
  }
  return cvv;
}

/**
 * Локальная генерация карт с валидацией по алгоритму Луна
 * @param {string} bin - BIN шаблон
 * @param {number} count - количество карт для генерации
 * @returns {Array} массив объектов карт
 */
function generateCardsLocally(bin, count = 10) {
  const cards = [];
  const generatedNumbers = new Set(); // Для избежания дубликатов
  
  console.log(`🎲 Generating ${count} valid cards from BIN: ${bin}`);
  
  let attempts = 0;
  const maxAttempts = count * 10; // Защита от бесконечного цикла
  
  while (cards.length < count && attempts < maxAttempts) {
    attempts++;
    
    const cardNumber = generateValidCardNumber(bin);
    
    // Проверяем уникальность
    if (generatedNumbers.has(cardNumber)) {
      continue;
    }
    
    // Валидация по Луну
    if (!validateLuhn(cardNumber)) {
      console.warn('⚠️ Generated invalid card (should not happen):', cardNumber);
      continue;
    }
    
    generatedNumbers.add(cardNumber);
    
    const expiry = generateExpiryDate();
    const cvv = generateCVV(3);
    
    const cardType = getCardType(cardNumber);
    
    cards.push({
      serial_number: cards.length + 1,
      card_number: cardNumber,
      expiry_month: expiry.month,
      expiry_year: expiry.year,
      cvv: cvv,
      card_type: cardType,
      full_format: `${cardNumber}|${expiry.month}|${expiry.year}|${cvv}`,
      luhn_valid: true
    });
  }
  
  console.log(`[SAF] Successfully generated ${cards.length} valid cards`);
  
  // Валидация всех сгенерированных карт
  const invalidCards = cards.filter(card => !validateLuhn(card.card_number));
  if (invalidCards.length > 0) {
    console.error(`❌ Found ${invalidCards.length} invalid cards!`);
  } else {
    console.log('[SAF] All cards passed Luhn validation');
  }
  
  // Показать статистику по типам карт
  const cardTypeCounts = {};
  cards.forEach(card => {
    cardTypeCounts[card.card_type] = (cardTypeCounts[card.card_type] || 0) + 1;
  });
  console.log('📊 Card types:', cardTypeCounts);
  
  return cards;
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
    chrome.storage.local.get(['customAddresses'], (result) => {
      const customAddresses = result.customAddresses || [];
      const allAddresses = [...customAddresses, ...DEFAULT_ADDRESSES];
      
      if (allAddresses.length === 0) {
        resolve(DEFAULT_ADDRESSES[0]);
      } else {
        const addr = randomChoice(allAddresses);
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
 * Простая генерация карт без валидации Луна (быстрее)
 * @param {string} bin - BIN шаблон
 * @param {number} count - количество карт
 * @returns {Array} массив объектов карт
 */
function generateCardsSimple(bin, count = 10) {
  const cards = [];
  const generatedNumbers = new Set();
  
  console.log(`🎲 Generating ${count} cards (no validation) from BIN: ${bin}`);
  
  for (let i = 0; i < count; i++) {
    let cardNumber = '';
    
    // Заменяем 'x' на случайные цифры
    for (let j = 0; j < bin.length; j++) {
      if (bin[j] === 'x' || bin[j] === 'X') {
        cardNumber += Math.floor(Math.random() * 10);
      } else {
        cardNumber += bin[j];
      }
    }
    
    // Проверяем уникальность
    if (generatedNumbers.has(cardNumber)) {
      i--;
      continue;
    }
    
    generatedNumbers.add(cardNumber);
    
    const expiry = generateExpiryDate();
    const cvv = generateCVV(3);
    const cardType = getCardType(cardNumber);
    
    cards.push({
      serial_number: i + 1,
      card_number: cardNumber,
      expiry_month: expiry.month,
      expiry_year: expiry.year,
      cvv: cvv,
      card_type: cardType,
      full_format: `${cardNumber}|${expiry.month}|${expiry.year}|${cvv}`,
      luhn_valid: false
    });
  }
  
  console.log(`[SAF] Generated ${cards.length} cards (simple mode)`);
  return cards;
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
        await chrome.cookies.remove({
          url: `https://${cookie.domain}${cookie.path}`,
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

