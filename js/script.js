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
// rendered HTML source as plain text.
document.querySelectorAll('.icon-link[data-href]').forEach(link => {
  const url = atob(link.dataset.href);
  link.addEventListener('click', (e) => {
    e.preventDefault();
    window.open(url, '_blank', 'noopener');
  });
});

// Assemble mailto from split, base64-encoded parts.
const emailLink = document.getElementById('emailLink');
if (emailLink) {
  const user = atob(emailLink.dataset.user);
  const domain = atob(emailLink.dataset.domain);
  emailLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = `mailto:${user}@${domain}`;
  });
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
