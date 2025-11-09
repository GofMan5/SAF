let isProcessing = false;
let fillButton = null;
let clearButton = null;

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
          // Для будущего - автогенерация
          // Пока используем дефолтные
          availableAddresses = DEFAULT_ADDRESSES;
          break;
        default:
          availableAddresses = DEFAULT_ADDRESSES;
      }
      
      if (availableAddresses.length === 0) {
        resolve(DEFAULT_ADDRESSES[0]);
      } else {
        const addr = availableAddresses[Math.floor(Math.random() * availableAddresses.length)];
        console.log(`[SAF] Using ${addressSource} address:`, addr.name);
        resolve(addr);
      }
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Случайная задержка для имитации человеческого ввода
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Посимвольный ввод текста (более реалистично)
async function typeText(element, text, useTyping = false) {
  if (!element || !text) return;
  
  element.focus();
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await sleep(randomDelay(150, 300));
  
  if (useTyping && text.length < 50) {
    // Посимвольный ввод для коротких текстов
    element.value = '';
    for (let i = 0; i < text.length; i++) {
      element.value += text[i];
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(randomDelay(30, 80));
    }
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    // Быстрый ввод для длинных текстов
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  await sleep(randomDelay(100, 200));
  element.blur();
  await sleep(randomDelay(200, 400));
}

// Получить все корневые элементы включая shadow DOM
function collectRoots() {
  const roots = [document];
  const stack = [document.documentElement];
  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;
    if (node.shadowRoot) {
      roots.push(node.shadowRoot);
    }
    const children = node.children || [];
    for (let i = 0; i < children.length; i++) {
      stack.push(children[i]);
    }
  }
  return roots;
}

// Проверка видимости элемента
function isVisible(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none') return false;
  if (el.disabled) return false;
  if (rect.width <= 0 || rect.height <= 0) return false;
  if (el.type === 'hidden') return false;
  return true;
}

// Собрать все видимые элементы форм
function collectFormElements() {
  const elements = [];
  for (const root of collectRoots()) {
    const found = root.querySelectorAll('input, select, textarea');
    found.forEach((el) => {
      if (isVisible(el)) elements.push(el);
    });
  }
  return elements;
}

// Установить значение с нативными событиями (с реалистичной симуляцией)
async function setNativeValueAndDispatch(el, value, useTyping = false) {
  if (!el) return;
  
  try {
    // Фокус на поле как реальный пользователь
    el.focus();
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(randomDelay(150, 300)); // Случайная задержка после фокуса
    
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      const proto = tag === 'INPUT' 
        ? window.HTMLInputElement.prototype 
        : window.HTMLTextAreaElement.prototype;
      const valueSetter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      
      // Опциональный посимвольный ввод для имён и коротких полей
      if (useTyping && value && value.length < 30) {
        el.value = '';
        for (let i = 0; i < value.length; i++) {
          valueSetter.call(el, el.value + value[i]);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          await sleep(randomDelay(50, 120)); // Случайная задержка между символами
        }
      } else {
        valueSetter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      el.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(randomDelay(150, 250)); // Случайная задержка после ввода
      el.blur();
    } else if (tag === 'SELECT') {
      el.value = value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(randomDelay(200, 350));
      el.blur();
    }
    
    // Дополнительная случайная задержка между полями
    await sleep(randomDelay(300, 500));
  } catch (_) {
    try {
      el.focus();
      await sleep(randomDelay(150, 300));
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(randomDelay(150, 250));
      el.blur();
      await sleep(randomDelay(300, 500));
    } catch (_) {}
  }
}

// Выбор значения из select
function pickSelectValue(selectEl, valueCandidates, textCandidates) {
  if (!selectEl || selectEl.tagName !== 'SELECT') return null;
  const opts = Array.from(selectEl.options || []);
  const normalizedText = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const normalizedIncludes = (a, b) => normalizedText(a).includes(normalizedText(b));

  for (const v of valueCandidates || []) {
    const byValue = opts.find(o => normalizedText(o.value) === normalizedText(v));
    if (byValue) return byValue.value;
  }

  for (const t of textCandidates || []) {
    const byText = opts.find(o => normalizedText(o.textContent) === normalizedText(t));
    if (byText) return byText.value;
  }

  for (const t of textCandidates || []) {
    const loose = opts.find(o => normalizedIncludes(o.textContent, t));
    if (loose) return loose.value;
  }
  return null;
}

