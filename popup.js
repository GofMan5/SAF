// DOM Elements
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// BIN elements
const binInput = document.getElementById('binInput');
const addBinBtn = document.getElementById('addBinBtn');
const generateCardsBtn = document.getElementById('generateCardsBtn');
const statusMessage = document.getElementById('statusMessage');
const binHistoryList = document.getElementById('binHistoryList');

// Address elements
const nameInput = document.getElementById('nameInput');
const address1Input = document.getElementById('address1Input');
const address2Input = document.getElementById('address2Input');
const cityInput = document.getElementById('cityInput');
const stateInput = document.getElementById('stateInput');
const zipInput = document.getElementById('zipInput');
const addAddressBtn = document.getElementById('addAddressBtn');
const addressesList = document.getElementById('addressesList');

// Name elements
const firstNameInput = document.getElementById('firstNameInput');
const lastNameInput = document.getElementById('lastNameInput');
const addNameBtn = document.getElementById('addNameBtn');
const namesList = document.getElementById('namesList');

// IP Blocker elements
const currentIPElement = document.getElementById('currentIP');
const ipStatusElement = document.getElementById('ipStatus');
const refreshIPBtn = document.getElementById('refreshIPBtn');
const blockedIPsList = document.getElementById('blockedIPsList');
const blockedIPsCount = document.getElementById('blockedIPsCount');
const clearAllIPsBtn = document.getElementById('clearAllIPsBtn');

// Luhn validation checkbox
const useLuhnValidation = document.getElementById('useLuhnValidation');

// Cursor Registration elements
const startCursorRegistrationBtn = document.getElementById('startCursorRegistrationBtn');
const cursorStatusMessage = document.getElementById('cursorStatusMessage');

const DEFAULT_BIN = '552461xxxxxxxxxx';

let currentIPAddress = null;

// BIN List - Coming Soon (функционал временно отключен)


// Auto-complete BIN with x's
binInput.addEventListener('input', (e) => {
  let value = e.target.value.toUpperCase();
  
  // Удаляем все кроме цифр и X
  value = value.replace(/[^0-9X]/g, '');
  
  // Ограничиваем длину до 19 символов (максимальная длина карты)
  if (value.length > 19) {
    value = value.substring(0, 19);
  }
  
  e.target.value = value;
});

binInput.addEventListener('blur', (e) => {
  let value = e.target.value.toUpperCase().replace(/[^0-9X]/g, '');
  
  if (value.length > 0 && value.length < 16) {
    // Дополняем до 16 символов (стандартная длина карты)
    const digitsOnly = value.replace(/X/g, '');
    const xCount = 16 - digitsOnly.length;
    value = digitsOnly + 'X'.repeat(xCount);
  }
  
  e.target.value = value;
});

// Mini Settings Toggle
const settingsToggleBtn = document.getElementById('settingsToggleBtn');
const miniSettings = document.getElementById('miniSettings');

if (settingsToggleBtn && miniSettings) {
  settingsToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    miniSettings.classList.toggle('show');
    settingsToggleBtn.classList.toggle('active');
  });
  
  // Close mini settings when clicking outside
  document.addEventListener('click', (e) => {
    if (!miniSettings.contains(e.target) && e.target !== settingsToggleBtn && !settingsToggleBtn.contains(e.target)) {
      miniSettings.classList.remove('show');
      settingsToggleBtn.classList.remove('active');
    }
  });
}

// Save validation preference
if (useLuhnValidation) {
  useLuhnValidation.addEventListener('change', () => {
    chrome.storage.local.set({ useLuhnValidation: useLuhnValidation.checked });
  });
  
  // Load saved preference
  chrome.storage.local.get(['useLuhnValidation'], (result) => {
    if (result.useLuhnValidation !== undefined) {
      useLuhnValidation.checked = result.useLuhnValidation;
    }
  });
}

// Address and Name Source Management
const addressSourceSelect = document.getElementById('addressSourceSelect');
const nameSourceSelect = document.getElementById('nameSourceSelect');

if (addressSourceSelect) {
  addressSourceSelect.addEventListener('change', () => {
    const source = addressSourceSelect.value;
    chrome.storage.local.set({ addressSource: source });
    console.log('✅ Address source changed to:', source);
  });
  
  // Load saved preference
  chrome.storage.local.get(['addressSource'], (result) => {
    if (result.addressSource) {
      addressSourceSelect.value = result.addressSource;
    } else {
      // Default to static
      addressSourceSelect.value = 'static';
      chrome.storage.local.set({ addressSource: 'static' });
    }
  });
}

if (nameSourceSelect) {
  nameSourceSelect.addEventListener('change', () => {
    const source = nameSourceSelect.value;
    chrome.storage.local.set({ nameSource: source });
    console.log('✅ Name source changed to:', source);
  });
  
  // Load saved preference
  chrome.storage.local.get(['nameSource'], (result) => {
    if (result.nameSource) {
      nameSourceSelect.value = result.nameSource;
    } else {
      // Default to static
      nameSourceSelect.value = 'static';
      chrome.storage.local.set({ nameSource: 'static' });
    }
  });
}

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Обновляем язык при переключении на вкладки
    if (Object.keys(translations).length > 0) {
      if (tabName === 'ipblocker') {
        updateIPBlockerLanguage();
      } else if (tabName === 'settings') {
        updateSettingsLanguage();
        updateCursorLanguage();
      }
    }
  });
});

// Sub-tab switching (for General and Settings)
const subTabs = document.querySelectorAll('.sub-tab-btn');
const subTabContents = document.querySelectorAll('.sub-tab-content');

