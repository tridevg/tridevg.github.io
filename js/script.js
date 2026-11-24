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
      'TITLE:DevSecOps & Cloud Infrastructure Engineer',
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
      print('  resume       — download TridevGuha-Resume.pdf');
      print('  coverletter  — download coverletter-tridevguha.pdf');
      print('  sudo hire-me — try it');
      print('  clear        — clear the screen');
      print('  exit         — close this terminal');
    },
    whoami(){
      print('tridev guha — devsecops & cloud infrastructure engineer @ pace wisdom solutions');
      print('aws · containers · ci/cd · devsecops · observability · genai workflows');
    },
    skills(){
      print('~/cloud, ~/containers-cicd, ~/iac-devsecops, ~/observability-ai');
      print('see the Skills section for the full breakdown.');
    },
    experience(){
      print('devops engineer @ pace wisdom solutions — dec 2025 – present');
      print('devops engineer @ qualys — mar 2022 – sept 2025');
      print('senior security engineer @ qualys — mar 2018 – mar 2022');
      print('8.8+ years total across cloud, devsecops, and security engineering.');
    },
    certs(){
      print('aws certified ai practitioner — june 2026');
      print('claude certified architect foundations — applied (exam pending)');
      print('red hat certified system administrator (rhcsa) — feb 2020');
    },
    contact(){
      print(`email:    ${emailAddress}`);
      print('github:   linked in the Contact section');
      print('linkedin: linked in the Contact section');
    },
    resume(){
      print('downloading TridevGuha-Resume.pdf...', 'term-echo');
      const a = document.createElement('a');
      a.href = 'assets/TridevGuha-Resume.pdf';
      a.download = 'TridevGuha-Resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    coverletter(){
      print('downloading coverletter-tridevguha.pdf...', 'term-echo');
      const a = document.createElement('a');
      a.href = 'assets/coverletter-tridevguha.pdf';
      a.download = 'coverletter-tridevguha.pdf';
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

  // Links shown inside chat replies. href may be a function so that social
  // URLs are read from the (base64-encoded) icon links at runtime instead of
  // being duplicated as plain text in this file.
  const socialHref = (label) => {
    const el = document.querySelector(`.icon-link[aria-label="${label}"]`);
    return el && el.dataset.href ? atob(el.dataset.href) : '';
  };
  const LINKS = {
    resume: { label: 'Download resume (PDF)', href: 'assets/TridevGuha-Resume.pdf', download: 'TridevGuha-Resume.pdf' },
    coverletter: { label: 'Download cover letter (PDF)', href: 'assets/coverletter-tridevguha.pdf', download: 'coverletter-tridevguha.pdf' },
    linkedin: { label: 'LinkedIn profile', href: () => socialHref('LinkedIn'), external: true },
    github: { label: 'GitHub profile', href: () => socialHref('GitHub'), external: true },
    pacewisdom: { label: 'Pace Wisdom Solutions — pacewisdom.in', href: 'https://pacewisdom.in', external: true },
    cve: { label: 'CVE Intelligence Platform — cve.pacewisdom.in', href: 'https://cve.pacewisdom.in', external: true },
  };

  const FALLBACK_TOPICS = 'experience (current and past roles), skills, cloud, containers, CI/CD, IaC, DevSecOps, observability, AI/GenAI, certifications, education, projects, location, languages, availability, contact, the resume, the cover letter, LinkedIn, GitHub, and Pace Wisdom';

  const intents = [
    {
      id: 'greeting',
      keywords: ['hi', 'hello', 'hey', 'yo', 'sup', 'good morning', 'good evening'],
      responses: [
        "Hey! I'm a scripted assistant for Tridev's portfolio — ask me about his experience, skills, certs, projects, or how to reach him.",
        "Hi there! Ask me anything about Tridev's DevSecOps and cloud background — experience, skills, certifications, resume, contact info, all fair game.",
      ],
    },
    {
      id: 'about',
      keywords: ['who are you', 'about you', 'tell me about', 'introduce', 'who is tridev', 'what do you do', 'summary', 'overview'],
      responses: [
        'Tridev Guha is a DevSecOps & Cloud Infrastructure Engineer with 8.8+ years of experience — architecting resilient AWS environments, hardened container platforms, and automated CI/CD pipelines. He is currently at Pace Wisdom Solutions.',
      ],
    },
    {
      id: 'experience',
      keywords: ['experience', 'work history', 'career', 'background', 'years', 'how long', 'how many years', 'worked at', 'roles', 'role'],
      responses: [
        '8.8+ years in total: DevOps Engineer at Pace Wisdom Solutions (Dec 2025–present), DevOps Engineer at Qualys (Mar 2022–Sept 2025), and Senior Security Engineer at Qualys (Mar 2018–Mar 2022). Full details in the Experience section.',
      ],
    },
    {
      id: 'current_role',
      keywords: ['current role', 'current job', 'where do you work', 'pace wisdom', 'working now', 'current company', 'what are you doing now', 'current'],
      responses: [
        'Currently a DevOps Engineer at Pace Wisdom Solutions (Dec 2025–present, Mangalore). Recent work: a zero-downtime AWS RDS MySQL upgrade (v8.0 to v8.4.10), EC2/ALB migrations, Secrets Manager hardening, and FinOps automation that cut AWS compute spend by 30–35%.',
      ],
      links: ['pacewisdom'],
    },
    {
      id: 'previous_role',
      keywords: ['qualys', 'previous job', 'past experience', 'security engineer', 'before this', 'previous role', 'past role'],
      responses: [
        'Before Pace Wisdom: DevOps Engineer at Qualys (Mar 2022–Sept 2025), where he led 80+ large-scale application migrations and standardized GitLab CI/CD and GitHub Actions. Earlier, Senior Security Engineer at Qualys (Mar 2018–Mar 2022), building RPM/DEB release pipelines for vulnerability and patch management.',
      ],
    },
    {
      id: 'skills',
      keywords: ['skills', 'tech stack', 'technologies', 'what do you know', 'expertise', 'skill set', 'stack', 'tools'],
      responses: [
        'Cloud (AWS EC2, VPC, EKS, RDS, ALB, Route 53, IAM, Lambda, EventBridge), containers & CI/CD (Docker, Kubernetes, GitLab CI/CD, GitHub Actions, Jenkins), IaC & DevSecOps (Terraform, Ansible, Trivy, SonarQube, Gitleaks), and observability & AI (Grafana, Loki/EFK, Prometheus, Bedrock, Claude Code). See the Skills section for the full breakdown.',
      ],
    },
    {
      id: 'cloud',
      keywords: ['aws', 'cloud', 'ec2', 's3', 'vpc', 'route 53', 'lambda', 'rds', 'eks', 'ecs', 'cloudfront', 'eventbridge', 'secrets manager'],
      responses: [
        'Hands-on with AWS — EC2, VPC, S3, EKS/ECS, RDS, ALB/ELB, Route 53, CloudFront, IAM, Lambda, EventBridge, SSM, and Secrets Manager. Also Nginx, HAProxy, and WireGuard VPN.',
      ],
    },
    {
      id: 'migrations',
      keywords: ['migration', 'migrations', 'migrated', 'cutover', 'downtime', 'upgrade'],
      responses: [
        'Led 80+ large-scale application migrations at Qualys, including live daytime cutovers and midnight windows, with near-zero downtime and zero data loss. At Pace Wisdom he ran a zero-downtime RDS MySQL upgrade (v8.0 to v8.4.10) via Blue/Green deployments.',
      ],
    },
    {
      id: 'finops',
      keywords: ['cost', 'costs', 'spend', 'finops', 'savings', 'optimization', 'rightsizing'],
      responses: [
        'FinOps automation: EC2 start-stop schedules via EventBridge and SSM, rightsizing, and Cost Optimization Hub audits — cutting recurring AWS compute spend by 30–35%.',
      ],
    },
    {
      id: 'containers',
      keywords: ['docker', 'kubernetes', 'k8s', 'container', 'containers', 'helm', 'nginx', 'reverse proxy'],
      responses: [
        'Docker, Docker Compose, and Kubernetes (EKS). He hardens containers with non-root execution (UID 10001), read-only root filesystems, pinned image tags, and resource quotas and health checks.',
      ],
    },
    {
      id: 'cicd',
      keywords: ['ci/cd', 'cicd', 'pipeline', 'pipelines', 'jenkins', 'github actions', 'gitlab', 'deploy', 'deployment', 'deployments', 'release', 'releases'],
      responses: [
        'GitLab CI/CD, GitHub Actions, and Jenkins — multi-stage pipelines with Trivy scanning, SonarQube SAST, Gitleaks secret detection, and gated production approvals. Deployment time dropped from ~40 minutes to under 8.',
      ],
    },
    {
      id: 'iac',
      keywords: ['terraform', 'ansible', 'infrastructure as code', 'iac', 'provisioning', 'configuration management'],
      responses: [
        'Terraform and Ansible for provisioning and configuration management — spinning up dev, staging, and production AWS environments in minutes instead of days.',
      ],
    },
    {
      id: 'security',
      keywords: ['security', 'devsecops', 'sonarqube', 'trivy', 'vulnerab', 'vulnerability', 'firewall', 'ids/ips', 'hardening', 'secrets', 'gitleaks', 'wireshark', 'burp'],
      responses: [
        'DevSecOps: Trivy, SonarQube, Gitleaks, and container/secrets scanning in CI/CD, plus least-privilege IAM, Secrets Manager, and Linux host hardening (UFW, Fail2Ban, Lynis). Earlier in his career he was a Senior Security Engineer at Qualys (firewalls, IDS/IPS, Wireshark, Burp Suite, vulnerability management).',
      ],
    },
    {
      id: 'observability',
      keywords: ['observability', 'monitoring', 'alerting', 'grafana', 'prometheus', 'loki', 'efk', 'uptime kuma', 'opentelemetry', 'sre', 'incident', 'incidents', 'mttr', 'postmortem', 'rca', 'slo', 'sla'],
      responses: [
        'Observability & SRE: Grafana, Prometheus, OpenTelemetry, Loki/EFK, CloudWatch, and Uptime Kuma. Alerting cut MTTD from 20+ minutes to under 3 at 99.9%+ uptime, and centralized logging with RCA runbooks cut MTTR by ~50%.',
      ],
    },
    {
      id: 'ai',
      keywords: ['genai', 'generative ai', 'claude', 'bedrock', 'prompt engineering', 'llm', 'mcp', 'agentic', 'livekit', 'guardrails', 'ai'],
      responses: [
        'AWS Certified AI Practitioner, Claude Certified Architect Foundations, Amazon Bedrock, Claude Code CLI, MCP integrations, and LiveKit voice AI infrastructure — applied to DevOps delivery, with agentic workflows and prompt engineering.',
      ],
    },
    {
      id: 'certifications',
      keywords: ['certification', 'certifications', 'certified', 'certificate', 'badge', 'certs', 'rhcsa', 'red hat'],
      responses: [
        'AWS Certified AI Practitioner (June 2026), Claude Certified Architect Foundations (Applied Foundations, exam pending), and Red Hat Certified System Administrator — RHCSA (Feb 2020).',
      ],
    },
    {
      id: 'education',
      keywords: ['education', 'degree', 'college', 'university', 'study', 'studied', 'academic', 'caltech', 'btech', 'b.tech', 'cdac', 'postgraduate', 'post-graduate', 'diploma'],
      responses: [
        'Post-Graduate Program in DevOps from Caltech CTME (Nov 2023); Post-Graduate Diploma in IT Infrastructure, Systems & Security from CDAC ACTS, Pune (2018, Grade A); and B.Tech in Computer Science & Engineering from Techno India University (2017, CGPA 9.01).',
      ],
    },
    {
      id: 'location',
      keywords: ['location', 'based', 'where are you', 'live', 'city', 'country', 'mangalore', 'india'],
      responses: [
        'Based in Mangalore, India.',
      ],
    },
    {
      id: 'languages',
      keywords: ['language', 'languages', 'speak', 'fluent', 'hindi', 'bengali'],
      responses: [
        'English (fluent), Hindi, and Bengali.',
      ],
    },
    {
      id: 'projects',
      keywords: ['project', 'projects', 'portfolio project', 'built anything', 'side project', 'cve', 'nuclei', 'vmdr', 'scanner', 'scanning', 'bot', 'ssl'],
      responses: [
        'Three projects: a self-hosted CVE Intelligence Platform (hourly NVD ingestion, CVSSv3 filtering, trend dashboards, multi-channel alerts, and LLM-suggested fixes), a Custom Multi-Account VMDR Scanning Engine (Nuclei, OWASP DefectDojo, FastAPI, Next.js), and an Automated SSL & Synthetic Health Bot Suite (Telegram and Teams alerts).',
      ],
      links: ['cve'],
    },
    {
      id: 'contact',
      keywords: ['contact', 'email', 'reach', 'get in touch', 'hire', 'talk to', 'message', 'phone'],
      responses: [
        "Best way is the Contact section — email, GitHub, LinkedIn, and Pace Wisdom icons are all there, plus a downloadable contact card.",
      ],
      action: 'contact',
      links: ['linkedin', 'github'],
    },
    {
      id: 'linkedin',
      keywords: ['linkedin'],
      responses: [
        'Here is his LinkedIn profile (opens in a new tab).',
      ],
      links: ['linkedin'],
    },
    {
      id: 'github',
      keywords: ['github', 'repo', 'repos', 'code', 'source'],
      responses: [
        'Here is his GitHub profile (opens in a new tab).',
      ],
      links: ['github'],
    },
    {
      id: 'pacewisdom',
      keywords: ['pacewisdom', 'pace wisdom.in', 'pace wisdom solutions', 'company website', 'company'],
      responses: [
        'Pace Wisdom Solutions is his current employer (DevOps Engineer since Dec 2025). Here is their site (opens in a new tab).',
      ],
      links: ['pacewisdom'],
    },
    {
      id: 'resume',
      keywords: ['resume', 'cv', 'download resume', 'download cv', 'curriculum vitae'],
      responses: [
        "You can grab the resume PDF directly — I'll start the download for you.",
      ],
      action: 'resume',
      links: ['resume'],
    },
    {
      id: 'coverletter',
      keywords: ['cover letter', 'coverletter', 'cover-letter', 'cover'],
      responses: [
        'The cover letter is a one-page overview of his 8.8+ years in DevSecOps and cloud architecture, with highlights on migrations, deployment speed, and AWS cost savings. Starting the download now.',
      ],
      action: 'coverletter',
      links: ['coverletter'],
    },
    {
      id: 'availability',
      keywords: ['available', 'availability', 'open to work', 'hiring', 'freelance', 'looking for a job', 'looking for job', 'join', 'notice period', 'relocate', 'remote'],
      responses: [
        "The resume doesn't say what his availability is. For opportunities or collaboration, the best move is reaching out directly via the Contact section — email or LinkedIn.",
      ],
      links: ['linkedin'],
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

  // Whole-word keyword match, so e.g. "hi" does not fire on "this" or "his".
  function hasKeyword(norm, kw){
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(norm);
  }

  function matchIntent(text){
    const norm = text.toLowerCase();
    let best = null;
    let bestScore = 0;
    intents.forEach(intent => {
      let score = 0;
      intent.keywords.forEach(kw => { if (hasKeyword(norm, kw)) score += kw.split(' ').length; });
      if (score > bestScore) { bestScore = score; best = intent; }
    });
    return bestScore > 0 ? best : null;
  }

  function addMessage(text, who, linkKeys){
    const div = document.createElement('div');
    div.className = `chat-msg ${who}`;
    div.textContent = text;
    (linkKeys || []).forEach(key => {
      const l = LINKS[key];
      if (!l) return;
      const url = typeof l.href === 'function' ? l.href() : l.href;
      if (!url) return;
      const a = document.createElement('a');
      a.href = url;
      a.textContent = l.label;
      a.style.display = 'block';
      a.style.marginTop = '6px';
      a.style.color = 'inherit';
      a.style.textDecoration = 'underline';
      if (l.download) {
        a.download = l.download;
      }
      if (l.external) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      div.appendChild(a);
    });
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function triggerDownload(key){
    const l = LINKS[key];
    if (!l) return;
    const a = document.createElement('a');
    a.href = l.href;
    a.download = l.download;
    document.body.appendChild(a);
    a.click();
    a.remove();
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
        addMessage(`Not sure I caught that. I can answer about: ${FALLBACK_TOPICS}. Try one of those, or use the quick replies below.`, 'bot');
        return;
      }
      addMessage(pick(intent.responses), 'bot', intent.links);
      if (intent.action === 'resume' || intent.action === 'coverletter') {
        triggerDownload(intent.action);
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
