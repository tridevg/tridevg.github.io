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

// Architecture diagram — auto-plays through each step, or click a node to
// jump straight to it (which pauses the auto-play).
(function archDiagram(){
  const section = document.getElementById('architecture');
  const nodes = Array.from(document.querySelectorAll('.arch-node'));
  const detail = document.getElementById('archDetail');
  if (!nodes.length || !detail || !section) return;

  const descriptions = {
    push: 'A commit lands on the `dev` branch and gets pushed to GitHub.',
    build: 'GitHub Pages picks up the push and builds the static site — no server, no containers to manage for the site itself.',
    cdn: 'The built site is served from Fastly’s edge CDN, so it loads fast from wherever you are.',
    you: 'Your browser renders it — HTML, CSS, and a bit of vanilla JS, no framework.',
  };

  let index = 0;
  let timer = null;
  const STEP_MS = 2600;

  function showStep(i){
    index = i;
    const node = nodes[i];
    nodes.forEach(n => n.classList.remove('active'));
    node.classList.add('active');
    detail.innerHTML = `<p><span class="prompt">$</span> ${descriptions[node.dataset.node]}</p>`;
  }

  function startAutoplay(){
    if (timer) return;
    timer = setInterval(() => {
      showStep((index + 1) % nodes.length);
    }, STEP_MS);
  }

  function stopAutoplay(){
    clearInterval(timer);
    timer = null;
  }

  nodes.forEach((node, i) => {
    node.addEventListener('click', () => {
      stopAutoplay();
      showStep(i);
    });
  });

  // Start the auto-play once the diagram actually scrolls into view.
  const playObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        showStep(0);
        startAutoplay();
        playObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  playObserver.observe(section);
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

// Rule-based Q&A chatbot. No LLM, no API key, no backend — a static site
// can't safely call an AI API from client-side JS without exposing the
// key. This scores user input against keyword-based intents instead, with
// varied phrasing so repeat questions don't feel robotic.
(function chatbot(){
  const fab = document.getElementById('chatFab');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const messages = document.getElementById('chatMessages');
  const quickReplies = document.getElementById('chatQuickReplies');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  if (!fab || !panel) return;

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const intents = [
    {
      id: 'greeting',
      keywords: ['hi', 'hello', 'hey', 'yo', 'sup', 'good morning', 'good evening'],
      responses: [
        "Hey! I'm a scripted assistant for Tridev's portfolio — ask me about his experience, skills, certs, or how to reach him.",
        "Hi there! Ask me anything about Tridev's DevOps background — experience, skills, certifications, contact info, all fair game.",
      ],
    },
    {
      id: 'about',
      keywords: ['who are you', 'about you', 'tell me about', 'introduce', 'who is tridev', 'what do you do'],
      responses: [
        'Tridev Guha is a DevOps Engineer with 7+ years across cloud operations, CI/CD automation, and production support — currently at Pace Wisdom Solutions.',
        "He's a DevOps engineer focused on cloud infra, automation, and DevSecOps, with a background in security engineering too.",
      ],
    },
    {
      id: 'experience',
      keywords: ['experience', 'work history', 'career', 'background', 'years of experience', 'how long', 'how many years'],
      responses: [
        '7+ years total: DevOps Engineer at Pace Wisdom Solutions (Dec 2025–present), and before that Senior Security Engineer at Qualys (Mar 2018–Sept 2025). Full details in the Experience section.',
      ],
    },
    {
      id: 'current_role',
      keywords: ['current role', 'current job', 'where do you work', 'pace wisdom', 'working now', 'current company', 'what are you doing now'],
      responses: [
        "Currently a DevOps Engineer at Pace Wisdom Solutions — owns delivery across cloud infra, CI/CD pipelines, containerized workloads, and observability tooling.",
      ],
    },
    {
      id: 'previous_role',
      keywords: ['qualys', 'previous job', 'past experience', 'security engineer', 'before this'],
      responses: [
        'Before this, 7+ years at Qualys as a Senior Security Engineer — CI/CD for vulnerability management releases, infra automation, and incident response.',
      ],
    },
    {
      id: 'skills',
      keywords: ['skills', 'tech stack', 'technologies', 'what do you know', 'expertise', 'skill set', 'stack'],
      responses: [
        'Cloud (AWS), containers & CI/CD (Docker, Kubernetes, GitLab CI/CD, GitHub Actions), IaC & DevSecOps (Terraform, Ansible, SonarQube, Trivy), and observability & AI (Grafana, Bedrock, Claude). See the Skills section for the full breakdown.',
      ],
    },
    {
      id: 'cloud',
      keywords: ['aws', 'cloud', 'ec2', 's3', 'vpc', 'route 53', 'lambda'],
      responses: [
        'Hands-on with AWS — EC2, VPC, S3, CloudWatch, CloudFront, Route 53, Lambda, EventBridge, SES, SNS, IAM.',
      ],
    },
    {
      id: 'containers',
      keywords: ['docker', 'kubernetes', 'k8s', 'container'],
      responses: [
        'Docker and Kubernetes for containerized workloads, with a focus on rollout stability and environment consistency.',
      ],
    },
    {
      id: 'cicd',
      keywords: ['ci/cd', 'cicd', 'pipeline', 'jenkins', 'github actions', 'gitlab'],
      responses: [
        'GitLab CI/CD, GitHub Actions, and Jenkins — pipeline design, hardening, and release automation.',
      ],
    },
    {
      id: 'iac',
      keywords: ['terraform', 'ansible', 'infrastructure as code', 'iac'],
      responses: [
        'Terraform and Ansible for infrastructure provisioning and configuration management.',
      ],
    },
    {
      id: 'security',
      keywords: ['security', 'devsecops', 'sonarqube', 'trivy', 'vulnerab', 'firewall', 'ids/ips'],
      responses: [
        'DevSecOps: SonarQube, Trivy, container/secrets scanning, and pipeline hardening — plus a background in security engineering (firewalls, IDS/IPS, vulnerability management at Qualys).',
      ],
    },
    {
      id: 'ai',
      keywords: ['genai', 'claude', 'bedrock', 'prompt engineering', 'generative ai', 'llm'],
      responses: [
        'AWS GenAI Foundations, Amazon Bedrock, and Claude — prompt engineering and AI workflow automation applied to DevOps delivery.',
      ],
    },
    {
      id: 'certifications',
      keywords: ['certification', 'certified', 'certificate', 'badge', 'certs'],
      responses: [
        'Two: AWS Certified — Generative AI Foundations, and Claude Certified Architect — Foundation. See the badges in the Skills & Certifications section.',
      ],
    },
    {
      id: 'education',
      keywords: ['education', 'degree', 'college', 'university', 'study', 'studied', 'academic'],
      responses: [
        "BTech in Computer Science & Engineering (Techno India University), plus a Post Graduate Diploma in IT Infrastructure Systems from CDAC Pune.",
      ],
    },
    {
      id: 'location',
      keywords: ['location', 'based', 'where are you', 'live', 'city', 'country'],
      responses: [
        'Based in Mangalore, India.',
      ],
    },
    {
      id: 'languages',
      keywords: ['language', 'speak', 'fluent'],
      responses: [
        'English (fluent), Hindi, and Bengali.',
      ],
    },
    {
      id: 'projects',
      keywords: ['project', 'portfolio project', 'built anything', 'side project'],
      responses: [
        "The Projects section is empty for now — coming soon. This chatbot and the rest of this site are themselves a decent demo of what he builds, though!",
      ],
    },
    {
      id: 'contact',
      keywords: ['contact', 'email', 'reach', 'get in touch', 'hire', 'linkedin', 'github profile', 'talk to'],
      responses: [
        "Best way is the Contact section — email, GitHub, and LinkedIn icons are all there, plus a downloadable contact card.",
      ],
      action: 'contact',
    },
    {
      id: 'resume',
      keywords: ['resume', 'cv', 'download resume'],
      responses: [
        "You can grab the resume PDF directly — I'll start the download for you.",
      ],
      action: 'resume',
    },
    {
      id: 'availability',
      keywords: ['available', 'open to work', 'hiring', 'freelance', 'looking for a job', 'looking for job'],
      responses: [
        "For opportunities or collaboration, the best move is reaching out directly via the Contact section — email or LinkedIn.",
      ],
    },
    {
      id: 'is_bot',
      keywords: ['are you real', 'are you ai', 'are you a bot', 'real person', 'chatgpt', 'gpt', 'are you human', 'is this ai'],
      responses: [
        "I'm a simple rule-based assistant — keyword matching, no LLM behind me. Honest answer, no smoke and mirrors. But I do know a lot about Tridev!",
      ],
    },
    {
      id: 'thanks',
      keywords: ['thanks', 'thank you', 'appreciate', 'cheers'],
      responses: ['Anytime! Ask away if you\'ve got more questions.', "You're welcome — happy to help."],
    },
    {
      id: 'bye',
      keywords: ['bye', 'goodbye', 'see you', 'later', 'gtg'],
      responses: ['Take care! Feel free to reach out via the Contact section anytime.', 'See you around!'],
    },
  ];

  function matchIntent(text){
    const norm = text.toLowerCase();
    let best = null;
    let bestScore = 0;
    intents.forEach(intent => {
      let score = 0;
      intent.keywords.forEach(kw => { if (norm.includes(kw)) score += kw.split(' ').length; });
      if (score > bestScore) { bestScore = score; best = intent; }
    });
    return bestScore > 0 ? best : null;
  }

  function addMessage(text, who){
    const div = document.createElement('div');
    div.className = `chat-msg ${who}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function respondTo(text){
    addMessage(text, 'user');
    const typing = document.createElement('div');
    typing.className = 'chat-msg bot typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const intent = matchIntent(text);
      if (!intent) {
        addMessage("Not sure I caught that — try asking about experience, skills, certifications, projects, or how to get in touch.", 'bot');
        return;
      }
      addMessage(pick(intent.responses), 'bot');
      if (intent.action === 'resume') {
        const a = document.createElement('a');
        a.href = 'assets/tridev-guha-resume.pdf';
        a.download = 'Tridev-Guha-Resume.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else if (intent.action === 'contact') {
        setTimeout(() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }), 300);
      }
    }, 500 + Math.random() * 400);
  }

  function open(){
    panel.classList.remove('hidden');
    if (!messages.children.length) {
      addMessage("Hi! Ask me anything about Tridev — experience, skills, certifications, or how to get in touch.", 'bot');
    }
    setTimeout(() => chatInput.focus(), 50);
  }
  function close(){
    panel.classList.add('hidden');
  }

  fab.addEventListener('click', open);
  closeBtn.addEventListener('click', close);

  function send(){
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    respondTo(text);
  }
  sendBtn.addEventListener('click', send);
  chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

  quickReplies.querySelectorAll('.chat-chip').forEach(chip => {
    chip.addEventListener('click', () => respondTo(chip.dataset.q));
  });
})();
