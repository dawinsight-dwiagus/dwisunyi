/* =======================================
   PAGE - HOME / BERANDA - JavaScript (SSOT & DRY)
======================================== */
import { isValidEmail, showToast, initFaqAccordion } from '../utils/dom.js';

(function () {
  'use strict';

  // ===== DOM ELEMENTS =====
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');

  // ===== INIT REUSABLE FAQ ACCORDION (SSOT) =====
  initFaqAccordion('.faq-item');

  // ===== NEWSLETTER FORM HANDLING =====
  if (newsletterForm && newsletterEmail) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);

    // Dynamic button state on email input
    newsletterEmail.addEventListener('input', () => {
      const isValid = isValidEmail(newsletterEmail.value);
      const button = newsletterForm.querySelector('button');
      if (button) {
        button.style.opacity = isValid ? '1' : '0.7';
      }
    });
  }

  function handleNewsletterSubmit(e) {
    e.preventDefault();

    const email = newsletterEmail.value.trim();

    // Reusable validation from SSOT dom.js
    if (!isValidEmail(email)) {
      showToast('Silakan masukkan email yang valid', 'error');
      return;
    }

    const button = newsletterForm.querySelector('button');
    const originalButtonContent = button.innerHTML;

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    // Simulate API call / submission
    setTimeout(() => {
      button.innerHTML = '<i class="fas fa-check-circle"></i> Berhasil!';
      button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      newsletterEmail.value = '';

      showToast('Terima kasih! Anda telah berlangganan newsletter kami.', 'success');

      // Reset button after 2.5 seconds
      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = originalButtonContent;
        button.style.background = '';
      }, 2500);
    }, 1200);
  }

  // ===== SMOOTH SCROLL TO SECTIONS =====
  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
  smoothScrollLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

        // Close mobile nav if open
        const navMobile = document.getElementById('nav-mobile');
        if (navMobile?.getAttribute('aria-hidden') === 'false') {
          navMobile.setAttribute('aria-hidden', 'true');
          const navBtn = document.getElementById('nav-mobile-btn');
          if (navBtn) navBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // ===== SCROLL TO TOP HELPER =====
  window.scrollToSection = function (sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
})();
