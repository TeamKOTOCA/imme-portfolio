const container = document.getElementById('container');
const pages = Array.from(document.querySelectorAll('.page'));
const buttons = Array.from(document.querySelectorAll('.nav button'));

const idToIndex = {};
pages.forEach((p, i) => idToIndex[p.dataset.id] = i);

/* 共通：指定IDへ移動 */
function goTo(id, behavior = 'smooth', push = true) {
  const index = idToIndex[id];
  if (index === undefined) return;

  container.scrollTo({
    left: index * window.innerWidth,
    behavior
  });

  setActive(id);

  if (push) {
    history.pushState({ id }, '', `#${id}`);
  }
}

/* ナビの active 切り替え */
function setActive(id) {
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === id);
  });
}

/* ナビクリック */
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    goTo(btn.dataset.id);
  });
});

/* 初回ロード：URL → ページ */
window.addEventListener('load', () => {
  const hash = location.hash.replace('#', '');
  if (hash && hash in idToIndex) {
    goTo(hash, 'auto', false);
  } else {
    setActive(pages[0].dataset.id);
  }
});

/* スクロール停止後：ページ → URL */
let scrollTimer = null;
container.addEventListener('scroll', () => {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    const index = Math.round(container.scrollLeft / window.innerWidth);
    const page = pages[index];
    if (!page) return;

    const id = page.dataset.id;
    setActive(id);
    history.replaceState({ id }, '', `#${id}`);
  }, 120);
});

/* 戻る / 進む */
window.addEventListener('popstate', () => {
  const hash = location.hash.replace('#', '');
  if (hash && hash in idToIndex) {
    goTo(hash, 'auto', false);
  }
});
