// Portfolio Interactivity (Dark Mode, Scroll Reveal & Edit Mode)

document.addEventListener('DOMContentLoaded', () => {
  // 1. Load saved content from localStorage first before initializing scripts
  loadSavedContent();
  
  // 2. Initialize modules
  initTheme();
  initScrollReveal();
  initEditMode();
});

// ================= CONTENT LOADER (LOCALSTORAGE) =================
function loadSavedContent() {
  const savedSidebar = localStorage.getItem('cv_sidebar');
  const savedMain = localStorage.getItem('cv_main');

  if (savedSidebar) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.innerHTML = savedSidebar;
  }

  if (savedMain) {
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

// ================= SCROLL REVEAL CONTROLLER =================
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (revealElements.length === 0 || prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('active'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

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
      showToast('Changes saved! Press Ctrl + P to export as PDF.');
    }
  });

  // Reset CV to Default Template
  resetBtn.addEventListener('click', () => {
    if (confirm('Revert all your edits back to the default template?')) {
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
