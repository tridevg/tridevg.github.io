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

// Toast helper
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(message){
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 2200);
}

// Assemble mailto from split, base64-encoded parts and set it as a real
// href (not decoded until runtime, so it never appears in page source).
// Clicking copies the address to the clipboard instead of launching a mail
// client, which is what most visitors actually want.
const emailLink = document.getElementById('emailLink');
let emailAddress = '';
if (emailLink) {
  const user = atob(emailLink.dataset.user);
  const domain = atob(emailLink.dataset.domain);
  emailAddress = `${user}@${domain}`;
  emailLink.href = `mailto:${emailAddress}`;
  emailLink.title = 'Click to copy email';
  emailLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(emailAddress)
      .then(() => showToast(`Copied ${emailAddress} to clipboard`))
      .catch(() => { window.location.href = emailLink.href; });
  });
}

// vCard download — built at click-time from the same decoded contact
// details used elsewhere, so nothing sensitive sits in the page source.
const vcardBtn = document.getElementById('vcardBtn');
if (vcardBtn) {
  vcardBtn.addEventListener('click', () => {
    const githubUrl = atob(document.querySelector('.icon-link[aria-label="GitHub"]').dataset.href);
    const linkedinUrl = atob(document.querySelector('.icon-link[aria-label="LinkedIn"]').dataset.href);
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Tridev Guha',
      'N:Guha;Tridev;;;',
      'ORG:Pace Wisdom Solutions',
      'TITLE:DevOps Engineer',
      `EMAIL;TYPE=INTERNET:${emailAddress}`,
      `URL:${githubUrl}`,
      `URL:${linkedinUrl}`,
      'END:VCARD',
    ].join('\r\n');
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tridev-guha.vcf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Contact card downloaded');
  });
}

// Status widget — cosmetic "last checked" timestamp
const statusUpdated = document.getElementById('statusUpdated');
if (statusUpdated) {
  statusUpdated.textContent = `checked ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

// Architecture diagram — click a node to see what that step does
(function archDiagram(){
  const nodes = document.querySelectorAll('.arch-node');
  const detail = document.getElementById('archDetail');
  if (!nodes.length || !detail) return;

  const descriptions = {
    push: 'A commit lands on the `dev` branch and gets pushed to GitHub.',
    build: 'GitHub Pages picks up the push and builds the static site — no server, no containers to manage for the site itself.',
    cdn: 'The built site is served from Fastly’s edge CDN, so it loads fast from wherever you are.',
    you: 'Your browser renders it — HTML, CSS, and a bit of vanilla JS, no framework.',
  };

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      const key = node.dataset.node;
      detail.innerHTML = `<p><span class="prompt">$</span> ${descriptions[key]}</p>`;
    });
  });
})();

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

// Interactive terminal easter egg
(function terminal(){
  const fab = document.getElementById('termFab');
  const heroOpenBtn = document.getElementById('termOpen');
  const overlay = document.getElementById('termOverlay');
  const closeBtn = document.getElementById('termClose');
  const output = document.getElementById('termOutput');
  const input = document.getElementById('termInput');

  function print(text, cls){
    const p = document.createElement('p');
    p.textContent = text;
    if (cls) p.classList.add(cls);
    output.appendChild(p);
    output.scrollTop = output.scrollHeight;
  }

  const commands = {
    help(){
      print('available commands:');
      print('  whoami       — who is this');
      print('  skills       — core skill categories');
      print('  experience   — career summary');
      print('  certs        — certifications');
      print('  contact      — how to reach me');
      print('  resume       — download resume.pdf');
      print('  sudo hire-me — try it');
      print('  clear        — clear the screen');
      print('  exit         — close this terminal');
    },
    whoami(){
      print('tridev guha — devops engineer @ pacewisdom solutions');
      print('cloud · ci/cd · devsecops · observability · genai workflows');
    },
    skills(){
      print('~/cloud, ~/containers-cicd, ~/iac-devsecops, ~/observability-ai');
      print('see the Skills section for the full breakdown.');
    },
    experience(){
      print('devops engineer @ pace wisdom solutions — dec 2025 – present');
      print('senior security engineer @ qualys — mar 2018 – sept 2025');
      print('7+ years total across cloud ops, ci/cd, and security.');
    },
    certs(){
      print('aws certified — generative ai foundations');
      print('claude certified architect — foundation');
    },
    contact(){
      print(`email:    ${emailAddress}`);
      print('github:   linked in the Contact section');
      print('linkedin: linked in the Contact section');
    },
    resume(){
      print('downloading resume.pdf...', 'term-echo');
      const a = document.createElement('a');
      a.href = 'assets/tridev-guha-resume.pdf';
      a.download = 'Tridev-Guha-Resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    clear(){
      output.innerHTML = '';
    },
    exit(){
      close();
    },
    close(){
      close();
    },
  };
  commands['sudo hire-me'] = function(){
    print('permission granted.', 'term-echo');
    print('scrolling to contact...', 'term-echo');
    setTimeout(() => {
      close();
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    }, 700);
  };

  function open(){
    overlay.classList.remove('hidden');
    setTimeout(() => input.focus(), 50);
  }
  function close(){
    overlay.classList.add('hidden');
  }

  fab.addEventListener('click', open);
  if (heroOpenBtn) heroOpenBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) close();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const raw = input.value.trim();
    input.value = '';
    if (!raw) return;
    print(`$ ${raw}`, 'term-echo');
    const handler = commands[raw.toLowerCase()];
    if (handler) {
      handler();
    } else {
      print(`command not found: ${raw} — try 'help'`, 'term-err');
    }
  });
})();
