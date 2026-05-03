const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

function applyTheme(mode) {
  root.dataset.theme = mode;
  localStorage.setItem('site-theme', mode);
  const icon = themeToggle?.querySelector('i');
  if (icon) {
    icon.className = mode === 'light' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

const savedTheme = localStorage.getItem('site-theme');
applyTheme(savedTheme === 'light' ? 'light' : 'dark');

themeToggle?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
  applyTheme(nextTheme);
});

// ── Active nav link indicator ────────────────────────────────
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const isActive = 
      (currentPath === '/' && href === '/') ||
      (currentPath.startsWith('/projects') && href === '/projects/') ||
      (currentPath.startsWith('/resume') && href === '/resume/');
    
    if (isActive) {
      link.style.opacity = '1';
      link.style.borderBottom = '2px solid var(--accent)';
    }
  });
}
setActiveNavLink();

// ── Scroll hint visibility ───────────────────────────────────
const scrollHint = document.querySelector('.scroll-hint');
if (scrollHint) {
  let scrolled = false;
  window.addEventListener('scroll', () => {
    if (!scrolled && window.scrollY > 50) {
      scrollHint.style.opacity = '0';
      scrollHint.style.pointerEvents = 'none';
      scrolled = true;
    } else if (scrolled && window.scrollY < 50) {
      scrollHint.style.opacity = '';
      scrollHint.style.pointerEvents = '';
      scrolled = false;
    }
  });
}

// ── Scroll-reveal ────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.classList.add('visible');
      revealObserver.unobserve(el.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Cursor glow (works in both light and dark mode) ──────────
const glow = document.createElement('div');
glow.className = 'cursor-glow';
document.body.appendChild(glow);

let glowVisible = false;
document.addEventListener('mousemove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
  if (!glowVisible) {
    glow.style.opacity = '1';
    glowVisible = true;
  }
});

document.addEventListener('mouseleave', () => {
  glow.style.opacity = '0';
  glowVisible = false;
});

// ── Card 3-D tilt ────────────────────────────────────────────
const TILT_MAX = 8;

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `perspective(700px) rotateY(${dx * TILT_MAX}deg) rotateX(${-dy * TILT_MAX}deg) translateZ(6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
