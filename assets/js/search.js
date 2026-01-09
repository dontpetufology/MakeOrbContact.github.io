// Minimal client-side search: fetch /search/index.json and filter on title, function, id.
// For production use, pre-generate /search/index.json from your mantras and glyphs (GitHub Action or build step).
(() => {
  const input = document.getElementById('site-search');
  if (!input) return;
  let index = [];

  async function loadIndex(){
    try {
      const res = await fetch('/search/index.json');
      if (!res.ok) return;
      index = await res.json();
    } catch(e){
      // If no index, exit silently
      console.warn('No search index available', e);
    }
  }

  function highlightQuery(text,q){
    if (!q) return text;
    const re = new RegExp('('+ q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') +')','ig');
    return text.replace(re,'<mark>$1</mark>');
  }

  input.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) return; // default view
    const results = index.filter(item => {
      return (item.title && item.title.toLowerCase().includes(q))
        || (item.function_short && item.function_short.toLowerCase().includes(q))
        || (item.id && item.id.toLowerCase().includes(q))
        || (item.content && item.content.toLowerCase().includes(q));
    }).slice(0,100);
    // Replace library grid with results
    const grid = document.getElementById('library-grid') || document.querySelector('.glyph-grid');
    if (!grid) return;
    grid.innerHTML = results.map(r => {
      if (r.type === 'mantra'){
        return `<article class="card card-mantra"><a class="card-link" href="${r.url}"><div class="card-thumb"><img src="${r.thumbnail}" alt=""></div><div class="card-body"><h3>${r.title}</h3><p class="muted">${r.function_short || ''}</p></div></a></article>`;
      } else {
        return `<article class="card card-glyph"><a class="card-link" href="${r.url}"><div class="card-thumb"><img src="${r.image}" alt=""></div><div class="card-body"><h4>${r.id}</h4><p class="muted">${r.short_description || ''}</p></div></a></article>`;
      }
    }).join('');
  });

  loadIndex();
})();
