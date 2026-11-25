/* ==========================================================================
   Portfolio V4 · Aníbal Oliveira
   Plain JavaScript, no libraries. Four small parts:
   1. Theme toggle (remembers the choice)
   2. Headline entrance (words rise in one after another)
   3. Scroll reveals (fade and small rise)
   4. The thread (a line that draws itself through Problem, Decision, Outcome)
   Everything is optional: with JavaScript off, or with "reduce motion" on,
   the page shows all its content straight away.
   ========================================================================== */
(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 1. Theme toggle ---------- */
    var toggle = document.querySelector('.theme-toggle');

    function currentTheme() {
        return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }

    function labelToggle() {
        if (!toggle) return;
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        toggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    }

    if (toggle) {
        labelToggle();
        toggle.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('v4-theme', next); } catch (e) { }
            labelToggle();
        });
    }

    /* ---------- 2. Headline entrance ----------
       Wraps every word of h1[data-split] in two spans so each word can rise
       from behind its own edge. Keeps <em> around the words it contained. */
    function splitHeadline(h) {
        var index = 0;
        var out = document.createDocumentFragment();

        function addWords(text, wrapTag) {
            var parts = text.split(/(\s+)/);          // keeps the spaces
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (!part) continue;
                if (/^\s+$/.test(part)) {
                    out.appendChild(document.createTextNode(' '));
                    continue;
                }
                var outer = document.createElement('span');
                var inner = document.createElement('span');
                outer.className = 'w';
                inner.style.setProperty('--i', index++);
                if (wrapTag) {
                    var tag = document.createElement(wrapTag);
                    tag.textContent = part;
                    inner.appendChild(tag);
                } else {
                    inner.textContent = part;
                }
                outer.appendChild(inner);
                out.appendChild(outer);
            }
        }

        for (var n = h.firstChild; n; n = n.nextSibling) {
            if (n.nodeType === 3) addWords(n.nodeValue, null);
            else if (n.nodeName === 'BR') out.appendChild(n.cloneNode(false));
            else if (n.nodeType === 1) addWords(n.textContent, n.tagName.toLowerCase());
        }

        h.textContent = '';
        h.appendChild(out);
        h.classList.add('is-split');
    }

    var headline = document.querySelector('h1[data-split]');
    if (headline) {
        if (reduceMotion) headline.classList.add('is-split');   // show as is
        else splitHeadline(headline);
    }

    /* ---------- 3. Scroll reveals ----------
       Anything with data-reveal gets the class "in" when it enters the
       viewport. The CSS does the fade; --d on the element sets the stagger. */
    var reveals = document.querySelectorAll('[data-reveal]');

    function showAll() {
        for (var i = 0; i < reveals.length; i++) reveals[i].classList.add('in');
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
        showAll();
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });

        for (var r = 0; r < reveals.length; r++) io.observe(reveals[r]);
    }

    /* ---------- 4. The thread ----------
       The amber line grows as the page scrolls. "Reach" is a point 72% down
       the window: the line is drawn up to it, and every step whose dot is
       above it lights up. Scrolling back up reverses it. */
    var wrap = document.querySelector('.thread-wrap');
    var line = wrap && wrap.querySelector('.thread');
    var steps = wrap ? wrap.querySelectorAll('.step') : [];
    var header = document.querySelector('.site-header');
    var ticking = false;

    function update() {
        ticking = false;

        if (header) {
            header.classList.toggle('is-scrolled', window.pageYOffset > 8);
        }
        if (!line || reduceMotion) return;

        var reach = window.innerHeight * 0.72;
        var box = line.getBoundingClientRect();
        var t = box.height ? (reach - box.top) / box.height : 1;
        t = Math.max(0, Math.min(1, t));
        line.style.setProperty('--t', t.toFixed(4));

        for (var i = 0; i < steps.length; i++) {
            var node = steps[i].querySelector('.node');
            var top = (node || steps[i]).getBoundingClientRect().top;
            steps[i].classList.toggle('on', top < reach);
        }
    }

    function requestUpdate() {
        if (ticking) return;
        ticking = true;
        (window.requestAnimationFrame || window.setTimeout)(update, 16);
    }

    if (reduceMotion) {
        // No drawing: the line is complete and every step is lit.
        if (line) line.style.setProperty('--t', 1);
        for (var s = 0; s < steps.length; s++) steps[s].classList.add('on');
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('load', requestUpdate);
    update();
})();
