document.addEventListener('DOMContentLoaded', function () {
    initYear();
    initSmoothScroll();
    initHeaderScroll();
    initMobileMenu();
    initHeroButtons();
    initCountdown();
    initMenuFilter();
    initCart();
    initTestimonials();
    initSocialLinks();
    initContactWhatsApp();
});

/* Ano automático no footer */
function initYear() {
    var yearSpan = document.getElementById('year');
    if (yearSpan) {
        var now = new Date();
        yearSpan.textContent = now.getFullYear();
    }
}

/* Scroll suave para âncoras */
function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');

    function onClick(event) {
        var href = this.getAttribute('href');
        if (!href || href === '#') {
            return;
        }
        var target = document.querySelector(href);
        if (target) {
            event.preventDefault();
            var headerHeight = 90;
            var offset = target.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({
                top: offset,
                behavior: 'smooth'
            });
        }
    }

    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', onClick);
    }

    /* Destacar link ativo pelo scroll */
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');

    function updateActive() {
        var scrollPos = window.scrollY + 120;
        for (var i = 0; i < sections.length; i++) {
            var sec = sections[i];
            var top = sec.offsetTop;
            var bottom = top + sec.offsetHeight;
            var id = sec.getAttribute('id');

            if (scrollPos >= top && scrollPos < bottom) {
                setActiveLink(id, navLinks);
            }
        }
    }

    window.addEventListener('scroll', updateActive);
    updateActive();
}

function setActiveLink(id, navLinks) {
    for (var i = 0; i < navLinks.length; i++) {
        var link = navLinks[i];
        var href = link.getAttribute('href').replace('#', '');
        if (href === id) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    }
}

/* Header reagindo ao scroll */
function initHeaderScroll() {
    var header = document.querySelector('.header');
    if (!header) {
        return;
    }

    function onScroll() {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onScroll);
    onScroll();
}

/* Menu mobile */
function initMobileMenu() {
    var btn = document.getElementById('btn-mobile');
    var list = document.getElementById('nav-list');

    if (!btn || !list) {
        return;
    }

    btn.addEventListener('click', function () {
        var isOpen = list.classList.contains('open');
        if (isOpen) {
            list.classList.remove('open');
        } else {
            list.classList.add('open');
        }
    });

    var navLinks = list.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', function () {
            list.classList.remove('open');
        });
    }
}

/* Botões principais do hero */
function initHeroButtons() {
    var btnOrder = document.getElementById('btn-order-now');
    var btnMenu = document.getElementById('btn-see-menu');
    var sectionMenu = document.getElementById('cardapio');

    if (btnOrder && sectionMenu) {
        btnOrder.addEventListener('click', function () {
            scrollToSection(sectionMenu);
        });
    }

    if (btnMenu && sectionMenu) {
        btnMenu.addEventListener('click', function () {
            scrollToSection(sectionMenu);
        });
    }
}

function scrollToSection(section) {
    var headerHeight = 90;
    var offset = section.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({
        top: offset,
        behavior: 'smooth'
    });
}

/* Contagem regressiva da promoção do hero */
function initCountdown() {
    var elHours = document.getElementById('cd-hours');
    var elMinutes = document.getElementById('cd-minutes');
    var elSeconds = document.getElementById('cd-seconds');

    if (!elHours || !elMinutes || !elSeconds) {
        return;
    }

    var now = new Date();
    var target = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    function update() {
        var current = new Date();
        var diff = target.getTime() - current.getTime();

        if (diff <= 0) {
            elHours.textContent = '00';
            elMinutes.textContent = '00';
            elSeconds.textContent = '00';
            return;
        }

        var totalSeconds = Math.floor(diff / 1000);
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;

        elHours.textContent = padTime(hours);
        elMinutes.textContent = padTime(minutes);
        elSeconds.textContent = padTime(seconds);
    }

    update();
    setInterval(update, 1000);
}

function padTime(value) {
    return value < 10 ? '0' + value : String(value);
}

/* Filtro do cardápio */
function initMenuFilter() {
    var chips = document.querySelectorAll('.chip');
    var items = document.querySelectorAll('.menu-item');

    if (chips.length === 0 || items.length === 0) {
        return;
    }

    function onFilterClick() {
        var filter = this.getAttribute('data-filter');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.remove('chip-active');
        }
        this.classList.add('chip-active');

        for (var j = 0; j < items.length; j++) {
            var item = items[j];
            var category = item.getAttribute('data-category');

            if (filter === 'todas' || category === filter) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        }
    }

    for (var i = 0; i < chips.length; i++) {
        chips[i].addEventListener('click', onFilterClick);
    }
}

