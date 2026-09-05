(function () {
    let html = document.documentElement;
    let btn = document.getElementById('themeToggle');

    function apply(t) {
        html.setAttribute('data-theme', t);
        try {
            localStorage.setItem('theme', t);
        } catch (e) { }
    }
    btn.addEventListener('click', function () {
        apply(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
    try {
        let saved = localStorage.getItem('theme');
        if (saved) html.setAttribute('data-theme', saved);
    } catch (e) { }
})();

let form = document.getElementById('contactForm');
let success = document.getElementById('successBox');
form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    let btn = form.querySelector('button[type="submit"]');
    let original = btn.textContent;
    btn.textContent = 'sending...';
    btn.disabled = true;
    fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(function (r) {
            if (r.ok) {
                form.style.display = 'none';
                success.classList.add('show');
            } else {
                btn.textContent = original;
                btn.disabled = false;
                alert('There was an error while send the message. Try again later.');
            }
        })
        .catch(function () {
            btn.textContent = original;
            btn.disabled = false;
            alert('There was an error while send the message. Try again later.');
        });
});

let currentLang = 'en';
let FLAG_GB = '<svg viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#00247d"/><path d="M0,0 L20,14 M20,0 L0,14" stroke="#fff" stroke-width="3"/><path d="M0,0 L20,14 M20,0 L0,14" stroke="#cf142b" stroke-width="1"/><path d="M10,0 V14 M0,7 H20" stroke="#fff" stroke-width="5"/><path d="M10,0 V14 M0,7 H20" stroke="#cf142b" stroke-width="3"/></svg>';
let FLAG_PT = '<svg viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#ff0000"/><rect width="8" height="14" fill="#046a38"/><circle cx="8" cy="7" r="3" fill="#ffcc00" stroke="#fff" stroke-width="0.6"/></svg>';
(function () {
    let html = document.documentElement;
    let btn = document.getElementById('langToggle');
    let flagEl = document.getElementById('langFlag');
    let codeEl = document.getElementById('langCode');

    function applyLang(lang) {
        currentLang = lang;
        html.setAttribute('lang', lang);

        document.querySelectorAll('[data-en]').forEach(function (el) {
            if (el.dataset.pt === undefined) {
                el.dataset.pt = el.innerHTML;
            }
            el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.pt;
        });

        document.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
            if (el.dataset.ptPlaceholder === undefined) {
                el.dataset.ptPlaceholder = el.getAttribute('placeholder');
            }
            el.setAttribute('placeholder', lang === 'en' ? el.dataset.enPlaceholder : el.dataset.ptPlaceholder);
        });

        if (lang === 'en') {
            flagEl.innerHTML = FLAG_PT;
            codeEl.textContent = 'PT';
        } else {
            flagEl.innerHTML = FLAG_GB;
            codeEl.textContent = 'EN';
        }
    }

    btn.addEventListener('click', function (e) {
        e.preventDefault();
        let next = currentLang === 'en' ? 'pt' : 'en';
        try {
            localStorage.setItem('lang', next);
        } catch (err) { }
        let url = new URL(window.location.href);
        url.searchParams.set('lang', next);
        window.location.href = url.toString();
    });

    let urlLang = new URL(window.location.href).searchParams.get('lang');
    if (urlLang === 'en' || urlLang === 'pt') {
        applyLang(urlLang);
    } else {
        try {
            let saved = localStorage.getItem('lang');
            applyLang(saved === 'en' ? 'en' : 'pt');
        } catch (e) {
            applyLang('en');
        }
    }
})();


(function () {
    let modal = document.getElementById('projectModal');
    let overlay = document.getElementById('modalOverlay');
    let closeBtn = document.getElementById('modalClose');
    let imageEl = document.getElementById('modalImage');
    let titleEl = document.getElementById('modalTitle');
    let descEl = document.getElementById('modalDesc');
    let toolsEl = document.getElementById('modalTools');
    let dotsEl = document.getElementById('galleryDots');
    let prevBtn = document.getElementById('galleryPrev');
    let nextBtn = document.getElementById('galleryNext');
    let liveLink = document.getElementById('modalLive');
    let codeLink = document.getElementById('modalCode');

    if (!modal) return;

    let images = [];
    let current = 0;

    function currentLangValue() {
        return document.documentElement.getAttribute('lang') || 'en';
    }

    function renderImage() {
        if (!images.length) return;
        imageEl.src = images[current];
        dotsEl.querySelectorAll('span').forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    function goTo(index) {
        if (!images.length) return;
        current = (index + images.length) % images.length;
        renderImage();
    }

    function openModal(card) {
        let lang = currentLangValue();

        let imgsAttr = card.getAttribute('data-images') || '';
        images = imgsAttr.split(',').map(function (s) {
            return s.trim();
        }).filter(Boolean);
        current = 0;

        let title = lang === 'pt' ?
            (card.getAttribute('data-title-pt') || card.getAttribute('data-title') || '') :
            (card.getAttribute('data-title') || '');
        let desc = lang === 'pt' ?
            (card.getAttribute('data-desc-pt') || card.getAttribute('data-desc') || '') :
            (card.getAttribute('data-desc') || '');
        let tools = (card.getAttribute('data-tools') || '').split(',').map(function (s) {
            return s.trim();
        }).filter(Boolean);
        let live = card.getAttribute('data-live') || '#';
        let code = card.getAttribute('data-code') || '#';

        titleEl.textContent = title;
        descEl.textContent = desc;

        toolsEl.innerHTML = '';
        tools.forEach(function (t) {
            let span = document.createElement('span');
            span.textContent = t;
            toolsEl.appendChild(span);
        });

        dotsEl.innerHTML = '';
        images.forEach(function (_, i) {
            let dot = document.createElement('span');
            dot.addEventListener('click', function () {
                goTo(i);
            });
            dotsEl.appendChild(dot);
        });

        let hasGallery = images.length > 1;
        prevBtn.style.display = hasGallery ? 'flex' : 'none';
        nextBtn.style.display = hasGallery ? 'flex' : 'none';
        dotsEl.style.display = hasGallery ? 'flex' : 'none';

        liveLink.href = live;
        codeLink.href = code;

        renderImage();

        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false')
        document.body.classList.add('modal-open');

        modal.querySelector('.modal-box').setAttribute(
            'aria-label',
            lang === 'pt' ? 'detalhes do projeto' : 'project details'
        );
    }

    function closeModal() {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true')
        document.body.classList.remove('modal-open');
    }

    document.querySelectorAll('.work-card').forEach(function (card) {
        card.addEventListener('click', function () {
            openModal(card);
        });
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(card);
            }
        });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    prevBtn.addEventListener('click', function () {
        goTo(current - 1);
    });
    nextBtn.addEventListener('click', function () {
        goTo(current + 1);
    });

    document.addEventListener('keydown', function (e) {
        if (!modal.classList.contains('show')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
    });
})();