/* Category counts — SINGLE SOURCE OF TRUTH for course numbers.
   When adding/removing a course, update the number here. Everything else auto-updates. */
(function() {
    var counts = {
        "biznes": 32,
        "produkty": 18,
        "marketing": 17,
        "programisci": 20,
        "automatyzacja": 10,
        "ogolne": 28,
        "grafika": 11,
        "hr": 10,
        "finanse": 9,
        "prawo": 9,
        "wideo": 5,
        "studia-podyplomowe": 7
    };

    // Compute total
    var total = 0;
    for (var key in counts) total += counts[key];

    // Update #total-courses on index.html
    var totalEl = document.getElementById('total-courses');
    if (totalEl) totalEl.textContent = total;

    // Update pill labels with (N)
    var nav = document.querySelector('.category-nav');
    if (nav) {
        nav.querySelectorAll('a').forEach(function(link) {
            var href = link.getAttribute('href') || '';
            var match = href.match(/szkolenia-ai-(.+)\.html/);
            if (!match) return;
            var slug = match[1];
            var count = counts[slug];
            if (count !== undefined) {
                link.textContent = link.textContent + ' (' + count + ')';
            }
        });
    }

    // Update course count badge on subpages
    var badge = document.getElementById('category-course-count');
    if (badge) {
        var path = window.location.pathname;
        var pageMatch = path.match(/szkolenia-ai-(.+)\.html/);
        if (pageMatch && counts[pageMatch[1]] !== undefined) {
            badge.textContent = counts[pageMatch[1]];
        }
    }
})();
