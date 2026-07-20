// =========================
// DATA NAVIGASI HEADER
// =========================
export const menuData = [
  { href: "/", text: "Home", icon: "fas fa-home" },

  {
    text: "Tentang",
    href: "/tentang/",
    icon: "fas fa-user",
    dropdown: [
      { href: "/tentang/", text: "Tentang Saya", icon: "fas fa-user-circle", isParent: true },
      { href: "/tentang/biografi/", text: "Biografi & Pendidikan", icon: "fas fa-book" },
      { href: "/tentang/organisasi/", text: "Organisasi & Pengalaman", icon: "fas fa-briefcase" }
    ]
  },

  {
    text: "Artikel",
    href: "/artikel/",
    icon: "fas fa-newspaper",
    dropdown: [
      { href: "/artikel/", text: "Semua Artikel", icon: "fas fa-pen-fancy", isParent: true },
      { href: "/artikel/islami/", text: "Islami", icon: "fas fa-mosque" },
      { href: "/artikel/sosial/", text: "Sosial", icon: "fas fa-people-arrows" },
      { href: "/artikel/politik/", text: "Politik", icon: "fas fa-landmark" },
      { href: "/artikel/pemikiran/", text: "Pemikiran", icon: "fas fa-lightbulb" }
    ]
  },

  {
    text: "Portofolio",
    href: "/portofolio/",
    icon: "fas fa-briefcase",
    dropdown: [
      { href: "/portofolio/", text: "Portofolio", icon: "fas fa-th", isParent: true },
      { href: "/portofolio/karya-tulis/", text: "Karya Tulis", icon: "fas fa-pen" },
      { href: "/portofolio/akademik/", text: "Akademik & Workshop", icon: "fas fa-chalkboard-user" },
      { href: "/portofolio/organisasi/", text: "Organisasi", icon: "fas fa-sitemap" },
      { href: "/portofolio/sertifikasi/", text: "Sertifikasi", icon: "fas fa-certificate" }
    ]
  },

  { href: "/ebook/", text: "E-Book", icon: "fas fa-book-open" },

  { href: "/kontak/", text: "Kontak", icon: "fas fa-envelope" }
];


// =========================
// DATA QUICK LINKS FOOTER
// =========================
export const quickLinksData = [
  { href: "/", text: "Home" },
  { href: "/tentang/", text: "Tentang" },
  { href: "/artikel/", text: "Artikel" },
  { href: "/portofolio/", text: "Portofolio" }
];


// =========================
// DATA LAYANAN UTAMA FOOTER (untuk kompatibilitas)
// =========================
export const mainServicesData = [
  { href: "/portofolio/karya-tulis/", text: "Karya Tulis" },
  { href: "/artikel/islami/", text: "Agama" },
  { href: "/artikel/sosial/", text: "Sosial" },
  { href: "/artikel/politik/", text: "Politik" },
  { href: "/artikel/pemikiran/", text: "Pemikiran" }
];


// =========================
// DATA SOSIAL MEDIA FOOTER
// =========================
export const footerSocialData = [
  { href: "https://www.instagram.com/dwisunyi", ariaLabel: "Instagram", icon: "fab fa-instagram" },
  { href: "https://wa.me/6287818888003", ariaLabel: "WhatsApp", icon: "fab fa-whatsapp" },
  { href: "mailto:dwiagus976@gmail.com", ariaLabel: "Email", icon: "fas fa-envelope" },
  { href: "https://www.linkedin.com/in/dwiagus", ariaLabel: "LinkedIn", icon: "fab fa-linkedin-in" }
];


// =========================
// DATA KONTAK FOOTER
// =========================
export const footerContactData = [
  {
    icon: "fas fa-map-marker-alt",
    text: "Surabaya, Indonesia"
  },
  {
    icon: "fas fa-phone-alt",
    text: "<a href=\"tel:+62-878-1888-8003\" class=\"footer-kontak-link\">+62 878-1888-8003</a>"
  },
  {
    icon: "fas fa-envelope",
    text: "<a href=\"mailto:dwiagus976@gmail.com\" class=\"footer-kontak-link\">dwiagus976@gmail.com</a>"
  },
  {
    icon: "fas fa-clock",
    text: "Senin - Jumat: 09.00 - 17.00 WIB"
  }
];


