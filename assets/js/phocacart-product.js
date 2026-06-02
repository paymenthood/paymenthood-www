/* phocacart-product.js — FAQ accordion for phocacart-product page */
(function () {
    'use strict';

    function togglePhocaFaq(el) {
        var item = el.closest('.phoca-faq-item');
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.phoca-faq-item.open').forEach(function (i) {
            i.classList.remove('open');
        });
        if (!isOpen) {
            item.classList.add('open');
        }
    }

    window.togglePhocaFaq = togglePhocaFaq;
}());
