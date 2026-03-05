/* ─── RATE BANNER — baner "Oceń szkolenie" w każdej sekcji kategorii ─── */
(function() {
    var ENABLED = false; // Feature flag — zmień na true żeby włączyć banery
    if (!ENABLED) return;

    var FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSecBGV2HlikJFBD5YhrzapFPqocY_CyQ2GZ93R0z3d6Agm3qQ/viewform';

    var style = document.createElement('style');
    style.textContent = ''
        + '.rate-banner {'
        + '  display: flex; align-items: center; gap: 1rem;'
        + '  background: linear-gradient(135deg, #6366f1, #06b6d4);'
        + '  border-radius: 12px;'
        + '  padding: 1rem 1.5rem;'
        + '  margin-bottom: 1.5rem;'
        + '  color: #fff;'
        + '  text-decoration: none;'
        + '  transition: all 0.25s ease;'
        + '}'
        + '.rate-banner:hover {'
        + '  background: linear-gradient(135deg, #4f46e5, #0891b2);'
        + '  transform: translateY(-2px);'
        + '  box-shadow: 0 12px 24px rgba(99,102,241,0.2);'
        + '}'
        + '.rate-banner-stars {'
        + '  font-size: 1.5rem;'
        + '  line-height: 1;'
        + '  flex-shrink: 0;'
        + '}'
        + '.rate-banner-text {'
        + '  flex: 1;'
        + '}'
        + '.rate-banner-title {'
        + '  font-weight: 700;'
        + '  font-size: 0.95rem;'
        + '  margin-bottom: 0.1rem;'
        + '}'
        + '.rate-banner-desc {'
        + '  font-size: 0.85rem;'
        + '  opacity: 0.9;'
        + '}'
        + '.rate-banner-arrow {'
        + '  font-size: 1.25rem;'
        + '  flex-shrink: 0;'
        + '  font-weight: 600;'
        + '  opacity: 0.8;'
        + '  transition: transform 0.2s ease;'
        + '}'
        + '.rate-banner:hover .rate-banner-arrow {'
        + '  transform: translateX(4px);'
        + '}'
        + '@media (max-width: 600px) {'
        + '  .rate-banner { padding: 0.85rem 1rem; gap: 0.75rem; }'
        + '  .rate-banner-stars { font-size: 1.25rem; }'
        + '  .rate-banner-title { font-size: 0.9rem; }'
        + '  .rate-banner-desc { font-size: 0.8rem; }'
        + '}';
    document.head.appendChild(style);

    var sections = document.querySelectorAll('.category-section');
    sections.forEach(function(section) {
        var desc = section.querySelector('.category-desc');
        if (!desc) return;

        var banner = document.createElement('a');
        banner.href = FORM_URL;
        banner.target = '_blank';
        banner.rel = 'noopener noreferrer';
        banner.className = 'rate-banner';
        banner.onclick = function() {
            if (typeof gtag === 'function') {
                gtag('event', 'ocen_kurs_click', {
                    event_category: 'engagement',
                    event_label: section.id || 'unknown'
                });
            }
        };

        banner.innerHTML = ''
            + '<span class="rate-banner-stars">★★★★★</span>'
            + '<span class="rate-banner-text">'
            + '  <span class="rate-banner-title">Byłeś na szkoleniu z tej kategorii? Oceń je!</span>'
            + '  <span class="rate-banner-desc">Twoja opinia pomoże innym wybrać najlepszy kurs</span>'
            + '</span>'
            + '<span class="rate-banner-arrow">→</span>';

        desc.insertAdjacentElement('afterend', banner);
    });
})();
