/**
 * EBOOK PAGE JS - DYNAMIC E-BOOK RENTAL SYSTEM
 * Handle ebook loading from Google Sheet, Midtrans payment, PDF preview
 */

// Global configuration (harus di luar IIFE agar accessible untuk Midtrans script)
window.GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxh_14HtgywAltdjwKXVU0DsJahKGHrtUUwnUE2zvB5qRAe33Wiky4F5ga3tew3CfCCKA/exec'; // UPDATE THIS
window.MIDTRANS_CLIENT_KEY = 'Mid-client-5Pt2HLTUbjJd24VZ'; // UPDATE THIS (dari Midtrans account)

(function () {
  'use strict';

  // ========== CONFIGURATION ==========
  const GAS_ENDPOINT = window.GAS_ENDPOINT;
  const MIDTRANS_CLIENT_KEY = window.MIDTRANS_CLIENT_KEY;
  
  // ========== STATE ==========
  let currentEbook = null;
  let userEmail = null;
  let accessToken = null;

  // ========== DOM ELEMENTS ==========
  const loadingEl = document.getElementById('ebook-loading');
  const contentEl = document.getElementById('ebook-content');
  const errorEl = document.getElementById('ebook-error');
  const errorMessageEl = document.getElementById('error-message');
  const rentBtn = document.getElementById('btn-rent');

  // ========== INIT ==========
  document.addEventListener('DOMContentLoaded', initEbook);

  async function initEbook() {
    try {
      // Get ebook ID from URL parameter
      const params = new URLSearchParams(window.location.search);
      const ebookId = params.get('id');

      if (!ebookId) {
        showError('Parameter e-book tidak ditemukan. Silakan gunakan URL: /ebook/?id=ebook-001');
        return;
      }

      // Fetch ebook data dari Google Sheet
      const ebookData = await fetchEbookData(ebookId);
      if (!ebookData) {
        showError('E-book tidak ditemukan atau tidak tersedia.');
        return;
      }

      currentEbook = ebookData;
      userEmail = getUserEmail();

      // Populate halaman dengan data
      populateEbookPage(ebookData);

      // Setup event listeners
      setupEventListeners();

      // Check if user already has access to this ebook
      if (userEmail) {
        checkUserAccess(ebookId);
      }

      // Show content
      if (loadingEl) loadingEl.style.display = 'none';
      if (contentEl) contentEl.style.display = 'block';

    } catch (error) {
      console.error('Init error:', error);
      showError('Terjadi kesalahan saat memuat e-book. Silakan coba lagi.');
    }
  }

  /**
   * Fetch ebook data from Google Sheet via GAS
   */
  async function fetchEbookData(ebookId) {
    try {
      const response = await fetch(GAS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          action: 'getEbook',
          ebookId: ebookId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return data.ebook;
      } else {
        console.error('GAS Error:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  }

  /**
   * Populate halaman dengan data ebook
   */
  function populateEbookPage(ebook) {
    // Hero
    const titleEl = document.getElementById('ebook-title');
    const subtitleEl = document.getElementById('ebook-subtitle');
    if (titleEl) titleEl.textContent = ebook.title;
    if (subtitleEl) subtitleEl.textContent = ebook.category || 'Uncategorized';

    // Metadata
    const coverEl = document.getElementById('ebook-cover');
    if (coverEl) {
      coverEl.src = ebook.coverImage;
      coverEl.alt = ebook.title;
    }
    
    const authorEl = document.getElementById('ebook-author');
    if (authorEl) authorEl.textContent = ebook.author || '-';
    
    const yearEl = document.getElementById('ebook-year');
    if (yearEl) yearEl.textContent = ebook.publishYear || new Date().getFullYear();
    
    const formatEl = document.getElementById('ebook-format');
    if (formatEl) formatEl.textContent = ebook.format || 'PDF';
    
    const pagesEl = document.getElementById('ebook-pages');
    if (pagesEl) pagesEl.textContent = (ebook.pages || 0) + ' halaman';
    
    const langEl = document.getElementById('ebook-language');
    if (langEl) langEl.textContent = ebook.language || 'Indonesian';

    // Price
    const priceEl = document.getElementById('ebook-price');
    if (priceEl) priceEl.textContent = formatPrice(ebook.price);
    
    const rentDaysEl = document.getElementById('ebook-rent-days');
    if (rentDaysEl) rentDaysEl.textContent = `Akses ${ebook.rentDays || 30} hari`;

    // Content
    const descEl = document.getElementById('ebook-description');
    if (descEl) descEl.innerHTML = `<p>${ebook.description || 'Deskripsi tidak tersedia'}</p>`;
    
    // Target audience
    const targetList = document.getElementById('ebook-target-audience');
    if (targetList && ebook.targetAudience) {
      targetList.innerHTML = ''; // Clear
      const audiences = Array.isArray(ebook.targetAudience) 
        ? ebook.targetAudience 
        : ebook.targetAudience.split(',');
      audiences.forEach(audience => {
        const li = document.createElement('li');
        li.textContent = typeof audience === 'object' ? audience.trim?.() || audience : audience.trim();
        targetList.appendChild(li);
      });
    }

    // Preview
    loadPreviewPDF(ebook.pdfFileId);
    const previewTextEl = document.getElementById('preview-text');
    if (previewTextEl) {
      previewTextEl.textContent = `Tersedia ${ebook.previewPages || 5} halaman pertama untuk dibaca secara gratis`;
    }

    // Synopsis
    const synEl = document.getElementById('ebook-synopsis');
    if (synEl) synEl.innerHTML = `<p>"${ebook.synopsis || 'Sinopsis tidak tersedia'}"</p>`;

    // Highlights
    const highlightsGrid = document.getElementById('highlights-grid');
    if (highlightsGrid && ebook.highlights && Array.isArray(ebook.highlights)) {
      highlightsGrid.innerHTML = ''; // Clear
      ebook.highlights.forEach(highlight => {
        const card = document.createElement('div');
        card.className = 'highlight-card';
        const icon = highlight.icon || 'fas fa-star';
        card.innerHTML = `
          <h4><i class="${icon}"></i> ${highlight.title}</h4>
          <p>${highlight.description}</p>
        `;
        highlightsGrid.appendChild(card);
      });
    }

    // Related ebooks
    if (ebook.relatedEbooks) {
      loadRelatedEbooks(ebook.relatedEbooks);
    }
  }

  /**
   * Load preview PDF ke halaman
   * Menggunakan Google Drive Viewer embed
   */
  function loadPreviewPDF(pdfFileId) {
    const previewViewer = document.getElementById('preview-viewer');
    
    if (!previewViewer) return;
    
    if (!pdfFileId) {
      previewViewer.innerHTML = '<p>Preview tidak tersedia</p>';
      return;
    }

    // Embed Google Drive PDF Viewer
    const viewerUrl = `https://drive.google.com/file/d/${pdfFileId}/preview`;
    previewViewer.innerHTML = `
      <div class="pdf-viewer">
        <iframe 
          src="${viewerUrl}" 
          width="100%" 
          height="500px" 
          allow="autoplay"
          loading="lazy">
        </iframe>
      </div>
    `;
  }

  /**
   * Load related ebooks
   */
  async function loadRelatedEbooks(relatedIds) {
    if (!relatedIds) return;

    const ids = Array.isArray(relatedIds) 
      ? relatedIds 
      : relatedIds.split(',');
    
    const grid = document.getElementById('related-ebooks-grid');
    if (!grid) return;

    grid.innerHTML = ''; // Clear

    for (const id of ids) {
      try {
        const ebookId = typeof id === 'string' ? id.trim() : id;
        const ebook = await fetchEbookData(ebookId);
        if (ebook) {
          const card = document.createElement('article');
          card.className = 'related-card';
          const excerpt = ebook.description ? ebook.description.substring(0, 80) : 'No description';
          card.innerHTML = `
            <div class="related-cover">
              <img src="${ebook.coverImage}" alt="${ebook.title}" loading="lazy">
            </div>
            <div class="related-info">
              <h3>${ebook.title}</h3>
              <p class="related-excerpt">${excerpt}...</p>
              <p class="related-price">Rp ${formatPrice(ebook.price)}</p>
              <a href="/ebook/?id=${ebook.id}" class="btn btn-secondary btn-sm">Lihat Detail</a>
            </div>
          `;
          grid.appendChild(card);
        }
      } catch (error) {
        console.error(`Error loading related ebook:`, error);
      }
    }
  }

  /**
   * Check if user already has access to this ebook
   */
  async function checkUserAccess(ebookId) {
    const email = userEmail;
    if (!email) return;

    try {
      const response = await fetch(GAS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          action: 'checkAccess',
          ebookId: ebookId,
          email: email
        })
      });

      const data = await response.json();
      if (data.hasAccess && data.accessToken) {
        accessToken = data.accessToken;
        if (rentBtn) {
          rentBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
          rentBtn.setAttribute('data-action', 'download');
        }
      }
    } catch (error) {
      console.error('Access check error:', error);
    }
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    if (rentBtn) {
      rentBtn.addEventListener('click', handleRentClick);
    }
  }

  /**
   * Handle rent button click
   */
  async function handleRentClick(e) {
    e.preventDefault();

    const action = rentBtn.getAttribute('data-action') || 'rent';

    if (action === 'download') {
      downloadPDF();
    } else {
      initiatePayment();
    }
  }

  /**
   * Download PDF (if user has access)
   */
  async function downloadPDF() {
    if (!accessToken || !currentEbook) {
      showNotification('Silakan sewa e-book terlebih dahulu', 'warning');
      return;
    }

    // Show loading state
    const originalText = rentBtn.innerHTML;
    rentBtn.disabled = true;
    rentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyiapkan...';

    try {
      // Get download link dari GAS (dengan token validation)
      const response = await fetch(GAS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          action: 'getDownloadLink',
          ebookId: currentEbook.id,
          accessToken: accessToken
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Gagal generate download link');
      }

      if (data.downloadUrl) {
        // ✅ Download dari GAS stream (PROTECTED)
        // URL format: https://script.google.com/macros/s/[ID]/usercopy?action=streamPDF&token=xxx
        // GAS akan validate token sebelum return file
        
        // Buat element link untuk download
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `${currentEbook.title.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('✓ PDF siap diunduh', 'success');
      } else {
        throw new Error(data.error || 'Download link generation failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      showNotification('Gagal mengunduh PDF: ' + error.message, 'error');
    } finally {
      rentBtn.disabled = false;
      rentBtn.innerHTML = originalText;
    }
  }

  /**
   * Initiate payment dengan Midtrans
   */
  async function initiatePayment() {
    const email = userEmail;

    if (!email || !currentEbook) {
      showNotification('Data tidak lengkap. Silakan muat ulang halaman.', 'error');
      return;
    }

    // Show loading state
    const originalText = rentBtn.innerHTML;
    rentBtn.disabled = true;
    rentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    try {
      // Step 1: Generate Midtrans snap token dari GAS
      const response = await fetch(GAS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          action: 'initPayment',
          ebookId: currentEbook.id,
          email: email,
          amount: currentEbook.price,
          rentDays: currentEbook.rentDays || 30
        })
      });

      const data = await response.json();
      
      // DEBUG: Log full response for troubleshooting
      console.log('GAS Response received. Response text:', JSON.stringify(data));

      // Handle API response - check both old format (data.success, data.snapToken) 
      // and if it failed but somehow has token data
      let snapToken = null;
      
      if (data.success === true) {
        // Success response - snapToken is spread into response by sendResponse
        snapToken = data.snapToken;
      } else if (data.snapToken) {
        // Fallback: snapToken might exist even if success is false (shouldn't happen)
        snapToken = data.snapToken;
      }
      
      if (!snapToken) {
        const errorMsg = data.error || 'Gagal membuat token pembayaran';
        console.error('Payment token error. Error:', errorMsg, 'Full response:', JSON.stringify(data));
        throw new Error(errorMsg);
      }
      
      console.log('✓ Snap token received:', snapToken);

      // Step 2: Open Midtrans payment gateway
      if (!window.snap) {
        throw new Error('Midtrans Snap belum dimuat. Silakan refresh halaman.');
      }

      snap.pay(data.snapToken, {
        onSuccess: function(result) {
          handlePaymentSuccess(result);
        },
        onPending: function(result) {
          showNotification('Pembayaran sedang diproses...', 'info');
        },
        onError: function(result) {
          showNotification('Pembayaran gagal. Silakan coba lagi.', 'error');
          rentBtn.disabled = false;
          rentBtn.innerHTML = originalText;
        },
        onClose: function() {
          showNotification('Pembayaran dibatalkan.', 'warning');
          rentBtn.disabled = false;
          rentBtn.innerHTML = originalText;
        }
      });

    } catch (error) {
      console.error('Payment error:', error);
      showNotification('Gagal memproses pembayaran: ' + error.message, 'error');
      rentBtn.disabled = false;
      rentBtn.innerHTML = originalText;
    }
  }

  /**
   * Handle payment success
   */
  async function handlePaymentSuccess(result) {
    try {
      // Save purchase ke Google Sheet
      const response = await fetch(GAS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          action: 'recordPurchase',
          ebookId: currentEbook.id,
          email: userEmail,
          transactionId: result.transaction_id,
          amount: currentEbook.price,
          paymentStatus: result.transaction_status
        })
      });

      const data = await response.json();

      if (data.success) {
        accessToken = data.accessToken;
        
        // Update button
        rentBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
        rentBtn.setAttribute('data-action', 'download');
        rentBtn.disabled = false;
        
        showNotification('✓ Selamat! Sewa berhasil. E-book dapat diunduh sekarang.', 'success');
        setTimeout(() => {
          downloadPDF();
        }, 1500);
      } else {
        throw new Error(data.error || 'Gagal menyimpan pembelian');
      }
    } catch (error) {
      console.error('Success handler error:', error);
      showNotification('Pembayaran berhasil tapi ada kesalahan: ' + error.message, 'warning');
      rentBtn.disabled = false;
      rentBtn.innerHTML = 'Sewa Sekarang';
    }
  }

  /**
   * Get or prompt for user email
   */
  function getUserEmail() {
    let email = localStorage.getItem('userEmail');
    
    if (!email) {
      email = prompt('Masukkan email Anda untuk melanjutkan:');
      if (email && email.includes('@')) {
        localStorage.setItem('userEmail', email);
      } else {
        return null;
      }
    }
    
    return email;
  }

  /**
   * Show error message
   */
  function showError(message) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) {
      errorEl.style.display = 'block';
      if (errorMessageEl) errorMessageEl.textContent = message;
    }
  }

  /**
   * Show notification toast
   */
  function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `notification notification-${type}`;
    
    const icons = {
      'success': 'check-circle',
      'error': 'exclamation-circle',
      'warning': 'exclamation-triangle',
      'info': 'info-circle'
    };

    toast.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${icons[type] || icons['info']}"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.remove();
      }, 4000);
    }, 100);
  }

  /**
   * Format price to Indonesian Rupiah
   */
  function formatPrice(price) {
    if (!price) return '0';
    return price.toLocaleString('id-ID');
  }



})();

