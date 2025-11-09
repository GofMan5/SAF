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

// Luhn validation checkbox
const useLuhnValidation = document.getElementById('useLuhnValidation');

const DEFAULT_BIN = '552461xxxxxxxxxx';

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


// Initialize
loadData();

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

// Sub-tab switching (for Settings)
const subTabs = document.querySelectorAll('.sub-tab-btn');
const subTabContents = document.querySelectorAll('.sub-tab-content');

subTabs.forEach(subTab => {
  subTab.addEventListener('click', () => {
    const subtabName = subTab.dataset.subtab;
    
    subTabs.forEach(st => st.classList.remove('active'));
    subTabContents.forEach(stc => stc.classList.remove('active'));
    
    subTab.classList.add('active');
    document.getElementById(`${subtabName}-subtab`).classList.add('active');
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
}
