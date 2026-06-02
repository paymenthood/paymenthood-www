/* woocommerce-product.js — FAQ accordion for woocommerce-product page */
(function () {
    'use strict';

    function toggleWooFaq(el) {
        var item = el.closest('.woo-faq-item');
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.woo-faq-item.open').forEach(function (i) {
            i.classList.remove('open');
        });
        if (!isOpen) {
            item.classList.add('open');
        }
    }

    window.toggleWooFaq = toggleWooFaq;
}());
