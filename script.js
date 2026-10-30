const dialog = document.querySelector('.lightbox');
const enlarged = dialog.querySelector('.enlarged');
const caption = dialog.querySelector('#image-caption');
const count = dialog.querySelector('.image-count');
let items = [];
let current = 0;
let opener;

function showImage(index) {
  current = (index + items.length) % items.length;
  const item = items[current];
  dialog.classList.toggle('landscape-dialog', item.dataset.landscape === 'true');
  enlarged.src = item.href;
  enlarged.alt = item.dataset.caption;
  caption.textContent = item.dataset.caption;
  count.textContent = `${current + 1} / ${items.length}`;
}

document.querySelectorAll('[data-gallery]').forEach(link => {
  link.addEventListener('click', event => {
    // Keep ordinary links as a fallback and preserve open-in-new-tab gestures.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    opener = link;
    const unique = new Map();
    document.querySelectorAll('[data-gallery]').forEach(candidate => {
      if (candidate.dataset.gallery === link.dataset.gallery && !unique.has(candidate.href)) unique.set(candidate.href, candidate);
    });
    items = [...unique.values()];
    showImage(items.findIndex(item => item.href === link.href));
    dialog.showModal();
  });
});

dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.querySelector('.previous').addEventListener('click', () => showImage(current - 1));
dialog.querySelector('.next').addEventListener('click', () => showImage(current + 1));
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showImage(current + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => opener?.focus());


// Inline galleries remain ordinary image links when JavaScript is unavailable.
document.querySelectorAll('.screenshots').forEach(gallery => {
  const slides = [...gallery.querySelectorAll('figure')];
  if (slides.length < 2) return;
  let active = 0;
  gallery.classList.add('carousel');
  gallery.setAttribute('role', 'region');
  gallery.setAttribute('aria-roledescription', 'carousel');
  const controls = document.createElement('div');
  controls.className = 'gallery-controls';
  const previous = document.createElement('button');
  previous.type = 'button';
  previous.textContent = '←';
  previous.setAttribute('aria-label', 'Previous screenshot');
  const status = document.createElement('span');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = '→';
  next.setAttribute('aria-label', 'Next screenshot');
  controls.append(previous, status, next);
  gallery.append(controls);
  function select(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const layer = (i - active + slides.length) % slides.length;
      slide.dataset.layer = String(layer);
      slide.hidden = layer > 2;
      slide.inert = layer !== 0;
      slide.setAttribute('aria-hidden', String(layer !== 0));
    });
    status.textContent = `${active + 1} / ${slides.length}`;
  }
  previous.addEventListener('click', () => select(active - 1));
  next.addEventListener('click', () => select(active + 1));
  gallery.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      select(active + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  select(0);
});
