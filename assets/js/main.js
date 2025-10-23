// Utilidades para el sitio estilo presentación futbolera.
const images = [
    'assets/img/slide1.jpg',
    'assets/img/slide2.jpg',
    'assets/img/slide3.jpg',
    'assets/img/slide4.jpg',
    'assets/img/slide5.jpg'
];

let currentIndex = 0;
let intervalId = null;
let imageElement = null;
let dots = [];

/** Pre-carga básica de imágenes */
const preloadImages = (paths) => {
    paths.forEach((path) => {
        const img = new Image();
        img.src = path;
    });
};

/** Obtiene el siguiente índice circular */
const getNextIndex = (index, step = 1) => {
    return (index + step + images.length) % images.length;
};

/** Cambia la imagen mostrada */
const showImage = (index) => {
    if (!imageElement) return;

    currentIndex = index;
    const nextSrc = images[currentIndex];

    // Agregamos manejadores de eventos por cada cambio.
    imageElement.onload = () => {
        imageElement.classList.remove('is-loading');
    };

    imageElement.onerror = () => {
        console.warn(`No se pudo cargar ${nextSrc}, avanzando a la siguiente.`);
        // Evitamos bucles infinitos en caso de que todas fallen.
        const nextIndex = getNextIndex(currentIndex, 1);
        if (nextIndex !== currentIndex) {
            showImage(nextIndex);
        }
    };

    requestAnimationFrame(() => {
        imageElement.classList.add('is-loading');
        imageElement.setAttribute('src', nextSrc);
        updateDots(currentIndex);
    });
};

/** Actualiza los indicadores del carrusel */
const updateDots = (activeIndex) => {
    dots.forEach((dot, idx) => {
        const isActive = idx === activeIndex;
        dot.setAttribute('aria-selected', String(isActive));
        dot.setAttribute('tabindex', isActive ? '0' : '-1');
    });
};

/** Avanza a la siguiente diapositiva */
const nextSlide = () => {
    showImage(getNextIndex(currentIndex, 1));
};

/** Retrocede a la diapositiva anterior */
const prevSlide = () => {
    showImage(getNextIndex(currentIndex, -1));
};

/** Inicia el temporizador automático si no existe */
const startAutoRotate = () => {
    if (intervalId) return;
    intervalId = window.setInterval(() => {
        nextSlide();
    }, 5000);
};

/** Reinicia el temporizador para mantener el ritmo */
const restartAutoRotate = () => {
    if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
    }
    startAutoRotate();
};

/** Prepara el carrusel cuando la página está lista */
const initCarousel = () => {
    imageElement = document.querySelector('.carousel__image');
    const dotsContainer = document.querySelector('.carousel__dots');
    const prevButton = document.querySelector('.carousel__button--prev');
    const nextButton = document.querySelector('.carousel__button--next');

    if (!imageElement || !dotsContainer || !prevButton || !nextButton) {
        return;
    }

    preloadImages(images);

    dots = images.map((_, idx) => {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot';
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Ir a la diapositiva ${idx + 1}`);
        dot.setAttribute('aria-selected', String(idx === currentIndex));
        dot.setAttribute('tabindex', idx === currentIndex ? '0' : '-1');
        dot.addEventListener('click', () => {
            showImage(idx);
            restartAutoRotate();
        });
        dotsContainer.appendChild(dot);
        return dot;
    });

    prevButton.addEventListener('click', () => {
        prevSlide();
        restartAutoRotate();
    });

    nextButton.addEventListener('click', () => {
        nextSlide();
        restartAutoRotate();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            restartAutoRotate();
        }
    });

    window.addEventListener('beforeunload', () => {
        if (intervalId) {
            window.clearInterval(intervalId);
            intervalId = null;
        }
    });

    updateDots(currentIndex);
    startAutoRotate();
};

// Inicialización general
window.addEventListener('DOMContentLoaded', () => {
    const isSlidesPage = document.body.classList.contains('slides-body');
    if (isSlidesPage) {
        initCarousel();
    }
});
