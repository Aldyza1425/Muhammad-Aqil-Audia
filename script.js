// Portfolio Interactivity (Dark Mode, Edit Mode & Translator)

document.addEventListener('DOMContentLoaded', () => {
  // 1. Load saved content from localStorage first before initializing scripts
  loadSavedContent();
  
  // 2. Initialize modules
  initTheme();
  initLanguage();
  initEditMode();
});

// ================= CONTENT LOADER (LOCALSTORAGE) =================
function loadSavedContent() {
  const savedSidebar = localStorage.getItem('cv_sidebar');
  const savedMain = localStorage.getItem('cv_main');

  // Add minimum length validation to prevent empty/corrupt cache states
  if (savedSidebar && savedSidebar.trim().length > 100) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.innerHTML = savedSidebar;
  }

  if (savedMain && savedMain.trim().length > 100) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.innerHTML = savedMain;
  }
}

// ================= THEME CONTROLLER =================
function initTheme() {
  const themeBtn = document.getElementById('theme-btn');
  if (!themeBtn) return;

  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let currentTheme = 'light';
  if (savedTheme) {
    currentTheme = savedTheme;
  } else if (systemPrefersDark) {
    currentTheme = 'dark';
  }

  document.documentElement.setAttribute('data-theme', currentTheme);

  themeBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    themeBtn.style.transform = 'scale(0.9) rotate(180deg)';
    setTimeout(() => {
      themeBtn.style.transform = '';
    }, 300);
  });
}

// ================= LANGUAGE CONTROLLER =================
function initLanguage() {
  const langBtn = document.getElementById('lang-btn');
  const downloadBtn = document.getElementById('download-btn');
  if (!langBtn) return;

  // Check URL parameters first (e.g. ?lang=id)
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');

  // Retrieve saved language, default to English
  const savedLang = urlLang || localStorage.getItem('cv_lang') || 'en';
  document.documentElement.setAttribute('data-lang', savedLang);
  langBtn.textContent = savedLang.toUpperCase();
  
  if (downloadBtn) {
    downloadBtn.setAttribute('href', savedLang === 'en' ? 'cv_en.pdf' : 'cv_id.pdf');
  }

  langBtn.addEventListener('click', () => {
    const currentLang = document.documentElement.getAttribute('data-lang');
    const newLang = currentLang === 'en' ? 'id' : 'en';

    document.documentElement.setAttribute('data-lang', newLang);
    langBtn.textContent = newLang.toUpperCase();
    localStorage.setItem('cv_lang', newLang);

    // Sync download PDF file target
    if (downloadBtn) {
      downloadBtn.setAttribute('href', newLang === 'en' ? 'cv_en.pdf' : 'cv_id.pdf');
    }

    // No JS reveal logic needed as animation is handled by pure CSS

    const toastMsg = newLang === 'en' ? 'Switched to English!' : 'Dialihkan ke Bahasa Indonesia!';
    showToast(toastMsg);
  });
}

// Scroll reveal handled natively by CSS keyframes

// ================= EDIT MODE & PERSISTENCE =================
function initEditMode() {
  const editBtn = document.getElementById('edit-btn');
  const resetBtn = document.getElementById('reset-btn');
  const editIcon = editBtn ? editBtn.querySelector('.edit-icon') : null;
  const saveIcon = editBtn ? editBtn.querySelector('.save-icon') : null;

  if (!editBtn || !resetBtn) return;

  // Show reset button if saved content exists in localStorage
  if (localStorage.getItem('cv_sidebar') || localStorage.getItem('cv_main')) {
    resetBtn.classList.remove('hidden');
  }

  // Toggle Edit Mode
  editBtn.addEventListener('click', () => {
    const isEditActive = document.body.classList.toggle('edit-mode-active');
    const editableElements = document.querySelectorAll('.editable');

    if (isEditActive) {
      // Turn EDIT MODE ON
      editableElements.forEach(el => {
        el.setAttribute('contenteditable', 'true');
      });
      
      // Update Button Icons
      if (editIcon) editIcon.classList.add('hidden');
      if (saveIcon) saveIcon.classList.remove('hidden');
      
      // Show reset option during edit session
      resetBtn.classList.remove('hidden');
    } else {
      // Turn EDIT MODE OFF (SAVE CHANGES)
      editableElements.forEach(el => {
        el.setAttribute('contenteditable', 'false');
        
        // Synchronize hyperlinked contents (Email, Phone, LinkedIn) back to active hrefs
        if (el.hasAttribute('data-link-type')) {
          const type = el.getAttribute('data-link-type');
          const value = el.textContent.trim();
          
          if (type === 'email') {
            el.setAttribute('href', `mailto:${value}`);
          } else if (type === 'tel') {
            const cleanPhone = value.replace(/\s+/g, '').replace(/[()]/g, '');
            el.setAttribute('href', `tel:${cleanPhone}`);
          } else if (type === 'linkedin') {
            const cleanLink = value.startsWith('http') ? value : `https://${value}`;
            el.setAttribute('href', cleanLink);
          }
        }
      });

      // Update Button Icons
      if (editIcon) editIcon.classList.remove('hidden');
      if (saveIcon) saveIcon.classList.add('hidden');

      // Save innerHTML to localStorage (this keeps the custom edits cached)
      const sidebar = document.querySelector('.sidebar');
      const mainContent = document.querySelector('.main-content');
      
      if (sidebar && mainContent) {
        localStorage.setItem('cv_sidebar', sidebar.innerHTML);
        localStorage.setItem('cv_main', mainContent.innerHTML);
      }

      // Show Toast Notification
      const currentLang = document.documentElement.getAttribute('data-lang');
      const toastText = currentLang === 'en' 
        ? 'Changes saved! Press Ctrl + P to export as PDF.' 
        : 'Perubahan disimpan! Tekan Ctrl + P untuk ekspor ke PDF.';
      showToast(toastText);
    }
  });

  // Reset CV to Default Template
  resetBtn.addEventListener('click', () => {
    const currentLang = document.documentElement.getAttribute('data-lang');
    const confirmMsg = currentLang === 'en'
      ? 'Revert all your edits back to the default template?'
      : 'Kembalikan seluruh hasil edit Anda ke templat awal?';
      
    if (confirm(confirmMsg)) {
      localStorage.removeItem('cv_sidebar');
      localStorage.removeItem('cv_main');
      window.location.reload();
    }
  });
}

// Helper: Toast Indicator
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
