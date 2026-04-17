/*
    Version: 1.24.0
    Last Modified: 2025-08-20
    Author: Maxim
    Contact: https://www.maxim.pe.kr
    License: 짤 2025 Maxim. All Rights Reserved.
*/
document.addEventListener('DOMContentLoaded', () => {

    const langSwitcher = document.getElementById('lang-switcher');
    const toTopBtn = document.getElementById('to-top-btn');
    let currentLangData = {};

    // --- Dynamic Variable Setup ---
    const dynamicVars = (() => {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        let domainInfo;

        if (hostname === 'localhost' || hostname === '127.0.0.1' || !hostname.includes('.')) {
            domainInfo = { full: hostname, apex: 'localhost', sub: '', tld: 'local', brand: 'localhost', path: '' };
        } else {
            const parts = hostname.split('.');
            const sub = parts[0];
            const tld = parts[parts.length - 1];
            const brand = parts.length > 2 ? parts[1] : 'www'; // www.sigonggan.com 媛숈? 寃쎌슦 brand瑜?sigonggan?쇰줈 ?〓룄濡??섏젙
            const apex = parts.length > 2 ? `${brand}.${tld}` : hostname;
            const cleanedPath = pathname.replace(/index\.html$/, '').replace(/\/$/, '').replace(/^\//, '');
            domainInfo = { full: hostname, apex: apex, sub: sub, tld: tld, brand: brand, path: cleanedPath };
        }
        
        return {
            domain: domainInfo.full,
            domain_apex: domainInfo.apex,
            domain_sub: domainInfo.sub,
            domain_brand: domainInfo.brand,
            domain_tld: domainInfo.tld,
            domain_path: domainInfo.path,
            year: new Date().getFullYear()
        };
    })();

    const processPlaceholders = (str) => {
        if (!str || typeof str !== 'string') return str;
        return str.replace(/\${(.*?)}/g, (match, key) => {
            const trimmedKey = key.trim();
            return dynamicVars[trimmedKey] !== undefined ? dynamicVars[trimmedKey] : match;
        });
    };

    const renderUI = (lang) => {
        if (Object.keys(currentLangData).length === 0) {
            console.error("Language data is not ready for rendering.");
            return;
        }

        const translatableElements = document.querySelectorAll('[data-lang], [data-lang-href]');
        translatableElements.forEach(el => {
            const key = el.getAttribute('data-lang');
            if (key && currentLangData[key] !== undefined) {
                const processedText = processPlaceholders(currentLangData[key]);
                if (el.classList.contains('render-as-html')) {
                    el.innerHTML = processedText;
                } else {
                    el.textContent = processedText;
                }
            }
            const hrefKey = el.getAttribute('data-lang-href');
            if (hrefKey && currentLangData[hrefKey] !== undefined) {
                const processedUrl = processPlaceholders(currentLangData[hrefKey]);
                el.setAttribute('href', processedUrl);
            }
        });

        document.documentElement.lang = lang;
    
        renderDynamicContent();
        setupAdvertisements();

        if (langSwitcher) {
            langSwitcher.querySelectorAll('button').forEach(button => {
                button.classList.toggle('active', button.getAttribute('data-lang-set') === lang);
            });
        }
    };

    const loadLanguageData = async (lang) => {
        try {
            const coreLangUrl = 'https://www.sigonggan.com/%40/page/core/v1.json';
            const userLangUrl = `./lang.json`;

            const [coreResponse, userResponse] = await Promise.all([
                fetch(coreLangUrl).catch(e => { console.error('Core language file (v1.json) failed to load.', e); return null; }),
                fetch(userLangUrl).catch(e => { console.warn(`User language file (${userLangUrl}) not found. Proceeding with core data only.`); return null; })
            ]);

            const coreData = coreResponse && coreResponse.ok ? await coreResponse.json() : {};
            const userData = userResponse && userResponse.ok ? await userResponse.json() : {};
            
            const commonDefaultData = coreData._default || {};
            const themeDefaultData = userData._default || {};
            const commonLangData = coreData[lang] || coreData['ko'] || {};
            const themeLangData = userData[lang] || userData['ko'] || {};
            
            currentLangData = { ...commonDefaultData, ...themeDefaultData, ...commonLangData, ...themeLangData };

            renderUI(lang);

        } catch (error) {
            console.error('Error loading or processing language data:', error);
        }
    };

    const renderDynamicContent = () => {
        const containers = document.querySelectorAll('[data-content-type]');
        if (!currentLangData) return;
        containers.forEach(container => {
            const contentType = container.dataset.contentType;
            const prefix = container.dataset.prefix;
            container.innerHTML = '';
            let htmlContent = '';
            for (let i = 1; i < 30; i++) {
                const itemIndex = String(i).padStart(2, '0');
                let itemHTML = '';
                switch (contentType) {
                    case 'product':
                        const productType = container.dataset.productType;
                        const labelKey = currentLangData[`${prefix}_${itemIndex}`];
                        const valueKey = currentLangData[`${prefix}_${itemIndex}_${productType}`];
                        if (labelKey && valueKey) {
                            itemHTML = `<div class="product-item"><span class="item-label">${labelKey}</span><span class="item-value">${valueKey}</span></div>`;
                        }
                        break;
                    case 'faq':
                        const qKey = currentLangData[`${prefix}_${itemIndex}_q`];
                        const aKey = currentLangData[`${prefix}_${itemIndex}_a`];
                        if (qKey && aKey) {
                            itemHTML = `<div class="faq-item"><div class="faq-question">${qKey}</div><div class="faq-answer">${aKey}</div></div>`;
                        }
                        break;
                    case 'affiliate-benefits':
                        const benefitKey = currentLangData[`${prefix}_${itemIndex}`];
                        if (benefitKey) {
                            itemHTML = `<li>${benefitKey}</li>`;
                        }
                        break;
                }
                if (itemHTML) htmlContent += itemHTML;
            }
            if (htmlContent) {
                switch (contentType) {
                    case 'affiliate-benefits':
                        container.innerHTML = `<ul class="ui-benefit-list">${htmlContent}</ul>`;
                        break;
                    default:
                        container.innerHTML = htmlContent;
                        break;
                }
            }
        });
    };
    
    const setupAdvertisements = () => {
        const adUnit = document.querySelector('ins.adsbygoogle');
        if (!adUnit) return;
        const adClient = currentLangData['ad_client_id'];
        const adSlot = currentLangData['ad_slot_id'];
        if (adClient && adSlot) {
            adUnit.setAttribute('data-ad-client', adClient);
            adUnit.setAttribute('data-ad-slot', adSlot);
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error("Adsense error:", e);
            }
        }
    };
    
    const initializeDemoLinkHandling = () => {
        if (document.getElementById('v1-demo-modal')) return;
        const modalHTML = `
            <div id="v1-demo-modal" class="v1-modal-overlay hidden">
                <div class="v1-modal-content">
                    <p id="v1-modal-text"></p>
                    <div class="v1-modal-buttons">
                        <button id="v1-modal-cancel" class="v1-modal-button v1-modal-button-cancel"></button>
                        <button id="v1-modal-confirm" class="v1-modal-button v1-modal-button-confirm"></button>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('v1-demo-modal');
        const modalText = document.getElementById('v1-modal-text');
        const confirmBtn = document.getElementById('v1-modal-confirm');
        const cancelBtn = document.getElementById('v1-modal-cancel');
        let currentUrlToOpen = null;

        const closeModal = () => modal.classList.add('hidden');
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        
        confirmBtn.addEventListener('click', () => {
            if (currentUrlToOpen) window.open(currentUrlToOpen, '_blank', 'noopener,noreferrer');
            closeModal();
        });

        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('.js-demo-link');
            if (!link) return;
            e.preventDefault();
            modalText.textContent = currentLangData['link_warning'] || 'This is sample information.';
            confirmBtn.textContent = currentLangData['link_modal_confirm'] || 'Continue';
            cancelBtn.textContent = currentLangData['link_modal_cancel'] || 'Cancel';
            currentUrlToOpen = link.href;
            modal.classList.remove('hidden');
        });
    };

    const setupSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]:not([data-lang-href])').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetElement = document.querySelector(this.getAttribute('href'));
                if(targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
            });
        });
    };

    const setupFadeInSectionObserver = () => {
        const sections = document.querySelectorAll('.fade-in-section');
        if (sections.length === 0) return;
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -150px 0px' });
        sections.forEach(section => { observer.observe(section); });
    };

    const setupToTopButton = () => {
        if (!toTopBtn) return;
        window.addEventListener('scroll', () => {
            const isVisible = window.scrollY > 300;
            toTopBtn.classList.toggle('visible', isVisible);
            toTopBtn.classList.toggle('hidden', !isVisible);
        }, { passive: true });
    };

    const setupHomeSlider = () => {
        const homeSection = document.getElementById('home');
        if (!homeSection) return;
        const slides = homeSection.querySelectorAll('.slide');
        const indicatorsContainer = homeSection.querySelector('.slide-indicators');
        if (slides.length <= 1) {
            if(slides.length === 1) slides[0].classList.add('active');
            if (indicatorsContainer) indicatorsContainer.style.display = 'none';
            return;
        }
        let currentSlideIndex = 0;
        let slideInterval;
        const showSlide = (index) => {
            slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
            if (indicatorsContainer) {
                Array.from(indicatorsContainer.children).forEach((dot, i) => dot.classList.toggle('active', i === index));
            }
            currentSlideIndex = index;
        };
        const nextSlide = () => showSlide((currentSlideIndex + 1) % slides.length);
        const startSlider = () => {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        };
        if (indicatorsContainer) {
            indicatorsContainer.innerHTML = '';
            slides.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.classList.add('indicator-dot');
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                dot.addEventListener('click', () => { showSlide(index); startSlider(); });
                indicatorsContainer.appendChild(dot);
            });
        }
        showSlide(0);
        startSlider();
    };

    const setupLightbox = () => {
        if (document.querySelector('.ui-lightbox')) return;
        const lightboxTriggers = document.querySelectorAll('.js-lightbox-trigger');
        if (lightboxTriggers.length === 0) return;
        const lightboxHTML = `<div class="ui-lightbox hidden"><div class="ui-lightbox-container"><img class="ui-lightbox-image" src="" alt="Enlarged image"><p class="ui-lightbox-caption"></p><button class="ui-lightbox-close-btn" aria-label="Close">&times;</button></div></div>`;
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        const lightbox = document.querySelector('.ui-lightbox');
        const lightboxImage = lightbox.querySelector('.ui-lightbox-image');
        const lightboxCaption = lightbox.querySelector('.ui-lightbox-caption');
        const lightboxCloseBtn = lightbox.querySelector('.ui-lightbox-close-btn');
        const openLightbox = (e) => {
            const triggerElement = e.currentTarget;
            const imageElement = triggerElement.querySelector('img');
            const card = triggerElement.closest('.ui-card');
            const imageSrc = imageElement ? imageElement.src : null;
            const captionText = card ? (card.querySelector('.ui-card-title')?.textContent || '') : '';
            if (imageSrc) {
                lightboxImage.src = imageSrc;
                lightboxCaption.textContent = captionText;
                lightbox.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        };
        const closeLightbox = () => {
            if (lightbox) {
                lightbox.classList.add('hidden');
                document.body.style.overflow = '';
                lightboxImage.src = '';
            }
        };
        lightboxTriggers.forEach(item => item.addEventListener('click', openLightbox));
        lightboxCloseBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
    };

    const setupVideoBackgrounds = () => {
        document.querySelectorAll('.section-video-bg .background-video').forEach(video => {
            video.play().catch(error => console.warn("Video autoplay was prevented:", error));
        });
    };

    const setupContentSliders = () => {
        document.querySelectorAll('.js-content-slider').forEach(slider => {
            const wrapper = slider.querySelector('.slider-wrapper');
            const prevBtn = slider.querySelector('.slider-prev');
            const nextBtn = slider.querySelector('.slider-next');
            const playPauseBtn = slider.querySelector('.slider-play-pause');
            if (!wrapper) return;

            const scrollAmount = wrapper.querySelector('.slider-item')?.offsetWidth + 30 || 330;
            let autoPlayInterval = null;
            let isPlaying = false;

            const updateNavButtons = () => {
                if (!prevBtn || !nextBtn) return;
                const isAtStart = wrapper.scrollLeft < 10;
                const isAtEnd = Math.abs(wrapper.scrollWidth - wrapper.clientWidth - wrapper.scrollLeft) < 10;
                prevBtn.classList.toggle('disabled', isAtStart);
                nextBtn.classList.toggle('disabled', isAtEnd);
            };

            const autoScroll = () => {
                if (Math.abs(wrapper.scrollWidth - wrapper.clientWidth - wrapper.scrollLeft) < 10) {
                    wrapper.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            };

            const startAutoPlay = () => {
                if (!playPauseBtn || isPlaying) return;
                clearInterval(autoPlayInterval);
                autoPlayInterval = setInterval(autoScroll, 3000);
                isPlaying = true;
                playPauseBtn.querySelector('.material-symbols-outlined').textContent = 'pause';
            };

            const stopAutoPlay = () => {
                if (!playPauseBtn || !isPlaying) return;
                clearInterval(autoPlayInterval);
                isPlaying = false;
                playPauseBtn.querySelector('.material-symbols-outlined').textContent = 'play_arrow';
            };

            if (prevBtn) prevBtn.addEventListener('click', () => wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
            if (nextBtn) nextBtn.addEventListener('click', () => wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
            
            if (playPauseBtn) {
                playPauseBtn.addEventListener('click', () => {
                    if (isPlaying) {
                        stopAutoPlay();
                    } else {
                        startAutoPlay();
                    }
                });
                slider.addEventListener('mouseenter', stopAutoPlay);
                slider.addEventListener('mouseleave', startAutoPlay);
            }

            wrapper.addEventListener('scroll', updateNavButtons, { passive: true });
            wrapper.addEventListener('focusin', stopAutoPlay);
            wrapper.addEventListener('focusout', startAutoPlay);

            updateNavButtons();
        });
    };

    const setupCanvasEffects = () => {
        const homeHeader = document.getElementById('home');
        if (!homeHeader) return;
    
        const canvas = homeHeader.querySelector('canvas');
        if (!canvas) return;
    
        const ctx = canvas.getContext('2d');
        let animationFrameId;
    
        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = homeHeader.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };
    
        const handleResize = () => {
            cancelAnimationFrame(animationFrameId);
            resizeCanvas();
            if (canvas.classList.contains('canvas-stars')) {
                initStars();
                animateStars();
            } else if (canvas.classList.contains('canvas-wave')) {
                initWaves();
                animateWave();
            }
        };
        
        let stars;
        const initStars = () => {
            stars = [];
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            const starCount = Math.floor((w * h) / 10000);
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    radius: Math.random() * 2 + 0.5,
                    alpha: 0.5 + Math.random() * 0.4,
                    speed: Math.random() * 0.2 + 0.05
                });
            }
        };
    
        const animateStars = () => {
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            stars.forEach(star => {
                star.y -= star.speed;
                if (star.y < 0) {
                    star.y = h;
                    star.x = Math.random() * w;
                }
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();
            });
            animationFrameId = requestAnimationFrame(animateStars);
        };
    
        let frame = 0;
        let waves = [];
        const waveColors = [
            'rgba(255, 255, 255, 0.8)',
            'rgba(255, 255, 255, 0.6)',
            'rgba(255, 255, 255, 0.4)',
            'rgba(255, 255, 255, 0.2)'
        ];

        const initWaves = () => {
            waves = [];
            const h = canvas.height / (window.devicePixelRatio || 1);
            waves.push(
                { y: h * 0.45, amplitude: 30, length: 0.015, speed: 0.02, color: waveColors[0] },
                { y: h * 0.50, amplitude: 40, length: 0.01, speed: -0.025, color: waveColors[1] },
                { y: h * 0.55, amplitude: 20, length: 0.018, speed: 0.03, color: waveColors[2] },
                { y: h * 0.60, amplitude: 25, length: 0.02, speed: -0.015, color: waveColors[3] }
            );
        };

        const animateWave = () => {
            const w = canvas.width / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, canvas.height / (window.devicePixelRatio || 1));
            
            waves.forEach(wave => {
                ctx.beginPath();
                ctx.moveTo(0, wave.y);
                for (let x = 0; x < w; x++) {
                    const y = wave.y + Math.sin(x * wave.length + frame * wave.speed) * wave.amplitude * Math.sin(frame * 0.012);
                    ctx.lineTo(x, y);
                }
                ctx.strokeStyle = wave.color;
                ctx.lineWidth = 2;
                ctx.stroke();
            });

            frame++;
            animationFrameId = requestAnimationFrame(animateWave);
        };
    
        if (canvas.classList.contains('canvas-stars')) {
            resizeCanvas();
            initStars();
            animateStars();
            window.addEventListener('resize', handleResize);
        } else if (canvas.classList.contains('canvas-wave')) {
            resizeCanvas();
            initWaves();
            animateWave();
            window.addEventListener('resize', handleResize);
        }
    };

    const setupContentParallax = () => {
        const content = document.querySelector('.js-parallax-content');
        if (!content) return;
        const homeSection = document.getElementById('home');
        if (!homeSection) return;
        const onMove = (e) => {
            const x = (e.touches ? e.touches[0].clientX : e.clientX);
            const y = (e.touches ? e.touches[0].clientY : e.clientY);
            const moveX = (x - window.innerWidth / 2) / 50;
            const moveY = (y - window.innerHeight / 2) / 50;
            content.style.transform = `translate(${moveX}px, ${moveY}px)`;
        };
        const onLeave = () => content.style.transform = '';
        homeSection.addEventListener('mousemove', onMove);
        homeSection.addEventListener('mouseout', onLeave);
        homeSection.addEventListener('touchstart', onMove, { passive: true });
        homeSection.addEventListener('touchmove', onMove, { passive: true });
        homeSection.addEventListener('touchend', onLeave);
    };

    const setupImageParallax = () => {
        const slideImages = document.querySelectorAll('#home .slide img');
        if (slideImages.length === 0) return;
        window.addEventListener('scroll', () => {
            if (window.scrollY < window.innerHeight) {
                slideImages.forEach(img => img.style.transform = `translateY(${window.scrollY * 0.5}px)`);
            }
        }, { passive: true });
    };

    // --- Application Initialization ---
    const init = async () => {
        const savedLang = localStorage.getItem('preferredLanguage');
        const browserLang = navigator.language.split('-')[0];
        const initialLang = savedLang || (['ko', 'en', 'vi'].includes(browserLang) ? browserLang : 'ko');
        
        await loadLanguageData(initialLang);

        if (langSwitcher) {
            langSwitcher.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    const selectedLang = e.target.getAttribute('data-lang-set');
                    localStorage.setItem('preferredLanguage', selectedLang);
                    loadLanguageData(selectedLang);
                }
            });
        }

        initializeDemoLinkHandling();
        setupSmoothScroll();
        setupFadeInSectionObserver();
        setupToTopButton();
        setupHomeSlider();
        setupLightbox();
        setupVideoBackgrounds();
        setupContentSliders();
        setupCanvasEffects();
        setupContentParallax();
        setupImageParallax();
    };

    init();
});