// Детект полей адреса
const FIELD_SYNONYMS = {
  fullName: ['full name', 'name', 'cardholder name', 'card name', 'cc-name'],
  firstName: ['first name', 'given-name'],
  lastName: ['last name', 'family-name', 'surname'],
  address1: ['address', 'address line 1', 'street', 'addressline1', 'address-line1', 'address-line-1'],
  address2: ['address line 2', 'apt', 'apartment', 'addressline2', 'address-line2', 'suite'],
  city: ['city', 'locality', 'address-level2'],
  state: ['state', 'region', 'province', 'administrative area', 'address-level1', 'address level 1'],
  postal: ['postal', 'zip', 'postcode', 'postal-code'],
  country: ['country', 'country or region']
};

const CARD_FIELD_WORDS = ['card', 'cvc', 'cvv', 'expiry', 'expiration', 'valid thru', 'month', 'year'];

function elementText(el) {
  const texts = [
    el.getAttribute('name'),
    el.getAttribute('id'),
    el.getAttribute('placeholder'),
    el.getAttribute('aria-label'),
    el.getAttribute('autocomplete'),
    el.getAttribute('data-testid'),
    el.getAttribute('data-qa')
  ].filter(Boolean);
  return texts.join(' ').toLowerCase();
}

function matchesAny(text, words) {
  const lower = text.toLowerCase();
  return words.some(w => lower.includes(w.toLowerCase()));
}

function isCardField(el) {
  const text = elementText(el);
  if (!text) return false;
  return matchesAny(text, CARD_FIELD_WORDS);
}

function scoreForSynonyms(el, synonyms) {
  const txt = elementText(el);
  let score = 0;
  if (!txt) return score;

  const auto = (el.getAttribute('autocomplete') || '').toLowerCase();
  for (const s of synonyms) {
    const sLower = s.toLowerCase();
    if (auto.split(/\s+/).includes(sLower)) score += 6;
  }

  const nameId = [
    (el.getAttribute('name') || '').toLowerCase(),
    (el.getAttribute('id') || '').toLowerCase()
  ].join(' ');
  for (const s of synonyms) {
    if (nameId.includes(s.toLowerCase())) score += 4;
  }

  const labelish = [
    (el.getAttribute('placeholder') || '').toLowerCase(),
    (el.getAttribute('aria-label') || '').toLowerCase()
  ].join(' ');
  for (const s of synonyms) {
    if (labelish.includes(s.toLowerCase())) score += 2;
  }
  return score;
}

function findBest(elements, synonyms, filterFn) {
  let best = null;
  let bestScore = 0;
  for (const el of elements) {
    if (filterFn && !filterFn(el)) continue;
    const score = scoreForSynonyms(el, synonyms);
    if (score > bestScore) {
      best = el;
      bestScore = score;
    }
  }
  return best;
}

function detectFields() {
  const all = collectFormElements().filter(el => !isCardField(el));
  const field = {};

  field.firstName = findBest(all, FIELD_SYNONYMS.firstName, el => el.tagName !== 'SELECT');
  field.lastName = findBest(all, FIELD_SYNONYMS.lastName, el => el.tagName !== 'SELECT');
  field.fullName = findBest(all, FIELD_SYNONYMS.fullName, el => el.tagName !== 'SELECT');
  field.address1 = findBest(all, FIELD_SYNONYMS.address1, el => el.tagName !== 'SELECT');
  field.address2 = findBest(all, FIELD_SYNONYMS.address2, el => el.tagName !== 'SELECT');
  field.city = findBest(all, FIELD_SYNONYMS.city, el => el.tagName !== 'SELECT');
  field.state = findBest(all, FIELD_SYNONYMS.state, el => el.tagName !== 'SELECT');
  field.postal = findBest(all, FIELD_SYNONYMS.postal, el => el.tagName !== 'SELECT');
  field.country = findBest(all, FIELD_SYNONYMS.country, () => true);

  if (field.fullName) {
    if (field.firstName === field.fullName) field.firstName = null;
    if (field.lastName === field.fullName) field.lastName = null;
  }
  if (field.firstName && field.lastName && field.firstName === field.lastName) {
    field.fullName = field.firstName;
    field.firstName = null;
    field.lastName = null;
  }

  return field;
}