subTabs.forEach(subTab => {
  subTab.addEventListener('click', () => {
    const subtabName = subTab.dataset.subtab;
    
    // Получаем родительский контейнер вкладки (General или Settings)
    const parentTabContent = subTab.closest('.tab-content');
    
    if (!parentTabContent) return;
    
    // Удаляем active только у подвкладок в текущем родителе
    const siblingSubTabs = parentTabContent.querySelectorAll('.sub-tab-btn');
    const siblingSubTabContents = parentTabContent.querySelectorAll('.sub-tab-content');
    
    siblingSubTabs.forEach(st => st.classList.remove('active'));
    siblingSubTabContents.forEach(stc => stc.classList.remove('active'));
    
    subTab.classList.add('active');
    const targetSubTab = document.getElementById(`${subtabName}-subtab`);
    if (targetSubTab) {
      targetSubTab.classList.add('active');
      
      // Обновляем переводы при переключении на подвкладки Settings
      if (Object.keys(translations).length > 0) {
        if (subtabName === 'stripe-settings') {
          updateSettingsLanguage();
        } else if (subtabName === 'cursor-settings') {
          updateCursorLanguage();
        }
      }
    }
  });
});

// BIN Management
addBinBtn.addEventListener('click', () => {
  const bin = binInput.value.trim();
  if (!bin) return;
  
  chrome.storage.local.get(['binHistory'], (result) => {
    let history = result.binHistory || [];
    
    // Remove if already exists
    history = history.filter(b => b !== bin);
    
    // Add to beginning
    history.unshift(bin);
    
    // Keep only last 20
    if (history.length > 20) history = history.slice(0, 20);
    
    chrome.storage.local.set({ binHistory: history, currentBin: bin }, () => {
      loadBinHistory();
      showToast('BIN added to history');
    });
  });
});

// Generate Cards
generateCardsBtn.addEventListener('click', async () => {
  const bin = binInput.value.trim();
  
  if (!bin) {
    showStatus('Please enter a BIN number', 'error');
    return;
  }
  
  if (bin.length < 6) {
    showStatus('BIN must be at least 6 digits', 'error');
    return;
  }
  
  const useValidation = useLuhnValidation.checked;
  
  generateCardsBtn.disabled = true;
  generateCardsBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Processing...</span>';
  
  if (useValidation) {
    showStatus('🔐 Generating cards with Luhn validation...', 'loading');
  } else {
    showStatus('⚡ Generating cards...', 'loading');
  }
  
  // Save to history
  chrome.storage.local.get(['binHistory'], (result) => {
    let history = result.binHistory || [];
    history = history.filter(b => b !== bin);
    history.unshift(bin);
    if (history.length > 20) history = history.slice(0, 20);
    chrome.storage.local.set({ binHistory: history, currentBin: bin }, () => {
      loadBinHistory();
    });
  });
  
  chrome.runtime.sendMessage({
    action: 'generateCards',
    bin: bin,
    useValidation: useValidation,
    stripeTabId: null
  }, (response) => {
    if (response && response.success) {
      const validationText = useValidation ? ' (Luhn validated)' : '';
      showStatus(`✅ Generated ${response.cards.length} cards${validationText}. Filling form...`, 'loading');
      
      // Find active Stripe tab and fill form
      chrome.tabs.query({ url: ['https://checkout.stripe.com/*', 'https://*.stripe.com/*'] }, (tabs) => {
        if (chrome.runtime.lastError) {
          generateCardsBtn.disabled = false;
          generateCardsBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Fill Everything</span>';
          showStatus('❌ Error: ' + chrome.runtime.lastError.message, 'error');
          return;
        }
        
        if (tabs.length > 0) {
          // Use the first active Stripe tab
          const stripeTab = tabs.find(t => t.active) || tabs[0];
          
          // Send message to content script to fill form
          chrome.tabs.sendMessage(stripeTab.id, { action: 'fillForm' }, (fillResponse) => {
            generateCardsBtn.disabled = false;
            generateCardsBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Fill Everything</span>';
            
            if (chrome.runtime.lastError) {
              showStatus('❌ Please open a Stripe checkout page first', 'error');
            } else {
              showStatus(`✅ Form filled successfully!`, 'success');
              showToast('Form filled!');
            }
          });
        } else {
          generateCardsBtn.disabled = false;
          generateCardsBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Fill Everything</span>';
          showStatus('❌ No Stripe checkout page found. Please open one first.', 'error');
        }
      });
    } else {
      generateCardsBtn.disabled = false;
      generateCardsBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Fill Everything</span>';
      showStatus('❌ Failed to generate cards. Try again.', 'error');
      showToast('Failed to generate cards', 'error');
    }
  });
});

function loadBinHistory() {
  chrome.storage.local.get(['binHistory', 'currentBin'], (result) => {
    const history = result.binHistory || [];
    const currentBin = result.currentBin || DEFAULT_BIN;
    
    binInput.value = currentBin;
    binHistoryList.innerHTML = '';
    
    if (history.length === 0) {
      binHistoryList.innerHTML = '<div class="empty">No BINs saved yet</div>';
      return;
    }
    
    history.forEach(bin => {
      const item = document.createElement('div');
      item.className = 'history-item';
      
      const binText = document.createElement('span');
      binText.textContent = bin;
      binText.className = 'history-bin';
      binText.addEventListener('click', () => {
        binInput.value = bin;
        chrome.storage.local.set({ currentBin: bin });
        showToast('BIN selected');
      });
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteBin(bin);
      });
      
      item.appendChild(binText);
      item.appendChild(deleteBtn);
      binHistoryList.appendChild(item);
    });
  });
}

function deleteBin(bin) {
  chrome.storage.local.get(['binHistory'], (result) => {
    let history = result.binHistory || [];
    history = history.filter(b => b !== bin);
    
    chrome.storage.local.set({ binHistory: history }, () => {
      loadBinHistory();
      showToast('BIN deleted');
    });
  });
}

