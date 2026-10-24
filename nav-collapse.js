(function () {
    var header = document.getElementById('sticky-header');
    var nav = header && header.querySelector('nav');
    var filters = document.getElementById('sticky-filters');
    if (!nav || nav.querySelector('.site-nav-toggle')) return;

    var style = document.createElement('style');
    style.textContent = [
        '.site-nav-links { display: contents; }',
        '#sticky-header.nav-collapsed nav .site-nav-links, #sticky-header.nav-collapsed > :not(nav) { display: none !important; }',
        '#sticky-header nav .site-nav-toggle { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 36px; padding: 0; margin-right: 8px; border: 1px solid #555; border-radius: 4px; background: #333; color: #ccc; cursor: pointer; font-size: 22px; line-height: 1; }',
        '#sticky-header nav .site-nav-toggle:hover { background: #444; }',
        '#sticky-header nav .site-nav-toggle:focus-visible { outline: 2px solid #8787FF; outline-offset: 2px; }'
    ].join('\n');
    document.head.appendChild(style);

    var links = document.createElement('div');
    links.className = 'site-nav-links';
    links.id = 'site-nav-links';
    while (nav.firstChild) links.appendChild(nav.firstChild);

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'site-nav-toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation menu');
    toggle.setAttribute('aria-controls', filters ? links.id + ' ' + filters.id : links.id);
    toggle.innerHTML = '<span aria-hidden="true">☰</span>';

    nav.setAttribute('aria-label', nav.getAttribute('aria-label') || 'Main navigation');
    nav.appendChild(toggle);
    nav.appendChild(links);

    function setCollapsed(collapsed) {
        header.classList.toggle('nav-collapsed', collapsed);
        toggle.setAttribute('aria-expanded', String(!collapsed));
    }

    setCollapsed(window.matchMedia('(max-width: 600px)').matches);
    toggle.addEventListener('click', function () {
        setCollapsed(!header.classList.contains('nav-collapsed'));
    });
})();
