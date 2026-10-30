// Aníbal Oliveira, portfolio 2027. Small, dependency-free behaviour for every page.
(function () {
    'use strict';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Case studies: highlight the section in view in the side rail.
    var railLinks = Array.prototype.slice.call(document.querySelectorAll('.rail li a'));
    if (railLinks.length) {
        var targets = railLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
        var ticking = false;
        function update() {
            ticking = false;
            var line = window.innerHeight * 0.3, cur = -1;
            targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) cur = i; });
            if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) cur = targets.length - 1;
            railLinks.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
        }
        window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
        update();
    }

    // Contribution donut, drawn from <script type="application/json" class="donut-data">.
    document.querySelectorAll('.donut').forEach(function (box) {
        var src = box.querySelector('script');
        if (!src) return;
        var data; try { data = JSON.parse(src.textContent); } catch (e) { return; }
        data.sort(function (a, b) { return b.percentage - a.percentage; });
        var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 200 200'); svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Share of my time: ' + data.map(function (d) { return d.legend + ' ' + d.percentage + '%'; }).join(', '));
        var r = 78, w = 30, c = 2 * Math.PI * r, off = 0, gap = 1.5;
        data.forEach(function (d) {
            var len = c * d.percentage / 100, ci = document.createElementNS(ns, 'circle');
            ci.setAttribute('cx', 100); ci.setAttribute('cy', 100); ci.setAttribute('r', r);
            ci.setAttribute('fill', 'none'); ci.setAttribute('stroke', d.color); ci.setAttribute('stroke-width', w);
            ci.setAttribute('stroke-dasharray', Math.max(0, len - gap) + ' ' + (c - Math.max(0, len - gap)));
            ci.setAttribute('stroke-dashoffset', -off); ci.setAttribute('transform', 'rotate(-90 100 100)');
            svg.appendChild(ci); off += len;
        });
        box.insertBefore(svg, src);
        var ul = document.createElement('ul'); ul.className = 'donut-legend';
        data.forEach(function (d) {
            var li = document.createElement('li');
            li.innerHTML = '<i style="background:' + d.color + '"></i>' + d.legend + '<b>' + d.percentage + '%</b>';
            ul.appendChild(li);
        });
        box.appendChild(ul);
    });

    // Autoplaying videos: respect reduced motion; the Maya cabin hero pauses and resumes on click.
    document.querySelectorAll('video[autoplay]').forEach(function (v) { if (reduce) { v.removeAttribute('autoplay'); v.pause(); } });
    var cabin = document.querySelector('.cabin-hero');
    if (cabin) {
        var cv = cabin.querySelector('video');
        cabin.style.cursor = 'pointer';
        cabin.setAttribute('title', 'Click to pause or play');
        cabin.addEventListener('click', function () { if (cv.paused) cv.play(); else cv.pause(); });
    }

    // Home: filters.
    var filterBtns = document.querySelectorAll('.filters button');
    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var tag = btn.getAttribute('data-tag');
            filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
            document.querySelectorAll('.card').forEach(function (card) {
                var tags = (card.getAttribute('data-tags') || '').split(' ');
                card.hidden = !(tag === 'all' || tags.indexOf(tag) > -1);
            });
        });
    });

    // Home: play the card's loop on hover or keyboard focus.
    if (!reduce) {
        document.querySelectorAll('.card a').forEach(function (a) {
            var v = a.querySelector('video');
            if (!v) return;
            function on() { v.currentTime = 0; var p = v.play(); v.classList.add('playing'); if (p && p.catch) p.catch(function () {}); }
            function off() { v.pause(); v.classList.remove('playing'); }
            a.addEventListener('mouseenter', on); a.addEventListener('focus', on);
            a.addEventListener('mouseleave', off); a.addEventListener('blur', off);
        });
    }
    // Theme toggle: remembers the choice; otherwise follows the system setting.
    var root = document.documentElement, tbtn = document.querySelector('.theme-toggle');
    function syncTheme() {
        var dark = root.getAttribute('data-theme') === 'dark';
        if (tbtn) { tbtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme'); tbtn.setAttribute('aria-pressed', dark ? 'true' : 'false'); }
    }
    if (tbtn) tbtn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
        syncTheme();
    });
    syncTheme();
})();
