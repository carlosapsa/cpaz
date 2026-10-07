// Menú móvil
const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
menu.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

// Pestañas de sectores
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  tabs.forEach((t) => {
    const selected = t === tab;
    t.setAttribute('aria-selected', String(selected));
    t.tabIndex = selected ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
  });
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

// Animación de aparición y contadores
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(el) {
  const target = Number(el.dataset.count);
  if (reduceMotion) { el.textContent = target; return; }
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / 1400, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const revealTargets = document.querySelectorAll('.section-head, .card, .case, .steps li, .tab-panels, .quote, .form');
if ('IntersectionObserver' in window) {
  revealTargets.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  revealTargets.forEach((el) => io.observe(el));

  const statsIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('[data-count]').forEach(countUp);
      statsIo.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  statsIo.observe(document.querySelector('.stats'));
} else {
  document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = el.dataset.count; });
}

// Formulario de contacto: sin backend, abre el cliente de correo con el mensaje
const form = document.getElementById('contact-form');
const status = form.querySelector('.form-status');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    status.textContent = 'Por favor, completa nombre, un email válido y tu mensaje.';
    status.className = 'form-status err';
    return;
  }
  const data = new FormData(form);
  const subject = encodeURIComponent(`Consulta de ${data.get('nombre')} (${data.get('empresa') || 'sin empresa'})`);
  const body = encodeURIComponent(`${data.get('mensaje')}\n\n${data.get('nombre')}\n${data.get('email')}`);
  window.location.href = `mailto:hola@cpaz.ai?subject=${subject}&body=${body}`;
  status.textContent = '¡Gracias! Abriendo tu cliente de correo para enviar el mensaje.';
  status.className = 'form-status ok';
  form.reset();
});

document.getElementById('year').textContent = new Date().getFullYear();
