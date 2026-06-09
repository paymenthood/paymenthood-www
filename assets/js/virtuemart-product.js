/* virtuemart-product.js — FAQ accordion for virtuemart-product page */
(function () {
    'use strict';

    function toggleVmFaq(el) {
        var item = el.closest('.vm-faq-item');
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.vm-faq-item.open').forEach(function (i) {
            i.classList.remove('open');
        });
        if (!isOpen) {
            item.classList.add('open');
        }
    }

    window.toggleVmFaq = toggleVmFaq;
}());
