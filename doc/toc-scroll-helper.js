(function () {
  const mql = matchMedia('(min-width: 1099pt)');
  const listFor = id => document.querySelector(
    `.table-of-contents nav > ol > li:nth-child(${id.replace('chapter-', '')}) > ol`
  );

  const obs = new IntersectionObserver(entries => {
    if (!mql.matches) return;
    for (const e of entries) {
      const ol = listFor(e.target.id);
      if (ol) ol.style.display = e.isIntersecting ? 'block' : 'none';
    }
  }, { threshold: 0 });

  const chapters = [...document.querySelectorAll('.chapter[id^="chapter-"]')];
  chapters.forEach(ch => obs.observe(ch));

  mql.addEventListener('change', () => {
    document.querySelectorAll('.table-of-contents nav > ol > li > ol')
      .forEach(ol => ol.style.display = '');
    if (!mql.matches) return;
    chapters.forEach(ch => { obs.unobserve(ch); obs.observe(ch); });
  });
})();