// =========================
// DATA ARTIKEL CAROUSEL FOOTER
// =========================
export const artikelCarouselData = [
  // Islami
  { 
    title: "Islam dan Kedamaian", 
    category: "Islami", 
    href: "/artikel/islami/islam-dan-kedamaian.html",
    image: "/assets/img/artikel/islami/islam-dan-kedamaian.webp"
  },
  { 
    title: "Pluralisme Agama", 
    category: "Islami", 
    href: "/artikel/islami/pluralisme-agama.html",
    image: "/assets/img/artikel/islami/pluralisme-agama.webp"
  },
  { 
    title: "Spiritualitas Sosial di Tengah Krisis", 
    category: "Islami", 
    href: "/artikel/islami/spiritualitas-sosial-di-tengah-krisis.html",
    image: "/assets/img/artikel/islami/spiritualitas-sosial-di-tengah-krisis.webp"
  },
  { 
    title: "Sufisme: Spiritualitas Kontemporer", 
    category: "Islami", 
    href: "/artikel/islami/sufisme-spiritualitas-kontemporer.html",
    image: "/assets/img/artikel/islami/sufisme-spiritualitas-kontemporer.webp"
  },
  
  // Pemikiran
  { 
    title: "Ekologis Filosofi", 
    category: "Pemikiran", 
    href: "/artikel/pemikiran/ekologis-filosofi.html",
    image: "/assets/img/artikel/pemikiran/ekologis-filosofi.webp"
  },
  { 
    title: "Etika Kontemporer", 
    category: "Pemikiran", 
    href: "/artikel/pemikiran/etika-kontemporer.html",
    image: "/assets/img/artikel/pemikiran/etika-kontemporer.webp"
  },
  { 
    title: "Feminisme dan Kesetaraan Gender", 
    category: "Pemikiran", 
    href: "/artikel/pemikiran/feminisme-kesetaraan-gender.html",
    image: "/assets/img/artikel/pemikiran/feminisme-kesetaraan-gender.webp"
  },
  { 
    title: "Filsafat Existensialisme", 
    category: "Pemikiran", 
    href: "/artikel/pemikiran/filsafat-existensialisme.html",
    image: "/assets/img/artikel/pemikiran/filsafat-existensialisme.webp"
  },
  { 
    title: "Identitas Diri", 
    category: "Pemikiran", 
    href: "/artikel/pemikiran/identitas-diri.html",
    image: "/assets/img/artikel/pemikiran/identitas-diri.webp"
  },
  { 
    title: "Kesadaran Kolektif", 
    category: "Pemikiran", 
    href: "/artikel/pemikiran/kesadaran-kolektif.html",
    image: "/assets/img/artikel/pemikiran/kesadaran-kolektif.webp"
  },
  { 
    title: "Transhumanisme dan Teknologi", 
    category: "Pemikiran", 
    href: "/artikel/pemikiran/transhumanisme-teknologi.html",
    image: "/assets/img/artikel/pemikiran/transhumanisme-teknologi.webp"
  },
  
  // Sosial
  { 
    title: "Aktivisme Pemuda", 
    category: "Sosial", 
    href: "/artikel/sosial/aktivisme-pemuda.html",
    image: "/assets/img/artikel/sosial/aktivisme-pemuda.webp"
  },
  { 
    title: "Ekonomi Sirkular", 
    category: "Sosial", 
    href: "/artikel/sosial/ekonomi-sirkular.html",
    image: "/assets/img/artikel/sosial/ekonomi-sirkular.webp"
  },
  { 
    title: "Kesenjangan Ekonomi", 
    category: "Sosial", 
    href: "/artikel/sosial/kesenjangan-ekonomi.html",
    image: "/assets/img/artikel/sosial/kesenjangan-ekonomi.webp"
  },
  { 
    title: "Kritik Sosial", 
    category: "Sosial", 
    href: "/artikel/sosial/kritik-sosial.html",
    image: "/assets/img/artikel/sosial/kritik-sosial.webp"
  },
  { 
    title: "Migrasi dan Budaya", 
    category: "Sosial", 
    href: "/artikel/sosial/migrasi-budaya.html",
    image: "/assets/img/artikel/sosial/migrasi-budaya.webp"
  }
];

