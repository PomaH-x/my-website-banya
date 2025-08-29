// ===== UTILITY FUNCTIONS =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const throttle = (func, delay) => {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
        const currentTime = Date.now();
        
        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
};

// ===== SMOOTH SCROLL =====
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        $$('a[href^="#"]').forEach(link => {
            link.addEventListener('click', this.handleClick.bind(this));
        });
    }

    handleClick(e) {
        e.preventDefault();
        const target = $(e.target.getAttribute('href'));
        
        if (target) {
            const headerHeight = $('#header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// ===== HEADER SCROLL BEHAVIOR =====
class HeaderScroll {
    constructor() {
        this.header = $('#header');
        this.init();
    }

    init() {
        window.addEventListener('scroll', throttle(this.handleScroll.bind(this), 10));
    }

    handleScroll() {
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
    }
}

// ===== MOBILE MENU =====
class MobileMenu {
    constructor() {
        this.toggle = $('#mobile-menu-toggle');
        this.menu = $('#mobile-menu');
        this.links = $$('.mobile-nav__link');
        this.isOpen = false;
        this.init();
    }

    init() {
        this.toggle.addEventListener('click', this.toggleMenu.bind(this));
        this.links.forEach(link => {
            link.addEventListener('click', this.closeMenu.bind(this));
        });
        
        // Кнопка закрытия
        const closeBtn = $('#mobile-menu-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', this.closeMenu.bind(this));
        }
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.menu.contains(e.target) && !this.toggle.contains(e.target)) {
                this.closeMenu();
            }
        });
        
        // Закрытие меню при изменении размера экрана
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        this.menu.classList.add('active');
        this.toggle.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
    }

    closeMenu() {
        this.menu.classList.remove('active');
        this.toggle.classList.remove('active');
        document.body.style.overflow = '';
        this.isOpen = false;
    }
}

// ===== FAQ ACCORDION =====
class FAQ {
    constructor() {
        this.items = $$('.faq__item');
        this.init();
    }

    init() {
        this.items.forEach(item => {
            const question = item.querySelector('.faq__question');
            question.addEventListener('click', () => this.toggleItem(item));
        });
    }

    toggleItem(item) {
        const isActive = item.classList.contains('active');
        const question = item.querySelector('.faq__question');
        
        // Закрываем все остальные элементы
        this.items.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
            }
        });
        
        // Переключаем текущий элемент
        if (isActive) {
            item.classList.remove('active');
            question.setAttribute('aria-expanded', 'false');
        } else {
            item.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
        }
    }
}

// ===== REVIEWS SLIDER =====
class ReviewsSlider {
    constructor(selector) {
        this.slider = $(selector);
        if (!this.slider) return;
        
        this.slides = this.slider.querySelectorAll('.review');
        this.prevBtn = this.slider.querySelector('.reviews-slider__btn--prev');
        this.nextBtn = this.slider.querySelector('.reviews-slider__btn--next');
        this.currentSlide = 0;
        this.autoplayInterval = null;
        this.init();
    }

    init() {
        if (this.slides.length === 0) return;
        
        this.createSliderTrack();
        this.showSlide(0);
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', this.prevSlide.bind(this));
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', this.nextSlide.bind(this));
        }
        
        // Мобильные кнопки
        this.createMobileNavigation();
        
        // Не запускаем autoplay
        // this.startAutoplay();
    }

    createSliderTrack() {
        const container = this.slider.querySelector('.reviews-slider__container');
        const track = document.createElement('div');
        track.className = 'reviews-slider__track';
        
        this.slides.forEach(slide => {
            track.appendChild(slide);
        });
        
        container.innerHTML = '';
        container.appendChild(track);
        this.track = track;
    }
    
    createMobileNavigation() {
        // Удаляем существующую навигацию если есть
        const existingNav = this.slider.querySelector('.reviews-slider__mobile-nav');
        if (existingNav) {
            existingNav.remove();
        }
        
        if (window.innerWidth <= 768) {
            const mobileNav = document.createElement('div');
            mobileNav.className = 'reviews-slider__mobile-nav';
            
            const prevBtn = document.createElement('button');
            prevBtn.className = 'reviews-slider__mobile-btn reviews-slider__mobile-btn--prev';
            prevBtn.innerHTML = '‹';
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevSlide();
            });
            
            const nextBtn = document.createElement('button');
            nextBtn.className = 'reviews-slider__mobile-btn reviews-slider__mobile-btn--next';
            nextBtn.innerHTML = '›';
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextSlide();
            });
            
            mobileNav.appendChild(prevBtn);
            mobileNav.appendChild(nextBtn);
            
            this.slider.appendChild(mobileNav);
        }
    }
    
    showSlide(index) {
        // Убеждаемся что индекс в пределах массива
        if (index < 0) index = this.slides.length - 1;
        if (index >= this.slides.length) index = 0;
        
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        if (this.track) {
            const translateX = -index * 100;
            this.track.style.transform = `translateX(${translateX}%)`;
            
            // Принудительно запускаем reflow для гарантированной анимации
            this.track.offsetHeight;
        }
        
        this.currentSlide = index;
    }

    nextSlide() {
        const next = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(next);
        
        // Добавляем тактильную обратную связь на мобильных
        if ('vibrate' in navigator && window.innerWidth <= 768) {
            navigator.vibrate(50);
        }
    }

    prevSlide() {
        const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prev);
        
        // Добавляем тактильную обратную связь на мобильных
        if ('vibrate' in navigator && window.innerWidth <= 768) {
            navigator.vibrate(50);
        }
    }

    startAutoplay() {
        // Отключаем autoplay по требованию
        // this.stopAutoplay();
        // this.autoplayInterval = setInterval(this.nextSlide.bind(this), 5000);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
}

