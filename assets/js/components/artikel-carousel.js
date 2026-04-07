import { artikelCarouselData } from '../config.js';

export function initArtikelCarousel() {
  const carousel = document.querySelector('.artikel-carousel');
  if (!carousel) return;

  const slidesContainer = carousel.querySelector('.carousel-slides');
  let currentSlide = 0;
  let autoplayInterval;

  // Create slides from data
  artikelCarouselData.forEach((artikel, index) => {
    const slide = document.createElement('div');
    slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
    slide.innerHTML = `
      <img src="${artikel.image}" alt="${artikel.title}" class="carousel-slide-image" loading="lazy">
      <div class="carousel-slide-overlay"></div>
      <div class="carousel-slide-content">
        <div class="carousel-slide-category">${artikel.category}</div>
        <h3 class="carousel-slide-title">${artikel.title}</h3>
        <a href="${artikel.href}" class="carousel-slide-link">Baca Selengkapnya</a>
      </div>
    `;
    slidesContainer.appendChild(slide);
  });

  // Create dots
  const controlsContainer = carousel.querySelector('.carousel-controls');
  artikelCarouselData.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
    dot.setAttribute('data-slide', index);
    dot.addEventListener('click', () => goToSlide(index));
    controlsContainer.appendChild(dot);
  });

  const slides = slidesContainer.querySelectorAll('.carousel-slide');
  const dots = controlsContainer.querySelectorAll('.carousel-dot');

  function showSlide(n) {
    slides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev');
      if (index < n) {
        slide.classList.add('prev');
      }
    });

    slides[n].classList.add('active');

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === n);
    });

    currentSlide = n;
  }

  function nextSlide() {
    const n = (currentSlide + 1) % slides.length;
    showSlide(n);
  }

  function goToSlide(n) {
    showSlide(n);
    resetAutoplay();
  }

  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
  }

  // Start autoplay
  startAutoplay();

  // Pause on hover
  carousel.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
  carousel.addEventListener('mouseleave', startAutoplay);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') {
      const n = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(n);
    }
  });
}