// Address Management
addAddressBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const address1 = address1Input.value.trim();
  const address2 = address2Input.value.trim();
  const city = cityInput.value.trim();
  const state = stateInput.value.trim();
  const zip = zipInput.value.trim();
  
  if (!name || !address1 || !city || !state || !zip) {
    showToast('Please fill all required fields', 'error');
    return;
  }
  
  const nameParts = name.split(' ');
  const firstName = nameParts[0] || name;
  const lastName = nameParts.slice(1).join(' ') || nameParts[0];
  
  const address = {
    id: Date.now(),
    name,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    stateCode: getStateCode(state),
    postal: zip,
    countryText: 'United States',
    countryValue: 'US'
  };
  
  chrome.storage.local.get(['customAddresses'], (result) => {
    const addresses = result.customAddresses || [];
    addresses.push(address);
    
    chrome.storage.local.set({ customAddresses: addresses }, () => {
      clearAddressInputs();
      loadAddresses();
      showToast('Address added');
    });
  });
});

function clearAddressInputs() {
  nameInput.value = '';
  address1Input.value = '';
  address2Input.value = '';
  cityInput.value = '';
  stateInput.value = '';
  zipInput.value = '';
}

function loadAddresses() {
  chrome.storage.local.get(['customAddresses'], (result) => {
    const addresses = result.customAddresses || [];
    addressesList.innerHTML = '';
    
    if (addresses.length === 0) {
      addressesList.innerHTML = '<div class="empty">No addresses saved yet</div>';
      return;
    }
    
    addresses.forEach(addr => {
      const item = document.createElement('div');
      item.className = 'list-item';
      
      const info = document.createElement('div');
      info.className = 'item-info';
      info.innerHTML = `
        <strong>${addr.name}</strong><br>
        <small>${addr.address1}${addr.address2 ? ', ' + addr.address2 : ''}<br>
        ${addr.city}, ${addr.state} ${addr.postal}</small>
      `;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', () => deleteAddress(addr.id));
      
      item.appendChild(info);
      item.appendChild(deleteBtn);
      addressesList.appendChild(item);
    });
  });
}

function deleteAddress(id) {
  chrome.storage.local.get(['customAddresses'], (result) => {
    let addresses = result.customAddresses || [];
    addresses = addresses.filter(a => a.id !== id);
    
    chrome.storage.local.set({ customAddresses: addresses }, () => {
      loadAddresses();
      showToast('Address deleted');
    });
  });
}

