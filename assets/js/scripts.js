/*!
 * PaymentHood site scripts — vanilla JS (no jQuery).
 * Replaces the legacy ICOCrypto jQuery theme bundle. Bootstrap 5 handles the
 * mobile menu (Offcanvas), the Integrations dropdown, and the home carousel via
 * data attributes; this file covers the few bits Bootstrap doesn't:
 *   - sticky/transparent header (.is-sticky -> .has-fixed on scroll)
 *   - scroll-reveal animations ([data-animate], via IntersectionObserver)
 *   - decorative overlay class init (.nk-ovm -> .has-ovm / .has-mask on parent)
 *   - mobile submenu accordion + hamburger<->offcanvas state sync
 *   - smooth in-page anchor scrolling for menu links
 */
(function () {
    'use strict';

    var NAV_BREAK = 992; // matches the _menu.scss desktop breakpoint

    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    // ---- Sticky / transparent header -------------------------------------
    // Adds .has-fixed once the page is scrolled, so the transparent hero header
    // turns solid (mirrors the old NioApp.Util.headerSticky behavior).
    function initStickyHeader() {
        var sticky = document.querySelector('.is-sticky');
        if (!sticky) return;

        var ticking = false;
        function apply() {
            sticky.classList.toggle('has-fixed', window.pageYOffset > 10);
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(apply);
        }, { passive: true });
        apply();
    }

    // ---- Scroll-reveal animations ----------------------------------------
    // Elements ship with class .animated (visibility:hidden by default) plus a
    // data-animate keyframe name. We add the keyframe class + reveal as each
    // element enters the viewport. Without IntersectionObserver (or JS), we
    // reveal everything immediately so nothing stays hidden.
    function reveal(el) {
        var typ = el.getAttribute('data-animate');
        var dur = el.getAttribute('data-duration');
        var dly = el.getAttribute('data-delay');
        if (typ) el.classList.add(typ);
        if (dur) el.style.animationDuration = dur + 's';
        if (dly) el.style.animationDelay = dly + 's';
        el.style.visibility = 'visible';
    }

    function initScrollReveal() {
        var items = document.querySelectorAll('.animated[data-animate]');
        if (!items.length) return;

        // No IntersectionObserver (or JS) -> reveal everything so nothing stays hidden.
        if (!('IntersectionObserver' in window)) {
            Array.prototype.forEach.call(items, reveal);
            return;
        }

        // The observer does the intersection work off the main thread, so there
        // are zero per-scroll layout reads (no getBoundingClientRect thrash). The
        // -8% bottom rootMargin reproduces the old `top < innerHeight * 0.92`
        // trigger; elements already on screen fire on the first callback, which
        // covers above-the-fold reveal on load.
        var io = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    reveal(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px' });

        Array.prototype.forEach.call(items, function (el) { io.observe(el); });
    }

    // ---- Decorative overlay masks ----------------------------------------
    // Flags parents of .nk-ovm so the theme's overlay CSS can target them.
    function initOverlays() {
        document.querySelectorAll('.nk-ovm').forEach(function (el) {
            if (el.parentElement) el.parentElement.classList.add('has-ovm');
        });
        document.querySelectorAll('.nk-ovm[class*="mask"]').forEach(function (el) {
            if (el.parentElement) el.parentElement.classList.add('has-mask');
        });
    }

    // ---- Menu: mobile submenu accordion + desktop hub link ---------------
    // Desktop (>= NAV_BREAK): the mega-menu opens on hover (pure CSS); clicking
    // the "Integrations" parent navigates to the hub page. Mobile: clicking the
    // parent toggles its submenu open (and closes siblings).
    function initMenu() {
        document.querySelectorAll('.menu .has-sub > .menu-toggle').forEach(function (toggle) {
            toggle.addEventListener('click', function (e) {
                if (window.innerWidth >= NAV_BREAK) {
                    if (toggle.parentElement.classList.contains('has-mega')) {
                        window.location.href = '/integrations/';
                    }
                    return; // hover CSS handles the dropdown on desktop
                }
                e.preventDefault();
                var li = toggle.parentElement;
                var willOpen = !li.classList.contains('open-nav');
                Array.prototype.forEach.call(li.parentElement.children, function (sib) {
                    sib.classList.remove('open-nav');
                });
                li.classList.toggle('open-nav', willOpen);
            });
        });
    }

    // ---- Hamburger <-> Offcanvas state sync ------------------------------
    // Bootstrap's Offcanvas drives the mobile drawer; we mirror its open state
    // onto the toggle button so the hamburger animates into an X.
    function initOffcanvasSync() {
        var drawer = document.getElementById('headerMenu');
        var toggle = document.querySelector('.navbar-toggle');
        if (!drawer || !toggle) return;
        drawer.addEventListener('show.bs.offcanvas', function () {
            toggle.classList.add('navbar-active');
        });
        drawer.addEventListener('hide.bs.offcanvas', function () {
            toggle.classList.remove('navbar-active');
        });
    }

    // ---- Smooth in-page anchor scrolling ---------------------------------
    function initSmoothScroll() {
        var header = document.querySelector('.header-main');
        document.querySelectorAll('a.menu-link[href*="#"]:not([href="#"])').forEach(function (link) {
            link.addEventListener('click', function (e) {
                if (link.pathname !== window.location.pathname || link.hostname !== window.location.hostname) {
                    return; // different page — let the browser navigate
                }
                var target = document.getElementById(link.hash.slice(1));
                if (!target) return;
                e.preventDefault();
                var offset = header ? header.offsetHeight : 0;
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            });
        });
    }

    ready(function () {
        initStickyHeader();
        initScrollReveal();
        initOverlays();
        initMenu();
        initOffcanvasSync();
        initSmoothScroll();
    });
}());
