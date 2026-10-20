/* Home hero slider (index.html #heroSlider).
 *
 * Two slides, cross-faded. Slide 1 is the original hero and carries .is-active in
 * the markup, so without this script the page is the original hero and the
 * controls stay [hidden].
 *
 * Rotates every 2 seconds. Accessibility (WCAG 2.2.2 Pause, Stop, Hide):
 *   - a visitor whose system asks for reduced motion still gets the rotation (the site owner
 *     wants it to move), but the slides swap instantly instead of cross-fading (see the
 *     prefers-reduced-motion block in _hero-slider.scss), and the pause button is there;
 *   - it pauses while the pointer is over the hero, while focus is inside it, and
 *     while the tab is hidden;
 *   - a visible pause button stops it for good until the visitor presses play;
 *   - the region is aria-live="off" while it rotates by itself and "polite" once
 *     it is stopped, so a screen reader is not interrupted by a slide change but
 *     does hear the slide a visitor chose.
 */
(function () {
    'use strict';

    var root = document.getElementById('heroSlider');
    if (!root) return;

    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    // The controls exist in several places (beside the last button of each slide, and a
    // pill under the hero on phones); only one set is displayed. All are kept in step.
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var pauses = Array.prototype.slice.call(root.querySelectorAll('.hero-pause'));
    var controls = Array.prototype.slice.call(root.querySelectorAll('[data-hero-controls]'));
    if (slides.length < 2 || !controls.length) return;

    // Time each slide stays up. The count always restarts from zero: after a pause, after the
    // pointer leaves, after the tab comes back. It is never carried over.
    var INTERVAL = 5000;
    var index = 0;
    var timer = null;
    var userPaused = false;
    var hovering = false;
    var focusInside = false;

    function show(i) {
        index = (i + slides.length) % slides.length;
        slides.forEach(function (slide, n) {
            var active = n === index;
            if (active && !slide.classList.contains('is-mounted')) {
                // Rendered for the first time: force a layout so the fade starts from
                // opacity 0 instead of appearing at once.
                slide.classList.add('is-mounted');
                void slide.offsetWidth;
            }
            slide.classList.toggle('is-active', active);
            // visibility:hidden on the slide is not enough: the entrance animation
            // sets an inline visibility:visible on elements inside slide 1, which
            // would keep them focusable and readable by a screen reader.
            // inert removes the whole inactive slide from both.
            if ('inert' in slide) slide.inert = !active;
        });
        dots.forEach(function (dot) {
            var current = (parseInt(dot.getAttribute('data-slide'), 10) || 0) === index;
            dot.setAttribute('aria-current', current ? 'true' : 'false');
        });
    }

    function playing() {
        return !userPaused && !hovering && !focusInside && !document.hidden;
    }

    var due = 0;

    function schedule() {
        window.clearTimeout(timer);
        timer = null;
        root.setAttribute('aria-live', userPaused ? 'polite' : 'off');
        if (!playing()) return;
        // Every call restarts a full interval, so a pause or a hover is never "carried over".
        due = Date.now() + INTERVAL;
        timer = window.setTimeout(function tick() {
            var left = due - Date.now();
            if (left > 50) { timer = window.setTimeout(tick, left); return; }   // fired early: wait the rest
            show(index + 1);
            schedule();
        }, INTERVAL);
    }

    function setPaused(value) {
        userPaused = value;
        pauses.forEach(function (pause) {
            pause.setAttribute('aria-pressed', value ? 'true' : 'false');
            pause.setAttribute('aria-label', value ? 'Play slideshow' : 'Pause slideshow');
        });
        schedule();
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            show(parseInt(dot.getAttribute('data-slide'), 10) || 0);
            // A visitor who picks a slide has taken control: stop rotating.
            setPaused(true);
        });
    });

    pauses.forEach(function (pause) {
        pause.addEventListener('click', function () {
            setPaused(!userPaused);
        });
    });

    // Pause while the MOUSE is over the hero; counting starts again from zero when it leaves.
    // Only a real mouse counts: on a touch screen the browser fakes a hover that stays after a
    // tap and would freeze the slider until the next tap elsewhere.
    function isMouse(event) { return !event.pointerType || event.pointerType === 'mouse'; }
    root.addEventListener('pointerenter', function (event) {
        if (isMouse(event)) { hovering = true; schedule(); }
    });
    root.addEventListener('pointerleave', function (event) {
        if (isMouse(event)) { hovering = false; schedule(); }
    });
    // The pointer may already be over the hero when the page loads.
    try { hovering = root.matches(':hover'); } catch (e) { hovering = false; }

    // Pause while a KEYBOARD user has focus inside the hero (so a slide does not change under
    // them), but not after a mouse click: clicking pause, play or a dot leaves focus on that
    // button, and counting that as "focus inside" froze the slider until the next click elsewhere.
    function keyboardFocus(target) {
        try { return target.matches(':focus-visible'); } catch (e) { return !usedPointer; }
    }
    var usedPointer = false;
    root.addEventListener('pointerdown', function () { usedPointer = true; }, true);
    document.addEventListener('keydown', function () { usedPointer = false; }, true);
    root.addEventListener('focusin', function (event) {
        focusInside = keyboardFocus(event.target);
        schedule();
    });
    root.addEventListener('focusout', function (event) {
        if (!root.contains(event.relatedTarget)) { focusInside = false; schedule(); }
    });
    document.addEventListener('visibilitychange', schedule);

    // Swipe on touch screens.
    var startX = 0;
    var startY = 0;
    root.addEventListener('touchstart', function (event) {
        var touch = event.changedTouches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    }, { passive: true });
    root.addEventListener('touchend', function (event) {
        var touch = event.changedTouches[0];
        var dx = touch.clientX - startX;
        var dy = touch.clientY - startY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            show(index + (dx < 0 ? 1 : -1));
            setPaused(true);
        }
    }, { passive: true });

    // The tablet/desktop controls sit beside slide 1's "View All" button and stay there on both
    // slides. Their position is measured from that button (offset* ignores the entrance
    // animation's transform) and redone whenever the layout can change.
    var ctrl = root.querySelector('.hero-ctrl');
    var anchor = root.querySelector('#heroSlide1 .hero-attach a');

    function placeControls() {
        if (!ctrl || !anchor || ctrl.hidden || !ctrl.offsetParent && getComputedStyle(ctrl).display === 'none') return;
        var x = 0, y = 0, el = anchor;
        while (el && el !== root) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
        if (el !== root) return;
        ctrl.style.left = (x + anchor.offsetWidth + 14) + 'px';
        ctrl.style.top = Math.round(y + (anchor.offsetHeight - ctrl.offsetHeight) / 2) + 'px';
    }

    show(index);
    controls.forEach(function (box) { box.hidden = false; });
    placeControls();
    window.addEventListener('resize', placeControls);
    window.addEventListener('load', placeControls);
    if (window.ResizeObserver) new ResizeObserver(placeControls).observe(root);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeControls);
    window.setTimeout(placeControls, 1500);   // after the entrance animations
    setPaused(userPaused);

    // Render the other slides once the page has settled, so the first fade is
    // smooth and the badge image is already there.
    function mountAll() {
        slides.forEach(function (slide) { slide.classList.add('is-mounted'); });
    }
    function whenIdle() {
        if (window.requestIdleCallback) window.requestIdleCallback(mountAll, { timeout: 3000 });
        else window.setTimeout(mountAll, 1500);
    }
    if (document.readyState === 'complete') whenIdle();
    else window.addEventListener('load', whenIdle);
})();
