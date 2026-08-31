// Typing effect for hero name
(function typeName(){
  const el = document.getElementById('typedName');
  const text = 'tridev guha';
  let i = 0;
  function tick(){
    if(i <= text.length){
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(tick, 90);
    }
  }
  tick();
})();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// Decode obfuscated GitHub / LinkedIn hrefs so the URL never appears in the
// rendered HTML source as plain text. Set as real attributes (rather than
// intercepting the click with window.open) so the browser handles the
// navigation natively instead of it being treated as a popup.
document.querySelectorAll('.icon-link[data-href]').forEach(link => {
  link.href = atob(link.dataset.href);
  link.target = '_blank';
  link.rel = 'noopener';
});

// Assemble mailto from split, base64-encoded parts and set it as a real
// href (not decoded until runtime, so it never appears in page source).
const emailLink = document.getElementById('emailLink');
if (emailLink) {
  const user = atob(emailLink.dataset.user);
  const domain = atob(emailLink.dataset.domain);
  emailLink.href = `mailto:${user}@${domain}`;
}

// Scroll-triggered reveal animations
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Scrollspy: highlight the current section's nav link
const sections = document.querySelectorAll('main section[id], footer[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
    if (!link) return;
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

sections.forEach(sec => spyObserver.observe(sec));

// Scroll-to-top button
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
});
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Boot-gate splash screen
(function boot(){
  const overlay = document.getElementById('bootOverlay');
  const runBtn = document.getElementById('bootRun');
  const skipBtn = document.getElementById('bootSkip');
  const log = document.getElementById('bootLog');

  if (sessionStorage.getItem('booted') === '1') {
    overlay.classList.add('hidden');
    return;
  }
  document.body.classList.add('boot-active');

  const lines = [
    { text: '[+] pulling tridevguha/portfolio:latest', ok: false },
    { text: '  ✓ layer 4f21a — pull complete', ok: false },
    { text: '  ✓ layer 8b09c — pull complete', ok: false },
    { text: '[+] network portfolio_default — created', ok: false },
    { text: '[+] container portfolio — started', ok: true },
    { text: '→ app listening on :8000', ok: false },
    { text: '[+] nginx reverse proxy — configured', ok: false },
    { text: '→ nginx :443 → app:8000', ok: false },
    { text: '✓ ready', ok: true },
  ];

  function dismiss(){
    sessionStorage.setItem('booted', '1');
    overlay.classList.add('hidden');
    document.body.classList.remove('boot-active');
    setTimeout(() => overlay.remove(), 600);
  }

  function run(){
    runBtn.disabled = true;
    let i = 0;
    function next(){
      if (i >= lines.length) { setTimeout(dismiss, 500); return; }
      const p = document.createElement('p');
      p.textContent = lines[i].text;
      if (lines[i].ok) p.classList.add('ok');
      log.appendChild(p);
      i++;
      setTimeout(next, 220);
    }
    next();
  }

  runBtn.addEventListener('click', run);
  skipBtn.addEventListener('click', dismiss);
})();
