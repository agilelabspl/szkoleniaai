/* ─── SITE NAV + ANNOUNCEMENT — single source, all pages ─── */
(function() {
    // Detect if we're in a subdirectory (e.g. slownik/)
    var prefix = '';
    var path = window.location.pathname;
    if (path.indexOf('/slownik/') !== -1) {
        prefix = '../';
    }

    // Detect active page
    var active = '';
    if (path === '/' || path.endsWith('/index.html') || path.endsWith('/szkoleniaai/')) {
        active = 'szkolenia';
    } else if (path.indexOf('wydarzenia') !== -1) {
        active = 'wydarzenia';
    } else if (path.indexOf('zbudowane') !== -1) {
        active = 'zbudowane';
    } else if (path.indexOf('praca-ai') !== -1) {
        active = 'praca';
    } else if (path.indexOf('podcasty') !== -1) {
        active = 'podcasty';
    } else if (path.indexOf('quiz') !== -1) {
        active = 'quiz';
    } else if (path.indexOf('szkolenia-ai-') !== -1) {
        active = 'szkolenia';
    }

    // Announcement bar — edit text here, one place for all pages
    // Set to empty string '' to hide the bar
    var announcementText = 'Zbudowałem to z AI. Też chcesz coś zbudować? <a href="https://www.linkedin.com/in/pawellewinski/" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;text-underline-offset:2px;">Napisz do mnie</a>';

    var html = '';

    // Skip to content link (a11y)
    html += '<a href="#main-content" class="skip-link">Przejdź do treści</a>';

    // Announcement bar
    if (announcementText) {
        html += '<div class="site-announcement" id="site-announcement">'
            + '<span>' + announcementText + '</span>'
            + '<button onclick="document.getElementById(\'site-announcement\').style.display=\'none\'" aria-label="Zamknij">&times;</button>'
            + '</div>';
    }

    // Navigation
    html += '<nav class="site-nav">'
        + '<div class="site-nav-inner">'
        + '<a href="' + prefix + 'index.html" class="site-nav-brand"><span>AI</span> Przewodnik</a>'
        + '<button class="nav-toggle" onclick="document.getElementById(\'site-nav-links\').classList.toggle(\'open\')" aria-label="Menu">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>'
        + '</button>'
        + '<ul class="site-nav-links" id="site-nav-links">'
        + '<li><a href="' + prefix + 'index.html"' + (active === 'szkolenia' ? ' class="active"' : '') + '>Szkolenia AI</a></li>'
        + '<li><a href="' + prefix + 'wydarzenia-ai.html"' + (active === 'wydarzenia' ? ' class="active"' : '') + '>Wydarzenia AI</a></li>'
        + '<li><a href="' + prefix + 'zbudowane-z-ai.html"' + (active === 'zbudowane' ? ' class="active"' : '') + '>Zbudowane z AI <span class="nav-flag">\uD83C\uDDF5\uD83C\uDDF1</span></a></li>'
        + '<li><a href="' + prefix + 'praca-ai.html"' + (active === 'praca' ? ' class="active"' : '') + '>Praca w AI</a></li>'
        + '<li><a href="' + prefix + 'quiz.html" class="nav-cta' + (active === 'quiz' ? ' active' : '') + '">Quiz AI</a></li>'
        + '</ul>'
        + '</div>'
        + '</nav>';

    // Insert after the current script tag
    var currentScript = document.currentScript;
    if (currentScript) {
        currentScript.insertAdjacentHTML('afterend', html);
    } else {
        document.body.insertAdjacentHTML('afterbegin', html);
    }
})();
