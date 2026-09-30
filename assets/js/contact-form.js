/* Contact form (contact-us.html): send to Formspree in the background.
 *
 * Success -> /thank-you.html. Keep that exact path: GTM fires the GA4
 * generate_lead conversion on a page view of it.
 * Failure -> #contact-error, with everything the visitor typed left in the
 * form, a pre-filled email link and a copy button, so no message is lost.
 *
 * Progressive enhancement only: without this script the form posts normally
 * to Formspree, which shows its own confirmation page.
 */
(function () {
    'use strict';

    var form = document.getElementById('contact-form');
    if (!form || !window.fetch || !window.FormData) return;

    var SUCCESS_URL = '/thank-you.html';
    var TIMEOUT_MS = 15000;
    var LABELS = { name: 'your name', email: 'your email address', message: 'your message' };

    var button = document.getElementById('contact-submit');
    var buttonHtml = button.innerHTML;
    var error = document.getElementById('contact-error');
    var detail = document.getElementById('contact-error-detail');
    var mail = document.getElementById('contact-error-mail');
    var copy = document.getElementById('contact-copy');
    var copyLabel = copy.querySelector('span');
    var copyText = copyLabel.textContent;
    var busy = false;

    function value(name) {
        var el = form.elements[name];
        return el ? el.value.trim() : '';
    }

    function asText() {
        return 'Name: ' + value('name') + '\nEmail: ' + value('email') + '\n\n' + value('message');
    }

    function setBusy(on) {
        busy = on;
        button.disabled = on;
        button.setAttribute('aria-busy', on ? 'true' : 'false');
        button.innerHTML = on
            ? '<em class="fas fa-spinner fa-spin me-2" aria-hidden="true"></em>Sending…'
            : buttonHtml;
    }

    function showError(reason) {
        detail.textContent = reason;
        // The address is read from the link, never written into this file, so it is not
        // exposed to scrapers here. By now Cloudflare's email decoder has turned the link
        // back into a plain mailto:; if it has not, the link is left as it is (it still works).
        var base = (mail.getAttribute('href') || '').split('?')[0];
        if (base.indexOf('mailto:') === 0) {
            mail.href = base +
                '?subject=' + encodeURIComponent('Contact form message from ' + (value('name') || 'the website')) +
                '&body=' + encodeURIComponent(asText());
        }
        error.classList.remove('d-none');
        // role="alert" announces it; focus also scrolls it into view on small screens.
        error.focus();
    }

    var KEPT = ' Nothing you typed has been lost.';
    var RETRY = KEPT + ' Try again in a minute, or send it to us by email.';

    function reasonFor(status, data) {
        var errors = data && data.errors;
        if (status === 422 && errors && errors.length) {
            var fields = [];
            errors.forEach(function (e) {
                var label = LABELS[e.field];
                if (label && fields.indexOf(label) < 0) fields.push(label);
            });
            if (fields.length) return 'Please check ' + fields.join(' and ') + ', then press Send Message again.' + KEPT;
        }
        return 'Our mail service had a problem.' + RETRY;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (busy) return;

        error.classList.add('d-none');
        setBusy(true);

        var controller = window.AbortController ? new AbortController() : null;
        var timer = controller ? setTimeout(function () { controller.abort(); }, TIMEOUT_MS) : null;

        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' },
            signal: controller ? controller.signal : undefined
        }).then(function (response) {
            return response.json().catch(function () { return {}; }).then(function (data) {
                clearTimeout(timer);
                if (response.ok) {
                    // Stay busy until the browser leaves, so a second click cannot resend.
                    window.location.assign(SUCCESS_URL);
                    return;
                }
                if (response.status === 403 && /recaptcha/i.test((data && data.error) || '')) {
                    // reCAPTCHA is switched on in the Formspree form settings, and Formspree
                    // refuses background submissions then. Formspree answered, so it is up:
                    // hand over to a normal post, which shows Formspree's captcha page and
                    // then its own confirmation page. form.submit() does not fire this
                    // handler again. (Redirecting from there back to /thank-you.html needs
                    // a paid Formspree plan, so the GTM conversion is not counted on this path.)
                    form.submit();
                    return;
                }
                setBusy(false);
                showError(reasonFor(response.status, data));
            });
        }).catch(function () {
            clearTimeout(timer);
            setBusy(false);
            showError('We couldn’t reach our mail service.' + RETRY);
        });
    });

    // Coming back from the thank-you page restores this page from the back/forward
    // cache with the button still in its "Sending" state.
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) setBusy(false);
    });

    function flash(text) {
        copyLabel.textContent = text;
        setTimeout(function () { copyLabel.textContent = copyText; }, 2500);
    }

    function legacyCopy(text) {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.className = 'visually-hidden';
        document.body.appendChild(area);
        area.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(area);
        flash(ok ? 'Copied' : 'Copy failed – select the text above instead');
    }

    copy.addEventListener('click', function () {
        var text = asText();
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function () { flash('Copied'); }, function () { legacyCopy(text); });
        } else {
            legacyCopy(text);
        }
    });
})();
