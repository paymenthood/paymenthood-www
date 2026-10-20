/* Colour theme selector: Light, Dark, System.
 *
 * The first paint is handled by the inline script in header.html, which reads the
 * saved choice (localStorage "ph_theme": light or dark; absent means System) and
 * sets data-theme and data-theme-pref on <html>. This file keeps that in step:
 *   - saves a choice made in the menu (System removes the key);
 *   - while the choice is System, follows the operating system when it changes;
 *   - follows a choice made in another tab;
 *   - runs the popover on desktop (the options are inline in the mobile menu).
 *
 * The stylesheet only ever matches html[data-theme="dark"].
 */
(function () {
    'use strict';

    var KEY = 'ph_theme';
    var root = document.documentElement;
    var query = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    var LABELS = { light: 'Light', dark: 'Dark', system: 'System' };

    function read() {
        try {
            var saved = window.localStorage.getItem(KEY);
            if (saved === 'light' || saved === 'dark') return saved;
        } catch (e) { /* storage blocked: follow the system */ }
        return 'system';
    }

    function save(pref) {
        try {
            if (pref === 'system') window.localStorage.removeItem(KEY);
            else window.localStorage.setItem(KEY, pref);
        } catch (e) { /* not persisted; still applies to this page */ }
    }

    function apply(pref) {
        var dark = pref === 'dark' || (pref === 'system' && !!query && query.matches);
        root.setAttribute('data-theme-pref', pref);
        root.setAttribute('data-theme', dark ? 'dark' : 'light');
    }

    var box = document.querySelector('[data-theme-switch]');
    var button = box && box.querySelector('.theme-switch-btn');
    var radios = box ? Array.prototype.slice.call(box.querySelectorAll('.ts-input')) : [];

    function sync(pref) {
        radios.forEach(function (radio) { radio.checked = radio.value === pref; });
        if (button) {
            button.setAttribute('aria-label', 'Colour theme: ' + LABELS[pref] + '. Change theme');
        }
    }

    // Follow the operating system while the choice is System.
    function onSystemChange() {
        if (read() === 'system') apply('system');
    }
    if (query) {
        if (query.addEventListener) query.addEventListener('change', onSystemChange);
        else if (query.addListener) query.addListener(onSystemChange);
    }

    // A choice made in another tab.
    window.addEventListener('storage', function (event) {
        if (event.key !== KEY) return;
        var pref = read();
        apply(pref);
        sync(pref);
    });

    if (!box || !button) return;

    function isOpen() { return box.classList.contains('is-open'); }

    function setOpen(open, returnFocus) {
        box.classList.toggle('is-open', open);
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
            var checked = box.querySelector('.ts-input:checked') || radios[0];
            if (checked) checked.focus();
        } else if (returnFocus) {
            button.focus();
        }
    }

    button.addEventListener('click', function () { setOpen(!isOpen(), false); });

    radios.forEach(function (radio) {
        // Arrow keys move through a native radio group and select as they go, so the
        // theme previews live and the panel stays open. A pointer click or Enter
        // confirms and closes it (in the mobile menu the panel is inline and never closes).
        radio.addEventListener('change', function () {
            if (!radio.checked) return;
            save(radio.value);
            apply(radio.value);
            sync(radio.value);
        });

        radio.addEventListener('click', function (event) {
            // detail is 0 for the click the browser synthesises on an arrow key press.
            if (event.detail > 0 && isOpen()) setOpen(false, true);
        });

        radio.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && isOpen()) {
                event.preventDefault();
                setOpen(false, true);
            }
        });
    });

    box.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && isOpen()) {
            event.stopPropagation();
            setOpen(false, true);
        }
    });

    document.addEventListener('click', function (event) {
        if (isOpen() && !box.contains(event.target)) setOpen(false, false);
    });

    // Pressing the mouse on an option's label would move focus to the nearest focusable
    // ancestor (the slide-in menu container), which the focusout handler below would read as
    // "left the control" and close the panel before the click lands. Keep focus where it is.
    box.addEventListener('mousedown', function (event) {
        if (event.target.closest && event.target.closest('.ts-option')) event.preventDefault();
    });

    box.addEventListener('focusout', function (event) {
        if (isOpen() && event.relatedTarget && !box.contains(event.relatedTarget)) setOpen(false, false);
    });

    sync(read());
    box.classList.add('is-ready');
})();
