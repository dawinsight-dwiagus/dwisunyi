/* =======================================
   PAGE - HOME / BERANDA - JavaScript
======================================== */

(function () {
  'use strict';

  // ===== DOM ELEMENTS =====
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');
  const faqItems = document.querySelectorAll('.faq-item');

  // ===== NEWSLETTER FORM HANDLING =====
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }

  function handleNewsletterSubmit(e) {
    e.preventDefault();

    const email = newsletterEmail.value.trim();

    // Validation
    if (!isValidEmail(email)) {
      showNotification('Silakan masukkan email yang valid', 'error');
      return;
    }

    // Simulate subscription (in production, send to backend)
    const formGroup = newsletterForm.querySelector('.form-group');
    const button = newsletterForm.querySelector('button');
    const originalButtonContent = button.innerHTML;

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    // Simulate API call
    setTimeout(() => {
      button.innerHTML = '<i class="fas fa-check-circle"></i> Berhasil!';
      button.style.background = 'linear-gradient(135deg, var(--success-green), #10b981)';
      newsletterEmail.value = '';

      showNotification('Terima kasih! Anda telah berlangganan newsletter kami.', 'success');

      // Reset button after 2 seconds
      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = originalButtonContent;
        button.style.background = '';
      }, 2000);
    }, 1500);
  }

  // ===== EMAIL VALIDATION =====
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ===== NOTIFICATION HELPER =====
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.textContent = message;

    // Add styles dynamically if needed
    notification.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? 'var(--success-green)' : '#ef4444'};
      color: white;
      border-radius: 8px;
      font-weight: 500;
      z-index: 1000;
      animation: slideUp 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
      notification.style.animation = 'slideDown 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  // ===== FAQ ACCORDION LOGIC =====
  if (faqItems.length > 0) {
    faqItems.forEach((item) => {
      const summary = item.querySelector('.faq-question');

      summary?.addEventListener('click', (e) => {
        e.preventDefault();

        // Close other items (optional behavior)
        // faqItems.forEach(otherItem => {
        //   if (otherItem !== item && otherItem.open) {
        //     otherItem.open = false;
        //   }
        // });

        if (item.open) {
          item.removeAttribute('open');
        } else {
          item.setAttribute('open', 'open');
        }
      });
    });
  }

  // ===== SMOOTH SCROLL TO SECTIONS =====
  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

  smoothScrollLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // Skip if href is just '#'
      if (href === '#') return;

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

  // ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'slideUp 0.6s ease-out forwards';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe article cards and other elements
  document.querySelectorAll('.article-card, .why-item').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    observer.observe(el);
  });

  // ===== LAZY LOAD IMAGES =====
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => imageObserver.observe(img));
  }

  // ===== SCROLL TO TOP HELPER =====
  window.scrollToSection = function (sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ===== FORM INPUT ENHANCEMENT =====
  if (newsletterEmail && newsletterForm) {
    newsletterEmail.addEventListener('input', () => {
      // Real-time email validation feedback if needed
      const isValid = isValidEmail(newsletterEmail.value);
      const button = newsletterForm.querySelector('button');

      if (button) {
        if (isValid) {
          button.style.opacity = '1';
          button.style.pointerEvents = 'auto';
        } else {
          button.style.opacity = '0.6';
          button.style.pointerEvents = 'none';
        }
      }
    });

    // Trigger initial state
    newsletterEmail.dispatchEvent(new Event('input'));
  }

  // ===== ANIMATION KEYFRAMES FOR SCRIPT =====
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideDown {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(20px);
      }
    }
  `;
  document.head.appendChild(style);

  console.log('Home page scripts loaded successfully');
})();