// Детект карточных полей
function detectCardFields() {
  const roots = collectRoots();
  let number, exp, cvc;
  
  const numberSelectors = [
    'input[autocomplete="cc-number"]',
    'input[name*="cardnumber" i]',
    'input[id*="cardnumber" i]',
    'input[name="cardNumber"]',
    'input[placeholder*="1234"]',
    '#cardNumber'
  ];
  const expSelectors = [
    'input[autocomplete="cc-exp"]',
    'input[name*="exp" i]',
    'input[id*="exp" i]',
    'input[placeholder*="MM"]',
    'input[name="cardExpiry"]',
    '#cardExpiry'
  ];
  const cvcSelectors = [
    'input[autocomplete="cc-csc"]',
    'input[name*="cvc" i]',
    'input[name*="cvv" i]',
    'input[id*="cvc" i]',
    'input[placeholder*="CVC"]',
    'input[name="cardCvc"]',
    '#cardCvc'
  ];

  function findFirstVisible(selectors) {
    for (const root of roots) {
      for (const sel of selectors) {
        const el = root.querySelector(sel);
        if (el && isVisible(el)) return el;
      }
    }
    return null;
  }

  number = findFirstVisible(numberSelectors);
  exp = findFirstVisible(expSelectors);
  cvc = findFirstVisible(cvcSelectors);
  
  if (number || exp || cvc) {
    return { number, exp, cvc };
  }
  return null;
}

// Клик на "enter address manually" если есть
function clickManualAddressIfPresent() {
  const MANUAL_ADDRESS_TEXTS = [
    'enter address manually',
    'manually enter address',
    'ввести адрес вручную',
    'введите адрес вручную',
    'адрес вручную'
  ];
  
  try {
    const roots = collectRoots();
    const selectors = ['button', '[role="button"]', 'a', '.Button', '.Link', 'span[role="button"]', 'div[role="button"]'];
    for (const root of roots) {
      for (const sel of selectors) {
        const nodes = root.querySelectorAll(sel);
        for (let i = 0; i < nodes.length; i++) {
          const el = nodes[i];
          if (!isVisible(el)) continue;
          const combined = [
            el.textContent || '',
            el.getAttribute('aria-label') || '',
            el.getAttribute('title') || '',
            el.getAttribute('data-testid') || ''
          ].join(' ').toLowerCase();
          if (!combined) continue;
          if (MANUAL_ADDRESS_TEXTS.some(t => combined.includes(t.toLowerCase()))) {
            const clickable = el.closest('button, [role="button"], a, [role="link"]') || el;
            console.log('[SAF] Clicking manual address button:', el.textContent);
            clickable.click();
            return true;
          }
        }
      }
    }
  } catch (_) {}
  return false;
}

