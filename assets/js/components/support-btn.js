// Floating WhatsApp Direct Button Builder untuk dawinsight.my.id
function initWhatsAppBtn() {
  const supportWrapper = document.querySelector(".support-btn-wrapper");
  if (!supportWrapper) return;

  const waNumber = "6287818888003";

  // Mapping path halaman ke pesan WA kontekstual
  const pathMessageMap = {
    "/": "Halo Dwi Sunyi! Saya ingin berdiskusi dan mengenal lebih baik tentang Anda.",
    "/index.html": "Halo Dwi Sunyi! Saya ingin berdiskusi dan mengenal lebih baik tentang Anda.",
    "/tentang/": "Halo Dwi Sunyi! Saya tertarik dengan biografi dan pengalaman Anda.",
    "/tentang/index.html": "Halo Dwi Sunyi! Saya tertarik dengan biografi dan pengalaman Anda.",
    "/artikel/": "Halo Dwi Sunyi! Artikel-artikel Anda sangat menarik dan saya ingin berdiskusi.",
    "/artikel/index.html": "Halo Dwi Sunyi! Artikel-artikel Anda sangat menarik dan saya ingin berdiskusi.",
    "/portofolio/": "Halo Dwi Sunyi! Portofolio Anda sangat mengesankan.",
    "/portofolio/index.html": "Halo Dwi Sunyi! Portofolio Anda sangat mengesankan.",
    "/kontak/": "Halo Dwi Sunyi! Saya ingin menghubungi Anda untuk diskusi lebih lanjut.",
    "/kontak/index.html": "Halo Dwi Sunyi! Saya ingin menghubungi Anda untuk diskusi lebih lanjut.",
    "/ebook/": "Halo Dwi Sunyi! Saya tertarik dengan E-Book Anda.",
    "/ebook/index.html": "Halo Dwi Sunyi! Saya tertarik dengan E-Book Anda."
  };

  const currentPath = window.location.pathname;
  const h1 = document.querySelector("h1");
  let defaultMessage = "Halo Dwi Sunyi! Saya ingin berdiskusi dengan Anda.";

  if (currentPath.includes("/artikel/") && h1) {
    defaultMessage = `Halo Dwi Sunyi! Saya tertarik berdiskusi tentang artikel "${h1.textContent.trim()}".`;
  } else if (currentPath.includes("/ebook/") && h1) {
    defaultMessage = `Halo Dwi Sunyi! Saya tertarik dengan E-Book "${h1.textContent.trim()}".`;
  }

  const message = pathMessageMap[currentPath] || defaultMessage;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  // Render tombol WhatsApp langsung tanpa dropdown panel
  supportWrapper.innerHTML = `
    <a href="${waUrl}" class="support-btn whatsapp-btn" target="_blank" rel="noopener noreferrer" aria-label="Chat WhatsApp Langsung" title="Chat WhatsApp Langsung">
      <i class="fab fa-whatsapp" aria-hidden="true"></i>
    </a>
  `;
}

if (document.readyState === "loading") {
  window.addEventListener("load", initWhatsAppBtn);
} else {
  initWhatsAppBtn();
}
