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