// Главная функция заполнения
async function autofillAll() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    showNotification('🔄 Starting auto-fill...', 'info');
    
    // Небольшая начальная задержка как у реального пользователя
    await sleep(randomDelay(500, 1000));

    // ВСЕГДА генерировать НОВЫЕ карты при каждом запуске
    showNotification('🔄 Generating fresh cards...', 'info');
    
    // Генерируем карты - берем из storage или дефолтный
    const binData = await chrome.storage.local.get(['currentBin']);
    const bin = binData.currentBin || '552461xxxxxxxxxx';
    
    // Content script не может использовать chrome.tabs.query
    // Отправляем запрос без ID вкладки, background script сам разберется
    const generated = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'generateCards',
        bin: bin,
        stripeTabId: null // Background script не использует это значение для автозаполнения
      }, (response) => {
        resolve(response);
      });
    });

    if (!generated || !generated.success) {
      showNotification('❌ Failed to generate cards: ' + (generated?.error || 'Unknown error'), 'error');
      isProcessing = false;
      return;
    }

    // Ждем пока карты сгенерируются и сохранятся
    await sleep(2000);
    const storage = await chrome.storage.local.get(['generatedCards']);
    
    if (!storage.generatedCards || storage.generatedCards.length === 0) {
      showNotification('❌ No cards were generated', 'error');
      isProcessing = false;
      return;
    }

    const card = storage.generatedCards[Math.floor(Math.random() * storage.generatedCards.length)];
    const person = await getRandomAddress();

    showNotification('💳 Filling card details...', 'info');
    await sleep(randomDelay(400, 700));

    // Клик на кнопку карты если есть
    const cardButton = document.querySelector('[data-testid="card-accordion-item-button"]');
    if (cardButton && isVisible(cardButton)) {
      console.log('[SAF] Clicking card button...');
      cardButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await sleep(randomDelay(300, 500));
      cardButton.click();
      await sleep(randomDelay(800, 1200));
    }

    // Заполнить карточные поля
    const cardFields = detectCardFields();
    if (cardFields) {
      if (cardFields.number) {
        console.log('[SAF] Filling card number...');
        await setNativeValueAndDispatch(cardFields.number, card.card_number);
      }
      if (cardFields.exp) {
        console.log('[SAF] Filling expiry date...');
        const expiryStr = `${card.expiry_month} / ${card.expiry_year.slice(-2)}`;
        await setNativeValueAndDispatch(cardFields.exp, expiryStr);
      }
      if (cardFields.cvc) {
        console.log('[SAF] Filling CVC...');
        await setNativeValueAndDispatch(cardFields.cvc, card.cvv);
      }
    }

    showNotification('📝 Filling address...', 'info');

    // Установить страну
    const fields = detectFields();
    if (fields.country && fields.country.tagName === 'SELECT') {
      console.log('[SAF] Filling country...');
      const pickedCountry = pickSelectValue(
        fields.country,
        [person.countryValue],
        [person.countryText]
      );
      if (pickedCountry) {
        await setNativeValueAndDispatch(fields.country, pickedCountry);
      }
      await sleep(300);
    }

    // Клик на manual address
    const clickedManual = clickManualAddressIfPresent();
    if (clickedManual) {
      console.log('[SAF] Manual address button clicked');
      await sleep(randomDelay(800, 1200));
    }

    // Заполнить имя и адрес
    const fillNameAndAddress = async () => {
      const fresh = detectFields();
      
      if (fresh.firstName && fresh.lastName && fresh.firstName !== fresh.lastName) {
        console.log('[SAF] Filling first name...');
        await setNativeValueAndDispatch(fresh.firstName, person.firstName, true);
        console.log('[SAF] Filling last name...');
        await setNativeValueAndDispatch(fresh.lastName, person.lastName, true);
      } else {
        const single = fresh.fullName || fresh.firstName || fresh.lastName;
        if (single) {
          console.log('[SAF] Filling full name...');
          await setNativeValueAndDispatch(single, person.name, true); // Посимвольный ввод
        }
      }

      if (fresh.address1) {
        console.log('[SAF] Filling address line 1...');
        await setNativeValueAndDispatch(fresh.address1, person.address1, false);
      }
      if (fresh.address2) {
        console.log('[SAF] Filling address line 2...');
        await setNativeValueAndDispatch(fresh.address2, person.address2, false);
      }
      if (fresh.city) {
        console.log('[SAF] Filling city...');
        await setNativeValueAndDispatch(fresh.city, person.city, true); // Посимвольный ввод для города
      }
      if (fresh.postal) {
        console.log('[SAF] Filling postal code...');
        await setNativeValueAndDispatch(fresh.postal, person.postal, false);
      }
    };

    await fillNameAndAddress();

    // Заполнить штат
    const tryFillState = async () => {
      await sleep(randomDelay(400, 600));
      const f2 = detectFields();
      if (!f2.state) return;
      if (f2.state.tagName === 'SELECT') {
        console.log('📍 Filling state (select)...');
        const pickedState = pickSelectValue(
          f2.state,
          [person.stateCode],
          [person.state]
        );
        if (pickedState) {
          await setNativeValueAndDispatch(f2.state, pickedState);
        }
      } else {
        console.log('📍 Filling state (input)...');
        await setNativeValueAndDispatch(f2.state, person.stateCode || person.state, true);
      }
    };
    
    await tryFillState();

    await sleep(randomDelay(600, 1000));
    
    // Очистить использованные карты из хранилища
    chrome.storage.local.remove(['generatedCards'], () => {
      console.log('[SAF] Cleared used cards from storage');
    });
    
    console.log('[SAF] Auto-fill completed!');
    showNotification('✅ All fields filled successfully!', 'success');

  } catch (error) {
    // Очистить карты даже при ошибке
    chrome.storage.local.remove(['generatedCards']);
    showNotification('❌ Error: ' + error.message, 'error');
    console.error('Autofill error:', error);
  }

  isProcessing = false;
}