/* Carrinho básico */
function initCart() {
    var cartToggle = document.getElementById('cart-toggle');
    var cartPanel = document.getElementById('cart-panel');
    var countSpan = document.getElementById('cart-count');
    var itemsList = document.getElementById('cart-items');
    var totalSpan = document.getElementById('cart-total');
    var btnClear = document.getElementById('cart-clear');
    var btnWhats = document.getElementById('cart-whatsapp');

    if (!cartToggle || !cartPanel || !countSpan || !itemsList || !totalSpan || !btnClear || !btnWhats) {
        return;
    }

    var cartItems = [];

    cartToggle.addEventListener('click', function () {
        var isOpen = cartPanel.classList.contains('open');
        if (isOpen) {
            cartPanel.classList.remove('open');
        } else {
            cartPanel.classList.add('open');
        }
    });

    document.addEventListener('click', function (event) {
        if (!cartPanel.classList.contains('open')) {
            return;
        }
        var target = event.target;
        var isInside = cartPanel.contains(target) || cartToggle.contains(target);
        if (!isInside) {
            cartPanel.classList.remove('open');
        }
    });

    var pizzaButtons = document.querySelectorAll('.btn-add-cart');
    function onAddPizzaClick() {
        var name = this.getAttribute('data-name');
        var priceStr = this.getAttribute('data-price');
        var price = parseFloat(priceStr.replace(',', '.'));
        addItemToCart(name, price);
    }
    for (var i = 0; i < pizzaButtons.length; i++) {
        pizzaButtons[i].addEventListener('click', onAddPizzaClick);
    }

    var comboButtons = document.querySelectorAll('.btn-add-combo');
    function onAddComboClick() {
        var json = this.getAttribute('data-items');
        try {
            var list = JSON.parse(json);
            for (var i = 0; i < list.length; i++) {
                addItemToCart(list[i].nome, list[i].preco);
            }
        } catch (error) {
            console.error('Erro ao adicionar combo:', error);
        }
    }
    for (var j = 0; j < comboButtons.length; j++) {
        comboButtons[j].addEventListener('click', onAddComboClick);
    }

    function addItemToCart(name, price) {
        if (!name || isNaN(price)) {
            return;
        }
        cartItems.push({
            nome: name,
            preco: price
        });
        renderCart();
    }

    function renderCart() {
        itemsList.innerHTML = '';

        var total = 0;
        for (var i = 0; i < cartItems.length; i++) {
            var item = cartItems[i];
            total += item.preco;

            var li = document.createElement('li');

            var spanName = document.createElement('span');
            spanName.className = 'cart-item-name';
            spanName.textContent = item.nome;

            var spanPrice = document.createElement('span');
            spanPrice.className = 'cart-item-price';
            spanPrice.textContent = 'R$ ' + formatMoney(item.preco);

            li.appendChild(spanName);
            li.appendChild(spanPrice);
            itemsList.appendChild(li);
        }

        countSpan.textContent = String(cartItems.length);
        totalSpan.textContent = formatMoney(total);
        updateCartWhatsLink(cartItems, total, btnWhats);
    }

    btnClear.addEventListener('click', function () {
        cartItems = [];
        renderCart();
    });
}

function formatMoney(value) {
    return value.toFixed(2).replace('.', ',');
}

function updateCartWhatsLink(cartItems, total, link) {
    var base = 'https://wa.me/5511999990000?text=';
    if (cartItems.length === 0) {
        link.href = base + encodeURIComponent('Olá! Quero fazer um pedido na Pepperoni King.');
        return;
    }

    var message = 'Olá! Quero fazer o seguinte pedido na Pepperoni King:%0A%0A';
    for (var i = 0; i < cartItems.length; i++) {
        var item = cartItems[i];
        message += '- ' + item.nome + ' (R$ ' + formatMoney(item.preco) + ')%0A';
    }
    message += '%0ATotal estimado: R$ ' + formatMoney(total);

    link.href = base + message;
}

/* Depoimentos (carrossel simples) */
function initTestimonials() {
    var track = document.getElementById('testimonial-track');
    var prev = document.getElementById('test-prev');
    var next = document.getElementById('test-next');

    if (!track || !prev || !next) {
        return;
    }

    var items = track.querySelectorAll('.testimonial');
    var index = 0;

    function showAt(i) {
        for (var k = 0; k < items.length; k++) {
            if (k === i) {
                items[k].classList.add('active');
            } else {
                items[k].classList.remove('active');
            }
        }
    }

    prev.addEventListener('click', function () {
        index = index - 1;
        if (index < 0) {
            index = items.length - 1;
        }
        showAt(index);
    });

    next.addEventListener('click', function () {
        index = index + 1;
        if (index >= items.length) {
            index = 0;
        }
        showAt(index);
    });

    setInterval(function () {
        index = index + 1;
        if (index >= items.length) {
            index = 0;
        }
        showAt(index);
    }, 7000);

    showAt(index);
}

