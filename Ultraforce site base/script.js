document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // 1. INJETA A TOP-BAR DE ACESSIBILIDADE EM TODAS AS PÁGINAS
    // Páginas de auth (login, cadastro, etc.) não recebem a barra
    // =========================================
    const isAuthPage = document.body.classList.contains('auth-page');

    // Remove qualquer barra que possa ter ficado no HTML antigo para não duplicar
    const existingBar = document.querySelector('.top-bar');
    if (existingBar) {
        existingBar.remove();
    }

    if (!isAuthPage) {
        const topBarHTML = `
        <div class="top-bar" id="top-bar-acessibilidade">
            <div class="container top-bar-content">
                <div class="accessibility-bar" role="toolbar" aria-label="Controles de acessibilidade">
                    <span style="color: var(--text-muted); font-size: 0.8rem; margin-right: 4px;">Acessibilidade:</span>
                    <button id="btn-increase-text" aria-label="Aumentar tamanho do texto" aria-pressed="false">A+</button>
                    <button id="btn-decrease-text" aria-label="Diminuir tamanho do texto" aria-pressed="false">A-</button>
                    <button id="btn-contrast"      aria-label="Ativar alto contraste"     aria-pressed="false">Alto Contraste</button>
                    <button id="btn-daltonism"     aria-label="Ativar modo daltonismo"    aria-pressed="false">Daltonismo: Off</button>
                </div>
                <div class="shipping-notice" aria-label="Promoção de frete">
                    <span>Frete Grátis Sul e Sudeste acima de R$&nbsp;199</span>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('afterbegin', topBarHTML);
    }

    // =========================================
    // 2. RESTAURA O ESTADO SALVO NO localStorage (persiste entre páginas)
    // =========================================
    const savedContrast   = localStorage.getItem('a11y-contrast')   === 'true';
    const savedDaltonism  = localStorage.getItem('a11y-daltonism')  || '';
    const savedFontSize   = parseInt(localStorage.getItem('a11y-fontsize')) || 16;

    let currentFontSize  = savedFontSize;
    let currentDaltonism = savedDaltonism;

    document.documentElement.style.setProperty('--font-base', `${currentFontSize}px`);
    if (savedContrast)  document.body.classList.add('alto-contraste');
    if (currentDaltonism) document.body.classList.add(currentDaltonism);

    // =========================================
    // 3. CONTROLES DE ACESSIBILIDADE
    // =========================================

    const btnIncrease = document.getElementById('btn-increase-text');
    const btnDecrease = document.getElementById('btn-decrease-text');

    function updateFontSize(newSize) {
        currentFontSize = Math.min(24, Math.max(12, newSize));
        document.documentElement.style.setProperty('--font-base', `${currentFontSize}px`);
        localStorage.setItem('a11y-fontsize', currentFontSize);
    }

    if (btnIncrease) btnIncrease.addEventListener('click', () => updateFontSize(currentFontSize + 2));
    if (btnDecrease) btnDecrease.addEventListener('click', () => updateFontSize(currentFontSize - 2));

    const btnContrast = document.getElementById('btn-contrast');

    function syncContrastButton() {
        if (!btnContrast) return;
        const isOn = document.body.classList.contains('alto-contraste');
        btnContrast.setAttribute('aria-pressed', isOn);
        btnContrast.textContent = isOn ? 'Contraste: ON ✓' : 'Alto Contraste';
    }

    if (btnContrast) {
        syncContrastButton(); 
        btnContrast.addEventListener('click', () => {
            document.body.classList.toggle('alto-contraste');
            const isOn = document.body.classList.contains('alto-contraste');
            localStorage.setItem('a11y-contrast', isOn);
            syncContrastButton();
        });
    }

    const btnDaltonism   = document.getElementById('btn-daltonism');
    const daltonismModes = ['deuteranopia', 'protanopia', 'tritanopia'];
    const daltonismLabels = {
        '':             'Daltonismo: Off',
        'deuteranopia': 'Deuteranopia (Verde) ✓',
        'protanopia':   'Protanopia (Vermelho) ✓',
        'tritanopia':   'Tritanopia (Azul) ✓'
    };

    function syncDaltonismButton() {
        if (!btnDaltonism) return;
        btnDaltonism.setAttribute('aria-pressed', currentDaltonism !== '');
        btnDaltonism.textContent = daltonismLabels[currentDaltonism] || 'Daltonismo: Off';
    }

    if (btnDaltonism) {
        syncDaltonismButton(); 
        btnDaltonism.addEventListener('click', () => {
            if (currentDaltonism) document.body.classList.remove(currentDaltonism);

            const idx = daltonismModes.indexOf(currentDaltonism);
            const next = (idx + 1) % (daltonismModes.length + 1);
            currentDaltonism = next < daltonismModes.length ? daltonismModes[next] : '';

            if (currentDaltonism) document.body.classList.add(currentDaltonism);
            localStorage.setItem('a11y-daltonism', currentDaltonism);
            syncDaltonismButton();
        });
    }

    // =========================================
    // 4. CARROSSEL DE AVALIAÇÕES
    // =========================================
    const track   = document.getElementById('testimonial-track');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (track && btnPrev && btnNext) {
        function getCardWidth() {
            const card = track.querySelector('.testimonial-card');
            if (!card) return 320;
            const style = getComputedStyle(track);
            const gap   = parseFloat(style.gap) || 20;
            return card.offsetWidth + gap;
        }
        btnNext.addEventListener('click', () => track.scrollBy({ left:  getCardWidth(), behavior: 'smooth' }));
        btnPrev.addEventListener('click', () => track.scrollBy({ left: -getCardWidth(), behavior: 'smooth' }));
    }

    // =========================================
    // 5. LOGIN
    // =========================================
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email      = document.getElementById('email').value.trim();
            const password   = document.getElementById('password').value;
            const keepEl     = document.getElementById('keep-logged');
            const keepLogged = keepEl ? keepEl.checked : false;
            const errorMsg   = document.getElementById('login-error');

            if (email === 'ux@gmail.com' && password === '123') {
                if (keepLogged) localStorage.setItem('userLogged', 'true');
                else            sessionStorage.setItem('userLogged', 'true');
                window.location.href = 'index.html';
            } else {
                errorMsg.textContent = 'E-mail ou senha incorretos. Use ux@gmail.com e senha 123.';
                errorMsg.style.display = 'block';
                errorMsg.setAttribute('role', 'alert');
            }
        });
    }

    // =========================================
    // 6. ESTADO DE LOGIN — altera header em todas as páginas
    // =========================================
    if (localStorage.getItem('userLogged') || sessionStorage.getItem('userLogged')) {
        document.querySelectorAll('.account-link .text').forEach(el => {
            el.innerHTML = '<small>Bem-vindo(a)</small><strong style="color: var(--primary-color);">Minha Conta</strong>';
        });
    }

    // =========================================
    // 7. CÁLCULO DE FRETE
    // =========================================
    document.querySelectorAll('.cep-input-group input').forEach(input => {
        input.addEventListener('input', () => {
            let v = input.value.replace(/\D/g, '');
            if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8);
            input.value = v;
        });
    });

    document.querySelectorAll('.btn-calc').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const parent    = btn.closest('.shipping-calculator');
            const input     = parent ? parent.querySelector('input') : null;
            const resultDiv = parent ? parent.querySelector('.shipping-result') : null;
            if (!input || !resultDiv) return;

            const digits = input.value.replace(/\D/g, '');

            if (digits.length >= 8) {
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = `
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span>PAC — 5 dias úteis</span>
                        <strong style="color:var(--primary-color)">R$ 15,90</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Sedex — 2 dias úteis</span>
                        <strong style="color:var(--primary-color)">R$ 35,90</strong>
                    </div>`;

                const cartFreight = document.getElementById('cart-freight-val');
                const cartTotal   = document.getElementById('cart-total-val');
                if (cartFreight) cartFreight.textContent = 'R$ 15,90';
                if (cartTotal)   cartTotal.textContent   = 'R$ 115,80';
            } else {
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = '<span style="color:var(--accent-color)">Digite um CEP válido com 8 dígitos.</span>';
            }
        });
    });

    // =========================================
    // 8. CHECKOUT
    // =========================================
    document.querySelectorAll('input[name="frete-checkout"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const taxa      = parseFloat(e.target.value);
            const freightEl = document.getElementById('checkout-freight-val');
            const totalEl   = document.getElementById('checkout-total-val');
            if (freightEl) freightEl.textContent = `R$ ${taxa.toFixed(2).replace('.', ',')}`;
            if (totalEl)   totalEl.textContent   = `R$ ${(99.90 + taxa - 9.99).toFixed(2).replace('.', ',')}`;
        });
    });

    // =========================================
    // 9. ABAS DA PÁGINA DE PRODUTO
    // =========================================
    const tabList = document.querySelector('[role="tablist"]');
    if (tabList) {
        const tabs   = Array.from(tabList.querySelectorAll('[role="tab"]'));
        const panels = document.querySelectorAll('[role="tabpanel"]');

        function activateTab(selectedTab) {
            tabs.forEach(tab => {
                tab.setAttribute('aria-selected', 'false');
                tab.setAttribute('tabindex', '-1');
                tab.classList.remove('tab-active');
            });
            panels.forEach(p => p.setAttribute('hidden', ''));

            selectedTab.setAttribute('aria-selected', 'true');
            selectedTab.setAttribute('tabindex', '0');
            selectedTab.classList.add('tab-active');
            const panel = document.getElementById(selectedTab.getAttribute('aria-controls'));
            if (panel) panel.removeAttribute('hidden');
        }

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => activateTab(tab));
            tab.addEventListener('keydown', (e) => {
                let ni = index;
                if      (e.key === 'ArrowRight') ni = (index + 1) % tabs.length;
                else if (e.key === 'ArrowLeft')  ni = (index - 1 + tabs.length) % tabs.length;
                else if (e.key === 'Home')        ni = 0;
                else if (e.key === 'End')         ni = tabs.length - 1;
                else return;
                e.preventDefault();
                activateTab(tabs[ni]);
                tabs[ni].focus();
            });
        });

        if (tabs.length > 0) activateTab(tabs[0]);
    }
});