/* =========================================================
   LAC / X3-F — interactions
   No dependencies. Progressive enhancement only.
   ========================================================= */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- theme ---------- */
  var themeBtn = doc.getElementById('themeBtn');
  var metaTheme = doc.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem('lac-theme', theme); } catch (e) {}
    if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#080d12' : '#0a1016');
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', theme === 'dark' ? '切换为浅色主题' : '切换为深色主题');
      themeBtn.setAttribute('title', theme === 'dark' ? '切换为浅色主题' : '切换为深色主题');
    }
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });
    applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = doc.getElementById('menuBtn');
  var mobileMenu = doc.getElementById('mobileMenu');
  var lastFocus = null;

  function openMenu() {
    if (!mobileMenu) return;
    lastFocus = doc.activeElement;
    mobileMenu.hidden = false;
    doc.body.classList.add('nav-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    var first = mobileMenu.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }

  function closeMenu(restoreFocus) {
    if (!mobileMenu) return;
    mobileMenu.hidden = true;
    doc.body.classList.remove('nav-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    if (restoreFocus && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      if (mobileMenu.hidden) openMenu(); else closeMenu(true);
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { closeMenu(false); });
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mobileMenu.hidden) closeMenu(true);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && !mobileMenu.hidden) closeMenu(false);
    });
  }

  /* ---------- nav state / progress / back to top ---------- */
  var nav = doc.getElementById('nav');
  var progress = doc.getElementById('progress');
  var backTop = doc.getElementById('backTop');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (nav) nav.classList.toggle('is-scrolled', y > 24);

    var max = doc.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0;
    if (progress) progress.style.width = pct + '%';

    if (backTop) backTop.classList.toggle('is-visible', y > 640);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- active nav ---------- */
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('[data-nav]'));
  var sections = navLinks.map(function (link) {
    var id = link.getAttribute('data-nav');
    return doc.getElementById(id);
  }).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('data-nav') === id);
        });
      });
    }, { rootMargin: '-38% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- print ---------- */
  var printBtn = doc.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', function () { window.print(); });
  }

  /* ---------- tabs ---------- */
  var tabButtons = Array.prototype.slice.call(doc.querySelectorAll('.tab-btn'));

  function activateTab(button, focus) {
    tabButtons.forEach(function (btn) {
      var selected = btn === button;
      btn.setAttribute('aria-selected', selected ? 'true' : 'false');
      btn.tabIndex = selected ? 0 : -1;
      var panel = doc.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
    if (focus) button.focus();
  }

  tabButtons.forEach(function (button, index) {
    button.addEventListener('click', function () { activateTab(button, false); });
    button.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabButtons[(index + 1) % tabButtons.length];
      if (e.key === 'ArrowLeft') next = tabButtons[(index - 1 + tabButtons.length) % tabButtons.length];
      if (e.key === 'Home') next = tabButtons[0];
      if (e.key === 'End') next = tabButtons[tabButtons.length - 1];
      if (next) {
        e.preventDefault();
        activateTab(next, true);
      }
    });
  });

  /* ---------- engineering calculator ---------- */
  var calcIds = ['mtow', 'disk', 'fm', 'time', 'reserve', 'batt', 'nonbatt'];
  var calcInputs = {};
  calcIds.forEach(function (id) { calcInputs[id] = doc.getElementById(id); });

  var calcOut = {
    power: doc.getElementById('outPower'),
    energy: doc.getElementById('outEnergy'),
    battMass: doc.getElementById('outBattMass'),
    margin: doc.getElementById('outMargin'),
    battLimit: doc.getElementById('outBattLimit'),
    status: doc.getElementById('outStatus'),
    barNon: doc.getElementById('barNon'),
    barBatt: doc.getElementById('barBatt'),
    legendNon: doc.getElementById('legendNon'),
    legendBatt: doc.getElementById('legendBatt'),
    mtow: doc.getElementById('mtowOut'),
    disk: doc.getElementById('diskOut'),
    fm: doc.getElementById('fmOut'),
    time: doc.getElementById('timeOut'),
    reserve: doc.getElementById('reserveOut'),
    batt: doc.getElementById('battOut'),
    nonbatt: doc.getElementById('nonbattOut')
  };

  function fmt(n, digits) {
    return new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: digits || 0,
      maximumFractionDigits: digits || 0
    }).format(n);
  }

  function updateCalc() {
    if (!calcInputs.mtow || !calcOut.power) return;

    var mtow = parseFloat(calcInputs.mtow.value);
    var disk = parseFloat(calcInputs.disk.value);
    var fm = parseFloat(calcInputs.fm.value);
    var time = parseFloat(calcInputs.time.value);
    var reserve = parseFloat(calcInputs.reserve.value);
    var battWh = parseFloat(calcInputs.batt.value);
    var nonbatt = parseFloat(calcInputs.nonbatt.value);

    var rho = 1.225;
    var g = 9.81;
    var powerW = Math.pow(mtow * g, 1.5) / (Math.sqrt(2 * rho * disk) * fm);
    var powerKw = powerW / 1000;
    var energyKwh = powerKw * (time / 60) * (1 + reserve);
    var battKg = energyKwh / (battWh / 1000);
    var battLimit = mtow - nonbatt;
    var margin = battLimit - battKg;

    calcOut.mtow.textContent = fmt(mtow) + ' kg';
    calcOut.disk.textContent = fmt(disk, 1) + ' m²';
    calcOut.fm.textContent = fm.toFixed(2);
    calcOut.time.textContent = fmt(time) + ' min';
    calcOut.reserve.textContent = Math.round(reserve * 100) + '%';
    calcOut.batt.textContent = fmt(battWh) + ' Wh/kg';
    calcOut.nonbatt.textContent = fmt(nonbatt) + ' kg';

    calcOut.power.innerHTML = fmt(powerKw) + '<small>kW</small>';
    calcOut.energy.textContent = fmt(energyKwh) + ' kWh';
    calcOut.battMass.textContent = fmt(battKg) + ' kg';
    calcOut.margin.textContent = (margin >= 0 ? '+' : '−') + fmt(Math.abs(margin)) + ' kg';
    calcOut.battLimit.textContent = fmt(Math.max(0, battLimit)) + ' kg';

    var scale = Math.max(mtow, nonbatt + battKg, 1);
    calcOut.barNon.style.width = (nonbatt / scale * 100).toFixed(2) + '%';
    calcOut.barBatt.style.width = (battKg / scale * 100).toFixed(2) + '%';
    calcOut.legendNon.textContent = fmt(nonbatt) + ' kg';
    calcOut.legendBatt.textContent = fmt(battKg) + ' kg';

    var statusClass = 'is-warn';
    var statusHtml = '';
    if (margin >= 20) {
      statusClass = 'is-ok';
      statusHtml = '<strong>可行（有裕度）：</strong>在假设下还剩 ' + fmt(margin) + ' kg 余量；仍需用真实结构重量、任务剖面与试飞数据复核。';
    } else if (margin >= -20) {
      statusClass = 'is-warn';
      statusHtml = '<strong>临界：</strong>电池质量与 880 kg 上限只差 ' + fmt(Math.abs(margin)) + ' kg；减重、提高盘面积或提高电池比能量，任一变量的小变化都会翻转结论。';
    } else {
      statusClass = 'is-bad';
      statusHtml = '<strong>超重：</strong>按当前假设，电池需要 ' + fmt(battKg) + ' kg，超出质量上限 ' + fmt(Math.abs(margin)) + ' kg；需要显著提高效率/比能量或降低任务时间。';
    }
    calcOut.status.className = 'calc-status ' + statusClass;
    calcOut.status.innerHTML = statusHtml;
  }

  calcIds.forEach(function (id) {
    if (calcInputs[id]) calcInputs[id].addEventListener('input', updateCalc);
  });
  updateCalc();

  /* ---------- market scenarios ---------- */
  var scenarios = {
    conservative: {
      units: [300, 600, 900, 1200],
      price: 1.8,
      margin: 0.2,
      label: '保守情景 · 均价 180 万元 · 毛利率 20%'
    },
    base: {
      units: [800, 1500, 2200, 3000],
      price: 1.8,
      margin: 0.2,
      label: '基准情景 · 均价 180 万元 · 毛利率 20%'
    },
    upside: {
      units: [1500, 3000, 5000, 7000],
      price: 1.8,
      margin: 0.2,
      label: '积极情景 · 均价 180 万元 · 毛利率 20%'
    }
  };

  var scenarioButtons = Array.prototype.slice.call(doc.querySelectorAll('[data-scenario]'));
  var marketUnits = doc.getElementById('mUnits');
  var marketRevenue = doc.getElementById('mRevenue');
  var marketGross = doc.getElementById('mGross');
  var scenarioLabel = doc.getElementById('mScenarioLabel');
  var allBars = Array.prototype.slice.call(doc.querySelectorAll('.bar-chart .bar'));
  var currentScenario = 'base';

  function renderScenario(key) {
    var s = scenarios[key];
    if (!s) return;
    currentScenario = key;

    scenarioButtons.forEach(function (btn) {
      if (btn.classList.contains('bar')) return;
      btn.setAttribute('aria-pressed', btn.getAttribute('data-scenario') === key ? 'true' : 'false');
    });

    allBars.forEach(function (bar) {
      var scenarioKey = bar.getAttribute('data-scenario');
      var yearIndex = Array.prototype.indexOf.call(bar.parentNode.parentNode.children, bar.parentNode);
      var units = scenarios[scenarioKey].units[yearIndex] || 0;
      var h = Math.max(4, Math.min(100, units / 7000 * 100));
      bar.style.setProperty('--h', h.toFixed(1) + '%');
      bar.classList.toggle('is-selected', scenarioKey === key);
    });

    var last = s.units[s.units.length - 1];
    var revenue = last * s.price * 1000000 / 100000000;
    var gross = revenue * s.margin;

    if (marketUnits) marketUnits.textContent = fmt(last) + ' 台';
    if (marketRevenue) marketRevenue.textContent = revenue.toFixed(1) + ' 亿元';
    if (marketGross) marketGross.textContent = gross.toFixed(1) + ' 亿元';
    if (scenarioLabel) scenarioLabel.textContent = s.label;
  }

  scenarioButtons.forEach(function (btn) {
    if (btn.classList.contains('bar')) return;
    btn.addEventListener('click', function () {
      renderScenario(btn.getAttribute('data-scenario'));
    });
  });
  renderScenario(currentScenario);

  /* ---------- takeoff readiness checklist (teaching aid) ---------- */
  var checkboxes = Array.prototype.slice.call(doc.querySelectorAll('.js-check'));
  var checkStatus = doc.getElementById('checkStatus');
  var checkText = doc.getElementById('checkText');
  var checkDetail = doc.getElementById('checkDetail');
  var checkReset = doc.getElementById('checkReset');
  var checkAll = doc.getElementById('checkAll');

  function updateChecklist() {
    if (!checkStatus || !checkboxes.length) return;
    var total = checkboxes.length;
    var done = checkboxes.filter(function (c) { return c.checked; }).length;
    var missing = total - done;

    checkStatus.classList.remove('is-clear', 'is-hold', 'is-blocked');
    if (missing === 0) {
      checkStatus.classList.add('is-clear');
      if (checkText) checkText.textContent = 'CLEARED';
      if (checkDetail) checkDetail.textContent = '演示条件全部确认。真实放行仍需飞行手册、现场授权与独立检查，不能以本检查单替代。';
    } else if (done >= Math.ceil(total * 0.5)) {
      checkStatus.classList.add('is-hold');
      if (checkText) checkText.textContent = 'HOLD';
      if (checkDetail) checkDetail.textContent = '还有 ' + missing + ' 项未确认。补齐条件前不应起飞。';
    } else {
      checkStatus.classList.add('is-blocked');
      if (checkText) checkText.textContent = 'STOP';
      if (checkDetail) checkDetail.textContent = '还有 ' + missing + ' 项未确认。任何一项不满足，都不应起飞。';
    }
  }

  checkboxes.forEach(function (c) { c.addEventListener('change', updateChecklist); });
  if (checkReset) {
    checkReset.addEventListener('click', function () {
      checkboxes.forEach(function (c) { c.checked = false; });
      updateChecklist();
    });
  }
  if (checkAll) {
    checkAll.addEventListener('click', function () {
      checkboxes.forEach(function (c) { c.checked = true; });
      updateChecklist();
    });
  }
  updateChecklist();

  /* ---------- smooth hash focus (accessibility) ---------- */
  doc.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function () {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = doc.querySelector(id);
      if (!target) return;
      // Let CSS smooth scrolling handle the movement; move focus for keyboard users.
      window.setTimeout(function () {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 450);
    });
  });
})();
