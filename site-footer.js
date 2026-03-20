/* ─── SITE FOOTER — single source, all pages ─── */
(function() {
    var path = window.location.pathname;
    var linkedIn = 'https://www.linkedin.com/in/pawellewinski/';

    // Context-aware second line
    var secondLine = '';
    if (path === '/' || path.endsWith('/index.html') || path.endsWith('/szkoleniaai/')) {
        secondLine = 'Znasz szkolenie AI, które warto tu dodać? <a href="' + linkedIn + '" target="_blank" rel="noopener noreferrer">Napisz do mnie</a>';
    } else if (path.indexOf('wydarzenia') !== -1) {
        secondLine = 'Znasz wydarzenie AI, które warto tu dodać? <a href="' + linkedIn + '" target="_blank" rel="noopener noreferrer">Napisz do mnie</a>';
    } else if (path.indexOf('zbudowane') !== -1) {
        secondLine = 'Znasz polski produkt AI, który warto tu dodać? <a href="' + linkedIn + '" target="_blank" rel="noopener noreferrer">Napisz do mnie</a>';
    } else if (path.indexOf('podcasty-ai') !== -1) {
        secondLine = 'Znasz polski podcast lub kanał AI, który warto tu dodać? <a href="' + linkedIn + '" target="_blank" rel="noopener noreferrer">Napisz do mnie</a>';
    } else if (path.indexOf('praca-ai') !== -1) {
        secondLine = 'Szukasz szkolenia AI? <a href="index.html">Sprawdź katalog kursów →</a>';
    } else if (path.indexOf('quiz') !== -1) {
        secondLine = '<a href="index.html">Przeglądaj pełny katalog kursów AI →</a>';
    } else if (path.indexOf('/slownik/') !== -1) {
        secondLine = '<a href="../slownik.html">Wszystkie terminy AI →</a>';
    } else if (path.indexOf('slownik') !== -1) {
        secondLine = 'Brakuje jakiegoś terminu? <a href="' + linkedIn + '" target="_blank" rel="noopener noreferrer">Napisz do mnie</a>';
    }

    var html = '<footer class="site-footer">'
        + '<p>Twoim przewodnikiem jest <a href="' + linkedIn + '" target="_blank" rel="noopener noreferrer">Paweł Lewiński</a></p>'
        + (secondLine ? '<p>' + secondLine + '</p>' : '')
        + '</footer>';

    document.currentScript.insertAdjacentHTML('afterend', html);
})();
