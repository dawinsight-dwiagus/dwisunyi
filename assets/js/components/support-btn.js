// Support Button Builder & Dynamic WhatsApp Links untuk dawinsight.my.id Personal Website
window.addEventListener("load", () => {
  const supportWrapper = document.querySelector(".support-btn-wrapper");

  // Jika wrapper tidak ada, hentikan
  if (!supportWrapper) return;

  // Daftar nomor WA placeholder
  const waContacts = [
    {
      label: "Chat Langsung",
      number: "6287818888003",
      schedule: "(Senin-Jumat: 09.00-17.00 WIB)",
      class: "wa-direct-link"
    }
  ];

  // Mapping path halaman ke pesan WA
  const pathMessageMap = {
    "/": "Halo dawinsight.my.id! Saya ingin mengenal lebih baik tentang Anda.",
    "/index.html": "Halo dawinsight.my.id! Saya ingin mengenal lebih baik tentang Anda.",
    "/tentang/": "Halo dawinsight.my.id! Saya tertarik dengan biography dan pengalaman Anda.",
    "/tentang/index.html": "Halo dawinsight.my.id! Saya tertarik dengan biography dan pengalaman Anda.",
    "/artikel/": "Halo dawinsight.my.id! Artikel-artikel Anda sangat menarik dan informatif.",
    "/artikel/index.html": "Halo dawinsight.my.id! Artikel-artikel Anda sangat menarik dan informatif.",
    "/blog/artikel/": "Halo dawinsight.my.id! Artikel-artikel Anda sangat menarik dan informatif.",
    "/blog/artikel/index.html": "Halo dawinsight.my.id! Artikel-artikel Anda sangat menarik dan informatif.",
    "/blog/artikel/detail.html": "Halo dawinsight.my.id! Saya membaca artikel ini dan ingin bertanya lebih lanjut.",
    "/blog/tips-website/": "Halo dawinsight.my.id! Tips-tips website Anda sangat berguna.",
    "/blog/tips-website/index.html": "Halo dawinsight.my.id! Tips-tips website Anda sangat berguna.",
    "/blog/tips-website/detail.html": "Halo dawinsight.my.id! Saya ingin mendiskusikan tips website ini lebih lanjut.",
    "/portofolio/": "Halo dawinsight.my.id! Portfolio Anda mengesankan dan menginspirasi.",
    "/portofolio/index.html": "Halo dawinsight.my.id! Portfolio Anda mengesankan dan menginspirasi.",
    "/perusahaan/": "Halo dawinsight.my.id! Saya ingin mengetahui lebih lanjut tentang profil Anda.",
    "/perusahaan/index.html": "Halo dawinsight.my.id! Saya ingin mengetahui lebih lanjut tentang profil Anda.",
    "/perusahaan/tentang/": "Halo dawinsight.my.id! Saya ingin mengetahui lebih banyak tentang Anda.",
    "/perusahaan/tentang/index.html": "Halo dawinsight.my.id! Saya ingin mengetahui lebih banyak tentang Anda.",
    "/perusahaan/portofolio/": "Halo dawinsight.my.id! Portfolio Anda mengesankan.",
    "/perusahaan/portofolio/index.html": "Halo dawinsight.my.id! Portfolio Anda mengesankan.",
    "/perusahaan/karir/": "Halo dawinsight.my.id! Saya tertarik dengan peluang karir di sini.",
    "/perusahaan/karir/index.html": "Halo dawinsight.my.id! Saya tertarik dengan peluang karir di sini.",
    "/perusahaan/legal/": "Halo dawinsight.my.id! Saya ingin informasi mengenai aspek legal dan kebijakan.",
    "/perusahaan/legal/index.html": "Halo dawinsight.my.id! Saya ingin informasi mengenai aspek legal dan kebijakan.",
    "/kontak/": "Halo dawinsight.my.id! Saya ingin menghubungi Anda untuk diskusi lebih lanjut.",
    "/kontak/index.html": "Halo dawinsight.my.id! Saya ingin menghubungi Anda untuk diskusi lebih lanjut.",
    "/ebook/": "Halo dawinsight.my.id! Saya tertarik dengan E-Book Anda.",
    "/ebook/index.html": "Halo dawinsight.my.id! Saya tertarik dengan E-Book Anda."
  };

  const currentPath = window.location.pathname;
  const defaultMessage = "Halo dawinsight.my.id! Saya ingin mengenal lebih baik tentang Anda.";
  const message = pathMessageMap[currentPath] || defaultMessage;

  // Bangun HTML support button
  supportWrapper.innerHTML = `
    <button class="support-btn" aria-expanded="false" aria-controls="support-panel" aria-label="Toggle Support Panel">
      <i class="fas fa-headset" aria-hidden="true"></i>
    </button>
    <nav id="support-panel" class="support-panel" role="region" aria-label="Support Panel" aria-hidden="true" tabindex="-1">
      <ul>
        <li class="support-list whatsapp-header" role="button" tabindex="0" aria-expanded="false" aria-controls="whatsapp-sublist" aria-haspopup="true">
          <i class="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp <i class="fas fa-caret-down" aria-hidden="true"></i>
        </li>
        <li>
          <ul id="whatsapp-sublist" class="support-sublist" role="list" hidden aria-hidden="true">
            ${waContacts
              .map(contact => `
              <li>
                <i class="fas fa-comments" aria-hidden="true"></i>
                <a href="https://wa.me/${contact.number}?text=${encodeURIComponent(message)}" target="_blank" rel="noopener noreferrer" class="${contact.class}" aria-label="Chat WhatsApp ${contact.label}">
                  ${contact.label}${contact.schedule ? `<br>${contact.schedule}` : ""}
                </a>
              </li>
            `).join("")}
          </ul>
        </li>
        <li role="link" class="info" tabindex="0" aria-label="Halaman Kontak dawinsight.my.id">
          <i class="fas fa-info-circle" aria-hidden="true"></i> Halaman Kontak
        </li>
        <li class="email" role="none" data-no-cf>
          <i class="fas fa-envelope" aria-hidden="true"></i>
          <a href="mailto:dwiagus976@gmail.com?subject=Halo dawinsight.my.id" aria-label="Kirim email ke dwiagus976@gmail.com">
            dwiagus976@gmail.com
          </a>
        </li>
      </ul>
    </nav>
  `;

  // Reuse event listener JS yang sudah ada
  const supportBtn = supportWrapper.querySelector(".support-btn");
  const whatsappHeader = supportWrapper.querySelector(".whatsapp-header");
  const whatsappSublist = supportWrapper.querySelector("#whatsapp-sublist");
  const kontakLi = supportWrapper.querySelector(".info");

  let isAnimatingBack = false;

  function closeSupportPanel() {
    if (isAnimatingBack) return;
    isAnimatingBack = true;
    supportWrapper.classList.add("rotating-back");
    setTimeout(() => {
      supportWrapper.classList.remove("active", "rotating-back");
      isAnimatingBack = false;
      supportBtn.setAttribute("aria-expanded", "false");
    }, 600);
  }

  supportBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (supportWrapper.classList.contains("active")) {
      closeSupportPanel();
    } else {
      supportWrapper.classList.add("active");
      supportBtn.setAttribute("aria-expanded", "true");
      whatsappHeader.focus();
    }
  });

  supportBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      supportBtn.click();
    }
  });

  document.addEventListener("click", (event) => {
    if (!supportWrapper.contains(event.target) && supportWrapper.classList.contains("active")) {
      closeSupportPanel();
    }
  });

  whatsappHeader.addEventListener("click", () => {
    const expanded = whatsappHeader.getAttribute("aria-expanded") === "true";
    const newExpanded = !expanded;
    whatsappHeader.setAttribute("aria-expanded", String(newExpanded));
    whatsappSublist.hidden = !newExpanded;
    whatsappSublist.setAttribute("aria-hidden", String(!newExpanded));
  });

  whatsappHeader.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      whatsappHeader.click();
    }
  });

  kontakLi.addEventListener("click", () => {
    window.location.href = "/kontak/";
  });

  kontakLi.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      kontakLi.click();
    }
  });
});

