/* Mode examen : tirage aléatoire, chronomètre persistant, correction différée */
(function () {
  'use strict';

  var BANK = window.EXAM_BANK || [];
  var PASS = 70;
  var MAX_HISTORY = 20;

  var api = null;
  var mount = null;
  var timer = null;
  var choice = { scope: [], count: 20, duration: 20 };
  var confirmOpen = false;

  function byId(id) {
    for (var i = 0; i < BANK.length; i += 1) if (BANK[i].id === id) return BANK[i];
    return null;
  }

  function store() {
    var st = api.getState();
    if (!st.exam || typeof st.exam !== 'object') st.exam = { session: null, history: [] };
    if (!st.exam.history) st.exam.history = [];
    if (st.exam.session === undefined) st.exam.session = null;
    return st.exam;
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pool(scope) {
    return BANK.filter(function (q) { return !scope.length || scope.indexOf(q.module) > -1; });
  }

  function moduleOf(id) {
    return api.modules.filter(function (m) { return m.id === id; })[0] || null;
  }

  function fmtClock(ms) {
    var total = Math.max(0, Math.ceil(ms / 1000));
    var m = Math.floor(total / 60);
    var s = total % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    document.body.classList.remove('is-exam');
  }

  function paint() {
    if (!mount || !api) return;
    stop();
    mount.innerHTML = '';
    var session = store().session;
    if (session && !session.submitted && Date.now() >= session.deadline) {
      submit(true);
      return;
    }
    if (session && !session.submitted) renderRunner(mount, session);
    else if (session && session.submitted) renderResult(mount, session);
    else renderSetup(mount);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function render(main, context) {
    api = context;
    mount = main;
    confirmOpen = false;
    paint();
  }

  /* ---------------- Session ---------------- */

  function start(scope, count, minutes) {
    var available = pool(scope);
    var picked = shuffle(available).slice(0, Math.max(1, Math.min(count, available.length)));
    var now = Date.now();
    store().session = {
      startedAt: now,
      deadline: now + minutes * 60000,
      durationMin: minutes,
      scope: scope.slice(),
      ids: picked.map(function (q) { return q.id; }),
      answers: {},
      flags: {},
      index: 0,
      submitted: false,
      submittedAt: null,
      autoSubmitted: false
    };
    api.save();
    paint();
  }

  function grade(session) {
    var per = {};
    var good = 0;
    var total = 0;
    session.ids.forEach(function (id, i) {
      var q = byId(id);
      if (!q) return;
      total += 1;
      var ok = session.answers[i] !== undefined && session.answers[i] === q.answer;
      if (ok) good += 1;
      if (!per[q.module]) per[q.module] = { good: 0, total: 0 };
      per[q.module].total += 1;
      if (ok) per[q.module].good += 1;
    });
    var pct = total ? Math.round(good / total * 100) : 0;
    return { good: good, total: total, pct: pct, per: per, pass: pct >= PASS };
  }

  function submit(auto) {
    var st = store();
    var session = st.session;
    if (!session || session.submitted) return;
    session.submitted = true;
    session.submittedAt = Date.now();
    session.autoSubmitted = !!auto;
    var res = grade(session);
    st.history.unshift({
      at: new Date(session.submittedAt).toISOString(),
      pct: res.pct,
      good: res.good,
      total: res.total,
      durationMin: session.durationMin,
      usedMin: Math.max(1, Math.round((session.submittedAt - session.startedAt) / 60000)),
      scope: session.scope.length ? session.scope.length + ' module(s)' : 'Tout le parcours',
      pass: res.pass
    });
    if (st.history.length > MAX_HISTORY) st.history.length = MAX_HISTORY;
    api.save();
    if (timer) { clearInterval(timer); timer = null; }
    document.body.classList.remove('is-exam');
    paint();
  }

  function paintClock(session) {
    var clock = document.getElementById('examClock');
    if (!clock) { stop(); return; }
    var left = session.deadline - Date.now();
    clock.textContent = fmtClock(left);
    clock.classList.toggle('is-urgent', left <= 60000);
    var bar = document.getElementById('examClockBar');
    if (bar) {
      var total = session.durationMin * 60000;
      bar.style.width = Math.max(0, Math.min(100, left / total * 100)) + '%';
    }
    if (left <= 0) submit(true);
  }

  /* ---------------- Écran de préparation ---------------- */

  function renderSetup(main) {
    var st = store();
    var hist = st.history;
    var best = hist.reduce(function (b, a) { return !b || a.pct > b.pct ? a : b; }, null);
    var available = pool(choice.scope);
    var counts = [10, 20, 30].filter(function (n) { return n <= available.length; });
    if (!counts.length) counts = [available.length];
    if (counts.indexOf(choice.count) === -1) choice.count = counts[counts.length - 1];

    var head = api.el('header', 'module-head');
    head.innerHTML =
      '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><span>Examen</span></div>' +
      '<h1>Examen final</h1>' +
      '<p class="module-head__lede">Questions tirées au hasard dans une banque de ' + BANK.length + ' items, chronomètre réel, corrections retenues jusqu’à la remise. Le seuil de réussite est de ' + PASS + ' %, et une réussite est exigée pour débloquer l’attestation du mode évaluation.</p>';
    main.appendChild(head);

    var stat = api.el('div', 'stat-grid');
    stat.innerHTML =
      '<div class="stat stat--accent"><strong>' + (best ? best.pct + ' %' : '—') + '</strong><span>Meilleur score</span></div>' +
      '<div class="stat"><strong>' + hist.length + '</strong><span>Tentatives</span></div>' +
      '<div class="stat"><strong>' + BANK.length + '</strong><span>Questions en banque</span></div>' +
      '<div class="stat"><strong>' + PASS + ' %</strong><span>Seuil de réussite</span></div>';
    main.appendChild(stat);

    var rules = api.el('div', 'callout callout--warn');
    rules.innerHTML = '<div class="callout__icon" aria-hidden="true">⏱</div><div class="callout__body">' +
      '<div class="callout__title">Règles de l’épreuve</div>' +
      '<p>Le chronomètre démarre dès le lancement et survit à un rechargement de page : l’heure de fin est enregistrée. À zéro, la copie est remise automatiquement.</p>' +
      '<p>Aucune correction, aucun cours et aucun accès au sommaire pendant l’épreuve. Les explications n’apparaissent qu’après la remise, et une seule tentative est conservée par épreuve.</p>' +
      '<p><strong>Attestation :</strong> l’examen fait partie des conditions de délivrance. Un score d’au moins ' + PASS + ' % est nécessaire ; les tentatives sont illimitées, seul le meilleur score compte.</p></div>';
    main.appendChild(rules);

    /* Périmètre */
    var scopeHead = api.el('section', 'section-head');
    scopeHead.innerHTML = '<h2>Périmètre</h2><p>Restreins l’épreuve à quelques modules pour réviser, ou couvre tout le parcours.</p>';
    main.appendChild(scopeHead);

    var scopeBox = api.el('div', 'exam-scope');
    var allLabel = api.el('label', 'check-item' + (choice.scope.length ? '' : ' is-checked'));
    var allCb = document.createElement('input');
    allCb.type = 'checkbox';
    allCb.checked = choice.scope.length === 0;
    allCb.id = 'examScopeAll';
    allCb.addEventListener('change', function () {
      choice.scope = allCb.checked ? [] : api.modules.map(function (m) { return m.id; });
      paint();
    });
    allLabel.appendChild(allCb);
    allLabel.appendChild(api.el('span', '', 'Tout le parcours (' + BANK.length + ' questions)'));
    scopeBox.appendChild(allLabel);

    api.modules.forEach(function (m) {
      var active = choice.scope.indexOf(m.id) > -1;
      var label = api.el('label', 'check-item' + (active ? ' is-checked' : ''));
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = active;
      cb.setAttribute('data-module', m.id);
      cb.addEventListener('change', function () {
        var i = choice.scope.indexOf(m.id);
        if (cb.checked && i === -1) choice.scope.push(m.id);
        if (!cb.checked && i > -1) choice.scope.splice(i, 1);
        paint();
      });
      label.appendChild(cb);
      label.appendChild(api.el('span', '', m.no + '. ' + m.title));
      scopeBox.appendChild(label);
    });
    main.appendChild(scopeBox);

    /* Réglages */
    var setHead = api.el('section', 'section-head');
    setHead.innerHTML = '<h2>Réglages</h2><p>' + available.length + ' question(s) disponibles dans ce périmètre.</p>';
    main.appendChild(setHead);

    var form = api.el('div', 'exam-form');

    var countField = api.el('label', 'field');
    countField.appendChild(api.el('span', 'field__label', 'Nombre de questions'));
    var countSel = document.createElement('select');
    countSel.id = 'examCount';
    counts.forEach(function (n) {
      var o = document.createElement('option');
      o.value = String(n);
      o.textContent = n + ' questions';
      if (n === choice.count) o.selected = true;
      countSel.appendChild(o);
    });
    countSel.addEventListener('change', function () { choice.count = parseInt(countSel.value, 10); });
    countField.appendChild(countSel);
    form.appendChild(countField);

    var timeField = api.el('label', 'field');
    timeField.appendChild(api.el('span', 'field__label', 'Durée'));
    var timeSel = document.createElement('select');
    timeSel.id = 'examDuration';
    [10, 20, 30, 45].forEach(function (n) {
      var o = document.createElement('option');
      o.value = String(n);
      o.textContent = n + ' minutes';
      if (n === choice.duration) o.selected = true;
      timeSel.appendChild(o);
    });
    timeSel.addEventListener('change', function () { choice.duration = parseInt(timeSel.value, 10); });
    timeField.appendChild(timeSel);
    form.appendChild(timeField);

    var go = api.el('button', 'btn btn--primary', 'Commencer l’épreuve');
    go.type = 'button';
    go.id = 'examStart';
    go.disabled = available.length === 0;
    go.addEventListener('click', function () {
      if (!available.length) { api.toast('Aucune question dans ce périmètre.'); return; }
      start(choice.scope, choice.count, choice.duration);
    });
    form.appendChild(go);
    main.appendChild(form);

    /* Historique */
    if (hist.length) {
      var hHead = api.el('section', 'section-head');
      hHead.innerHTML = '<h2>Historique</h2><p>Les ' + MAX_HISTORY + ' dernières tentatives, conservées sur cet appareil.</p>';
      main.appendChild(hHead);
      var wrap = api.el('div', 'table-wrap');
      wrap.innerHTML = '<table><thead><tr><th>Date</th><th class="num">Score</th><th class="num">Durée</th><th>Périmètre</th><th>Résultat</th></tr></thead><tbody>' +
        hist.map(function (a) {
          return '<tr><td>' + api.esc(api.formatDate(a.at)) + '</td>' +
            '<td class="num">' + a.pct + ' %</td>' +
            '<td class="num">' + a.usedMin + '/' + a.durationMin + ' min</td>' +
            '<td>' + api.esc(a.scope) + '</td>' +
            '<td>' + (a.pass ? '<span class="pill pill--ok">Réussi</span>' : '<span class="pill pill--warn">Échec</span>') + '</td></tr>';
        }).join('') + '</tbody></table>';
      main.appendChild(wrap);
    }

    var note = api.el('p', 'small muted');
    note.textContent = 'Aucune donnée ne quitte cet appareil : l’épreuve et l’historique vivent dans le stockage local du navigateur.';
    main.appendChild(note);
  }

  /* ---------------- Épreuve en cours ---------------- */

  function renderRunner(main, session) {
    var answered = Object.keys(session.answers).length;
    var q = byId(session.ids[session.index]);
    var m = q ? moduleOf(q.module) : null;

    document.body.classList.add('is-exam');

    var head = api.el('header', 'module-head');
    head.innerHTML =
      '<div class="crumbs"><a href="#/" aria-disabled="true">Accueil</a><span>›</span><span>Épreuve en cours</span></div>' +
      '<h1>Épreuve en cours</h1>' +
      '<p class="module-head__lede">Corrections et explications retenues jusqu’à la remise. Le chronomètre soumet automatiquement à zéro.</p>';
    main.appendChild(head);

    var bar = api.el('div', 'exam-bar');
    bar.innerHTML =
      '<div class="exam-bar__clock"><span class="small muted">Temps restant</span>' +
      '<strong class="exam-clock" id="examClock" aria-live="off">--:--</strong></div>' +
      '<div class="exam-bar__meter"><div class="bar"><span class="bar__fill" id="examClockBar" style="width:100%"></span></div>' +
      '<span class="small muted"><strong id="examAnswered">' + answered + '</strong> / ' + session.ids.length +
      ' répondues · navigation verrouillée</span></div>';

    var finish = api.el('button', 'btn btn--primary btn--sm', 'Terminer l’épreuve');
    finish.type = 'button';
    finish.id = 'examFinish';
    finish.addEventListener('click', function () {
      confirmOpen = true;
      paint();
    });
    bar.appendChild(finish);
    main.appendChild(bar);

    /* Palette */
    var palette = api.el('div', 'exam-palette');
    palette.setAttribute('role', 'group');
    palette.setAttribute('aria-label', 'Aller à une question');
    session.ids.forEach(function (id, i) {
      var cls = 'exam-pal';
      if (i === session.index) cls += ' is-current';
      else if (session.answers[i] !== undefined) cls += ' is-answered';
      if (session.flags[i]) cls += ' is-flagged';
      var b = api.el('button', cls, String(i + 1));
      b.type = 'button';
      b.id = 'examPal' + i;
      b.setAttribute('aria-label', 'Question ' + (i + 1) + (session.answers[i] !== undefined ? ', répondue' : ', sans réponse') + (session.flags[i] ? ', marquée' : ''));
      if (i === session.index) b.setAttribute('aria-current', 'step');
      b.addEventListener('click', function () {
        session.index = i;
        api.save();
        paint();
      });
      palette.appendChild(b);
    });
    main.appendChild(palette);

    if (!q) {
      main.appendChild(api.el('p', 'log-warn', 'Question introuvable dans la banque. Termine l’épreuve pour repartir sur une base propre.'));
      return;
    }

    var card = api.el('section', 'exam-q');
    card.innerHTML = '<div class="exam-q__meta"><span class="tag">Question ' + (session.index + 1) + '</span>' +
      '<span class="tag">Module ' + (m ? m.no : '?') + '</span>' +
      '<span class="tag">' + api.esc(q.level) + '</span>' +
      (session.flags[session.index] ? '<span class="pill pill--warn">Marquée</span>' : '') + '</div>' +
      '<p class="exam-q__prompt">' + api.esc(q.q) + '</p>';
    var opts = api.el('div', 'exam-q__opts');
    var buttons = [];
    q.options.forEach(function (label, oi) {
      var selected = session.answers[session.index] === oi;
      var b = api.el('button', 'opt' + (selected ? ' is-selected' : ''),
        '<span class="opt__key">' + String.fromCharCode(65 + oi) + '</span><span>' + api.esc(label) + '</span>');
      b.type = 'button';
      b.setAttribute('aria-pressed', selected ? 'true' : 'false');
      b.addEventListener('click', function () {
        session.answers[session.index] = oi;
        api.save();
        buttons.forEach(function (x, xi) {
          x.classList.toggle('is-selected', xi === oi);
          x.setAttribute('aria-pressed', xi === oi ? 'true' : 'false');
        });
        var counter = document.getElementById('examAnswered');
        if (counter) counter.textContent = String(Object.keys(session.answers).length);
        var pal = document.getElementById('examPal' + session.index);
        if (pal) { pal.classList.add('is-answered'); pal.setAttribute('aria-label', 'Question ' + (session.index + 1) + ', répondue'); }
      });
      buttons.push(b);
      opts.appendChild(b);
    });
    card.appendChild(opts);

    var foot = api.el('div', 'exam-q__foot');
    var prev = api.el('button', 'btn btn--sm btn--ghost', '← Précédent');
    prev.type = 'button';
    prev.disabled = session.index === 0;
    prev.addEventListener('click', function () {
      if (session.index === 0) return;
      session.index -= 1;
      api.save();
      paint();
    });
    foot.appendChild(prev);

    var flag = api.el('button', 'btn btn--sm btn--ghost', session.flags[session.index] ? '★ Marquée' : '☆ Marquer pour révision');
    flag.type = 'button';
    flag.id = 'examFlag';
    flag.addEventListener('click', function () {
      if (session.flags[session.index]) delete session.flags[session.index];
      else session.flags[session.index] = true;
      api.save();
      paint();
    });
    foot.appendChild(flag);

    var next = api.el('button', 'btn btn--sm', 'Suivant →');
    next.type = 'button';
    next.disabled = session.index >= session.ids.length - 1;
    next.addEventListener('click', function () {
      if (session.index >= session.ids.length - 1) return;
      session.index += 1;
      api.save();
      paint();
    });
    foot.appendChild(next);
    card.appendChild(foot);
    main.appendChild(card);

    if (confirmOpen) {
      var left = session.ids.filter(function (_, i) { return session.answers[i] === undefined; }).length;
      var box = api.el('section', 'exam-confirm');
      box.innerHTML = '<h2>Remettre la copie maintenant ?</h2>' +
        '<p>' + (left === 0 ? 'Toutes les questions ont une réponse.' : left + ' question(s) sans réponse seront comptées comme fausses.') +
        ' Les corrections s’afficheront immédiatement après.</p>';
      var yes = api.el('button', 'btn btn--primary', 'Confirmer la remise');
      yes.type = 'button';
      yes.id = 'examConfirm';
      yes.addEventListener('click', function () { submit(false); });
      var no = api.el('button', 'btn btn--ghost', 'Continuer l’épreuve');
      no.type = 'button';
      no.addEventListener('click', function () {
        confirmOpen = false;
        paint();
      });
      var row = api.el('div', 'row');
      row.appendChild(yes);
      row.appendChild(no);
      box.appendChild(row);
      main.appendChild(box);
    }

    paintClock(session);
    if (timer) clearInterval(timer);
    timer = setInterval(function () { paintClock(session); }, 500);
  }

  /* ---------------- Résultat ---------------- */

  function renderResult(main, session) {
    var res = grade(session);
    var usedMin = Math.max(1, Math.round((session.submittedAt - session.startedAt) / 60000));
    var modules = Object.keys(res.per).map(function (id) {
      var m = moduleOf(id);
      return { id: id, module: m, good: res.per[id].good, total: res.per[id].total, pct: Math.round(res.per[id].good / res.per[id].total * 100) };
    }).sort(function (a, b) { return a.pct - b.pct; });
    var weakest = modules[0];

    var head = api.el('header', 'module-head');
    head.innerHTML =
      '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><span>Résultat</span></div>' +
      '<h1>Résultat de l’épreuve</h1>' +
      '<p class="module-head__lede">' + (session.autoSubmitted
        ? 'Temps écoulé : la copie a été remise automatiquement.'
        : 'Copie remise. Voici la correction détaillée, question par question.') + '</p>';
    main.appendChild(head);

    var hero = api.el('section', 'eval-hero');
    hero.innerHTML =
      '<div class="gauge" style="--v:' + res.pct + '" role="img" aria-label="Score de l’épreuve : ' + res.pct + ' pour cent">' +
      '<div class="gauge__inner"><strong>' + res.pct + '</strong><span>%</span></div></div>' +
      '<div class="eval-hero__text">' +
      '<span class="eyebrow">' + (res.pass ? 'Épreuve réussie' : 'Seuil non atteint') + '</span>' +
      '<h2>' + res.good + ' / ' + res.total + ' bonnes réponses</h2>' +
      '<p>' + (res.pass
        ? 'Tu réponds sans relire le cours : c’est exactement ce que l’épreuve mesure. Le détail ci-dessous montre ce qui reste fragile.'
        : 'Le seuil est de ' + PASS + ' %. Relis les modules les plus faibles ci-dessous, puis retente : les questions tirées seront différentes. Tant que ce seuil n’est pas atteint, l’attestation reste verrouillée.') + '</p>' +
      '<p class="small muted">Durée utilisée : ' + usedMin + ' min sur ' + session.durationMin + ' · ' + api.esc(session.scope.length ? session.scope.length + ' module(s) couvert(s)' : 'tout le parcours') + '.</p>' +
      '</div>';
    main.appendChild(hero);

    var revHead = api.el('section', 'section-head');
    revHead.innerHTML = '<h2>Résultat par module</h2><p>Le plus faible en premier : c’est là que la prochaine session doit commencer.</p>';
    main.appendChild(revHead);

    var wrap = api.el('div', 'table-wrap');
    wrap.innerHTML = '<table><thead><tr><th>Module</th><th class="num">Score</th><th>Lecture</th></tr></thead><tbody>' +
      modules.map(function (r) {
        return '<tr><td>' + (r.module ? '<a href="#/m/' + r.module.id + '">' + r.module.no + '. ' + api.esc(r.module.title) + '</a>' : api.esc(r.id)) + '</td>' +
          '<td class="num">' + r.good + '/' + r.total + '</td>' +
          '<td>' + (r.pct === 100 ? '<span class="pill pill--ok">Solide</span>' : r.pct >= 50 ? '<span class="pill pill--warn">À revoir</span>' : '<span class="pill pill--warn">Fragile</span>') + '</td></tr>';
      }).join('') + '</tbody></table>';
    main.appendChild(wrap);

    var corrHead = api.el('section', 'section-head');
    corrHead.innerHTML = '<h2>Correction détaillée</h2><p>Chaque réponse fausse est expliquée : lis l’explication avant de retenter.</p>';
    main.appendChild(corrHead);

    var list = api.el('div', 'stack');
    session.ids.forEach(function (id, i) {
      var q = byId(id);
      if (!q) return;
      var m = moduleOf(q.module);
      var picked = session.answers[i];
      var ok = picked !== undefined && picked === q.answer;
      var item = api.el('article', 'exam-review' + (ok ? ' is-good' : ' is-bad'));
      item.innerHTML =
        '<div class="exam-review__head"><span class="tag">Q' + (i + 1) + '</span>' +
        '<span class="tag">' + (m ? 'Module ' + m.no : api.esc(q.module)) + '</span>' +
        '<span class="pill ' + (ok ? 'pill--ok' : 'pill--warn') + '">' + (ok ? '✓ juste' : '✗ faux') + '</span>' +
        (picked === undefined ? '<span class="tag">sans réponse</span>' : '') + '</div>' +
        '<p class="exam-review__q">' + api.esc(q.q) + '</p>' +
        '<p class="exam-review__line"><span>Ta réponse</span><strong class="' + (ok ? 'is-ok' : 'is-ko') + '">' +
        (picked === undefined ? 'aucune' : String.fromCharCode(65 + picked) + '. ' + api.esc(q.options[picked])) + '</strong></p>' +
        (ok ? '' : '<p class="exam-review__line"><span>Bonne réponse</span><strong class="is-ok">' +
          String.fromCharCode(65 + q.answer) + '. ' + api.esc(q.options[q.answer]) + '</strong></p>') +
        '<p class="exam-review__exp">' + api.esc(q.explain) + '</p>';
      list.appendChild(item);
    });
    main.appendChild(list);

    function reportText() {
      var lines = [
        'Examen final — IA & Freebuff',
        'Date : ' + api.formatDate(new Date(session.submittedAt).toISOString()),
        'Score : ' + res.pct + ' % (' + res.good + '/' + res.total + ') — seuil ' + PASS + ' % : ' + (res.pass ? 'réussi' : 'échec'),
        'Durée : ' + usedMin + ' min sur ' + session.durationMin,
        'Périmètre : ' + (session.scope.length ? session.scope.length + ' module(s)' : 'tout le parcours')
      ];
      lines.push('Par module :');
      modules.slice().sort(function (a, b) { return (a.module ? a.module.no : 0) - (b.module ? b.module.no : 0); }).forEach(function (r) {
        lines.push('  · ' + (r.module ? r.module.no + '. ' + r.module.title : r.id) + ' : ' + r.good + '/' + r.total + ' (' + r.pct + ' %)');
      });
      return lines.join('\n');
    }

    var actions = api.el('div', 'row');
    actions.style.marginTop = '1.4rem';

    var again = api.el('button', 'btn btn--primary', 'Refaire une épreuve');
    again.type = 'button';
    again.id = 'examAgain';
    again.addEventListener('click', function () {
      store().session = null;
      api.save();
      paint();
    });
    actions.appendChild(again);

    var copy = api.el('button', 'btn btn--ghost', 'Copier le relevé');
    copy.type = 'button';
    copy.addEventListener('click', function () {
      api.copyText(reportText());
      api.toast('Relevé copié dans le presse-papiers.');
    });
    actions.appendChild(copy);

    if (weakest && weakest.pct < 100 && weakest.module) {
      var weakLink = api.el('a', 'btn btn--ghost', 'Revoir le module ' + weakest.module.no);
      weakLink.href = '#/m/' + weakest.module.id;
      actions.appendChild(weakLink);
    }
    main.appendChild(actions);

    var hist = store().history;
    var best = hist.reduce(function (b, a) { return !b || a.pct > b.pct ? a : b; }, null);
    var foot = api.el('p', 'small muted');
    foot.style.marginTop = '1rem';
    foot.textContent = 'Meilleur score sur cet appareil : ' + (best ? best.pct + ' %' : '—') +
      ' · ' + hist.length + ' tentative(s) enregistrée(s). L’examen ne pèse pas dans le score global du mode évaluation, mais une réussite (≥ ' + PASS + ' %) est exigée pour l’attestation.';
    main.appendChild(foot);
  }

  window.EXAM = {
    render: render,
    stop: stop,
    isRunning: function () {
      if (!api) return false;
      var st = api.getState();
      return !!(st.exam && st.exam.session && !st.exam.session.submitted);
    }
  };
})();
