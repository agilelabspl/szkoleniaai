/**
 * Cookie Consent — aiprzewodnik.pl
 * Samodzielny skrypt (zero zależności).
 * Tworzy gtag stub, baner RODO, panel ustawień, warunkowe ładowanie skryptów.
 */
(function () {
    'use strict';

    /* ── 1. gtag stub ── */
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    /* ── 2. Konfiguracja ── */
    var STORAGE_KEY = 'aiprzewodnik_cookie_consent';
    var CONSENT_VERSION = 1;
    var GA_ID = 'G-BYGTBRQ1YF';
    var HOTJAR_ID = 6638779;
    var AHREFS_KEY = '/zVD2dmUygVPV3XAdTIR3g';
    var MAILERLITE_ACCOUNT = '575409';

    /* ── 3. Helpers ── */
    function loadScript(src, attrs) {
        var s = document.createElement('script');
        s.async = true;
        s.src = src;
        if (attrs) {
            for (var k in attrs) {
                if (attrs.hasOwnProperty(k)) s.setAttribute(k, attrs[k]);
            }
        }
        document.head.appendChild(s);
    }

    function injectInlineScript(code) {
        var s = document.createElement('script');
        s.textContent = code;
        document.head.appendChild(s);
    }

    /* ── 4. Ładowanie skryptów wg kategorii ── */
    function loadAnalytics() {
        loadScript('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);
        gtag('js', new Date());
        gtag('config', GA_ID);
    }

    function loadMarketing() {
        // Ahrefs
        loadScript('https://analytics.ahrefs.com/analytics.js', { 'data-key': AHREFS_KEY });
        // Hotjar
        injectInlineScript(
            '(function(h,o,t,j,a,r){' +
            'h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};' +
            'h._hjSettings={hjid:' + HOTJAR_ID + ',hjsv:6};' +
            'a=o.getElementsByTagName("head")[0];' +
            'r=o.createElement("script");r.async=1;' +
            'r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;' +
            'a.appendChild(r);' +
            '})(window,document,"https://static.hotjar.com/c/hotjar-",".js?sv=");'
        );
    }

    function loadFunctional() {
        // MailerLite — ładuj tylko jeśli strona ma element .ml-embedded
        injectInlineScript(
            '(function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[])' +
            '.push(arguments);},l=d.createElement(e),l.async=1,l.src=u,' +
            'n=d.getElementsByTagName(e)[0],n.parentNode.insertBefore(l,n);})' +
            '(window,document,"script","https://assets.mailerlite.com/js/universal.js","ml");' +
            'ml("account","' + MAILERLITE_ACCOUNT + '");'
        );
    }

    /* ── 4b. Placeholder dla formularzy gdy brak zgody ── */
    function showFormPlaceholders() {
        var forms = document.querySelectorAll('.ml-embedded');
        for (var i = 0; i < forms.length; i++) {
            var el = forms[i];
            if (el.querySelector('.cc-form-placeholder')) continue;
            var placeholder = document.createElement('div');
            placeholder.className = 'cc-form-placeholder';
            placeholder.innerHTML =
                '<p>Aby zobaczyć formularz zapisu, zaakceptuj cookies funkcjonalne.</p>' +
                '<button type="button">Zmień ustawienia cookies</button>';
            placeholder.querySelector('button').addEventListener('click', function () {
                showBanner(true);
            });
            el.appendChild(placeholder);
        }
    }

    function hideFormPlaceholders() {
        var placeholders = document.querySelectorAll('.cc-form-placeholder');
        for (var i = 0; i < placeholders.length; i++) {
            placeholders[i].remove();
        }
    }

    function applyConsent(prefs) {
        if (prefs.analytics) loadAnalytics();
        if (prefs.marketing) loadMarketing();
        if (prefs.functional) {
            hideFormPlaceholders();
            loadFunctional();
        }
    }

    /* ── 5. Odczyt / zapis zgody ── */
    function getConsent() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var data = JSON.parse(raw);
            if (data && data.version === CONSENT_VERSION) return data;
            return null;
        } catch (e) {
            return null;
        }
    }

    function saveConsent(analytics, marketing, functional) {
        var prefs = {
            analytics: !!analytics,
            marketing: !!marketing,
            functional: !!functional,
            timestamp: new Date().toISOString(),
            version: CONSENT_VERSION
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        } catch (e) { /* brak localStorage */ }
        return prefs;
    }

    /* ── 6. CSS banera ── */
    var CSS = '' +
    '#cc-banner{position:fixed;bottom:0;left:0;right:0;z-index:99999;font-family:Inter,system-ui,-apple-system,sans-serif;' +
        'background:#fff;border-top:1px solid #e2e8f0;box-shadow:0 -4px 24px rgba(0,0,0,0.1);' +
        'transform:translateY(100%);transition:transform .4s cubic-bezier(.4,0,.2,1);padding:0}' +
    '#cc-banner.cc-visible{transform:translateY(0)}' +
    '#cc-inner{max-width:960px;margin:0 auto;padding:0.9rem 1.1rem}' +
    '#cc-text{font-size:0.82rem;line-height:1.45;color:#334155;margin-bottom:0.7rem}' +
    '#cc-text a{color:#5b5ee8;text-decoration:underline;text-underline-offset:2px}' +
    '#cc-buttons{display:flex;gap:0.5rem;flex-wrap:wrap}' +
    '#cc-buttons button{flex:1 1 0;min-width:140px;padding:0.5rem 0.75rem;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer;' +
        'font-family:inherit;border:none;transition:background .2s,transform .1s}' +
    '#cc-buttons button:active{transform:scale(0.97)}' +
    '#cc-accept{background:#5b5ee8;color:#fff}' +
    '#cc-accept:hover{background:#4a4dd4}' +
    '#cc-reject{background:#e2e8f0;color:#334155}' +
    '#cc-reject:hover{background:#cbd5e1}' +
    '#cc-settings-btn{background:#e2e8f0;color:#334155}' +
    '#cc-settings-btn:hover{background:#cbd5e1}' +
    /* Panel ustawień */
    '#cc-settings{display:none;margin-top:0.75rem;border-top:1px solid #e2e8f0;padding-top:0.75rem}' +
    '#cc-settings.cc-open{display:block}' +
    '#cc-settings h3{font-size:0.9rem;font-weight:700;color:#1e293b;margin:0 0 0.6rem 0}' +
    '.cc-category{display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #f1f5f9}' +
    '.cc-category:last-child{border-bottom:none}' +
    '.cc-cat-info{flex:1}' +
    '.cc-cat-name{font-weight:600;font-size:0.82rem;color:#1e293b}' +
    '.cc-cat-desc{font-size:0.75rem;color:#64748b;margin-top:1px}' +
    /* Toggle switch */
    '.cc-toggle{position:relative;width:44px;height:24px;flex-shrink:0;margin-left:1rem}' +
    '.cc-toggle input{opacity:0;width:0;height:0;position:absolute}' +
    '.cc-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#cbd5e1;border-radius:24px;transition:background .2s}' +
    '.cc-slider:before{content:"";position:absolute;width:18px;height:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:transform .2s}' +
    '.cc-toggle input:checked+.cc-slider{background:#5b5ee8}' +
    '.cc-toggle input:checked+.cc-slider:before{transform:translateX(20px)}' +
    '.cc-toggle input:disabled+.cc-slider{background:#5b5ee8;opacity:0.6;cursor:not-allowed}' +
    '.cc-toggle input:disabled:checked+.cc-slider:before{transform:translateX(20px)}' +
    '#cc-save{margin-top:0.6rem;padding:0.5rem 1.5rem;background:#5b5ee8;color:#fff;border:none;border-radius:8px;' +
        'font-size:0.85rem;font-weight:600;cursor:pointer;font-family:inherit}' +
    '#cc-save:hover{background:#4a4dd4}' +
    '#cc-admin{font-size:0.72rem;color:#94a3b8;margin-top:0.6rem;line-height:1.3}' +
    /* Placeholder formularz */
    '.cc-form-placeholder{background:#f8fafc;border:1px dashed #cbd5e1;border-radius:12px;padding:1.5rem;text-align:center;' +
        'font-family:Inter,system-ui,-apple-system,sans-serif;margin:1rem 0}' +
    '.cc-form-placeholder p{color:#64748b;font-size:0.9rem;margin:0 0 0.75rem 0;line-height:1.5}' +
    '.cc-form-placeholder button{background:#5b5ee8;color:#fff;border:none;border-radius:8px;padding:0.5rem 1.25rem;' +
        'font-size:0.85rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background .2s}' +
    '.cc-form-placeholder button:hover{background:#4a4dd4}' +
    /* Responsywność */
    '@media(max-width:640px){' +
        '#cc-buttons{flex-direction:column}' +
        '#cc-buttons button{min-width:0;width:100%}' +
        '#cc-inner{padding:0.75rem 0.9rem}' +
    '}';

    /* ── 7. HTML banera ── */
    function buildBanner() {
        // Banner
        var banner = document.createElement('div');
        banner.id = 'cc-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Ustawienia prywatności');

        banner.innerHTML = '' +
        '<div id="cc-inner">' +
            '<div id="cc-text">' +
                'Używamy cookies. Niezbędne działają zawsze, pozostałe tylko za Twoją zgodą. ' +
                '<a href="https://agilelabs.pl/polityka_prywatnosci" target="_blank" rel="noopener noreferrer">Polityka prywatności</a>' +
            '</div>' +
            '<div id="cc-buttons">' +
                '<button id="cc-accept" type="button">Akceptuj wszystkie</button>' +
                '<button id="cc-reject" type="button">Tylko niezbędne</button>' +
                '<button id="cc-settings-btn" type="button">Ustawienia</button>' +
            '</div>' +
            '<div id="cc-settings">' +
                '<h3>Ustawienia cookies</h3>' +
                '<div class="cc-category">' +
                    '<div class="cc-cat-info"><div class="cc-cat-name">Niezbędne</div>' +
                    '<div class="cc-cat-desc">Podstawowe działanie strony. Zawsze aktywne.</div></div>' +
                    '<label class="cc-toggle"><input type="checkbox" checked disabled><span class="cc-slider"></span></label>' +
                '</div>' +
                '<div class="cc-category">' +
                    '<div class="cc-cat-info"><div class="cc-cat-name">Analityczne</div>' +
                    '<div class="cc-cat-desc">Google Analytics — statystyki odwiedzin i popularność treści.</div></div>' +
                    '<label class="cc-toggle"><input type="checkbox" id="cc-chk-analytics"><span class="cc-slider"></span></label>' +
                '</div>' +
                '<div class="cc-category">' +
                    '<div class="cc-cat-info"><div class="cc-cat-name">Marketingowe</div>' +
                    '<div class="cc-cat-desc">Hotjar (heatmapy) i Ahrefs (analiza SEO).</div></div>' +
                    '<label class="cc-toggle"><input type="checkbox" id="cc-chk-marketing"><span class="cc-slider"></span></label>' +
                '</div>' +
                '<div class="cc-category">' +
                    '<div class="cc-cat-info"><div class="cc-cat-name">Funkcjonalne</div>' +
                    '<div class="cc-cat-desc">MailerLite — formularze zapisu na newsletter i materiały PDF.</div></div>' +
                    '<label class="cc-toggle"><input type="checkbox" id="cc-chk-functional"><span class="cc-slider"></span></label>' +
                '</div>' +
                '<button id="cc-save" type="button">Zapisz ustawienia</button>' +
                '<div id="cc-admin">Administrator danych: Agilelabs Mobi-net Paweł Lewiński, pomoc@agilelabs.pl</div>' +
            '</div>' +
        '</div>';

        return { banner: banner };
    }

    /* ── 8. Wstrzyknięcie linku "Ustawienia cookies" do footera ── */
    function injectFooterLink() {
        var footer = document.querySelector('footer');
        if (!footer) return;

        var p = document.createElement('p');
        p.style.marginTop = '0.5rem';
        var a = document.createElement('a');
        a.href = '#';
        a.textContent = 'Ustawienia cookies';
        a.style.cssText = 'color:#5b5ee8;text-decoration:underline;text-underline-offset:2px;font-size:0.9rem;cursor:pointer';
        a.addEventListener('click', function (e) {
            e.preventDefault();
            showBanner(true);
        });
        p.appendChild(a);
        footer.appendChild(p);
    }

    /* ── 9. Pokaż / ukryj baner ── */
    var bannerEl, settingsPanel;
    var isBuilt = false;

    function ensureBannerBuilt() {
        if (isBuilt) return;
        isBuilt = true;

        // CSS
        var style = document.createElement('style');
        style.textContent = CSS;
        document.head.appendChild(style);

        // HTML
        var parts = buildBanner();
        bannerEl = parts.banner;
        settingsPanel = bannerEl.querySelector('#cc-settings');

        document.body.appendChild(bannerEl);

        // Event listeners
        bannerEl.querySelector('#cc-accept').addEventListener('click', function () {
            var prefs = saveConsent(true, true, true);
            applyConsent(prefs);
            hideBanner();
        });

        bannerEl.querySelector('#cc-reject').addEventListener('click', function () {
            saveConsent(false, false, false);
            hideBanner();
        });

        bannerEl.querySelector('#cc-settings-btn').addEventListener('click', function () {
            settingsPanel.classList.toggle('cc-open');
        });

        bannerEl.querySelector('#cc-save').addEventListener('click', function () {
            var a = bannerEl.querySelector('#cc-chk-analytics').checked;
            var m = bannerEl.querySelector('#cc-chk-marketing').checked;
            var f = bannerEl.querySelector('#cc-chk-functional').checked;
            var prefs = saveConsent(a, m, f);
            applyConsent(prefs);
            hideBanner();
        });

    }

    function showBanner(openSettings) {
        ensureBannerBuilt();

        // Jeśli otwieramy ponownie, załaduj aktualne ustawienia
        var existing = getConsent();
        if (existing) {
            bannerEl.querySelector('#cc-chk-analytics').checked = existing.analytics;
            bannerEl.querySelector('#cc-chk-marketing').checked = existing.marketing;
            bannerEl.querySelector('#cc-chk-functional').checked = existing.functional;
        } else {
            bannerEl.querySelector('#cc-chk-analytics').checked = false;
            bannerEl.querySelector('#cc-chk-marketing').checked = false;
            bannerEl.querySelector('#cc-chk-functional').checked = false;
        }

        if (openSettings) {
            settingsPanel.classList.add('cc-open');
        }

        // Animacja
        requestAnimationFrame(function () {
            bannerEl.classList.add('cc-visible');
        });
    }

    function hideBanner() {
        if (!bannerEl) return;
        bannerEl.classList.remove('cc-visible');
    }

    /* ── 10. Inicjalizacja ── */
    function init() {
        var consent = getConsent();
        if (consent) {
            applyConsent(consent);
            if (!consent.functional) showFormPlaceholders();
        } else {
            showBanner(false);
            showFormPlaceholders();
        }
        injectFooterLink();
    }

    // Uruchom po załadowaniu DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
