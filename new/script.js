console.log('[init] script loaded');

const container = document.getElementById('container');
const pages = Array.from(document.querySelectorAll('.page'));
const buttons = Array.from(document.querySelectorAll('.nav button'));

console.log('[init] container:', container);
console.log('[init] pages:', pages);
console.log('[init] buttons:', buttons);

const idToIndex = {};
pages.forEach((p, i) => {
  idToIndex[p.dataset.id] = i;
});
console.log('[init] idToIndex:', idToIndex);

/* 共通：指定IDへ移動 */
function goTo(id, behavior = 'smooth', push = true) {
  console.log('[goTo] called:', { id, behavior, push });

  const index = idToIndex[id];
  console.log('[goTo] index:', index);

  if (index === undefined) {
    console.warn('[goTo] invalid id:', id);
    return;
  }

  const targetLeft = index * window.innerWidth;
  console.log('[goTo] targetLeft:', targetLeft);

  if (behavior === 'smooth') {
    container.scrollTo({
      left: targetLeft,
      behavior: 'smooth'
    });
  } else {
    container.scrollLeft = targetLeft;
  }

  console.log('[goTo] after scrollLeft:', container.scrollLeft);

  setActive(id);

  if (push) {
    history.pushState({ id }, '', `#${id}`);
    console.log('[goTo] pushState:', `#${id}`);
  }
}

/* ナビの active 切り替え */
function setActive(id) {
  console.log('[setActive] id:', id);

  buttons.forEach(btn => {
    const active = btn.dataset.id === id;
    btn.classList.toggle('active', active);
    if (active) {
      console.log('[setActive] active button:', id);
    }
  });
}

/* ナビクリック */
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    console.log('[nav click]', btn.dataset.id);
    goTo(btn.dataset.id);
  });
});

/* 初回ロード：URL → ページ */
window.addEventListener('load', () => {
  const hash = location.hash.replace('#', '');
  console.log('[load] hash:', hash);

  if (hash && hash in idToIndex) {
    goTo(hash, 'auto', false);
  } else if (pages[0]) {
    setActive(pages[0].dataset.id);
  }
});

/* スクロール停止後：ページ → URL */
let scrollTimer = null;
container.addEventListener('scroll', () => {
  console.log('[scroll] scrollLeft:', container.scrollLeft);

  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    const index = Math.round(container.scrollLeft / window.innerWidth);
    const page = pages[index];

    console.log('[scroll end]', {
      index,
      page,
      scrollLeft: container.scrollLeft
    });

    if (!page) return;

    const id = page.dataset.id;
    setActive(id);
    history.replaceState({ id }, '', `#${id}`);
    console.log('[scroll end] replaceState:', `#${id}`);
  }, 120);
});

/* 戻る / 進む */
window.addEventListener('popstate', () => {
  const hash = location.hash.replace('#', '');
  console.log('[popstate] hash:', hash);

  if (hash && hash in idToIndex) {
    goTo(hash, 'auto', false);
  }
});

container.addEventListener('wheel', (e) => {
  const page = getCurrentPage();
  if (!page) return;

  const absX = Math.abs(e.deltaX);
  const absY = Math.abs(e.deltaY);

  // 縦操作が優勢なら通常スクロール
  if (absY > absX) {
    return;
  }

  const scrollTop = page.scrollTop;
  const threshold = window.innerHeight * 0.5;
  console.log(threshold + " : " + scrollTop + " : " + page);

  // 50vh 以上縦に読んでいたら横移動禁止
  if (scrollTop > threshold) {
    return;
  }

  // 横操作かつ条件クリア時のみ横ページ移動
  e.preventDefault();
  container.scrollLeft += e.deltaX;

}, { passive: false });

function getCurrentPage() {
  const index = Math.round(container.scrollLeft / window.innerWidth);
  return pages[index] ?? null;
}