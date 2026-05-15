/* =========================================================
   Arogya Netram - Landing Page Scripts
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Sticky navbar shadow on scroll ---------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 30) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile hamburger ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  /* ---------- Interactive button feedback (ripple + haptic) ---------- */
  const interactiveBtns = document.querySelectorAll('.cta-btn, .nav-cta, .float-call');
  interactiveBtns.forEach(btn => {
    btn.style.position = btn.style.position || 'relative';
    btn.addEventListener('click', e => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
      if (navigator.vibrate) navigator.vibrate(15);
    });
  });

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          const offset = 80;
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.scrollY - offset,
            behavior: 'smooth',
          });
        }
      }
    });
  });

  /* ---------- Scroll reveal via IntersectionObserver ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Form validation ---------- */
  const form = document.getElementById('leadForm');
  if (form) {
    const showError = (input, msg) => {
      input.classList.add('invalid');
      const err = form.querySelector(`.err[data-for="${input.id}"]`);
      if (err) err.textContent = msg;
    };
    const clearError = input => {
      input.classList.remove('invalid');
      const err = form.querySelector(`.err[data-for="${input.id}"]`);
      if (err) err.textContent = '';
    };

    form.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => clearError(inp));
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      const name = form.name;
      const phone = form.phone;
      const city = form.city;

      if (!name.value.trim() || name.value.trim().length < 2) {
        showError(name, 'कृपया मान्य नाम दर्ज करें');
        valid = false;
      }
      if (!/^[6-9]\d{9}$/.test(phone.value.trim())) {
        showError(phone, 'कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें');
        valid = false;
      }
      if (!city.value.trim()) {
        showError(city, 'कृपया शहर का नाम दर्ज करें');
        valid = false;
      }

      if (valid) {
        const success = document.getElementById('formSuccess');
        success.hidden = false;
        form.reset();
        setTimeout(() => (success.hidden = true), 5000);
      }
    });
  }

  /* ---------- Lazy load fallback for browsers without native support ---------- */
  if (!('loading' in HTMLImageElement.prototype) && 'IntersectionObserver' in window) {
    const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    const lazyIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          if (img.dataset.src) img.src = img.dataset.src;
          lazyIO.unobserve(img);
        }
      });
    });
    lazyImgs.forEach(img => lazyIO.observe(img));
  }
})();
