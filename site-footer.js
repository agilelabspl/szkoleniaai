/* ─── SITE FOOTER — single source, all pages ─── */
(function() {
    var path = window.location.pathname;
    var linkedIn = 'https://www.linkedin.com/in/pawellewinski/';

    // Context-aware second line
    var secondLine = '';
    if (path === '/' || path.endsWith('/index.html') || path.endsWith('/szkoleniaai/')) {
        secondLine = 'Znasz szkolenie AI, kt\u00f3re warto tu doda\u0107? <a href="' + linkedIn + '" target="_blank" rel="noopener noreferrer">Napisz do mnie</a>';
    } else if (path.indexOf('wydarzenia') !== -1) {
        secondLine = 'Znasz wydarzenie AI, kt\u00f3re warto tu doda\u0107? <a href="' + linkedIn + '" target="_blank" rel="noopener noreferrer">Napisz do mnie</a>';
    } else if (path.indexOf('zbudowane') !== -1) {
        secondLine = 'Znasz polski produkt AI, kt\u00f3ry warto tu doda\u0107? <a href="' + linkedIn + '" target="_blank" rel="noopener noreferrer">Napisz do mnie</a>';
    } else if (path.indexOf('praca-ai') !== -1) {
        secondLine = 'Szukasz szkolenia AI? <a href="index.html">Sprawd\u017a katalog kurs\u00f3w \u2192</a>';
    } else if (path.indexOf('quiz') !== -1) {
        secondLine = '<a href="index.html">Przegl\u0105daj pe\u0142ny katalog kurs\u00f3w AI \u2192</a>';
    } else if (path.indexOf('/slownik/') !== -1) {
        secondLine = '<a href="../slownik.html">Wszystkie terminy AI \u2192</a>';
    } else if (path.indexOf('slownik') !== -1) {
        secondLine = 'Brakuje jakiego\u015b terminu? <a href="' + linkedIn + '" target="_blank" rel="noopener noreferrer">Napisz do mnie</a>';
    }

    var html = '<footer class="site-footer">'
        + '<p>Twoim przewodnikiem jest <a href="' + linkedIn + '" target="_blank" rel="noopener noreferrer">Pawe\u0142 Lewi\u0144ski</a></p>'
        + (secondLine ? '<p>' + secondLine + '</p>' : '')
        + '</footer>';

    document.currentScript.insertAdjacentHTML('afterend', html);
})();