// ===== GALLERY & LIGHTBOX =====
class Gallery {
    constructor() {
        this.galleries = $$('.gallery');
        this.lightbox = $('#lightbox');
        this.lightboxImg = $('.lightbox__image');
        this.lightboxClose = $('.lightbox__close');
        this.lightboxPrev = $('.lightbox__nav--prev');
        this.lightboxNext = $('.lightbox__nav--next');
        this.currentImages = [];
        this.currentIndex = 0;
        this.init();
    }

    init() {
        this.galleries.forEach(gallery => {
            const items = gallery.querySelectorAll('.gallery__item');
            items.forEach((item, index) => {
                item.addEventListener('click', () => {
                    this.openLightbox(gallery, index);
                });
            });
        });

        if (this.lightboxClose) {
            this.lightboxClose.addEventListener('click', this.closeLightbox.bind(this));
        }
        
        if (this.lightboxPrev) {
            this.lightboxPrev.addEventListener('click', this.prevImage.bind(this));
        }
        
        if (this.lightboxNext) {
            this.lightboxNext.addEventListener('click', this.nextImage.bind(this));
        }

        // Закрытие по клику на overlay и вне изображения
        if (this.lightbox) {
            this.lightbox.addEventListener('click', (e) => {
                if (e.target === this.lightbox || e.target.classList.contains('lightbox__overlay') || e.target.classList.contains('lightbox__content')) {
                    this.closeLightbox();
                }
            });
        }

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.lightbox.classList.contains('active')) {
                this.closeLightbox();
            }
            if (e.key === 'ArrowLeft' && this.lightbox.classList.contains('active')) {
                this.prevImage();
            }
            if (e.key === 'ArrowRight' && this.lightbox.classList.contains('active')) {
                this.nextImage();
            }
        });
    }

    openLightbox(gallery, index) {
        const items = gallery.querySelectorAll('.gallery__item');
        this.currentImages = Array.from(items).map(item => item.dataset.src || item.querySelector('img').src);
        this.currentIndex = index;
        
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Небольшая задержка для плавного появления
        setTimeout(() => {
            this.showImage();
        }, 50);
    }

    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
        
        // Сбрасываем изображение
        if (this.lightboxImg) {
            this.lightboxImg.style.opacity = '0';
            this.lightboxImg.style.transform = 'scale(0.8)';
        }
    }

    showImage() {
        if (this.lightboxImg && this.currentImages[this.currentIndex]) {
            this.lightboxImg.src = this.currentImages[this.currentIndex];
        }
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.currentImages.length;
        this.showImage();
    }

    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.currentImages.length) % this.currentImages.length;
        this.showImage();
    }
}

// ===== MAP LOADER =====
class MapLoader {
    constructor() {
        this.mapButtons = $$('.map-load-btn');
        this.init();
    }

    init() {
        this.mapButtons.forEach(btn => {
            btn.addEventListener('click', this.loadMap.bind(this));
        });
    }

    loadMap(e) {
        const button = e.target;
        const placeholder = button.closest('.map-placeholder');
        const address = button.dataset.address;
        
        if (!placeholder || !address) return;

        // Показываем загрузку
        button.textContent = 'Загрузка...';
        button.disabled = true;

        // Создаем iframe с Яндекс.Картами
        const iframe = document.createElement('iframe');
        iframe.src = `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(address)}&z=16`;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '16px';
        iframe.loading = 'lazy';

        // Заменяем содержимое placeholder на iframe
        placeholder.innerHTML = '';
        placeholder.appendChild(iframe);

        // Добавляем обработчик загрузки
        iframe.onload = () => {
            placeholder.style.opacity = '1';
        };
    }
}