// Name Management
addNameBtn.addEventListener('click', () => {
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  
  if (!firstName || !lastName) {
    showToast('Please enter both first and last name', 'error');
    return;
  }
  
  const name = {
    id: Date.now(),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`
  };
  
  chrome.storage.local.get(['customNames'], (result) => {
    const names = result.customNames || [];
    names.push(name);
    
    chrome.storage.local.set({ customNames: names }, () => {
      firstNameInput.value = '';
      lastNameInput.value = '';
      loadNames();
      showToast('Name added');
    });
  });
});

function loadNames() {
  chrome.storage.local.get(['customNames'], (result) => {
    const names = result.customNames || [];
    namesList.innerHTML = '';
    
    if (names.length === 0) {
      namesList.innerHTML = '<div class="empty">No names saved yet</div>';
      return;
    }
    
    names.forEach(name => {
      const item = document.createElement('div');
      item.className = 'list-item';
      
      const info = document.createElement('div');
      info.className = 'item-info';
      info.innerHTML = `<strong>${name.fullName}</strong>`;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', () => deleteName(name.id));
      
      item.appendChild(info);
      item.appendChild(deleteBtn);
      namesList.appendChild(item);
    });
  });
}

function deleteName(id) {
  chrome.storage.local.get(['customNames'], (result) => {
    let names = result.customNames || [];
    names = names.filter(n => n.id !== id);
    
    chrome.storage.local.set({ customNames: names }, () => {
      loadNames();
      showToast('Name deleted');
    });
  });
}

// Helper functions
function getStateCode(stateName) {
  const states = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY'
  };
  
  return states[stateName] || stateName.substring(0, 2).toUpperCase();
}

function showStatus(message, type = '') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';
  
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 5000);
  }
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function loadData() {
  loadBinHistory();
  loadAddresses();
  loadNames();
  loadIPBlockerData(); // Загружаем данные IP Blocker
}

// ========================
// IP Blocker Management
// ========================

/**
 * Получает текущий IP адрес через публичный API
 */
async function fetchCurrentIP() {
  if (!currentIPElement) return; // Check if element exists
  
  try {
    currentIPElement.textContent = t('ipBlocker.loading');
    
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    currentIPAddress = data.ip;
    
    // Отображаем IP
    currentIPElement.textContent = currentIPAddress;
    
    // Получаем информацию о стране
    const countryInfo = await getCountryByIP(currentIPAddress);
    console.log('[SAF IP Blocker] Country info for current IP:', countryInfo);
    
    // Отображаем страну в отдельном поле
    const countryInfoItem = document.getElementById('countryInfoItem');
    const countryNameElement = document.getElementById('countryName');
    
    if (countryInfo && countryInfo.country) {
      if (countryNameElement) {
        countryNameElement.textContent = `${countryInfo.country} (${countryInfo.countryCode})`;
      }
      if (countryInfoItem) {
        countryInfoItem.style.display = 'flex';
      }
    } else {
      if (countryInfoItem) {
        countryInfoItem.style.display = 'none';
      }
    }
    
    checkIPStatus();
    
    console.log('[SAF IP Blocker] Current IP fetched:', currentIPAddress);
  } catch (error) {
    console.error('[SAF IP Blocker] Error fetching IP:', error);
    if (currentIPElement) {
      currentIPElement.textContent = t('ipBlocker.error');
    }
    showToast(t('ipBlocker.failedToFetch'), 'error');
  }
}

/**
 * Проверяет статус текущего IP (заблокирован или нет)
 */
function checkIPStatus() {
  if (!currentIPAddress || !ipStatusElement) return;
  
  chrome.storage.local.get(['blockedIPs'], (result) => {
    const blockedIPs = result.blockedIPs || [];
    const isBlocked = blockedIPs.some(item => item.ip === currentIPAddress);
    
    if (isBlocked) {
      ipStatusElement.textContent = '🚫 ' + t('ipBlocker.statusBlocked');
      ipStatusElement.className = 'ip-status blocked';
    } else {
      ipStatusElement.textContent = '✅ ' + t('ipBlocker.statusActive');
      ipStatusElement.className = 'ip-status active';
    }
  });
}

/**
 * Получает информацию о стране по IP адресу
 */
async function getCountryByIP(ip) {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country,
        countryCode: data.countryCode
      };
    }
    return null;
  } catch (error) {
    console.error('[SAF IP Blocker] Error fetching country info:', error);
    return null;
  }
}

/**
 * Добавляет IP в список блокировки
 */
async function addIPToBlocklist(ip, reason = 'Manual') {
  if (!ip) {
    showToast('Enter IP address', 'error');
    return;
  }
  
  // Простая валидация IP адреса
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    showToast('Invalid IP format', 'error');
    return;
  }
  
  // Получаем информацию о стране
  const countryInfo = await getCountryByIP(ip);
  console.log('[SAF IP Blocker] Country info:', countryInfo);
  
  chrome.storage.local.get(['blockedIPs'], (result) => {
    let blockedIPs = result.blockedIPs || [];
    
    // Проверяем, не заблокирован ли уже этот IP
    const alreadyBlocked = blockedIPs.some(item => item.ip === ip);
    
    if (alreadyBlocked) {
      showToast('IP already blocked', 'error');
      return;
    }
    
    // Добавляем новый IP
    const blockedEntry = {
      ip: ip,
      date: new Date().toISOString(),
      reason: reason,
      timestamp: Date.now(),
      country: countryInfo?.country || 'Unknown',
      countryCode: countryInfo?.countryCode || '??'
    };
    
    blockedIPs.push(blockedEntry);
    
    // Сохраняем в storage
    chrome.storage.local.set({ blockedIPs: blockedIPs }, () => {
      console.log('[SAF IP Blocker] IP added to blocklist:', ip);
      showToast('IP blocked');
      loadBlockedIPs();
      checkIPStatus();
    });
  });
}

/**
 * Удаляет IP из списка блокировки
 */
function deleteBlockedIP(ip) {
  chrome.storage.local.get(['blockedIPs'], (result) => {
    let blockedIPs = result.blockedIPs || [];
    blockedIPs = blockedIPs.filter(item => item.ip !== ip);
    
    chrome.storage.local.set({ blockedIPs: blockedIPs }, () => {
      console.log('[SAF IP Blocker] IP removed from blocklist:', ip);
      showToast(t('ipBlocker.ipRemoved'));
      loadBlockedIPs();
      checkIPStatus();
    });
  });
}

/**
 * Загружает и отображает список заблокированных IP
 */
function loadBlockedIPs() {
  if (!blockedIPsList) return; // Check if element exists
  
  chrome.storage.local.get(['blockedIPs'], (result) => {
    const blockedIPs = result.blockedIPs || [];
    blockedIPsList.innerHTML = '';
    
    // Обновляем счетчик
    if (blockedIPsCount) {
      blockedIPsCount.textContent = blockedIPs.length;
    }
    
    // Показываем/скрываем кнопку очистки
    if (clearAllIPsBtn) {
      clearAllIPsBtn.style.display = blockedIPs.length > 0 ? 'flex' : 'none';
    }
    
    if (blockedIPs.length === 0) {
      blockedIPsList.innerHTML = `<div class="empty">${t('ipBlocker.noBlockedIPs')}</div>`;
      return;
    }
    
    // Сортируем по дате (новые первыми)
    blockedIPs.sort((a, b) => b.timestamp - a.timestamp);
    
    blockedIPs.forEach(item => {
      const ipItem = document.createElement('div');
      ipItem.className = 'blocked-ip-item';
      
      const ipInfo = document.createElement('div');
      ipInfo.className = 'blocked-ip-info';
      
      const ipAddress = document.createElement('div');
      ipAddress.className = 'blocked-ip-address';
      ipAddress.textContent = item.ip;
      
      const ipMeta = document.createElement('div');
      ipMeta.className = 'blocked-ip-meta';
      
      const ipDate = document.createElement('div');
      ipDate.className = 'blocked-ip-date';
      ipDate.textContent = formatDate(item.date);
      
      // Добавляем страну если есть
      if (item.country && item.country !== 'Unknown') {
        const ipCountry = document.createElement('div');
        ipCountry.className = 'blocked-ip-country';
        ipCountry.innerHTML = `<span class="country-flag">🌍</span> ${item.country} (${item.countryCode})`;
        ipMeta.appendChild(ipCountry);
      }
      
      ipMeta.appendChild(ipDate);
      
      const ipReason = document.createElement('div');
      ipReason.className = 'blocked-ip-reason';
      ipReason.textContent = item.reason;
      
      ipInfo.appendChild(ipAddress);
      ipInfo.appendChild(ipMeta);
      ipInfo.appendChild(ipReason);
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.className = 'delete-btn';
      deleteBtn.title = t('ipBlocker.removeIP');
      deleteBtn.addEventListener('click', () => {
        const confirmMsg = t('ipBlocker.confirmRemove').replace('{ip}', item.ip);
        if (confirm(confirmMsg)) {
          deleteBlockedIP(item.ip);
        }
      });
      
      ipItem.appendChild(ipInfo);
      ipItem.appendChild(deleteBtn);
      blockedIPsList.appendChild(ipItem);
    });
  });
}

/**
 * Форматирует дату в читаемый вид
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  // Переводы для относительного времени
  const timeStrings = {
    en: {
      justNow: 'Just now',
      minsAgo: (n) => `${n} min${n > 1 ? 's' : ''} ago`,
      hoursAgo: (n) => `${n} hour${n > 1 ? 's' : ''} ago`,
      daysAgo: (n) => `${n} day${n > 1 ? 's' : ''} ago`
    },
    ru: {
      justNow: 'Только что',
      minsAgo: (n) => `${n} мин. назад`,
      hoursAgo: (n) => `${n} ч. назад`,
      daysAgo: (n) => `${n} дн. назад`
    }
  };
  
  const lang = currentLang || 'en';
  const strings = timeStrings[lang];
  
  if (diffMins < 1) return strings.justNow;
  if (diffMins < 60) return strings.minsAgo(diffMins);
  if (diffHours < 24) return strings.hoursAgo(diffHours);
  if (diffDays < 7) return strings.daysAgo(diffDays);
  
  // Для старых дат используем локализованный формат
  const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Мигрирует старые записи IP, добавляя информацию о стране
 */
async function migrateOldIPRecords() {
  chrome.storage.local.get(['blockedIPs'], async (result) => {
    let blockedIPs = result.blockedIPs || [];
    let needsUpdate = false;
    
    // Проверяем каждую запись
    for (let i = 0; i < blockedIPs.length; i++) {
      const item = blockedIPs[i];
      
      // Если у записи нет информации о стране, получаем её
      if (!item.country || !item.countryCode) {
        console.log('[SAF IP Blocker] Updating country info for IP:', item.ip);
        const countryInfo = await getCountryByIP(item.ip);
        
        if (countryInfo) {
          blockedIPs[i].country = countryInfo.country;
          blockedIPs[i].countryCode = countryInfo.countryCode;
          needsUpdate = true;
        } else {
          // Устанавливаем значения по умолчанию если не удалось получить информацию
          blockedIPs[i].country = 'Unknown';
          blockedIPs[i].countryCode = '??';
          needsUpdate = true;
        }
        
        // Добавляем небольшую задержку чтобы не перегружать API
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    // Сохраняем обновлённые данные
    if (needsUpdate) {
      chrome.storage.local.set({ blockedIPs: blockedIPs }, () => {
        console.log('[SAF IP Blocker] ✅ IP records migrated with country info');
        loadBlockedIPs();
      });
    }
  });
}

/**
 * Загружает все данные для IP Blocker
 */
function loadIPBlockerData() {
  // Проверяем, что элементы IP Blocker существуют (вкладка открыта)
  if (currentIPElement || blockedIPsList) {
    fetchCurrentIP();
    loadBlockedIPs();
    migrateOldIPRecords(); // Мигрируем старые записи
  }
}

// Event Listeners для IP Blocker
if (refreshIPBtn) {
  refreshIPBtn.addEventListener('click', () => {
    fetchCurrentIP();
    loadBlockedIPs();
    showToast(t('ipBlocker.ipDataRefreshed'));
  });
}

// Обработчик для кнопки очистки всех IP
if (clearAllIPsBtn) {
  clearAllIPsBtn.addEventListener('click', () => {
    chrome.storage.local.get(['blockedIPs'], (result) => {
      const blockedIPs = result.blockedIPs || [];
      const count = blockedIPs.length;
      
      if (count === 0) return;
      
      const lang = currentLang || 'en';
      
      // ПЕРВОЕ ПРЕДУПРЕЖДЕНИЕ
      const firstWarningMessages = {
        en: `⚠️ WARNING!\n\nYou are about to delete ALL ${count} blocked IP address${count > 1 ? 'es' : ''}.\n\nThis action cannot be undone!\n\nAre you sure you want to continue?`,
        ru: `⚠️ ПРЕДУПРЕЖДЕНИЕ!\n\nВы собираетесь удалить ВСЕ ${count} заблокированных IP адрес${count > 1 ? (count > 4 ? 'ов' : 'а') : ''}.\n\nЭто действие нельзя отменить!\n\nВы уверены, что хотите продолжить?`
      };
      
      const firstConfirm = confirm(firstWarningMessages[lang]);
      
      if (!firstConfirm) {
        const cancelMsg = lang === 'ru' ? '❌ Действие отменено' : '❌ Action cancelled';
        showToast(cancelMsg, 'info');
        return;
      }
      
      // ВТОРОЕ ПРЕДУПРЕЖДЕНИЕ (более строгое)
      const secondWarningMessages = {
        en: `🚨 FINAL WARNING! 🚨\n\nThis is your LAST CHANCE!\n\nYou will permanently delete ${count} IP address${count > 1 ? 'es' : ''} from the blocklist.\n\nClick OK ONLY if you are absolutely sure!`,
        ru: `🚨 ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ! 🚨\n\nЭто ваш ПОСЛЕДНИЙ ШАНС передумать!\n\nВы окончательно удалите ${count} IP адрес${count > 1 ? (count > 4 ? 'ов' : 'а') : ''} из списка блокировки.\n\nНажмите ОК ТОЛЬКО если вы абсолютно уверены!`
      };
      
      const secondConfirm = confirm(secondWarningMessages[lang]);
      
      if (!secondConfirm) {
        const cancelMsg = lang === 'ru' ? '❌ Действие отменено' : '❌ Action cancelled';
        showToast(cancelMsg, 'info');
        return;
      }
      
      // Очищаем все IP
      chrome.storage.local.set({ blockedIPs: [] }, () => {
        console.log('[SAF IP Blocker] All IPs cleared');
        const successMsg = lang === 'ru' 
          ? `🗑️ Все ${count} IP адрес${count > 1 ? (count > 4 ? 'ов' : 'а') : ''} удалены` 
          : `🗑️ All ${count} IP address${count > 1 ? 'es' : ''} deleted`;
        showToast(successMsg, 'success');
        loadBlockedIPs();
        checkIPStatus();
      });
    });
  });
}

// Слушаем сообщения от content script о заблокированных IP
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ipBlocked') {
    console.log('[SAF IP Blocker] IP blocked notification received:', request.ip);
    loadBlockedIPs();
    checkIPStatus();
    const message = t('ipBlocker.ipBlocked').replace('{ip}', request.ip);
    showToast(message, 'error');
  }
});

console.log('[SAF IP Blocker] Popup initialized ✅');

// ========================
// Cursor Registration Management
// ========================
// TEMPORARILY DISABLED - IN DEVELOPMENT

/*
if (startCursorRegistrationBtn) {
  startCursorRegistrationBtn.addEventListener('click', async () => {
    startCursorRegistrationBtn.disabled = true;
    startCursorRegistrationBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Processing...</span>';
    
    if (cursorStatusMessage) {
      cursorStatusMessage.textContent = '🔄 Opening Cursor dashboard...';
      cursorStatusMessage.style.display = 'block';
      cursorStatusMessage.className = 'status-message loading';
    }
    
    try {
      // Сразу открываем dashboard Cursor в новой вкладке
      chrome.tabs.create({ url: 'https://cursor.com/dashboard' }, (tab) => {
        if (chrome.runtime.lastError) {
          startCursorRegistrationBtn.disabled = false;
          startCursorRegistrationBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Start Registration</span>';
          if (cursorStatusMessage) {
            cursorStatusMessage.textContent = '❌ Error: ' + chrome.runtime.lastError.message;
            cursorStatusMessage.className = 'status-message error';
          }
          return;
        }
        
        console.log('[SAF] Created tab:', tab.id);
        
        if (cursorStatusMessage) {
          cursorStatusMessage.textContent = '⏳ Waiting for page to load...';
          cursorStatusMessage.className = 'status-message loading';
        }
        
        // Создаем listener для отслеживания загрузки страницы
        const listener = (tabId, changeInfo, updatedTab) => {
          console.log('[SAF] Tab update:', tabId, changeInfo.status);
          
          // Проверяем что это наша вкладка и страница полностью загружена
          if (tabId === tab.id && changeInfo.status === 'complete') {
            console.log('[SAF] Page loaded completely, starting registration...');
            
            // Удаляем listener
            chrome.tabs.onUpdated.removeListener(listener);
            
            if (cursorStatusMessage) {
              cursorStatusMessage.textContent = '✅ Page loaded! Starting registration...';
              cursorStatusMessage.className = 'status-message loading';
            }
            
            // Дополнительная задержка для инициализации content script
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { action: 'startCursorRegistration' }, (response) => {
                startCursorRegistrationBtn.disabled = false;
                startCursorRegistrationBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Start Registration</span>';
                
                if (chrome.runtime.lastError) {
                  console.error('[SAF] Message error:', chrome.runtime.lastError);
                  if (cursorStatusMessage) {
                    cursorStatusMessage.textContent = '⚠️ Registration started (check the tab)';
                    cursorStatusMessage.className = 'status-message warning';
                  }
                } else if (response && response.success) {
                  console.log('[SAF] Registration started successfully');
                  if (cursorStatusMessage) {
                    cursorStatusMessage.textContent = '✅ Registration started successfully!';
                    cursorStatusMessage.className = 'status-message success';
                  }
                  showToast('Cursor registration started!');
                } else {
                  console.warn('[SAF] Unexpected response:', response);
                }
              });
            }, 2000); // Ждем еще 2 секунды для инициализации
          }
        };
        
        // Добавляем listener
        chrome.tabs.onUpdated.addListener(listener);
        
        // Таймаут на случай если страница не загрузится
        setTimeout(() => {
          chrome.tabs.onUpdated.removeListener(listener);
          if (startCursorRegistrationBtn.disabled) {
            startCursorRegistrationBtn.disabled = false;
            startCursorRegistrationBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Start Registration</span>';
            if (cursorStatusMessage) {
              cursorStatusMessage.textContent = '⚠️ Timeout - please try manually on the opened tab';
              cursorStatusMessage.className = 'status-message warning';
            }
          }
        }, 15000); // Максимум 15 секунд ожидания
      });
    } catch (error) {
      startCursorRegistrationBtn.disabled = false;
      startCursorRegistrationBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Start Registration</span>';
      if (cursorStatusMessage) {
        cursorStatusMessage.textContent = '❌ Error: ' + error.message;
        cursorStatusMessage.className = 'status-message error';
      }
    }
  });
}
*/

// ========================
// Theme & Language Management
// ========================

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeDropdown = document.getElementById('themeDropdown');
const themeOptions = document.querySelectorAll('.theme-option');
const langToggle = document.getElementById('langToggle');
const langIcon = document.getElementById('langIcon');

let currentTheme = 'dark';
let currentLang = 'en';
let translations = {};

// Маппинг тем на иконки
const themeIcons = {
  'dark': '🌙',
  'light': '☀️',
  'galaxy': '🌌',
  'sky': '☁️',
  'underground': '⛏️'
};

/**
 * Загружает файл переводов
 */
async function loadTranslations() {
  try {
    const response = await fetch(chrome.runtime.getURL('translations.json'));
    translations = await response.json();
    console.log('[SAF] Translations loaded successfully');
  } catch (error) {
    console.error('[SAF] Failed to load translations:', error);
  }
}

/**
 * Получает перевод по ключу
 */
function t(key) {
  // Если переводы еще не загружены, возвращаем заглушки
  if (!translations || Object.keys(translations).length === 0) {
    const fallbacks = {
      'ipBlocker.loading': 'Loading...',
      'ipBlocker.error': 'Error',
      'ipBlocker.noBlockedIPs': 'No blocked IPs',
      'ipBlocker.statusActive': 'Active',
      'ipBlocker.statusBlocked': 'Blocked',
      'ipBlocker.failedToFetch': 'Failed to fetch IP address',
      'themes.dark': 'Dark',
      'themes.light': 'Light',
      'themes.galaxy': 'Galaxy',
      'themes.sky': 'Sky',
      'themes.underground': 'Underground',
      'cursor.status': 'In Development'
    };
    return fallbacks[key] || key;
  }
  
  const keys = key.split('.');
  let value = translations[currentLang];
  
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      console.warn(`[SAF] Translation not found: ${key}`);
      return key;
    }
  }
  
  return value;
}

/**
 * Загружает сохраненные настройки темы и языка
 */
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['theme', 'language'], (result) => {
      // Загружаем тему
      if (result.theme) {
        currentTheme = result.theme;
      }
      applyTheme(currentTheme);
      
      // Загружаем язык (по умолчанию 'en')
      if (result.language) {
        currentLang = result.language;
      } else {
        // Если язык не сохранен, устанавливаем английский по умолчанию
        currentLang = 'en';
        chrome.storage.local.set({ language: 'en' });
      }
      applyLanguage(currentLang);
      
      resolve();
    });
  });
}

/**
 * Применяет тему
 */
function applyTheme(theme) {
  currentTheme = theme;
  
  // Удаляем все классы тем
  document.body.classList.remove('light-theme', 'galaxy-theme', 'sky-theme', 'underground-theme');
  
  // Добавляем класс выбранной темы (если не dark)
  if (theme !== 'dark') {
    document.body.classList.add(`${theme}-theme`);
  }
  
  // Обновляем иконку
  themeIcon.textContent = themeIcons[theme] || '🌙';
  
  // Обновляем активную опцию в меню
  themeOptions.forEach(option => {
    if (option.dataset.theme === theme) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
  
  // Сохраняем настройку
  chrome.storage.local.set({ theme: theme });
}

/**
 * Обновляет все тексты интерфейса
 */
function updateUILanguage() {
  // Главные вкладки
  const tabGeneral = document.querySelector('[data-tab="general"]');
  const tabIPBlocker = document.querySelector('[data-tab="ipblocker"]');
  const tabSettings = document.querySelector('[data-tab="settings"]');
  
  if (tabGeneral) tabGeneral.querySelector('span:last-child').textContent = t('tabs.general');
  if (tabIPBlocker) tabIPBlocker.querySelector('span:last-child').textContent = t('tabs.ipBlocker');
  if (tabSettings) tabSettings.querySelector('span:last-child').textContent = t('tabs.settings');
  
  // Подвкладки General
  const subTabStripe = document.querySelector('[data-subtab="stripe"]');
  const subTabCursor = document.querySelector('[data-subtab="cursor"]');
  
  if (subTabStripe) subTabStripe.querySelector('span').textContent = '💳 ' + t('subTabs.stripe');
  if (subTabCursor) subTabCursor.querySelector('span').textContent = '🤖 ' + t('subTabs.cursor');
  
  // Подвкладки Settings
  const subTabStripeSettings = document.querySelector('[data-subtab="stripe-settings"]');
  const subTabCursorSettings = document.querySelector('[data-subtab="cursor-settings"]');
  
  if (subTabStripeSettings) subTabStripeSettings.querySelector('span').textContent = '💳 ' + t('subTabs.stripe');
  if (subTabCursorSettings) subTabCursorSettings.querySelector('span').textContent = '🤖 ' + t('subTabs.cursor');
  
  // IP Blocker
  updateIPBlockerLanguage();
  
  // Settings
  updateSettingsLanguage();
  
  // Cursor status
  updateCursorLanguage();
  
  // Tooltips
  updateTooltips();
  
  // Theme names
  updateThemeNames();
}

/**
 * Обновляет тексты IP Blocker
 */
function updateIPBlockerLanguage() {
  // Заголовок первой секции
  const sectionHeaders = document.querySelectorAll('#ipblocker-tab .section-header h3');
  if (sectionHeaders[0]) sectionHeaders[0].textContent = t('ipBlocker.title');
  if (sectionHeaders[1]) sectionHeaders[1].textContent = t('ipBlocker.blockedIPs');
  
  // Метки полей
  const ipLabels = document.querySelectorAll('#ipblocker-tab .ip-label');
  if (ipLabels[0]) ipLabels[0].textContent = t('ipBlocker.currentIP');
  if (ipLabels[1]) ipLabels[1].textContent = t('ipBlocker.status');
  
  // Кнопка Refresh
  const refreshBtn = document.getElementById('refreshIPBtn');
  if (refreshBtn) {
    const refreshText = refreshBtn.querySelector('span:last-child');
    if (refreshText) refreshText.textContent = t('ipBlocker.refresh');
  }
  
  // Обновляем статус текущего IP
  if (currentIPAddress) {
    checkIPStatus();
  } else {
    // Если IP еще не загружен
    const ipStatus = document.getElementById('ipStatus');
    if (ipStatus && ipStatus.textContent === 'Not tracked') {
      ipStatus.textContent = t('ipBlocker.statusNotTracked');
    }
  }
  
  // Перезагружаем список заблокированных IP для обновления текстов
  loadBlockedIPs();
}

/**
 * Обновляет тексты Cursor
 */
function updateCursorLanguage() {
  const cursorStatus = document.getElementById('cursorStatus');
  if (cursorStatus) cursorStatus.textContent = t('cursor.status');
  
  const cursorSettingsStatus = document.getElementById('cursorSettingsStatus');
  if (cursorSettingsStatus) cursorSettingsStatus.textContent = t('cursor.status');
}

/**
 * Обновляет тексты Settings
 */
function updateSettingsLanguage() {
  // Заголовки секций
  const sectionHeaders = document.querySelectorAll('#stripe-settings-subtab .section-header h3');
  if (sectionHeaders[0]) sectionHeaders[0].textContent = t('settings.addresses');
  if (sectionHeaders[1]) sectionHeaders[1].textContent = t('settings.names');
  
  // Placeholder'ы
  const nameInput = document.getElementById('nameInput');
  const address1Input = document.getElementById('address1Input');
  const address2Input = document.getElementById('address2Input');
  const cityInput = document.getElementById('cityInput');
  const stateInput = document.getElementById('stateInput');
  const zipInput = document.getElementById('zipInput');
  
  if (nameInput) nameInput.placeholder = t('settings.fullName');
  if (address1Input) address1Input.placeholder = t('settings.addressLine1');
  if (address2Input) address2Input.placeholder = t('settings.addressLine2');
  if (cityInput) cityInput.placeholder = t('settings.city');
  if (stateInput) stateInput.placeholder = t('settings.state');
  if (zipInput) zipInput.placeholder = t('settings.zipCode');
  
  // Кнопка Add
  const addAddressBtn = document.getElementById('addAddressBtn');
  if (addAddressBtn) addAddressBtn.querySelector('span:last-child').textContent = t('settings.add');
  
  // Names секция
  const namesTitle = document.querySelectorAll('#stripe-settings-subtab .section-header h3')[1];
  if (namesTitle) namesTitle.textContent = t('settings.names');
  
  const firstNameInput = document.getElementById('firstNameInput');
  const lastNameInput = document.getElementById('lastNameInput');
  
  if (firstNameInput) firstNameInput.placeholder = t('settings.firstName');
  if (lastNameInput) lastNameInput.placeholder = t('settings.lastName');
  
  const addNameBtn = document.getElementById('addNameBtn');
  if (addNameBtn) addNameBtn.querySelector('span:last-child').textContent = t('settings.add');
}

/**
 * Обновляет tooltips
 */
function updateTooltips() {
  if (themeToggle) themeToggle.title = t('tooltips.toggleTheme');
  if (langToggle) {
    langToggle.title = currentLang === 'en' ? t('tooltips.switchToRussian') : t('tooltips.switchToEnglish');
  }
}

/**
 * Обновляет названия тем в меню
 */
function updateThemeNames() {
  themeOptions.forEach(option => {
    const theme = option.dataset.theme;
    const nameSpan = option.querySelector('.theme-name');
    if (nameSpan) {
      nameSpan.textContent = t(`themes.${theme}`);
    }
  });
}

/**
 * Применяет язык
 */
function applyLanguage(lang) {
  currentLang = lang;
  
  // Обновляем иконку флага
  if (langIcon) {
    langIcon.textContent = lang === 'en' ? '🇺🇸' : '🇷🇺';
    langToggle.title = lang === 'en' ? t('tooltips.switchToRussian') : t('tooltips.switchToEnglish');
  }
  
  // Обновляем все тексты интерфейса
  if (Object.keys(translations).length > 0) {
    updateUILanguage();
  }
  
  // Сохраняем настройку
  chrome.storage.local.set({ language: lang });
  
  console.log('[SAF] Language changed to:', lang);
}

/**
 * Показывает/скрывает меню выбора темы
 */
function toggleThemeDropdown() {
  themeDropdown.classList.toggle('show');
}

/**
 * Закрывает меню выбора темы
 */
function closeThemeDropdown() {
  themeDropdown.classList.remove('show');
}

/**
 * Выбирает тему
 */
function selectTheme(theme) {
  applyTheme(theme);
  closeThemeDropdown();
  
  // Используем переводы для названия темы
  const themeName = t(`themes.${theme}`);
  const message = currentLang === 'en' ? `Theme: ${themeName}` : `Тема: ${themeName}`;
  showToast(message);
}

/**
 * Переключает язык с анимацией
 */
async function toggleLanguage() {
  // Добавляем класс для анимации
  document.body.classList.add('lang-switching');
  
  // Ждем завершения анимации затухания
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Переключаем язык
  const newLang = currentLang === 'en' ? 'ru' : 'en';
  applyLanguage(newLang);
  
  // Убираем класс для возврата прозрачности
  setTimeout(() => {
    document.body.classList.remove('lang-switching');
  }, 50);
  
  // Показываем уведомление
  const message = newLang === 'en' ? t('toast.languageEnglish') : t('toast.languageRussian');
  showToast(message);
}

// Event Listeners для темы и языка
if (themeToggle) {
  themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleThemeDropdown();
  });
}

// Обработчики для опций тем
themeOptions.forEach(option => {
  option.addEventListener('click', (e) => {
    e.stopPropagation();
    const theme = option.dataset.theme;
    selectTheme(theme);
  });
});

// Закрытие dropdown при клике вне его
document.addEventListener('click', (e) => {
  if (!e.target.closest('.theme-selector')) {
    closeThemeDropdown();
  }
});

if (langToggle) {
  langToggle.addEventListener('click', toggleLanguage);
}

// Загружаем переводы и настройки при открытии popup
(async function init() {
  await loadTranslations();
  await loadSettings();
  // Теперь переводы загружены, можно загружать данные
  loadData();
})();
