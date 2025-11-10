// ========================
// Cursor Registration Automation
// ========================

console.log('[SAF Cursor] Script loaded on:', window.location.href);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

async function setNativeValue(el, value, useTyping = false) {
  if (!el) return;
  
  try {
    el.focus();
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(randomDelay(150, 300));
    
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      const proto = tag === 'INPUT' 
        ? window.HTMLInputElement.prototype 
        : window.HTMLTextAreaElement.prototype;
      const valueSetter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      
      if (useTyping && value && value.length < 30) {
        el.value = '';
        for (let i = 0; i < value.length; i++) {
          valueSetter.call(el, el.value + value[i]);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          await sleep(randomDelay(50, 120));
        }
      } else {
        valueSetter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      el.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(randomDelay(150, 250));
      el.blur();
      await sleep(randomDelay(200, 300));
    }
  } catch (error) {
    console.error('[SAF Cursor] Error setting value:', error);
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function showNotification(message, type = 'info') {
  const existing = document.getElementById('cursor-registration-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.id = 'cursor-registration-notification';
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
  if (!document.getElementById('cursor-notification-style')) {
    style.id = 'cursor-notification-style';
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

async function getRandomPersonData() {
  // Генерируем случайные данные
  const firstNames = ['John', 'Michael', 'David', 'James', 'Robert', 'William', 'Richard', 'Thomas', 'Charles', 'Daniel'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return { firstName, lastName };
}

async function fillRegistrationForm() {
  try {
    console.log('[SAF Cursor] Filling registration form...');
    showNotification('📝 Filling registration form...', 'info');
    await sleep(1500);
    
    // Получаем случайные данные
    const person = await getRandomPersonData();
    const randomEmail = `${person.firstName.toLowerCase()}.${person.lastName.toLowerCase()}${Math.floor(Math.random() * 9999)}@gmail.com`;
    
    console.log('[SAF Cursor] Generated data:', { firstName: person.firstName, lastName: person.lastName, email: randomEmail });
    
    // Ищем поля формы
    const firstNameField = document.querySelector('input[name="first_name"], input[autocomplete="given-name"]');
    const lastNameField = document.querySelector('input[name="last_name"], input[autocomplete="family-name"]');
    const emailField = document.querySelector('input[name="email"], input[type="email"], input[autocomplete="email"]');
    
    console.log('[SAF Cursor] Found fields:', {
      firstName: !!firstNameField,
      lastName: !!lastNameField,
      email: !!emailField
    });
    
    if (firstNameField && isVisible(firstNameField)) {
      console.log('[SAF Cursor] Filling first name...');
      await setNativeValue(firstNameField, person.firstName, true);
      showNotification(`👤 Name: ${person.firstName}`, 'info');
    }
    
    if (lastNameField && isVisible(lastNameField)) {
      console.log('[SAF Cursor] Filling last name...');
      await setNativeValue(lastNameField, person.lastName, true);
      showNotification(`👥 Last name: ${person.lastName}`, 'info');
    }
    
    if (emailField && isVisible(emailField)) {
      console.log('[SAF Cursor] Filling email...');
      await setNativeValue(emailField, randomEmail, false);
      showNotification(`📧 Email: ${randomEmail}`, 'info');
    }
    
    // Сохраняем credentials
    chrome.storage.local.set({
      lastCursorCredentials: {
        email: randomEmail,
        firstName: person.firstName,
        lastName: person.lastName,
        timestamp: Date.now()
      }
    });
    
    await sleep(1000);
    showNotification('✅ Form filled successfully!', 'success');
    
    console.log('[SAF Cursor] Registration form completed!');
    
  } catch (error) {
    console.error('[SAF Cursor] Error filling form:', error);
    showNotification('❌ Error: ' + error.message, 'error');
  }
}

function findSignUpButton() {
  const SIGNUP_TEXTS = [
    'регистрация',
    'sign up',
    'register',
    'create account',
    'sign-up'
  ];
  
  try {
    const roots = collectRoots();
    const selectors = ['a', 'button', '[role="button"]', '[role="link"]', '.Link', '.Button'];
    
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
            el.getAttribute('href') || '',
            el.getAttribute('data-testid') || ''
          ].join(' ').toLowerCase();
          
          if (!combined) continue;
          
          // Проверяем на совпадение с текстами регистрации
          if (SIGNUP_TEXTS.some(t => combined.includes(t))) {
            const clickable = el.closest('a, button, [role="button"], [role="link"]') || el;
            console.log('[SAF Cursor] Found sign-up element:', {
              tag: el.tagName,
              text: el.textContent.trim().slice(0, 50),
              href: el.href || 'no href'
            });
            return clickable;
          }
        }
      }
    }
  } catch (error) {
    console.error('[SAF Cursor] Error in findSignUpButton:', error);
  }
  
  return null;
}

async function startRegistration() {
  try {
    console.log('[SAF Cursor] Starting registration process...');
    showNotification('🤖 Starting registration...', 'info');
    await sleep(2000);
    
    const currentUrl = window.location.href;
    console.log('[SAF Cursor] Current URL:', currentUrl);
    
    // Ищем кнопку/ссылку регистрации
    console.log('[SAF Cursor] Looking for sign-up link...');
    showNotification('🔍 Looking for Sign Up...', 'info');
    
    const signUpButton = findSignUpButton();
    
    if (signUpButton) {
      console.log('[SAF Cursor] Found Sign Up button!');
      showNotification('✅ Found Sign Up!', 'success');
      await sleep(500);
      
      signUpButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await sleep(300);
      
      // Убираем target="_blank" если есть
      if (signUpButton.hasAttribute('target')) {
        signUpButton.removeAttribute('target');
      }
      
      console.log('[SAF Cursor] Clicking Sign Up button...');
      signUpButton.click();
      console.log('[SAF Cursor] Clicked!');
      
      // Ждем загрузки формы
      await sleep(3000);
      
      // Заполняем форму
      await fillRegistrationForm();
    } else {
      console.log('[SAF Cursor] Sign Up button not found. Checking if already on registration form...');
      showNotification('🔍 Checking for registration form...', 'info');
      await sleep(1000);
      
      // Возможно уже на странице регистрации
      const emailField = document.querySelector('input[name="email"], input[type="email"]');
      if (emailField && isVisible(emailField)) {
        console.log('[SAF Cursor] Already on registration form!');
        await fillRegistrationForm();
      } else {
        console.log('[SAF Cursor] No registration form found');
        showNotification('⚠️ Registration form not found', 'warning');
        
        // Debug - показываем все найденные элементы
        const roots = collectRoots();
        for (const root of roots) {
          const allLinks = root.querySelectorAll('a');
          console.log('[SAF Cursor] Links in root:', Array.from(allLinks).slice(0, 10).map(a => ({
            text: a.textContent.trim().slice(0, 30),
            href: a.href
          })));
        }
      }
    }
    
  } catch (error) {
    console.error('[SAF Cursor] Error in registration:', error);
    showNotification('❌ Error: ' + error.message, 'error');
  }
}

// Слушатель сообщений
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[SAF Cursor] Received message:', request.action);
  
  if (request.action === 'startCursorRegistration') {
    console.log('[SAF Cursor] Starting registration on:', window.location.href);
    startRegistration();
    sendResponse({ success: true });
  }
  
  return true;
});

// Автозапуск через 3 секунды если есть параметр
if (window.location.href.includes('authenticator.cursor.sh')) {
  console.log('[SAF Cursor] On authenticator page, waiting for auto-start...');
}
