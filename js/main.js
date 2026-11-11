/**
 * SAVOIE CHEESE TART - main.js
 * jQuery を使わない素の JavaScript。
 * <script defer> で読み込むので HTML の解析を止めず、DOM 構築後に実行される。
 * （type="module" にしないのは、index.html をダブルクリックで開く file:// でも動かすため）
 */
'use strict';

// ブロックで囲み、変数がグローバルに漏れないようにする
{
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const spQuery = window.matchMedia('(width < 768px)');

  /* --------------------------------------------------------------------------
   * 1. スクロールで画面に入ったらクラスを付けるアニメーション
   *    「どの要素に・どのクラスを・何ms後に付けるか」を表で管理する。
   * -------------------------------------------------------------------------- */
  const SCROLL_ANIMATIONS = [
    // テキストのスライドイン
    { selector: '._scrollBothSlideUp', className: '_isActiveBothSlideUp' },
    { selector: '._scrollBothSlideDown, ._scrollBothSlideDownSec, ._scrollBothSlideDownThr', className: '_isActiveBothSlideDown' },
    { selector: '._scrollSlideSound1', className: 'js-timeLag', delay: 500 },
    { selector: '._scrollSlideSound2', className: 'js-timeLag', delay: 800 },
    { selector: '._scrollSlide', className: 'js-timeLag', delay: 1100 },
    { selector: '._scrollBothListUp', className: 'js-timeLag', stagger: 50 },
    { selector: '._scrollStepUp', className: '_isActiveStepUp', stagger: 250 }, // HOW TO EAT：0.25秒ずつ順番に

    // 背景色の帯（PRICE の黒い帯、見出しの色の帯）
    { selector: '._scrollSlideLeft', className: 'js-price' },
    { selector: '._scrollPrice', className: 'js-price2' },
    { selector: '._scrollBandLeft', className: 'js-passionTitle' },
    { selector: '._scrollBandLeftSec', className: 'js-passion', delay: 300 },
    { selector: '._scrollBandUp', className: 'js-material', delay: 800 }, // ESSENCE（レイアウト a）の見出しの帯
    { selector: '._scrollBandUpSec', className: 'js-material2', delay: 800 }, // ESSENCE（レイアウト b）の見出しの帯

    // 画像の clip-path 表示
    { selector: '._scrollSlideImgUp', className: 'is-active' },
    { selector: '._scrollSlideImgUpSec, ._scrollSlideImgLeftSec', className: 'is-active', delay: 500 },
    { selector: '._scrollSlideImgLeft, ._scrollSlideImgRight', className: 'is-active', delay: 300 },

    // 縦書き文字・見出しの演出
    { selector: '.u-downAnime', className: 'js-textSlideDown', childSelector: '.u-blocking', childClassName: 'js-textSlide', delay: 1000 },
    { selector: '.u-textLeft', className: 'slideAnimeLeft', childSelector: '.u-textLeftAnime', childClassName: 'slideAnimeRight', delay: 300 },
    { selector: '.p-passion__comment', className: 'js-headerActive' },

    // 価格
    { selector: '.fadeIn', className: 'js-fadeIn' },
    { selector: '.p-price__slide', className: 'js-priceText' },
  ];

  /* ファーストビューの画像が表示できる状態になってから、時間差で実行するアニメーション */
  const LOAD_ANIMATIONS = [
    { selector: '._lordSlideImgDown, ._lordSlideImgLeft', className: 'is-active', delay: 500 },
    { selector: '._lordSlideImgUp, ._lordSlideImgUpSec', className: 'is-active', delay: 1000 },
    { selector: '.p-menu__btn', className: 'js-headerActive', delay: 1500 },
    { selector: '.p-menu__shopLink', className: 'js-headerActive', delay: 2000 },
    { selector: '.p-menu__category', className: 'js-pageLink', delay: 2500 },
  ];

  /** 要素(と子要素)にクラスを付ける。動きを減らす設定のときは待ち時間なし */
  function activate(el, { className, childSelector, childClassName, delay = 0 }, extraDelay = 0) {
    const run = () => {
      el.classList.add(className);
      if (childSelector) {
        el.querySelectorAll(childSelector).forEach((child) => child.classList.add(childClassName));
      }
    };
    const wait = prefersReducedMotion ? 0 : delay + extraDelay;
    if (wait > 0) setTimeout(run, wait);
    else run();
  }

  function setupScrollAnimations() {
    // 要素 → 設定 の対応表（1つの要素が複数の設定に該当してもよい）
    const configsByElement = new Map();
    for (const config of SCROLL_ANIMATIONS) {
      document.querySelectorAll(config.selector).forEach((el) => {
        if (!configsByElement.has(el)) configsByElement.set(el, []);
        configsByElement.get(el).push(config);
      });
    }

    // 動きを減らす設定なら、スクロールを待たずに最初から全部表示しておく
    if (prefersReducedMotion) {
      configsByElement.forEach((configs, el) => configs.forEach((config) => activate(el, config)));
      return;
    }

    // stagger（順番に表示）用：設定ごとに「次の要素を表示してよい時刻」を覚えておく。
    // 同時に画面に入っても、スクロールで少しずつ入っても、前の要素から必ず stagger ミリ秒あけて表示する。
    const nextStartAt = new Map();
    const staggerDelay = (config) => {
      if (!config.stagger) return 0;
      const now = performance.now();
      const start = Math.max(now, nextStartAt.get(config) ?? 0);
      nextStartAt.set(config, start + config.stagger);
      return start - now;
    };

    // IntersectionObserver：スクロールのたびに全要素の位置を計算しないので軽い
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        // 画面内に入った、またはページ内リンクで一気に通り過ぎた（画面より上にある）要素を対象にする
        const passed = entry.boundingClientRect.top < 0;
        if (!entry.isIntersecting && !passed) continue;

        observer.unobserve(entry.target);
        for (const config of configsByElement.get(entry.target)) {
          activate(entry.target, config, staggerDelay(config));
        }
      }
    }, {
      // 画面の下端ちょうどではなく、下から15%ほど入ったところで開始する
      // （画面の一番下で動いて見逃す、ということを防ぐ）
      rootMargin: '0px 0px -15% 0px',
    });

    configsByElement.forEach((_, el) => observer.observe(el));
  }

  function setupLoadAnimations() {
    const run = () => {
      for (const config of LOAD_ANIMATIONS) {
        document.querySelectorAll(config.selector).forEach((el) => activate(el, config));
      }
    };
    // ページ全体（下の方の画像まで）の load を待つと表示が遅れるので、
    // ファーストビューのメイン画像のデコードが終わった時点で開始する
    const hero = document.querySelector('.p-main__img1');
    (hero ? hero.decode() : Promise.resolve()).catch(() => {}).then(run);
  }

  /* --------------------------------------------------------------------------
   * 2. メニュー（JP ボタン / スマホのハンバーガー）
   * -------------------------------------------------------------------------- */
  function setupMenu() {
    const toggle = document.querySelector('.p-menu__toggle');
    const menu = document.getElementById(toggle?.getAttribute('aria-controls'));
    if (!toggle || !menu) return;

    const caret = toggle.querySelector('.c-icon--caret');
    const navMark = toggle.querySelector('.p-menu__navMark');
    const shopLinks = document.querySelectorAll('.p-menu__shopLink');
    const links = menu.querySelectorAll('._linkSlideLeft');
    let timers = [];

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('js-active', open);
      caret?.classList.toggle('js-revolving', open);
      navMark?.classList.toggle('js-navBorderAfter', open);
      navMark?.classList.toggle('js-navBorderBefore', open);
      navMark?.classList.toggle('js-navBorderNone', open);
      // スマホではメニューを開いている間 SHOPS ボタンを隠す（画面幅は開閉のたびに判定）
      shopLinks.forEach((el) => el.classList.toggle('js-toHide', open && spQuery.matches));

      // リンクを上から順に時間差で表示
      timers.forEach(clearTimeout);
      timers = [...links].map((link, i) =>
        setTimeout(() => link.classList.toggle('js-linkSlideLeft', open), prefersReducedMotion ? 0 : i * 50),
      );
    };

    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    // Esc キーで閉じてボタンにフォーカスを戻す
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // ページ内リンクを選んだらメニューを閉じる
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a[href^="#"]')) setOpen(false);
    });
  }

  setupScrollAnimations();
  setupLoadAnimations();
  setupMenu();
}
