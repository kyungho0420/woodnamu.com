/**
 * Woodnamu - Page Refactoring V4
 * Design Theme: Modern Minimal Matte
 */
const siteConfig = {
    meta: {
        framework: 'V4',
        type: 'page',
        mode: 'demo',
        lang: 'ko',
        theme: 'dark', // Forced Dark for Matte feel
        scroll_smooth: true
    },
    api: {
        server: 'provider',
        base_url: 'https://dev.dam.so'
    },
    canvas: {
        target: '#home',
        effect: 'waveEffect',
        overlay: 'dotted'
    },
    buttons: [
        { name: 'Request', icon: 'auto_awesome', url: '#request' }
    ]
};

// [Tier 3] Custom Effect: Wave (Legacy Port)
window.waveEffect = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    frame: 0,
    waves: [],
    animationFrameId: null,
    colors: [
        'rgba(212, 175, 55, 0.4)',  /* Champagne Gold Subtle */
        'rgba(212, 175, 55, 0.2)',
        'rgba(255, 255, 255, 0.1)',
        'rgba(255, 255, 255, 0.05)'
    ],

    init(container) {
        this.container = container;
        this.canvas = container.querySelector('.damso-canvas__effect');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'damso-canvas__effect';
            container.appendChild(this.canvas);
        }
        this.ctx = this.canvas.getContext('2d');

        this.resize = this.resize.bind(this);
        this.animate = this.animate.bind(this);

        window.addEventListener('resize', this.resize);
        this.resize();
        this.initWaves();
        this.animate();
    },

    resize() {
        if (!this.container) return;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
    },

    initWaves() {
        this.waves = [];
        const h = this.height;
        this.waves.push(
            { y: h * 0.45, amplitude: 20, length: 0.01, speed: 0.01, color: this.colors[0] },
            { y: h * 0.50, amplitude: 25, length: 0.008, speed: -0.015, color: this.colors[1] },
            { y: h * 0.55, amplitude: 15, length: 0.012, speed: 0.02, color: this.colors[2] },
            { y: h * 0.60, amplitude: 10, length: 0.015, speed: -0.01, color: this.colors[3] }
        );
    },

    animate() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.waves.forEach(wave => {
            this.ctx.beginPath();
            this.ctx.moveTo(0, wave.y);
            for (let x = 0; x < this.width; x++) {
                const y = wave.y + Math.sin(x * wave.length + this.frame * wave.speed) * wave.amplitude * Math.sin(this.frame * 0.008);
                this.ctx.lineTo(x, y);
            }
            this.ctx.strokeStyle = wave.color;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });

        this.frame++;
        this.animationFrameId = requestAnimationFrame(this.animate);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.V4) {
        window.V4.init(siteConfig).then(async (app) => {
            app.registerEffect('waveEffect', window.waveEffect);
            
            // ?덉젙?곸씤 ?띿뒪???뚮뜑留곸쓣 ?꾪빐 Data.load ?섎룞 ?뺤씤 諛??ъ쟻??(?듭뀡)
            const currentLang = document.documentElement.lang || 'ko';
            await app.Data.load(currentLang);
            
            console.log('Woodnamu V4 Refactored Initialized');
        });
    }
});

