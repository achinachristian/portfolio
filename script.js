document.addEventListener('DOMContentLoaded', () => {
  const store = {
    get(k){ try{ return localStorage.getItem(k); }catch{ return null; } },
    set(k,v){ try{ localStorage.setItem(k,v); }catch{} }
  };

  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    menuToggle.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  function applyTheme(theme){
    if (theme === 'light') { root.setAttribute('data-theme','light'); themeToggle.setAttribute('aria-pressed','true'); }
    else { root.removeAttribute('data-theme'); themeToggle.setAttribute('aria-pressed','false'); }
  }
  applyTheme(store.get('theme') || (prefersLight ? 'light' : 'dark'));
  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    store.set('theme', next);
  });

  const phrases = ['builds frontends.', 'wrangles databases.', 'ships with AI in the loop.', 'captains MLBB teams.'];
  const typed = document.getElementById('typed');
  let pi = 0, ci = 0, deleting = false;
  (function tick(){
    const word = phrases[pi];
    typed.textContent = word.slice(0, ci);
    if (!deleting && ci === word.length){ deleting = true; return setTimeout(tick, 1400); }
    if (deleting && ci === 0){ deleting = false; pi = (pi + 1) % phrases.length; }
    ci += deleting ? -1 : 1;
    setTimeout(tick, deleting ? 35 : 70);
  })();

  const bar = document.getElementById('progress');
  const toTop = document.getElementById('toTop');
  function onScroll(){
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100) + '%';
    toTop.hidden = h.scrollTop < 500;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const revealEls = document.querySelectorAll('.skill-card, .project-card, .timeline-item, .section-title');
  revealEls.forEach(el => el.classList.add('reveal'));
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); revealObs.unobserve(e.target); } });
  }, { threshold: .15 });
  revealEls.forEach(el => revealObs.observe(el));

  const navAnchors = document.querySelectorAll('.nav-link');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  navAnchors.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });

  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const search = document.getElementById('projectSearch');
  const countEl = document.getElementById('resultCount');
  const emptyEl = document.getElementById('emptyState');
  let activeFilter = 'all';

  function applyProjectFilters(){
    const q = search.value.trim().toLowerCase();
    let visible = 0;
    projectCards.forEach(card => {
      const inCat = activeFilter === 'all' || card.dataset.category.split(' ').includes(activeFilter);
      const inText = !q || card.textContent.toLowerCase().includes(q);
      const show = inCat && inText;
      card.classList.toggle('is-hidden', !show);
      if (show) visible++;
    });
    countEl.textContent = visible + ' / ' + projectCards.length + ' shown';
    emptyEl.hidden = visible !== 0;
  }
  filterButtons.forEach(btn => btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    activeFilter = btn.dataset.filter;
    applyProjectFilters();
  }));
  search.addEventListener('input', applyProjectFilters);
  applyProjectFilters();

  document.getElementById('printResume').addEventListener('click', () => window.print());

  document.getElementById('copyEmail').addEventListener('click', async () => {
    try{ await navigator.clipboard.writeText('achinachristian@gmail.com'); showToast('Email copied to clipboard'); }
    catch{ showToast('Copy failed. Select it manually.'); }
  });

  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('successMsg');
  const msg = document.getElementById('message');
  const counter = document.getElementById('counter');
  const fields = {
    name: { input: document.getElementById('name'), error: document.getElementById('nameError') },
    email: { input: document.getElementById('email'), error: document.getElementById('emailError') },
    message: { input: msg, error: document.getElementById('messageError') }
  };
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(key, message){
    const { input, error } = fields[key];
    input.closest('.field').classList.toggle('has-error', Boolean(message));
    error.textContent = message || '';
  }
  function validate(){
    let valid = true;
    if (!fields.name.input.value.trim()){ setError('name','Please enter your name.'); valid = false; } else setError('name','');
    const emailVal = fields.email.input.value.trim();
    if (!emailVal){ setError('email','Please enter your email.'); valid = false; }
    else if (!emailPattern.test(emailVal)){ setError('email','Please enter a valid email address.'); valid = false; }
    else setError('email','');
    if (!msg.value.trim()){ setError('message','Please enter a message.'); valid = false; } else setError('message','');
    return valid;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    successMsg.classList.remove('is-visible');
    if (!validate()) return;
    const name = fields.name.input.value.trim();
    const email = fields.email.input.value.trim();
    const subject = encodeURIComponent('Portfolio message from ' + name);
    const body = encodeURIComponent(msg.value.trim() + '\n\n— ' + name + ' (' + email + ')');
    window.location.href = 'mailto:achinachristian@gmail.com?subject=' + subject + '&body=' + body;
    successMsg.classList.add('is-visible');
    form.reset();
    counter.textContent = '0 / 500';
  });

  Object.keys(fields).forEach(key => fields[key].input.addEventListener('input', () => setError(key, '')));
  msg.addEventListener('input', () => {
    counter.textContent = msg.value.length + ' / 500';
    counter.classList.toggle('warn', msg.value.length > 450);
  });

});