/* product-page.js — FAQ accordion shared by all integration product pages */
(function () {
    'use strict';

    function toggleFaq(el) {
        var item = el.closest('.faq-item');
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function (i) {
            i.classList.remove('open');
        });
        if (!isOpen) {
            item.classList.add('open');
        }
    }

    // Expose globally so inline onclick attributes still work
    window.toggleFaq = toggleFaq;
}());