function showNotification(message, type = 'info') {
  const existing = document.getElementById('auto-card-filler-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.id = 'auto-card-filler-notification';
  notification.textContent = message;
  
  const colors = {
    info: '#3498db',
    success: '#2ecc71',
    warning: '#f39c12',
    error: '#e74c3c'
  };
  
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: colors[type] || colors.info,
    color: 'white',
    padding: '15px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: '9999999',
    fontSize: '14px',
    fontWeight: '600',
    maxWidth: '300px',
    animation: 'slideIn 0.3s ease-out'
  });
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  if (!document.getElementById('autofill-notification-style')) {
    style.id = 'autofill-notification-style';
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transition = 'all 0.3s ease-out';
    notification.style.transform = 'translateX(400px)';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Найти заголовок "Метод оплаты" / "Payment method"
function findPaymentMethodHeader() {
  const roots = collectRoots();
  
  for (const root of roots) {
    // Ищем различные варианты заголовков
    const headers = root.querySelectorAll('h1, h2, h3, h4, .Header, [class*="header"], [class*="title"], [class*="Title"]');
    
    for (const header of headers) {
      const text = header.textContent.toLowerCase().trim();
      if (text === 'payment method' || 
          text === 'payment' || 
          text === 'метод оплаты' ||
          text === 'способ оплаты' ||
          text.includes('payment method')) {
        return header;
      }
    }
  }
  
  return null;
}

// Создать кнопку очистки рядом с заголовком
function createFillButton() {
  if (clearButton || document.getElementById('stripe-clear-btn')) {
    return;
  }
  
  const paymentHeader = findPaymentMethodHeader();
  
  // Кнопка "Fill Everything" убрана - теперь используется кнопка в popup расширения
  
  // Создать кнопку очистки
  clearButton = document.createElement('button');
  clearButton.id = 'stripe-clear-btn';
  clearButton.innerHTML = '🗑️ Clear All Data';
  clearButton.style.cssText = `
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
    transition: all 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin-left: 8px;
    vertical-align: middle;
    white-space: nowrap;
  `;
  
  clearButton.addEventListener('mouseenter', () => {
    clearButton.style.transform = 'translateY(-1px)';
    clearButton.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
  });
  
  clearButton.addEventListener('mouseleave', () => {
    clearButton.style.transform = 'translateY(0)';
    clearButton.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
  });
  
  clearButton.addEventListener('click', async () => {
    if (confirm('⚠️ Clear all Stripe data? This will:\n\n• Delete all cookies\n• Clear localStorage\n• Clear sessionStorage\n• Clear cache\n• Reload the page\n\nContinue?')) {
      clearButton.disabled = true;
      clearButton.innerHTML = '⏳ Clearing...';
      
      await clearAllStripeData();
      
      showNotification('✅ All data cleared! Reloading...', 'success');
      setTimeout(() => {
        location.reload();
      }, 1000);
    }
  });
  
  // Вставить кнопки
  if (paymentHeader) {
    // Если заголовок найден - вставляем рядом
    if (paymentHeader.parentElement) {
      // Создаем wrapper для заголовка и кнопок
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;';
      
      // Копируем стили заголовка
      const headerClone = paymentHeader.cloneNode(true);
      headerClone.style.margin = '0';
      
      // Контейнер для кнопок
      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.cssText = 'display: flex; gap: 8px;';
      buttonsContainer.appendChild(clearButton);
      
      wrapper.appendChild(headerClone);
      wrapper.appendChild(buttonsContainer);
      
      paymentHeader.parentElement.replaceChild(wrapper, paymentHeader);
    }
  } else {
    // Если не нашли заголовок - добавляем плавающую кнопку справа вверху
    clearButton.style.cssText += `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
      padding: 12px 20px;
      font-size: 14px;
    `;
    document.body.appendChild(clearButton);
  }
}

// Функция полной очистки данных Stripe
async function clearAllStripeData() {
  try {
    // Очистка localStorage
    localStorage.clear();
    
    // Очистка sessionStorage
    sessionStorage.clear();
    
    // Очистка IndexedDB
    if (window.indexedDB) {
      const databases = await window.indexedDB.databases();
      for (const db of databases) {
        window.indexedDB.deleteDatabase(db.name);
      }
    }
    
    // Очистка всех cookies для текущего домена
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${location.hostname}`;
    }
    
    // Очистка Cache API
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
      }
    }
    
    // Запрос на очистку через background script (для более глубокой очистки)
    chrome.runtime.sendMessage({ action: 'clearBrowsingData' });
    
    console.log('[SAF] All Stripe data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    showNotification('⚠️ Partial clear - some data may remain', 'warning');
  }
}

// Проверить нужна ли кнопка
function shouldShowButton() {
  const cardInput = detectCardFields();
  const addressFields = detectFields();
  return cardInput || addressFields.fullName || addressFields.address1;
}

// Инициализация кнопки
function initButton() {
  if (shouldShowButton()) {
    createFillButton();
  }
}

// Наблюдатель за DOM
const observer = new MutationObserver(() => {
  if (!fillButton && shouldShowButton()) {
    createFillButton();
  }
});

if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initButton);
} else {
  initButton();
}

setTimeout(initButton, 1000);
setTimeout(initButton, 2000);
setTimeout(initButton, 3000);

// Слушатель сообщений
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    autofillAll();
  }
});

// Clear cards on page unload or reload
window.addEventListener('beforeunload', () => {
  chrome.storage.local.remove(['generatedCards']);
  console.log('[SAF] Cleared cards on page unload');
});

// Clear old cards on page load
chrome.storage.local.remove(['generatedCards'], () => {
  console.log('[SAF] Cleared old cards on page load');
});
