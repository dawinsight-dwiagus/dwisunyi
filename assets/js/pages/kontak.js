/**
 * KONTAK PAGE JS (SSOT & DRY)
 * Handle contact form validation, submission, and interaction using shared utils.
 */
import { isValidEmail, isValidPhone, showToast, initFaqAccordion } from '../utils/dom.js';

(function () {
  'use strict';

  // ========== INIT REUSABLE FAQ ACCORDION (SSOT) ==========
  initFaqAccordion('.faq-item');

  // ========== FORM HANDLING ==========
  const kontakForm = document.getElementById('kontakForm');
  const formMessage = document.getElementById('formMessage');

  if (kontakForm) {
    // Real-time validation for required fields
    const fields = ['fullname', 'email', 'phone', 'subject', 'message', 'permission'];
    
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('change', () => validateField(field));
      }
    });

    kontakForm.addEventListener('submit', handleFormSubmit);
  }

  // Validate individual field
  function validateField(field) {
    const fieldId = field.id;
    const value = field.value.trim();
    const errorElement = field.parentElement.querySelector('.error-message');

    let isValid = true;
    let errorMsg = '';

    // Required check
    if (!value && field.hasAttribute('required')) {
      isValid = false;
      const labelText = field.previousElementSibling ? field.previousElementSibling.textContent.replace('*', '').trim() : 'Kolom ini';
      errorMsg = `${labelText} harus diisi`;
    }

    // Email validation using SSOT helper
    if (fieldId === 'email' && value) {
      if (!isValidEmail(value)) {
        isValid = false;
        errorMsg = 'Format email tidak valid';
      }
    }

    // Phone validation using SSOT helper
    if (fieldId === 'phone' && value) {
      if (!isValidPhone(value)) {
        isValid = false;
        errorMsg = 'Format nomor telepon tidak valid';
      }
    }

    // Checkbox validation
    if (fieldId === 'permission' && !field.checked) {
      isValid = false;
      errorMsg = 'Anda harus menyetujui persyaratan ini';
    }

    // Display error state
    if (!isValid) {
      field.classList.add('input-error');
      if (errorElement) {
        errorElement.textContent = errorMsg;
        errorElement.classList.add('show');
      }
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.classList.remove('input-error');
      field.removeAttribute('aria-invalid');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
      }
    }

    return isValid;
  }

  // Handle form submission
  async function handleFormSubmit(e) {
    e.preventDefault();

    // Validate all fields
    let isFormValid = true;
    const fieldsToValidate = ['fullname', 'email', 'subject', 'message', 'permission'];
    
    fieldsToValidate.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field && !validateField(field)) {
        isFormValid = false;
      }
    });

    // Also validate optional phone if filled
    const phoneField = document.getElementById('phone');
    if (phoneField && phoneField.value.trim() && !validateField(phoneField)) {
      isFormValid = false;
    }

    if (!isFormValid) {
      showFormMessage('Mohon perbaiki error di atas sebelum mengirim', 'error');
      showToast('Mohon lengkapi formulir dengan benar', 'error');
      return;
    }

    // Show loading state
    const submitBtn = kontakForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

    try {
      const formData = new FormData(kontakForm);
      const data = Object.fromEntries(formData);

      await simulateFormSubmission(data);

      const successMsg = '✓ Pesan Anda berhasil dikirim! Saya akan merespons secepatnya.';
      showFormMessage(successMsg, 'success');
      showToast(successMsg, 'success');

      // Reset form
      setTimeout(() => {
        kontakForm.reset();
        kontakForm.querySelectorAll('input, textarea').forEach(field => {
          field.classList.remove('input-error');
          field.removeAttribute('aria-invalid');
          const errorEl = field.parentElement?.querySelector('.error-message');
          if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('show');
          }
        });
      }, 1000);
    } catch (error) {
      console.error('Form submission error:', error);
      const errMsg = 'Gagal mengirim pesan. Silakan coba lagi atau gunakan WhatsApp.';
      showFormMessage(errMsg, 'error');
      showToast(errMsg, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  // Simulate form submission
  function simulateFormSubmission(data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.fullname && data.email && data.subject && data.message) {
          resolve({ success: true });
        } else {
          reject(new Error('Form data incomplete'));
        }
      }, 800);
    });
  }

  // Show/hide in-card form message banner
  function showFormMessage(message, type = 'success') {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.className = `form-message ${type} show`;

    const duration = type === 'success' ? 5000 : 7000;
    setTimeout(() => {
      formMessage.classList.remove('show');
    }, duration);
  }

  // Copy to clipboard helper for copyable elements
  const copyableElements = document.querySelectorAll('[data-copyable]');
  copyableElements.forEach(element => {
    element.addEventListener('click', () => {
      const text = element.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = element.textContent;
        element.textContent = 'Tersalin! ✓';
        showToast('Kontak tersalin ke clipboard!', 'info', 2000);
        setTimeout(() => {
          element.textContent = originalText;
        }, 2000);
      });
    });
  });
})();
