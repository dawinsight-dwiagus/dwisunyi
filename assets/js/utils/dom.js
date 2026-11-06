/**
 * DOM & Form Utility Functions (SSOT & DRY)
 * Centralized helpers for validation, notifications/toasts, and UI interactions.
 */

/**
 * Validate email format using standard RFC-compliant regex
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate Indonesian / international phone number
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s-]/g, '');
  const phoneRegex = /^(\+62|0)[0-9]{9,13}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Display a sleek, accessible toast notification (SSOT for all pages)
 * @param {string} message - Notification text
 * @param {'success'|'error'|'info'|'warning'} type - Toast type
 * @param {number} duration - Auto-hide duration in milliseconds (default: 4000)
 */
export function showToast(message, type = 'success', duration = 4000) {
  // Remove any existing active toast to prevent stacking clutter
  const existing = document.querySelector('.site-toast');
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.className = `site-toast site-toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');

  const iconClass = type === 'success' 
    ? 'fa-circle-check' 
    : type === 'error' 
      ? 'fa-circle-xmark' 
      : type === 'warning' 
        ? 'fa-triangle-exclamation' 
        : 'fa-circle-info';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}" aria-hidden="true"></i>
    <span class="site-toast__text">${message}</span>
  `;

  // Inline styling ensures it works even before or regardless of page-specific CSS
  const bgColor = type === 'success' 
    ? 'rgba(16, 185, 129, 0.95)' 
    : type === 'error' 
      ? 'rgba(239, 68, 68, 0.95)' 
      : type === 'warning' 
        ? 'rgba(245, 158, 11, 0.95)' 
        : 'rgba(6, 182, 212, 0.95)';

  toast.style.cssText = `
    position: fixed;
    bottom: clamp(1.25rem, 3vw, 2rem);
    right: clamp(1rem, 2.5vw, 2rem);
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.75rem 1.25rem;
    background: ${bgColor};
    color: #ffffff;
    font-size: 0.88rem;
    font-weight: 500;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
    z-index: 99999;
    backdrop-filter: blur(8px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    animation: toastSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  `;

  document.body.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Initialize FAQ Accordion behavior across pages (SSOT)
 * Handles auto-closing sibling items if desired or custom click interactions.
 * @param {string} selector - Query selector for FAQ items (default: '.faq-item')
 */
export function initFaqAccordion(selector = '.faq-item') {
  const items = document.querySelectorAll(selector);
  if (!items || items.length === 0) return;

  items.forEach(item => {
    const summary = item.querySelector('summary') || item.querySelector('.faq-question');
    if (!summary) return;

    summary.addEventListener('click', (e) => {
      // If using native <details>, let native event handle toggle smoothly,
      // but rotate icon and close others if open
      if (item.tagName.toLowerCase() === 'details') {
        const isOpen = item.hasAttribute('open');
        if (!isOpen) {
          items.forEach(other => {
            if (other !== item && other.hasAttribute('open')) {
              other.removeAttribute('open');
            }
          });
        }
      }
    });
  });
}

