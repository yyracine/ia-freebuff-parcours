/* Application : routeur, rendu, progression, quiz, PWA */
(function () {
  'use strict';

  var STORE_KEY = 'ia-freebuff-progress-v1';
  var MODULES = window.MODULES || [];
  var EXERCISES = window.EXERCISES || [];
  var PROJECTS = window.PROJECTS || [];
  var GLOSSARY = window.GLOSSARY || [];
  var MASTERY = window.MASTERY || [];

  var state = load();

  function load() {
    var base = { done: {}, quiz: {}, exercises: {}, mastery: {}, exam: { session: null, history: [] }, learner: { name: '', awardedAt: null }, theme: null };
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        return {
          done: parsed.done || {},
          quiz: parsed.quiz || {},
          exercises: parsed.exercises || {},
          mastery: parsed.mastery || {},
          exam: parsed.exam || { session: null, history: [] },
          learner: parsed.learner || { name: '', awardedAt: null },
          theme: parsed.theme || null
        };
      }
    } catch (e) { /* stockage indisponible : on continue en mémoire */ }
    return base;
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------------- Thème ---------------- */
  function applyTheme() {
    var stored = state.theme;
    if (stored) document.documentElement.setAttribute('data-theme', stored);
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  $('#themeBtn').addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    state.theme = next; save();
  });

  /* ---------------- Toast ---------------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(function () { t.classList.add('is-on'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove('is-on');
      setTimeout(function () { t.hidden = true; }, 250);
    }, 2400);
  }

  /* ---------------- Progression ---------------- */
  function completedCount() {
    return MODULES.filter(function (m) { return state.done[m.id]; }).length;
  }

  function updateProgress() {
    var total = MODULES.length || 1;
    var pct = Math.round(completedCount() / total * 100);
    $('#progressLabel').textContent = pct + ' %';
    $('#progressRing').style.setProperty('--p', pct);
    $('#progressChip').title = completedCount() + ' module(s) terminé(s) sur ' + MODULES.length;
    $$('.side-link[data-module]').forEach(function (a) {
      var m = MODULES.filter(function (x) { return x.id === a.getAttribute('data-module'); })[0];
      if (m) a.classList.toggle('is-done', !!state.done[m.id]);
    });
  }

  /* ---------------- Navigation ---------------- */
  function buildNav() {
    var nav = $('#sideNav');
    nav.innerHTML = '';

    nav.appendChild(el('div', 'side-nav__title', 'Parcours'));
    nav.appendChild(sideLink('#/', 'Accueil', '◆', false));

    MODULES.forEach(function (m) {
      var a = sideLink('#/m/' + m.id, m.title, String(m.no), true);
      a.setAttribute('data-module', m.id);
      if (state.done[m.id]) a.classList.add('is-done');
      nav.appendChild(a);
    });

    nav.appendChild(el('div', 'side-nav__title', 'Pratique'));
    nav.appendChild(sideLink('#/atelier', 'Exercices', '✎', false));
    nav.appendChild(sideLink('#/projets', 'Projets', '▲', false));
    nav.appendChild(el('div', 'side-nav__title', 'Bilan'));
    nav.appendChild(sideLink('#/evaluation', 'Mode évaluation', '★', false));
    nav.appendChild(sideLink('#/examen', 'Examen final', '⏱', false));
    nav.appendChild(el('div', 'side-nav__title', 'Référence'));
    nav.appendChild(sideLink('#/glossaire', 'Glossaire', '≡', false));
    nav.appendChild(sideLink('#/maitrise', 'Checklist de maîtrise', '✓', false));
    nav.appendChild(sideLink('#/guide', 'Guide d’utilisation', '?', false));
    updateProgress();
  }

  function sideLink(href, label, badge, isModule) {
    var a = document.createElement('a');
    a.className = 'side-link';
    a.href = href;
    a.innerHTML = '<span class="side-link__no">' + esc(badge) + '</span>' +
      '<span class="side-link__label">' + esc(label) + '</span>' +
      '<span class="side-link__done" aria-hidden="true"></span>';
    return a;
  }

  function markActiveNav() {
    var hash = location.hash || '#/';
    $$('.side-link').forEach(function (a) {
      if (a.getAttribute('href') === hash) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* ---------------- Routeur ---------------- */
  function route() {
    var hash = location.hash || '#/';

    /* Épreuve en cours : le cours et le sommaire restent verrouillés */
    if (hash !== '#/examen' && window.EXAM && window.EXAM.isRunning()) {
      location.hash = '#/examen';
      toast('Épreuve en cours : termine ou abandonne pour quitter.');
      return;
    }
    if (window.EXAM && window.EXAM.stop) window.EXAM.stop();

    var main = $('#main');
    main.innerHTML = '';
    closeMenu();

    var m = /^#\/m\/([\w-]+)/.exec(hash);
    if (m) {
      var mod = MODULES.filter(function (x) { return x.id === m[1]; })[0];
      if (mod) { renderModule(mod, main); markActiveNav(); return; }
    }
    if (hash === '#/atelier') { renderAtelier(main); }
    else if (hash === '#/projets') { renderProjects(main); }
    else if (hash === '#/glossaire') { renderGlossary(main); }
    else if (hash === '#/maitrise') { renderMastery(main); }
    else if (hash === '#/evaluation') { renderEvaluation(main); }
    else if (hash === '#/examen') { renderExamView(main); }
    else if (hash === '#/guide') { renderGuide(main); }
    else { renderHome(main); }
    markActiveNav();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ---------------- Accueil ---------------- */
  function renderHome(main) {
    var groups = [
      { title: 'Fondations', desc: 'Comprendre le moteur', ids: ['ia', 'harnais', 'agents'] },
      { title: 'Atelier', desc: 'Les briques de l’écosystème', ids: ['skills', 'mcp', 'hooks'] },
      { title: 'Pratique Freebuff', desc: 'Méthode et fabrication', ids: ['vibe', 'freebuff', 'agentforge'] }
    ];

    var hero = el('section', 'hero');
    hero.innerHTML =
      '<span class="eyebrow">Parcours guidé · 9 modules</span>' +
      '<h1>Comprendre l’IA, puis <span class="grad-text">piloter Freebuff</span> comme un professionnel.</h1>' +
      '<p>Du token au sous-agent : neuf modules, des schémas manipulables, des exercices corrigés et cinq projets. À la fin, tu sais ce qu’est un harnais, un skill, MCP ou un hook — et tu sais t’en servir.</p>' +
      '<div class="hero__cta">' +
      '<a class="btn btn--primary" href="#/m/ia">Commencer le module 1' +
      '<svg viewBox="0 0 24 24"><path d="M5 12h14m0 0-6-6m6 6-6 6"/></svg></a>' +
      '<a class="btn" href="#/atelier">Voir les exercices</a>' +
      '<a class="btn btn--ghost" href="#/projets">Les projets</a>' +
      '</div>' +
      '<div class="hero__meta">' +
      '<div><strong>9</strong><span>modules</span></div>' +
      '<div><strong>12</strong><span>exercices corrigés</span></div>' +
      '<div><strong>5</strong><span>projets</span></div>' +
      '<div><strong id="heroDone">0</strong><span>terminés</span></div>' +
      '</div>';
    main.appendChild(hero);
    $('#heroDone').textContent = String(completedCount());

    /* Progression réelle */
    var stats = el('section', 'section-head');
    stats.innerHTML = '<h2>Où tu en es</h2><p>Progression enregistrée sur cet appareil</p>';
    main.appendChild(stats);

    var grid = el('div', 'stat-grid');
    var quizTotal = 0, quizGood = 0;
    Object.keys(state.quiz).forEach(function (k) {
      var q = state.quiz[k];
      if (q) { quizTotal += q.total || 0; quizGood += q.good || 0; }
    });
    grid.innerHTML =
      '<div class="stat stat--accent"><strong>' + completedCount() + '/' + MODULES.length + '</strong><span>Modules terminés</span></div>' +
      '<div class="stat"><strong>' + (quizTotal ? Math.round(quizGood / quizTotal * 100) + ' %' : '—') + '</strong><span>Réussite aux quiz</span></div>' +
      '<div class="stat"><strong>' + Object.keys(state.exercises).length + '/' + EXERCISES.length + '</strong><span>Exercices faits</span></div>' +
      '<div class="stat"><strong>' + Object.keys(state.mastery).length + '</strong><span>Compétences cochées</span></div>';
    main.appendChild(grid);

    /* Pourquoi ce parcours */
    var why = el('section', 'section-head');
    why.innerHTML = '<h2>Trois idées reçues à démonter</h2><p>Ce que ce parcours corrige dès le départ</p>';
    main.appendChild(why);
    var tbl = el('div', 'table-wrap');
    tbl.innerHTML =
      '<table><thead><tr><th>On croit souvent…</th><th>En réalité</th></tr></thead><tbody>' +
      '<tr><td>« L’IA sait des choses. »</td><td>Un modèle prédit la suite d’un texte. La fiabilité vient des outils et des vérifications, pas de sa mémoire.</td></tr>' +
      '<tr><td>« Un agent, c’est un chat plus fort. »</td><td>Un agent boucle avec des outils et observe le réel. Sans harnais, il ne peut rien faire.</td></tr>' +
      '<tr><td>« Le vibe coding, c’est coder sans regarder. »</td><td>C’est déléguer l’exécution en gardant l’architecture, le périmètre et la relecture.</td></tr>' +
      '</tbody></table>';
    main.appendChild(tbl);

    groups.forEach(function (g) {
      var head = el('section', 'section-head');
      head.innerHTML = '<h2>' + esc(g.title) + '</h2><p>' + esc(g.desc) + '</p>';
      main.appendChild(head);
      var mg = el('div', 'module-grid');
      g.ids.forEach(function (id) {
        var m = MODULES.filter(function (x) { return x.id === id; })[0];
        if (m) mg.appendChild(moduleCard(m));
      });
      main.appendChild(mg);
    });

    var cta = el('section', 'section-head');
    cta.innerHTML = '<h2>Passer à la pratique</h2><p>Le savoir ne s’installe qu’en manipulant</p>';
    main.appendChild(cta);
    var cards = el('div', 'module-grid');
    cards.innerHTML =
      '<a class="module-card" href="#/atelier"><div class="module-card__top"><span class="module-card__icon">✎</span><span class="module-card__no">12</span></div>' +
      '<h3>Exercices corrigés</h3><p>Court, ciblé, avec une solution commentée. Le meilleur moyen de vérifier une intuition.</p></a>' +
      '<a class="module-card" href="#/projets"><div class="module-card__top"><span class="module-card__icon">▲</span><span class="module-card__no">5</span></div>' +
      '<h3>Projets</h3><p>Du portfolio en vibe coding au pipeline d’agents. Chaque projet a ses critères d’évaluation.</p></a>' +
      '<a class="module-card" href="#/maitrise"><div class="module-card__top"><span class="module-card__icon">✓</span><span class="module-card__no">22</span></div>' +
      '<h3>Checklist de maîtrise</h3><p>Le contrôle final : ce que tu dois savoir faire seul, sans relire le cours.</p></a>' +
      '<a class="module-card" href="#/examen"><div class="module-card__top"><span class="module-card__icon">⏱</span><span class="module-card__no">45</span></div>' +
      '<h3>Examen final</h3><p>Questions tirées au hasard, chronomètre réel, corrections retenues jusqu’à la remise. Seuil de réussite : 70 %.</p></a>' +
      '<a class="module-card" href="#/evaluation"><div class="module-card__top"><span class="module-card__icon">★</span><span class="module-card__no">Bilan</span></div>' +
      '<h3>Mode évaluation</h3><p>Un score pondéré sur les quiz, les exercices et la checklist, puis une attestation imprimable dès les cinq seuils atteints, examen final compris.</p></a>';
    main.appendChild(cards);
    updateProgress();
  }

  function moduleCard(m) {
    var a = document.createElement('a');
    a.className = 'module-card' + (state.done[m.id] ? ' is-done' : '');
    a.href = '#/m/' + m.id;
    a.innerHTML =
      '<div class="module-card__top"><span class="module-card__icon">' + m.icon + '</span>' +
      (state.done[m.id] ? '<span class="badge-done">✓ terminé</span>' : '') +
      '<span class="module-card__no">' + m.no + ' · ' + esc(m.duration) + '</span></div>' +
      '<h3>' + esc(m.title) + '</h3>' +
      '<p>' + esc(m.subtitle) + '</p>' +
      '<div class="module-card__tags">' + m.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>';
    return a;
  }

  /* ---------------- Vue module ---------------- */
  function renderModule(m, main) {
    var idx = MODULES.indexOf(m);
    document.title = m.title + ' — IA & Freebuff';

    var head = el('header', 'module-head');
    head.innerHTML =
      '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><span>Module ' + m.no + '</span></div>' +
      '<h1>' + esc(m.title) + '</h1>' +
      '<p class="module-head__lede">' + esc(m.subtitle) + '</p>' +
      '<div class="module-head__meta">' +
      '<span class="chip">' + m.icon + ' ' + esc(m.level) + '</span>' +
      '<span class="chip">⏱ ' + esc(m.duration) + '</span>' +
      (state.done[m.id] ? '<span class="chip chip--ok">✓ Terminé</span>' : '') +
      '</div>';
    main.appendChild(head);

    if (m.objectives && m.objectives.length) {
      var obj = el('section', 'objectives');
      obj.innerHTML = '<h2>Objectifs du module</h2><ul>' +
        m.objectives.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul>';
      main.appendChild(obj);
    }

    var blocks = el('div', 'blocks');
    (m.blocks || []).forEach(function (b) { blocks.appendChild(renderBlock(b, m)); });
    main.appendChild(blocks);

    if (m.takeaways && m.takeaways.length) {
      var tk = el('section', 'takeaways');
      tk.innerHTML = '<h2>À retenir</h2><ul>' +
        m.takeaways.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
      main.appendChild(tk);
    }

    /* Marquer terminé */
    var doneWrap = el('div', 'row row--between');
    doneWrap.style.marginTop = '1.4rem';
    var doneBtn = el('button', 'btn ' + (state.done[m.id] ? 'btn--ghost' : 'btn--primary'),
      state.done[m.id] ? '✓ Module terminé — annuler' : 'Marquer ce module comme terminé');
    doneBtn.type = 'button';
    doneBtn.addEventListener('click', function () {
      state.done[m.id] = !state.done[m.id];
      save(); buildNav(); route();
      toast(state.done[m.id] ? 'Module terminé. Bien joué.' : 'Marqueur retiré.');
    });
    doneWrap.appendChild(doneBtn);

    var quizState = state.quiz[m.id];
    if (quizState) {
      doneWrap.appendChild(el('span', 'small muted', 'Quiz : ' + quizState.good + '/' + quizState.total));
    }
    main.appendChild(doneWrap);

    /* Nav */
    var nav = el('nav', 'module-nav');
    if (idx > 0) {
      var prev = MODULES[idx - 1];
      var pa = document.createElement('a');
      pa.className = 'module-nav__link';
      pa.href = '#/m/' + prev.id;
      pa.innerHTML = '<small>← Module ' + prev.no + '</small><strong>' + esc(prev.title) + '</strong>';
      nav.appendChild(pa);
    }
    if (idx < MODULES.length - 1) {
      var next = MODULES[idx + 1];
      var na = document.createElement('a');
      na.className = 'module-nav__link module-nav__link--next';
      na.href = '#/m/' + next.id;
      na.innerHTML = '<small>Module ' + next.no + ' →</small><strong>' + esc(next.title) + '</strong>';
      nav.appendChild(na);
    } else {
      var fa = document.createElement('a');
      fa.className = 'module-nav__link module-nav__link--next';
      fa.href = '#/atelier';
      fa.innerHTML = '<small>Pratique →</small><strong>Passer aux exercices</strong>';
      nav.appendChild(fa);
    }
    main.appendChild(nav);
  }

  /* ---------------- Rendu des blocs ---------------- */
  function renderBlock(b, module) {
    switch (b.type) {
      case 'prose': {
        var s = el('section', 'block block--prose');
        if (b.title) s.appendChild(el('h2', '', esc(b.title)));
        s.appendChild(el('div', '', b.html));
        return s;
      }
      case 'callout': {
        var icons = { key: '◆', tip: '💡', warn: '⚠', danger: '⛔', info: 'ℹ' };
        var c = el('aside', 'callout callout--' + (b.tone || 'info'));
        c.innerHTML = '<div class="callout__icon" aria-hidden="true">' + (icons[b.tone] || 'ℹ') + '</div>' +
          '<div class="callout__body">' + (b.title ? '<div class="callout__title">' + esc(b.title) + '</div>' : '') + b.html + '</div>';
        return c;
      }
      case 'steps': {
        var st = el('section', '');
        if (b.title) st.appendChild(el('h2', '', esc(b.title)));
        var box = el('div', 'steps');
        b.items.forEach(function (it) {
          box.appendChild(el('div', 'step', '<h4>' + esc(it.title) + '</h4>' + it.html));
        });
        st.appendChild(box);
        return st;
      }
      case 'code': {
        var code = el('figure', 'code-block');
        var headEl = el('div', 'code-block__head');
        headEl.appendChild(el('span', 'code-block__title', (b.lang ? b.lang + ' · ' : '') + (b.title || 'extrait')));
        var btn = el('button', 'btn btn--sm btn--ghost code-block__copy', 'Copier');
        btn.type = 'button';
        btn.addEventListener('click', function () {
          copyText(b.code).then(function () {
            btn.textContent = 'Copié ✓';
            setTimeout(function () { btn.textContent = 'Copier'; }, 1500);
          });
        });
        headEl.appendChild(btn);
        code.appendChild(headEl);
        var pre = document.createElement('pre');
        var codeEl = document.createElement('code');
        codeEl.textContent = b.code;
        pre.appendChild(codeEl);
        code.appendChild(pre);
        if (b.caption) code.appendChild(el('figcaption', '', esc(b.caption)));
        return code;
      }
      case 'table': {
        var wrap = el('div', 'table-wrap');
        wrap.innerHTML = '<table><thead><tr>' + b.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
          '</tr></thead><tbody>' + b.rows.map(function (r) {
            return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
          }).join('') + '</tbody></table>';
        var holder = el('section', '');
        if (b.title) holder.appendChild(el('h2', '', esc(b.title)));
        holder.appendChild(wrap);
        return holder;
      }
      case 'example': {
        var ex = el('aside', 'example');
        ex.innerHTML = '<span class="example__label">Exemple</span>' +
          (b.title ? '<h4>' + esc(b.title) + '</h4>' : '') + b.html;
        return ex;
      }
      case 'widget': return renderWidget(b);
      case 'quiz': return renderQuiz(b, module);
      default: return el('div', '', '');
    }
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  function renderWidget(b) {
    var wrap = el('section', 'widget');
    wrap.appendChild(el('div', 'widget__head',
      '<span class="widget__kind">Interactif</span><span class="widget__title">' + esc(b.title || '') + '</span>'));
    var body = el('div', 'widget__body');
    if (b.hint) body.appendChild(el('p', 'widget__hint', esc(b.hint)));
    wrap.appendChild(body);
    var factory = window.WIDGETS && window.WIDGETS[b.widget];
    if (factory) {
      try { factory(body, b.config || {}); }
      catch (e) { body.appendChild(el('p', 'muted', 'Widget indisponible : ' + esc(e.message))); }
    }
    return wrap;
  }

  /* ---------------- Quiz ---------------- */
  function renderQuiz(b, module) {
    var box = el('section', 'quiz');
    var head = el('div', 'quiz__head');
    head.innerHTML = '<span class="widget__kind">Quiz</span><strong>' + esc(b.title || 'Vérifie tes acquis') + '</strong>' +
      '<span class="quiz__score" data-score>0/' + b.questions.length + '</span>';
    box.appendChild(head);

    var answers = new Array(b.questions.length).fill(null);
    var scoreEl = $('[data-score]', head);
    var verdict = el('div', 'quiz__verdict');

    function updateScore() {
      var good = answers.filter(function (a, i) { return a !== null && a === b.questions[i].answer; }).length;
      var answered = answers.filter(function (a) { return a !== null; }).length;
      scoreEl.textContent = good + '/' + b.questions.length;
      verdict.textContent = answered === 0 ? '' : good === b.questions.length
        ? 'Parfait. Tu peux passer à la suite.'
        : (answered < b.questions.length ? answered + ' question(s) traitée(s) — continue.' : 'Relis les explications des questions manquées, puis réessaie.');
      if (answered === b.questions.length) {
        var prev = state.quiz[module.id] || { good: 0, total: b.questions.length };
        state.quiz[module.id] = { good: good, total: b.questions.length };
        if (prev.good !== good) save();
      }
    }

    b.questions.forEach(function (q, qi) {
      var qWrap = el('div', 'quiz__q');
      qWrap.appendChild(el('p', 'quiz__prompt', '<span class="quiz__num">Q' + (qi + 1) + '</span>' + esc(q.q)));
      var opts = el('div', 'quiz__opts');
      var explain = el('p', 'quiz__explain', esc(q.explain));
      explain.hidden = true;
      var buttons = [];
      q.options.forEach(function (o, oi) {
        var btn = el('button', 'opt', '<span class="opt__key">' + String.fromCharCode(65 + oi) + '</span><span>' + esc(o) + '</span>');
        btn.type = 'button';
        btn.addEventListener('click', function () {
          if (answers[qi] !== null) return;
          answers[qi] = oi;
          buttons.forEach(function (x, xi) {
            x.disabled = true;
            if (xi === q.answer) x.classList.add('is-correct');
            else if (xi === oi) x.classList.add('is-wrong');
          });
          explain.hidden = false;
          updateScore();
        });
        buttons.push(btn);
        opts.appendChild(btn);
      });
      qWrap.appendChild(opts);
      qWrap.appendChild(explain);
      box.appendChild(qWrap);
    });

    var foot = el('div', 'quiz__foot');
    var retry = el('button', 'btn btn--sm btn--ghost', 'Réinitialiser ce quiz');
    retry.type = 'button';
    retry.addEventListener('click', function () {
      answers = new Array(b.questions.length).fill(null);
      $$('.opt', box).forEach(function (x) {
        x.disabled = false;
        x.classList.remove('is-correct', 'is-wrong');
      });
      $$('.quiz__explain', box).forEach(function (x) { x.hidden = true; });
      updateScore();
    });
    foot.appendChild(retry);
    foot.appendChild(verdict);
    box.appendChild(foot);
    return box;
  }

  /* ---------------- Exercices ---------------- */
  function renderAtelier(main) {
    document.title = 'Exercices — IA & Freebuff';
    var head = el('header', 'module-head');
    head.innerHTML =
      '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><span>Atelier</span></div>' +
      '<h1>Exercices corrigés</h1>' +
      '<p class="module-head__lede">Douze exercices courts, un par compétence clé. Cherche d’abord seul, puis ouvre la solution : c’est l’écart entre les deux qui fait apprendre.</p>';
    main.appendChild(head);

    var stat = el('div', 'stat-grid');
    stat.innerHTML =
      '<div class="stat stat--accent"><strong id="exDone">0</strong><span>Exercices terminés</span></div>' +
      '<div class="stat"><strong>' + EXERCISES.length + '</strong><span>Disponibles</span></div>' +
      '<div class="stat"><strong>' + new Set(EXERCISES.map(function (e) { return e.level; })).size + '</strong><span>Niveaux</span></div>';
    main.appendChild(stat);

    var bar = el('div', 'row');
    bar.style.margin = '1.2rem 0';
    var filter = document.createElement('select');
    filter.id = 'exFilter';
    var all = document.createElement('option');
    all.value = ''; all.textContent = 'Tous les modules';
    filter.appendChild(all);
    MODULES.forEach(function (m) {
      var o = document.createElement('option');
      o.value = m.id; o.textContent = 'Module ' + m.no + ' — ' + m.title;
      filter.appendChild(o);
    });
    bar.appendChild(filter);
    main.appendChild(bar);

    var list = el('div', 'stack');
    list.id = 'exList';
    main.appendChild(list);

    function draw(filterId) {
      list.innerHTML = '';
      EXERCISES.filter(function (e) { return !filterId || e.module === filterId; })
        .forEach(function (e) { list.appendChild(exerciseCard(e)); });
      $('#exDone').textContent = String(Object.keys(state.exercises).length);
    }

    filter.addEventListener('change', function () { draw(filter.value); });
    draw('');
  }

  function exerciseCard(e) {
    var m = MODULES.filter(function (x) { return x.id === e.module; })[0];
    var card = el('article', 'exercise');
    var checked = !!state.exercises[e.id];
    card.innerHTML =
      '<div class="exercise__top"><span class="tag">' + esc(e.level) + '</span>' +
      '<span class="tag">Module ' + (m ? m.no + ' · ' + esc(m.title) : esc(e.module)) + '</span></div>' +
      '<h3>' + esc(e.title) + '</h3>' +
      '<p class="exercise__brief">' + esc(e.brief) + '</p>' +
      '<p class="exercise__criteria"><strong>Critères :</strong> ' + esc(e.criteria) + '</p>' +
      '<div class="row"><label class="check-item" style="padding:.35rem .6rem"><input type="checkbox" ' +
      (checked ? 'checked' : '') + ' data-ex="' + esc(e.id) + '"><span>Fait</span></label></div>' +
      '<details class="reveal"><summary>Indices</summary><ul>' +
      e.hints.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul></details>' +
      '<details class="reveal"><summary>Solution commentée</summary><p>' + esc(e.solution) + '</p></details>';

    var cb = $('input[type="checkbox"]', card);
    cb.addEventListener('change', function () {
      if (cb.checked) state.exercises[e.id] = true;
      else delete state.exercises[e.id];
      save();
      var d = $('#exDone');
      if (d) d.textContent = String(Object.keys(state.exercises).length);
      toast(cb.checked ? 'Exercice coché.' : 'Exercice décoché.');
    });
    return card;
  }

  /* ---------------- Projets ---------------- */
  function renderProjects(main) {
    document.title = 'Projets — IA & Freebuff';
    var head = el('header', 'module-head');
    head.innerHTML =
      '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><span>Projets</span></div>' +
      '<h1>Cinq projets, du premier commit au pipeline d’agents</h1>' +
      '<p class="module-head__lede">Chaque projet a un objectif livrable, des étapes, des critères d’évaluation et une extension. Les critères comptent plus que le code : c’est eux qui distinguent un travail professionnel d’une démonstration.</p>';
    main.appendChild(head);

    PROJECTS.forEach(function (p, i) {
      var card = el('section', 'widget');
      card.style.marginBottom = '1.2rem';
      card.innerHTML =
        '<div class="widget__head"><span class="widget__kind">Projet ' + (i + 1) + '</span>' +
        '<span class="widget__title">' + esc(p.title) + '</span>' +
        '<span class="tag" style="margin-left:auto">' + esc(p.level) + ' · ' + esc(p.duration) + '</span></div>' +
        '<div class="widget__body">' +
        '<p><strong>But :</strong> ' + esc(p.goal) + '</p>' +
        '<p class="small muted">' + esc(p.brief) + '</p>' +
        '<h3 style="margin-top:1rem">Étapes</h3>' +
        '<div class="steps">' + p.steps.map(function (s) {
          return '<div class="step"><p>' + esc(s) + '</p></div>';
        }).join('') + '</div>' +
        '<h3 style="margin-top:1.2rem">Critères de réussite</h3>' +
        '<ul>' + p.criteria.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' +
        '<details class="reveal"><summary>Pour aller plus loin</summary><p>' + esc(p.extensions) + '</p></details>' +
        '</div>';
      main.appendChild(card);
    });
  }

  /* ---------------- Glossaire ---------------- */
  function renderGlossary(main) {
    document.title = 'Glossaire — IA & Freebuff';
    var head = el('header', 'module-head');
    head.innerHTML =
      '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><span>Glossaire</span></div>' +
      '<h1>Glossaire</h1>' +
      '<p class="module-head__lede">' + GLOSSARY.length + ' termes, définitions courtes et opérationnelles. Filtre pour trouver vite.</p>';
    main.appendChild(head);

    var bar = el('div', 'filter-bar');
    var input = document.createElement('input');
    input.type = 'search';
    input.id = 'glossarySearch';
    input.placeholder = 'Filtrer : contexte, skill, hook, MCP…';
    input.setAttribute('aria-label', 'Filtrer le glossaire');
    bar.appendChild(input);
    var count = el('span', 'small muted', GLOSSARY.length + ' termes');
    bar.appendChild(count);
    main.appendChild(bar);

    var grid = el('div', 'glossary');
    main.appendChild(grid);

    function draw(q) {
      var query = (q || '').trim().toLowerCase();
      var rows = GLOSSARY.filter(function (g) {
        return !query || g.term.toLowerCase().indexOf(query) >= 0 ||
          g.def.toLowerCase().indexOf(query) >= 0 || g.tag.toLowerCase().indexOf(query) >= 0;
      }).sort(function (a, b) { return a.term.localeCompare(b.term, 'fr'); });
      grid.innerHTML = '';
      rows.forEach(function (g) {
        grid.appendChild(el('article', 'term',
          '<h3>' + esc(g.term) + '</h3><p>' + esc(g.def) + '</p><em>' + esc(g.tag) + '</em>'));
      });
      if (!rows.length) grid.innerHTML = '<p class="muted">Aucun terme ne correspond.</p>';
      count.textContent = rows.length + ' terme(s)';
    }
    input.addEventListener('input', function () { draw(input.value); });
    draw('');
  }

  /* ---------------- Checklist de maîtrise ---------------- */
  function renderMastery(main) {
    document.title = 'Maîtrise — IA & Freebuff';
    var total = MASTERY.reduce(function (n, g) { return n + g.items.length; }, 0);
    var done = Object.keys(state.mastery).filter(function (k) { return state.mastery[k]; }).length;

    var head = el('header', 'module-head');
    head.innerHTML =
      '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><span>Maîtrise</span></div>' +
      '<h1>Checklist de maîtrise</h1>' +
      '<p class="module-head__lede">Coche uniquement ce que tu peux faire <em>sans relire le cours</em>. C’est ton tableau de bord final, pas une liste de souhaits.</p>';
    main.appendChild(head);

    var stat = el('div', 'stat-grid');
    stat.innerHTML =
      '<div class="stat stat--accent"><strong id="mDone">' + done + '/' + total + '</strong><span>Compétences acquises</span></div>' +
      '<div class="stat"><strong id="mPct">' + Math.round(done / total * 100) + ' %</strong><span>Progression</span></div>' +
      '<div class="stat"><strong>9</strong><span>Modules couverts</span></div>';
    main.appendChild(stat);

    MASTERY.forEach(function (g, gi) {
      var sec = el('section', 'widget');
      sec.style.marginTop = '1.2rem';
      sec.style.marginBottom = '1.2rem';
      sec.innerHTML = '<div class="widget__head"><span class="widget__kind">' + esc(g.group) + '</span>' +
        '<span class="widget__title">' + g.items.length + ' compétences</span></div>';
      var body = el('div', 'widget__body');
      var list = el('div', 'checklist');
      g.items.forEach(function (item, ii) {
        var id = 'm' + gi + '-' + ii;
        var label = el('label', 'check-item' + (state.mastery[id] ? ' is-checked' : ''));
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!state.mastery[id];
        cb.addEventListener('change', function () {
          state.mastery[id] = cb.checked;
          label.classList.toggle('is-checked', cb.checked);
          save();
          var n = Object.keys(state.mastery).filter(function (k) { return state.mastery[k]; }).length;
          $('#mDone').textContent = n + '/' + total;
          $('#mPct').textContent = Math.round(n / total * 100) + ' %';
          if (n === total) toast('Parcours complet. Tu peux prétendre à la maîtrise.');
        });
        label.appendChild(cb);
        label.appendChild(el('span', '', esc(item)));
        list.appendChild(label);
      });
      body.appendChild(list);
      sec.appendChild(body);
      main.appendChild(sec);
    });

    var note = el('div', 'callout callout--tip');
    note.innerHTML = '<div class="callout__icon" aria-hidden="true">💡</div><div class="callout__body">' +
      '<div class="callout__title">Comment utiliser cette liste</div>' +
      '<p>Une case non cochée n’est pas un échec : c’est la prochaine chose à pratiquer. Choisis le module correspondant, puis reviens cocher après un projet réel.</p></div>';
    main.appendChild(note);
  }

  /* ---------------- Mode évaluation ---------------- */
  var EVAL_LEVELS = [
    { min: 92, name: 'Maîtrise', desc: 'Tu sais expliquer chaque brique et arbitrer seul : agents, skills, MCP, hooks. Prochain objectif : transmettre.' },
    { min: 78, name: 'Praticien confirmé', desc: 'Tu mènes un projet complet en vibe coding et tu délègues proprement. Consolide ce qui n’est pas encore vert.' },
    { min: 62, name: 'Praticien', desc: 'Les bases sont solides et l’outillage est compris. Les lignes rouges plus bas sont ton prochain chantier.' },
    { min: 40, name: 'Intermédiaire', desc: 'Tu as les repères essentiels. Termine les modules non lus et refais les quiz manqués.' },
    { min: 0, name: 'Débutant', desc: 'Commence par les modules 1 à 3 : tout le reste s’appuie dessus.' }
  ];

  function quizStats() {
    var per = [];
    var good = 0;
    var total = 0;
    var ratioSum = 0;
    MODULES.forEach(function (m) {
      var quiz = (m.blocks || []).filter(function (b) { return b.type === 'quiz'; })[0];
      if (!quiz) return;
      var t = quiz.questions.length;
      var saved = state.quiz[m.id];
      var s = saved ? Math.max(0, Math.min(saved.good, t)) : 0;
      per.push({ module: m, good: s, total: t, answered: !!saved });
      good += s;
      total += t;
      ratioSum += t ? s / t : 0;
    });
    return {
      per: per,
      good: good,
      total: total,
      pct: per.length ? Math.round(ratioSum / per.length * 100) : 0
    };
  }

  function masteryStats() {
    var done = 0;
    var total = 0;
    MASTERY.forEach(function (g, gi) {
      g.items.forEach(function (_, ii) {
        total += 1;
        if (state.mastery['m' + gi + '-' + ii]) done += 1;
      });
    });
    return { done: done, total: total, pct: total ? Math.round(done / total * 100) : 0 };
  }

  function exerciseStats() {
    var done = EXERCISES.filter(function (e) { return state.exercises[e.id]; }).length;
    return {
      done: done,
      total: EXERCISES.length,
      pct: EXERCISES.length ? Math.round(done / EXERCISES.length * 100) : 0
    };
  }

  function evalScores() {
    var q = quizStats();
    var ex = exerciseStats();
    var ma = masteryStats();
    var modDone = completedCount();
    var modPct = MODULES.length ? Math.round(modDone / MODULES.length * 100) : 0;
    var parts = [
      { label: 'Quiz des modules', weight: 40, pct: q.pct, detail: q.good + '/' + q.total + ' bonnes réponses', href: '#/m/ia' },
      { label: 'Exercices corrigés', weight: 25, pct: ex.pct, detail: ex.done + '/' + ex.total + ' réalisés', href: '#/atelier' },
      { label: 'Checklist de maîtrise', weight: 20, pct: ma.pct, detail: ma.done + '/' + ma.total + ' compétences', href: '#/maitrise' },
      { label: 'Modules terminés', weight: 15, pct: modPct, detail: modDone + '/' + MODULES.length + ' marqués', href: '#/' }
    ];
    var score = Math.round(parts.reduce(function (n, p) { return n + p.pct * p.weight / 100; }, 0));
    return {
      score: score,
      parts: parts,
      quiz: q,
      exercises: ex,
      mastery: ma,
      modules: modPct,
      modDone: modDone
    };
  }

  function evalLevel(score) {
    return EVAL_LEVELS.filter(function (l) { return score >= l.min; })[0] || EVAL_LEVELS[EVAL_LEVELS.length - 1];
  }

  function certReqs(s, examBest) {
    var list = [
      { name: 'Score global', need: '≥ 80 %', label: 'Score global ≥ 80 %', ok: s.score >= 80, value: s.score + ' %' },
      { name: 'Quiz des modules', need: '≥ 70 %', label: 'Quiz ≥ 70 %', ok: s.quiz.pct >= 70, value: s.quiz.pct + ' %' },
      { name: 'Exercices corrigés', need: '≥ 9 sur 12', label: 'Au moins 9 exercices sur 12', ok: s.exercises.done >= 9, value: s.exercises.done + '/' + s.exercises.total },
      { name: 'Checklist de maîtrise', need: '≥ 80 %', label: 'Checklist ≥ 80 %', ok: s.mastery.pct >= 80, value: s.mastery.pct + ' %' },
      { name: 'Examen final', need: '≥ 70 %', label: 'Examen final réussi (≥ 70 %)', ok: !!(examBest && examBest.pass), value: examBest ? examBest.pct + ' %' : 'aucune tentative' }
    ];
    return { list: list, ok: list.every(function (r) { return r.ok; }) };
  }

  function certRef(score) {
    var str = (state.learner.name || 'apprenant') + '|' + score + '|' + (state.learner.awardedAt || '');
    var h = 5381;
    for (var i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return 'IAF-' + h.toString(36).toUpperCase().slice(0, 4).padEnd(4, '0') + '-' + String(score).padStart(2, '0');
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) { return '—'; }
  }

  function renderEvaluation(main) {
    document.title = 'Évaluation — IA & Freebuff';
    var s = evalScores();
    var examHistory = (state.exam && state.exam.history) || [];
    var examBest = examHistory.reduce(function (b, a) { return !b || a.pct > b.pct ? a : b; }, null);
    var examPassed = !!(examBest && examBest.pass);
    var req = certReqs(s, examBest);
    var level = evalLevel(s.score);

    if (req.ok && !state.learner.awardedAt) {
      state.learner.awardedAt = new Date().toISOString();
      save();
    }

    function summaryText() {
      var name = (state.learner.name || '').trim() || 'Apprenant';
      var lines = [
        'Bilan — IA & Freebuff',
        'Apprenant : ' + name,
        'Score global : ' + s.score + ' % (' + level.name + ')',
        'Quiz : ' + s.quiz.pct + ' % (' + s.quiz.good + '/' + s.quiz.total + ')',
        'Exercices : ' + s.exercises.done + '/' + s.exercises.total,
        'Checklist : ' + s.mastery.done + '/' + s.mastery.total,
        'Modules terminés : ' + s.modDone + '/' + MODULES.length
      ];
      lines.push(examBest
        ? 'Examen final : ' + examBest.pct + ' % (' + examBest.good + '/' + examBest.total + ') — ' +
          (examBest.pass ? 'réussi' : 'seuil de 70 % non atteint') + ' · ' + examHistory.length + ' tentative(s)'
        : 'Examen final : non passé — requis pour l’attestation');
      s.quiz.per.forEach(function (p) {
        lines.push('  · Module ' + p.module.no + ' — ' + p.module.title + ' : ' + p.good + '/' + p.total);
      });
      if (req.ok) lines.push('Réf. attestation : ' + certRef(s.score) + ' — délivrée le ' + formatDate(state.learner.awardedAt));
      return lines.join('\n');
    }

    var head = el('header', 'module-head');
    head.innerHTML =
      '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><span>Bilan</span></div>' +
      '<h1>Mode évaluation</h1>' +
      '<p class="module-head__lede">Un score unique, pondéré à partir de tes quiz, de tes exercices, de ta checklist et des modules terminés. Il se recalcule à chaque visite, sans serveur ni notation externe.</p>';
    main.appendChild(head);

    var idBox = el('div', 'eval-id');
    idBox.innerHTML = '<label for="learnerName">Nom sur l’attestation</label>';
    var input = document.createElement('input');
    input.type = 'text';
    input.id = 'learnerName';
    input.maxLength = 60;
    input.value = state.learner.name || '';
    input.placeholder = 'Prénom et nom de l’apprenant';
    input.setAttribute('aria-label', 'Nom de l’apprenant');
    idBox.appendChild(input);
    idBox.appendChild(el('p', 'small muted', 'Stocké uniquement sur cet appareil. Sans nom, l’attestation reste anonyme.'));
    main.appendChild(idBox);

    var hero = el('section', 'eval-hero');
    hero.innerHTML =
      '<div class="gauge" style="--v:' + s.score + '" role="img" aria-label="Score global : ' + s.score + ' pour cent">' +
      '<div class="gauge__inner"><strong>' + s.score + '</strong><span>%</span></div></div>' +
      '<div class="eval-hero__text">' +
      '<span class="eyebrow">Niveau atteint</span>' +
      '<h2>' + esc(level.name) + '</h2>' +
      '<p>' + esc(level.desc) + '</p>' +
      '<p class="small muted">Pondération : quiz 40 % · exercices 25 % · checklist 20 % · modules 15 %.</p>' +
      '</div>';
    main.appendChild(hero);

    var bHead = el('section', 'section-head');
    bHead.innerHTML = '<h2>Détail du score</h2><p>Chaque ligne pèse dans le total : améliore la plus basse en premier.</p>';
    main.appendChild(bHead);

    var brk = el('div', 'eval-break');
    s.parts.forEach(function (p) {
      brk.appendChild(el('div', 'eval-break__row',
        '<div><a href="' + p.href + '"><strong>' + esc(p.label) + '</strong></a>' +
        '<span class="stat__note">' + esc(p.detail) + ' · poids ' + p.weight + ' %</span></div>' +
        '<div class="bar"><span class="bar__fill" style="width:' + p.pct + '%"></span></div>' +
        '<div class="eval-break__val">' + p.pct + ' %</div>'));
    });
    main.appendChild(brk);

    var examHead = el('section', 'section-head');
    examHead.innerHTML = '<h2>Examen final</h2><p>Une épreuve à part : questions tirées au hasard, chronomètre, corrections visibles seulement après la remise.</p>';
    main.appendChild(examHead);

    var exBox = el('div', 'exam-summary');
    exBox.innerHTML = examBest
      ? '<div class="exam-summary__score"><strong>' + examBest.pct + ' %</strong><span>meilleur score</span></div>' +
        '<div class="exam-summary__text"><p>' + (examBest.pass ? 'Épreuve réussie' : 'Seuil de 70 % non atteint') +
        ' — ' + examHistory.length + ' tentative(s), la meilleure le ' + esc(formatDate(examBest.at)) + '.</p>' +
        '<p class="small muted">L’examen ne pèse pas dans le score global, mais il est obligatoire pour l’attestation : il vérifie que tu réponds sans relire le cours.</p></div>'
      : '<div class="exam-summary__score"><strong>—</strong><span>aucune tentative</span></div>' +
        '<div class="exam-summary__text"><p>Aucune épreuve passée pour l’instant.</p>' +
        '<p class="small muted">45 questions en banque, tirage aléatoire, seuil de réussite à 70 %.</p></div>';
    var goExam = document.createElement('a');
    goExam.className = 'btn btn--sm';
    goExam.href = '#/examen';
    goExam.textContent = examBest ? 'Refaire l’examen' : 'Passer l’examen';
    exBox.appendChild(goExam);
    main.appendChild(exBox);

    var tHead = el('section', 'section-head');
    tHead.innerHTML = '<h2>Quiz, module par module</h2><p>Un quiz non commencé compte comme zéro : c’est ce qui distingue une maîtrise vérifiée d’une impression de maîtrise.</p>';
    main.appendChild(tHead);

    var wrap = el('div', 'table-wrap');
    wrap.innerHTML = '<table><thead><tr><th>Module</th><th class="num">Score</th><th>Statut</th></tr></thead><tbody>' +
      s.quiz.per.map(function (p) {
        var statut = p.answered && p.good === p.total ? '<span class="pill pill--ok">Acquis</span>'
          : p.answered ? '<span class="pill pill--warn">À revoir</span>'
            : '<span class="pill">Non fait</span>';
        return '<tr><td><a href="#/m/' + p.module.id + '">' + p.module.no + '. ' + esc(p.module.title) + '</a></td>' +
          '<td class="num">' + (p.answered ? p.good : 0) + '/' + p.total + '</td>' +
          '<td>' + statut + '</td></tr>';
      }).join('') + '</tbody>' +
      '<tfoot><tr><td>Total</td><td class="num">' + s.quiz.good + '/' + s.quiz.total + '</td><td>' + s.quiz.pct + ' %</td></tr></tfoot></table>';
    main.appendChild(wrap);

    var actions = [];
    if (!examPassed) actions.push({ t: 'Réussir l’examen final chronométré (seuil 70 %)', href: '#/examen' });
    s.quiz.per.forEach(function (p) {
      if (!p.answered) actions.push({ t: 'Faire le quiz du module ' + p.module.no + ' — ' + p.module.title, href: '#/m/' + p.module.id });
      else if (p.good < p.total) actions.push({ t: 'Revoir ' + (p.total - p.good) + ' question(s) du module ' + p.module.no + ' — ' + p.module.title, href: '#/m/' + p.module.id });
    });
    if (s.exercises.done < s.exercises.total) actions.push({ t: 'Réaliser ' + (s.exercises.total - s.exercises.done) + ' exercice(s) encore non cochés', href: '#/atelier' });
    if (s.mastery.done < s.mastery.total) actions.push({ t: 'Valider ' + (s.mastery.total - s.mastery.done) + ' compétence(s) de la checklist', href: '#/maitrise' });
    if (s.modDone < MODULES.length) actions.push({ t: 'Marquer ' + (MODULES.length - s.modDone) + ' module(s) comme terminé(s)', href: '#/' });

    var aHead = el('section', 'section-head');
    aHead.innerHTML = '<h2>Prochaines actions</h2><p>Le chemin le plus court vers l’attestation, dans l’ordre.</p>';
    main.appendChild(aHead);

    var actBox = el('div', 'eval-actions');
    if (actions.length) {
      actions.slice(0, 4).forEach(function (a, i) {
        var link = el('a', 'eval-action',
          '<span class="eval-action__no">' + (i + 1) + '</span><span>' + esc(a.t) + '</span><span class="eval-action__go" aria-hidden="true">→</span>');
        link.href = a.href;
        actBox.appendChild(link);
      });
    } else {
      actBox.appendChild(el('p', 'log-ok', '✓ Tout est validé. Refais un quiz sans les explications pour vérifier que tu sais encore répondre.'));
    }
    main.appendChild(actBox);

    if (req.ok) {
      var certWrap = el('section', 'cert-wrap');
      certWrap.id = 'certWrap';
      var cert = el('article', 'cert');
      cert.id = 'cert';
      cert.innerHTML =
        '<div class="cert__bar" aria-hidden="true"></div>' +
        '<div class="cert__inner">' +
        '<div class="cert__top"><span>IA &amp; Freebuff · Parcours interactif</span>' +
        '<span class="cert__ref" data-cert-ref></span></div>' +
        '<p class="cert__kicker">Attestation de réussite</p>' +
        '<h2 class="cert__name" data-cert-name></h2>' +
        '<p class="cert__claim">a suivi les neuf modules du parcours « Comprendre l’IA, piloter Freebuff », réalisé les exercices, validé l’évaluation finale avec un score global de <strong>' + s.score + ' %</strong> et réussi l’examen final chronométré avec <strong>' + (examBest ? examBest.pct : 0) + ' %</strong>.</p>' +
        '<h3 class="cert__sub">Conditions de délivrance — toutes vérifiées</h3>' +
        '<ul class="cert__reqs">' +
        req.list.map(function (r) {
          return '<li><span class="cert__req-ok" aria-hidden="true">✓</span>' +
            '<span class="cert__req-name">' + esc(r.name) + '</span>' +
            '<strong>' + esc(r.value) + '</strong>' +
            '<span class="cert__req-need">seuil ' + esc(r.need) + '</span></li>';
        }).join('') +
        '</ul>' +
        '<div class="cert__foot">' +
        '<div><span>Délivrée le</span><strong>' + esc(formatDate(state.learner.awardedAt)) + '</strong></div>' +
        '<div><span>Niveau</span><strong>' + esc(level.name) + '</strong></div>' +
        '<div><span>Modules suivis</span><strong>' + s.modDone + '/' + MODULES.length + '</strong></div>' +
        '<div><span>Score</span><strong>' + s.score + ' %</strong></div>' +
        '</div>' +
        '<p class="cert__legal">Attestation générée localement à partir des résultats enregistrés sur cet appareil. Elle documente un parcours personnel et n’a pas de valeur diplômante.</p>' +
        '</div>';
      certWrap.appendChild(cert);

      var bar = el('div', 'row no-print');
      bar.style.marginTop = '1rem';
      var printBtn = el('button', 'btn btn--primary', 'Imprimer / enregistrer en PDF');
      printBtn.type = 'button';
      printBtn.addEventListener('click', function () {
        document.body.classList.add('is-printing-cert');
        toast('Dans la boîte d’impression, choisis « Enregistrer au format PDF ».');
        setTimeout(function () { window.print(); }, 150);
      });
      var copyBtn = el('button', 'btn btn--ghost', 'Copier le bilan');
      copyBtn.type = 'button';
      copyBtn.addEventListener('click', function () {
        copyText(summaryText());
        toast('Bilan copié dans le presse-papiers.');
      });
      bar.appendChild(printBtn);
      bar.appendChild(copyBtn);
      certWrap.appendChild(bar);
      main.appendChild(certWrap);
    } else {
      var remain = req.list.filter(function (r) { return !r.ok; }).length;
      var suspended = !!state.learner.awardedAt;
      var miss = el('section', 'eval-req');
      miss.innerHTML = '<h2>Attestation verrouillée — ' + remain + ' condition(s) restante(s)</h2>' +
        (suspended
          ? '<div class="eval-suspend"><strong>Ton attestation est suspendue, pas perdue</strong>' +
            '<p>Elle t’avait été délivrée le ' + esc(formatDate(state.learner.awardedAt)) + '. Les conditions de délivrance incluent désormais l’examen final chronométré : il te reste cette épreuve à réussir pour la réactiver.</p>' +
            '<p class="small muted">La date du ' + esc(formatDate(state.learner.awardedAt)) + ' est conservée et sera réaffichée telle quelle. Ta progression, tes quiz et tes exercices ne sont pas remis en cause.</p></div>'
          : '') +
        '<p>Le certificat s’active automatiquement dès que ces cinq conditions sont atteintes. Elles garantissent que tu as pratiqué et vérifié tes acquis, pas seulement lu.</p>' +
        '<ul>' + req.list.map(function (r) {
          return '<li class="' + (r.ok ? 'is-ok' : 'is-ko') + '"><span class="req__mark" aria-hidden="true">' + (r.ok ? '✓' : '✗') + '</span>' +
            '<span>' + esc(r.label) + '</span><strong>' + esc(r.value) + '</strong></li>';
        }).join('') + '</ul>' +
        '<p class="small muted">Les exercices et la checklist représentent 45 % du score et demandent le moins d’effort : commence par là. L’examen final, lui, ne s’obtient qu’en répondant sans relire : c’est la dernière condition à remplir.</p>';
      if (!examPassed) {
        var examCta = document.createElement('a');
        examCta.className = 'btn btn--primary';
        examCta.href = '#/examen';
        examCta.textContent = examBest ? 'Repasser l’examen final' : 'Passer l’examen final';
        examCta.style.marginTop = '.7rem';
        miss.appendChild(examCta);
      }
      main.appendChild(miss);
    }

    function refreshCert() {
      var name = (state.learner.name || '').trim();
      $$('[data-cert-name]', main).forEach(function (n) { n.textContent = name || 'Nom de l’apprenant'; });
      $$('[data-cert-ref]', main).forEach(function (n) { n.textContent = 'Réf. ' + certRef(s.score); });
    }
    input.addEventListener('input', function () {
      state.learner.name = input.value;
      save();
      refreshCert();
    });
    refreshCert();
  }

  /* ---------------- Guide d’utilisation ---------------- */
  function renderGuide(main) {
    document.title = 'Guide d’utilisation — IA & Freebuff';
    var g = window.GUIDE;
    if (!g) {
      main.appendChild(el('p', 'muted', 'Guide indisponible : le module n’a pas été chargé.'));
      return;
    }

    var head = el('header', 'module-head');
    head.innerHTML =
      '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><span>Guide</span></div>' +
      '<h1>Guide d’utilisation</h1>' +
      '<p class="module-head__lede">' + g.lede + '</p>';
    main.appendChild(head);

    var toc = el('nav', 'guide-toc');
    toc.setAttribute('aria-label', 'Sommaire du guide');
    g.sections.forEach(function (s) {
      var b = el('button', 'guide-toc__item', '<span aria-hidden="true">' + esc(s.icon) + '</span><span>' + esc(s.title) + '</span>');
      b.type = 'button';
      b.addEventListener('click', function () {
        var target = document.getElementById('guide-' + s.id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      toc.appendChild(b);
    });
    main.appendChild(toc);

    g.sections.forEach(function (s) {
      var sec = el('section', 'guide-sec');
      sec.id = 'guide-' + s.id;
      sec.innerHTML = '<h2>' + esc(s.title) + '</h2>' + s.html;
      main.appendChild(sec);
    });

    if (g.faq && g.faq.length) {
      var fh = el('section', 'section-head');
      fh.innerHTML = '<h2>Questions fréquentes</h2><p>Les blocages les plus courants, et leur solution.</p>';
      main.appendChild(fh);
      var list = el('div', 'guide-faq');
      g.faq.forEach(function (f) {
        var d = document.createElement('details');
        d.className = 'guide-faq__item';
        d.innerHTML = '<summary>' + esc(f.q) + '</summary><div>' + f.a + '</div>';
        list.appendChild(d);
      });
      main.appendChild(list);
    }

    var foot = el('p', 'small muted');
    foot.style.marginTop = '2rem';
    foot.textContent = 'Ce guide porte sur l’application elle-même ; le contenu pédagogique reste dans les neuf modules.';
    main.appendChild(foot);
  }

  /* ---------------- Examen final ---------------- */
  function renderExamView(main) {
    document.title = 'Examen final — IA & Freebuff';
    if (!window.EXAM) {
      main.appendChild(el('p', 'muted', 'Mode examen indisponible : le module n’a pas été chargé.'));
      return;
    }
    window.EXAM.render(main, {
      getState: function () { return state; },
      save: save,
      el: el,
      esc: esc,
      toast: toast,
      copyText: copyText,
      modules: MODULES,
      formatDate: formatDate
    });
    markActiveNav();
  }

  /* ---------------- Menu mobile ---------------- */
  function openMenu() {
    $('#sidebar').classList.add('is-open');
    $('#scrim').hidden = false;
    $('#menuBtn').setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    $('#sidebar').classList.remove('is-open');
    $('#scrim').hidden = true;
    $('#menuBtn').setAttribute('aria-expanded', 'false');
  }
  $('#menuBtn').addEventListener('click', function () {
    if ($('#sidebar').classList.contains('is-open')) closeMenu(); else openMenu();
  });
  $('#scrim').addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------------- Réinitialisation ---------------- */
  $('#resetBtn').addEventListener('click', function () {
    if (!window.confirm('Effacer toute la progression enregistrée sur cet appareil ?')) return;
    state = {
      done: {}, quiz: {}, exercises: {}, mastery: {},
      exam: { session: null, history: [] },
      learner: { name: (state.learner && state.learner.name) || '', awardedAt: null },
      theme: state.theme
    };
    save();
    buildNav();
    route();
    toast('Progression réinitialisée.');
  });

  /* ---------------- Barre de lecture ---------------- */
  function updateReadbar() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0;
    $('#readbarFill').style.width = pct + '%';
  }
  window.addEventListener('scroll', updateReadbar, { passive: true });
  window.addEventListener('resize', updateReadbar);

  /* ---------------- PWA ---------------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () { /* mode fichier local ou HTTP simple */ });
    });
  }

  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    $('#installBtn').hidden = false;
  });
  $('#installBtn').addEventListener('click', function () {
    if (!deferredPrompt) { toast('Utilise le menu du navigateur → « Installer ».'); return; }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function () {
      deferredPrompt = null;
      $('#installBtn').hidden = true;
    });
  });

  /* ---------------- Démarrage ---------------- */
  applyTheme();
  buildNav();
  window.addEventListener('afterprint', function () { document.body.classList.remove('is-printing-cert'); });
  window.addEventListener('hashchange', route);
  route();
  updateReadbar();
})();