/* Links sociais (aponta pro que você quiser) */
function initSocialLinks() {
    var whats = document.getElementById('social-whatsapp');
    var insta = document.getElementById('social-instagram');
    var face = document.getElementById('social-facebook');
    var yt = document.getElementById('social-youtube');

    if (whats) {
        whats.href = 'https://wa.me/5537999492573?text=' +
            encodeURIComponent('Olá! Quero fazer um pedido na Pizzareal.');
        whats.target = '_blank';
        whats.rel = 'noopener noreferrer';
    }
    if (insta) {
        insta.href = 'https://www.instagram.com/ayrtonsanabiobjj';
        insta.target = '_blank';
        insta.rel = 'noopener noreferrer';
    }
    if (face) {
        face.href = 'https://www.facebook.com/ayrton.sanabio.12';
        face.target = '_blank';
        face.rel = 'noopener noreferrer';
    }
    if (yt) {
        yt.href = 'https://www.youtube.com/@seu_canal_aqui';
        yt.target = '_blank';
        yt.rel = 'noopener noreferrer';
    }
}

/* Formulário -> WhatsApp */
function initContactWhatsApp() {
    var btn = document.getElementById('btn-contact-whatsapp');
    if (!btn) {
        return;
    }

    btn.addEventListener('click', function () {
        var nome = document.getElementById('nome');
        var telefone = document.getElementById('telefone');
        var mensagem = document.getElementById('mensagem');

        var texto = 'Olá, meu nome é ' + (nome ? nome.value : '') +
            '. Telefone: ' + (telefone ? telefone.value : '') +
            '.%0A%0A' +
            'Mensagem/Pedido:%0A' + (mensagem ? encodeURIComponent(mensagem.value) : '');

        var url = 'https://wa.me/5537999492573?text=' + texto;
        window.open(url, '_blank');
    });
}



/* --- REVEAL AO ROLAR --- */
function initScrollReveal() {
    var items = [];

    var sections = document.querySelectorAll('.section, .hero');
    var promos = document.querySelectorAll('.promo-card');
    var menuItems = document.querySelectorAll('.menu-item');
    var testimonial = document.querySelectorAll('.testimonial');

    pushNodeList(items, sections);
    pushNodeList(items, promos);
    pushNodeList(items, menuItems);
    pushNodeList(items, testimonial);

    if (items.length === 0) {
        return;
    }

    for (var i = 0; i < items.length; i++) {
        items[i].classList.add('reveal');
    }

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            for (var j = 0; j < entries.length; j++) {
                if (entries[j].isIntersecting) {
                    entries[j].target.classList.add('reveal-visible');
                    observer.unobserve(entries[j].target);
                }
            }
        }, {
            threshold: 0.2
        });

        for (var k = 0; k < items.length; k++) {
            observer.observe(items[k]);
        }
    } else {
        function checkScroll() {
            var windowBottom = window.innerHeight + window.scrollY;
            for (var m = 0; m < items.length; m++) {
                var el = items[m];
                if (el.classList.contains('reveal-visible')) {
                    continue;
                }
                var rect = el.getBoundingClientRect();
                var top = rect.top + window.scrollY;
                if (windowBottom > top + rect.height * 0.2) {
                    el.classList.add('reveal-visible');
                }
            }
        }

        window.addEventListener('scroll', checkScroll);
        checkScroll();
    }
}

function pushNodeList(targetArray, nodeList) {
    for (var i = 0; i < nodeList.length; i++) {
        targetArray.push(nodeList[i]);
    }
}

/* --- BOTÃO VOLTAR AO TOPO --- */
function initBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Voltar ao topo');
    btn.textContent = '↑';

    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    function onScroll() {
        if (window.scrollY > 250) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', onScroll);
    onScroll();
}

/* --- PERSISTÊNCIA DO CARRINHO --- */
function initCartPersistence() {
    if (!window.localStorage) {
        return;
    }
    if (!localStorage.getItem('pepperoni_cart')) {
        localStorage.setItem('pepperoni_cart', JSON.stringify([]));
    }
}

function saveCart(items) {
    if (!window.localStorage) {
        return;
    }
    try {
        localStorage.setItem('pepperoni_cart', JSON.stringify(items));
    } catch (e) {
        console.error('Erro ao salvar carrinho:', e);
    }
}

function loadCart() {
    if (!window.localStorage) {
        return [];
    }
    try {
        var data = localStorage.getItem('pepperoni_cart');
        if (!data) {
            return [];
        }
        var parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed;
    } catch (e) {
        console.error('Erro ao ler carrinho:', e);
        return [];
    }
}

/* --- FEEDBACK VISUAL EM BOTÕES --- */
function addButtonFeedback(button) {
    if (!button) {
        return;
    }

    var originalText = button.textContent;

    button.classList.add('btn-added', 'btn-pulse');

    setTimeout(function () {
        button.classList.remove('btn-pulse');
    }, 400);

    setTimeout(function () {
        button.classList.remove('btn-added');
        button.textContent = originalText;
    }, 1200);
}
