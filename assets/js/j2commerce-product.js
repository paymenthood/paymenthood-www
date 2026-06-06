/* j2commerce-product.js — FAQ accordion for j2commerce-product page */
(function () {
    'use strict';

    function toggleJ2cFaq(el) {
        var item = el.closest('.j2c-faq-item');
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.j2c-faq-item.open').forEach(function (i) {
            i.classList.remove('open');
        });
        if (!isOpen) {
            item.classList.add('open');
        }
    }

    window.toggleJ2cFaq = toggleJ2cFaq;
}());
