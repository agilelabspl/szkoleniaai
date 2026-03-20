/* GA4 event tracking — shared across all pages */
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Event delegation for course cards and chatbot results
        document.addEventListener('click', function(e) {
            // Course card click
            var card = e.target.closest('.course-card');
            if (card) {
                if (typeof gtag === 'function') {
                    var h3 = card.querySelector('h3');
                    gtag('event', 'course_click', {
                        event_label: h3 ? h3.textContent : 'Unknown'
                    });
                }
                return;
            }

            // Category nav pill click
            var pill = e.target.closest('.category-nav a');
            if (pill) {
                if (typeof gtag === 'function') {
                    gtag('event', 'category_click', {
                        event_label: pill.textContent
                    });
                }
                return;
            }

            // Chatbot result click
            var result = e.target.closest('.chatbot-card[href]');
            if (result) {
                if (typeof gtag === 'function') {
                    var name = result.querySelector('.chatbot-card-name');
                    gtag('event', 'chatbot_result_click', {
                        event_label: name ? name.textContent : ''
                    });
                }
                return;
            }
        });

        // Chatbot input focus (fire once)
        var input = document.getElementById('chatbot-input');
        var focusTracked = false;
        if (input) {
            input.addEventListener('focus', function() {
                if (!focusTracked && typeof gtag === 'function') {
                    gtag('event', 'chatbot_focus');
                    focusTracked = true;
                }
            });
        }
    });
})();