// ===== LAZY LOADING =====
class LazyLoader {
    constructor() {
        this.images = $$('img[loading="lazy"]');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
                rootMargin: '50px'
            });

            this.images.forEach(img => {
                this.observer.observe(img);
            });
        } else {
            // Fallback для старых браузеров
            this.images.forEach(img => {
                this.loadImage(img);
            });
        }
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    loadImage(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
    }
}

// ===== ANIMATIONS ON SCROLL =====
class ScrollAnimations {
    constructor() {
        this.elements = $$('.advantage-card, .fact, .object__section');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
                threshold: 0.1,
                rootMargin: '-50px'
            });

            this.elements.forEach(el => {
                this.observer.observe(el);
            });
        }
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// ===== PHONE CLICK TRACKING =====
class PhoneTracker {
    constructor() {
        this.phoneLinks = $$('a[href^="tel:"]');
        this.init();
    }

    init() {
        this.phoneLinks.forEach(link => {
            link.addEventListener('click', this.trackCall.bind(this));
        });
    }

    trackCall(e) {
        const phone = e.target.closest('a').href.replace('tel:', '');
        
        // Здесь можно добавить аналитику
        if (typeof gtag !== 'undefined') {
            gtag('event', 'phone_call', {
                phone_number: phone,
                event_category: 'contact',
                event_label: 'phone_click'
            });
        }
        
        console.log('Phone call tracked:', phone);
    }
}

// ===== FORM VALIDATION (если понадобится) =====
class FormValidator {
    constructor(form) {
        this.form = form;
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this));
            input.addEventListener('input', this.clearError.bind(this));
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const isValid = this.validateForm();
        
        if (isValid) {
            this.submitForm();
        }
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField({ target: input })) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        const type = field.type;
        
        this.clearError(e);
        
        if (field.hasAttribute('required') && !value) {
            this.showError(field, 'Это поле обязательно для заполнения');
            return false;
        }
        
        if (type === 'email' && value && !this.isValidEmail(value)) {
            this.showError(field, 'Введите корректный email');
            return false;
        }
        
        if (type === 'tel' && value && !this.isValidPhone(value)) {
            this.showError(field, 'Введите корректный номер телефона');
            return false;
        }
        
        return true;
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isValidPhone(phone) {
        const re = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return re.test(phone);
    }

    showError(field, message) {
        field.classList.add('error');
        
        let errorDiv = field.parentNode.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            field.parentNode.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
    }

    clearError(e) {
        const field = e.target;
        field.classList.remove('error');
        
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    async submitForm() {
        // Здесь логика отправки формы
        console.log('Form submitted');
    }
}

// ===== PERFORMANCE MONITORING =====
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        // Мониторинг загрузки страницы
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);
                
                // Отправка метрики в аналитику
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'timing_complete', {
                        name: 'load',
                        value: loadTime
                    });
                }
            }
        });

        // Мониторинг ошибок
        window.addEventListener('error', (e) => {
            console.error('JavaScript error:', e.error);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exception', {
                    description: e.message,
                    fatal: false
                });
            }
        });
    }
}

// ===== INITIALIZATION =====
class App {
    constructor() {
        this.init();
    }

    init() {
        // Ждем полной загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.initComponents.bind(this));
        } else {
            this.initComponents();
        }
    }

    initComponents() {
        // Инициализируем все компоненты
        new SmoothScroll();
        new HeaderScroll();
        new MobileMenu();
        new FAQ();
        new Gallery();
        new MapLoader();
        new LazyLoader();
        new ScrollAnimations();
        new PhoneTracker();
        new PerformanceMonitor();

        // Инициализируем слайдеры отзывов для каждого объекта
        new ReviewsSlider('[data-slider="sadovaya"]');
        new ReviewsSlider('[data-slider="dubinka"]');
        new ReviewsSlider('[data-slider="prachechnaya"]');

        // Инициализируем формы (если есть)
        const forms = $$('form');
        forms.forEach(form => new FormValidator(form));
        
        // Инициализируем AOS
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: 100
            });
        }
        
        // Обработка изменения размера экрана для мобильных кнопок
        window.addEventListener('resize', throttle(() => {
            // Обновляем мобильную навигацию при изменении размера экрана
            const sliders = $$('.reviews-slider');
            sliders.forEach(sliderElement => {
                const dataSlider = sliderElement.getAttribute('data-slider');
                if (dataSlider) {
                    // Создаем новый экземпляр для обновления мобильной навигации
                    new ReviewsSlider(`[data-slider="${dataSlider}"]`);
                }
            });
        }, 250));

        console.log('App initialized successfully');
    }
}

// Запускаем приложение
new App();

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SmoothScroll,
        HeaderScroll,
        MobileMenu,
        FAQ,
        ReviewsSlider,
        Gallery,
        MapLoader,
        LazyLoader,
        ScrollAnimations,
        PhoneTracker,
        FormValidator,
        PerformanceMonitor,
        App
    };
}
