/* Widgets interactifs — chaque fabrique reçoit (body, config) */
window.WIDGETS = {};

(function () {
  'use strict';

  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function foot(body, html) {
    var f = el('div', 'widget__foot', html);
    body.parentNode.appendChild(f);
    return f;
  }

  function copyButton(getText, label) {
    var b = el('button', 'btn btn--sm btn--ghost', label || 'Copier');
    b.type = 'button';
    b.addEventListener('click', function () {
      var text = getText();
      var done = function () {
        b.textContent = 'Copié ✓';
        setTimeout(function () { b.textContent = label || 'Copier'; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
      } else {
        fallback(text, done);
      }
    });
    return b;
  }

  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
    done();
  }

  /* ---------------------------------------------------------
     1. Labo token : prédiction du mot suivant + température
     --------------------------------------------------------- */
  window.WIDGETS.tokenlab = function (body) {
    var base = [
      { w: 'canapé', p: 0.62 },
      { w: 'toit', p: 0.17 },
      { w: 'clavier', p: 0.11 },
      { w: 'gratte-ciel', p: 0.04 }
    ];
    var temp = 0.8;
    var picked = null;

    var sentence = el('div', 'sentence',
      'Le chat dort sur le <span class="blank" id="tlBlank">?</span>');
    var probs = el('div', 'probs');
    probs.setAttribute('role', 'group');
    probs.setAttribute('aria-label', 'Candidats pour le mot suivant');
    var ctrl = el('div', 'grid-2');
    var sliderWrap = el('div', 'field');
    var slider = document.createElement('input');
    slider.type = 'range'; slider.min = '0.1'; slider.max = '1.6'; slider.step = '0.05'; slider.value = String(temp);
    slider.id = 'tlTemp';
    var sliderLabel = el('label', '', 'Température : <strong id="tlTempVal">0,80</strong>');
    sliderLabel.setAttribute('for', 'tlTemp');
    sliderWrap.appendChild(sliderLabel);
    sliderWrap.appendChild(slider);
    sliderWrap.appendChild(el('small', '', '0,1 = presque toujours le même mot · 1,6 = très dispersé'));
    var note = el('p', 'meter__note', 'Clique sur un mot pour simuler un tirage.');
    ctrl.appendChild(sliderWrap);
    ctrl.appendChild(note);

    function normalize(t) {
      var powers = base.map(function (c) { return Math.pow(c.p, 1 / t); });
      var sum = powers.reduce(function (a, b) { return a + b; }, 0);
      return base.map(function (c, i) { return { w: c.w, p: powers[i] / sum }; });
    }

    function render() {
      var dist = normalize(temp);
      probs.innerHTML = '';
      dist.forEach(function (c) {
        var b = el('button', 'prob');
        b.type = 'button';
        b.setAttribute('aria-pressed', picked === c.w ? 'true' : 'false');
        if (picked === c.w) b.classList.add('is-picked');
        b.innerHTML =
          '<span>' + esc(c.w) + '</span>' +
          '<span class="prob__bar"><i style="width:' + (c.p * 100).toFixed(1) + '%"></i></span>' +
          '<span class="prob__val">' + (c.p * 100).toFixed(1) + ' %</span>';
        b.addEventListener('click', function () {
          picked = c.w;
          sentence.querySelector('#tlBlank').textContent = c.w;
          note.innerHTML = '« ' + esc(c.w) + ' » tiré avec ' + (c.p * 100).toFixed(1) +
            ' % de probabilité. Et maintenant le modèle recommence pour le mot suivant, avec ce mot ajouté au contexte.';
          render();
        });
        probs.appendChild(b);
      });
      sliderLabel.querySelector('#tlTempVal').textContent = temp.toFixed(2).replace('.', ',');
    }

    slider.addEventListener('input', function () {
      temp = parseFloat(slider.value);
      picked = null;
      sentence.querySelector('#tlBlank').textContent = '?';
      note.textContent = 'Clique sur un mot pour simuler un tirage.';
      render();
    });

    body.appendChild(el('p', 'widget__hint',
      'Le modèle ne « comprend » pas la phrase : il calcule une distribution de probabilités sur le vocabulaire, puis tire un token.'));
    body.appendChild(sentence);
    body.appendChild(probs);
    body.appendChild(ctrl);
    foot(body, '<span>Avec une température basse, le même prompt donne presque toujours la même réponse. Avec une température haute, tu obtiens de la variété… et parfois du n\'importe quoi.</span>');
    render();
  };

  /* ---------------------------------------------------------
     2. Boucle agentique pas à pas
     --------------------------------------------------------- */
  window.WIDGETS.agentloop = function (body) {
    var harnessOn = true;
    var step = 0;
    var nodes = [
      { key: 'demande', title: 'Demande', sub: '« Répare le test qui échoue »' },
      { key: 'contexte', title: 'Contexte assemblé', sub: 'AGENTS.md + fichiers + outils' },
      { key: 'modele', title: 'Modèle', sub: 'propose une action' },
      { key: 'outil', title: 'Outil exécuté', sub: 'terminal, lecture, édition' },
      { key: 'obs', title: 'Observation', sub: 'sortie d\'erreur réelle' },
      { key: 'verif', title: 'Vérification', sub: 'les tests passent ?' }
    ];
    var loop = el('div', 'loop');
    var log = el('div', 'log');
    log.setAttribute('role', 'log');
    log.setAttribute('aria-live', 'polite');
    var controls = el('div', 'row');
    var nextBtn = el('button', 'btn btn--sm btn--primary', 'Étape suivante');
    nextBtn.type = 'button';
    var resetBtn = el('button', 'btn btn--sm btn--ghost', 'Recommencer');
    resetBtn.type = 'button';
    var toggle = el('button', 'btn btn--sm btn--soft', 'Couper le harnais');
    toggle.type = 'button';
    controls.appendChild(nextBtn);
    controls.appendChild(resetBtn);
    controls.appendChild(toggle);

    var messages = {
      demande: '→ objectif reçu : « npm test échoue sur cart.test.ts, répare »',
      contexte: '→ contexte : AGENTS.md (conventions), cart.ts, cart.test.ts, définition des outils',
      modele: '← modèle : « je dois lire la sortie complète du test »  (appel d\'outil)',
      outil: '⚙ outil run_terminal_command("npm test -- cart") → sortie capturée (48 lignes)',
      obs: '← observation : "expected 3, received 2" à la ligne 41 — arrondi du total',
      verif: '⚙ outil run_terminal_command("npm test") → 0 échec. Boucle terminée.'
    };
    var harnessOffMessages = {
      demande: '→ objectif reçu : « npm test échoue, répare »',
      contexte: '→ contexte : la demande, rien d\'autre. Aucun fichier, aucun outil.',
      modele: '← modèle : « Vérifiez que votre fonction de total gère les arrondis. » (aucune action possible)',
      outil: '✕ pas d\'outil disponible : le harnais est coupé. Rien ne peut être lu ni exécuté.',
      obs: '✕ pas d\'observation : le modèle n\'a aucun retour du réel.',
      verif: '✕ aucune vérification possible. Le test est toujours rouge.'
    };

    function renderLog() {
      log.innerHTML = '';
      var max = harnessOn ? step : Math.min(step, 3);
      for (var i = 1; i <= max; i++) {
        var key = nodes[i - 1].key;
        var text = (harnessOn ? messages : harnessOffMessages)[key];
        var line = el('div', '', esc(text));
        if (/✕/.test(text)) line.className = 'log-warn';
        else if (/^⚙/.test(text)) line.className = 'log-acc';
        else if (/0 échec/.test(text)) line.className = 'log-ok';
        log.appendChild(line);
      }
      if (max === 0) log.innerHTML = '<span class="muted">La boucle n\'a pas encore démarré.</span>';
    }

    function renderNodes() {
      loop.innerHTML = '';
      nodes.forEach(function (n, i) {
        var active = i === Math.min(step, nodes.length - 1) && step < nodes.length;
        var d = el('div', 'loop__node' + (active ? ' is-active' : '') + (!harnessOn && i >= 3 ? ' is-idle' : ''));
        d.innerHTML = '<span class="loop__dot">' + (i + 1) + '</span><div><strong>' + esc(n.title) +
          '</strong><br><span>' + esc(n.sub) + '</span></div>';
        loop.appendChild(d);
      });
    }

    function advance() {
      if (step < nodes.length) step++;
      if (step === nodes.length) {
        nextBtn.disabled = true;
        nextBtn.textContent = harnessOn ? 'Terminé ✓' : 'Sans issue';
      }
      renderNodes();
      renderLog();
    }

    nextBtn.addEventListener('click', advance);
    resetBtn.addEventListener('click', function () {
      step = 0;
      nextBtn.disabled = false;
      nextBtn.textContent = 'Étape suivante';
      renderNodes(); renderLog();
    });
    toggle.addEventListener('click', function () {
      harnessOn = !harnessOn;
      toggle.textContent = harnessOn ? 'Couper le harnais' : 'Rétablir le harnais';
      step = 0;
      nextBtn.disabled = false;
      nextBtn.textContent = 'Étape suivante';
      renderNodes(); renderLog();
    });

    body.appendChild(el('p', 'widget__hint',
      'Chaque tour renvoie au modèle une observation réelle. C\'est ce retour du réel qui permet la correction.'));
    body.appendChild(loop);
    body.appendChild(el('div', '', '<div style="height:.7rem"></div>'));
    body.appendChild(log);
    body.appendChild(el('div', '', '<div style="height:.7rem"></div>'));
    body.appendChild(controls);
    foot(body, '<span>Sans harnais, il ne reste qu\'un modèle qui parle : aucune lecture, aucune exécution, aucune preuve.</span>');
    renderNodes(); renderLog();
  };

  /* ---------------------------------------------------------
     3. Jauge de contexte / divulgation progressive
     --------------------------------------------------------- */
  window.WIDGETS.contextmeter = function (body) {
    var BUDGET = 128000;
    var skills = 8;
    var files = 6;
    var progressive = true;

    var wrap = el('div', 'grid-2');
    var skillField = el('div', 'field');
    var skillLabel = el('label', '', 'Skills disponibles : <strong id="cmSkills">8</strong>');
    var skillRange = document.createElement('input');
    skillRange.type = 'range'; skillRange.min = '0'; skillRange.max = '24'; skillRange.value = '8';
    skillRange.id = 'cmSkillsRange';
    skillLabel.setAttribute('for', 'cmSkillsRange');
    skillField.appendChild(skillLabel); skillField.appendChild(skillRange);

    var fileField = el('div', 'field');
    var fileLabel = el('label', '', 'Fichiers lus dans la session : <strong id="cmFiles">6</strong>');
    var fileRange = document.createElement('input');
    fileRange.type = 'range'; fileRange.min = '0'; fileRange.max = '30'; fileRange.value = '6';
    fileRange.id = 'cmFilesRange';
    fileLabel.setAttribute('for', 'cmFilesRange');
    fileField.appendChild(fileLabel); fileField.appendChild(fileRange);

    var toggleWrap = el('label', 'check-item');
    var toggle = document.createElement('input');
    toggle.type = 'checkbox'; toggle.checked = true;
    toggleWrap.appendChild(toggle);
    toggleWrap.appendChild(el('span', '', 'Divulgation progressive activée (seuls 2 skills sont chargés en entier)'));

    wrap.appendChild(skillField);
    wrap.appendChild(fileField);

    var bar = el('div', 'meter__bar');
    var legend = el('div', 'meter__legend');
    var note = el('p', 'meter__note');

    function compute() {
      var system = 2500;
      var instructions = 1800;
      var history = 4200;
      var skillMeta = skills * 90;
      var loadedSkills = progressive ? Math.min(2, skills) : skills;
      var skillBodies = loadedSkills * 1900;
      var fileTokens = files * 1300;
      return [
        { label: 'Système', v: system, color: '#6b7280' },
        { label: 'AGENTS.md', v: instructions, color: '#8b7cff' },
        { label: 'Historique', v: history, color: '#4fd1c5' },
        { label: 'Skills (métadonnées)', v: skillMeta, color: '#c8f56a' },
        { label: 'Skills (corps chargés)', v: skillBodies, color: '#f0b44f' },
        { label: 'Fichiers lus', v: fileTokens, color: '#ff8b6b' }
      ];
    }

    function render() {
      skillLabel.querySelector('strong').textContent = String(skills);
      fileLabel.querySelector('strong').textContent = String(files);
      var parts = compute();
      var total = parts.reduce(function (a, p) { return a + p.v; }, 0);
      bar.innerHTML = '';
      parts.forEach(function (p) {
        if (p.v <= 0) return;
        var seg = el('div', 'meter__seg');
        seg.style.flexBasis = (p.v / total * 100) + '%';
        seg.style.background = p.color;
        seg.title = p.label + ' : ' + p.v.toLocaleString('fr-FR') + ' tokens';
        if (p.v / total > 0.08) seg.textContent = p.label;
        bar.appendChild(seg);
      });
      legend.innerHTML = parts.filter(function (p) { return p.v > 0; }).map(function (p) {
        return '<span><i style="background:' + p.color + '"></i>' + esc(p.label) + ' — ' +
          p.v.toLocaleString('fr-FR') + '</span>';
      }).join('');

      var ratio = total / BUDGET;
      var verdict;
      if (ratio > 0.95) verdict = '<strong style="color:var(--danger)">Saturation :</strong> le harnais doit résumer, donc il perd du détail — et parfois l\'essentiel.';
      else if (ratio > 0.7) verdict = '<strong style="color:var(--warn)">Zone rouge :</strong> chaque nouveau fichier chasse autre chose. Le modèle commence à oublier le début de la tâche.';
      else if (ratio > 0.35) verdict = '<strong style="color:var(--accent-2)">Confortable :</strong> le contexte reste lisible, la tâche est prioritaire.';
      else verdict = '<strong style="color:var(--ok)">Léger :</strong> beaucoup de marge. Tu peux charger un skill ou un fichier de plus sans risque.';
      note.innerHTML = 'Total estimé : <strong>' + total.toLocaleString('fr-FR') + ' tokens</strong> sur ' +
        BUDGET.toLocaleString('fr-FR') + ' (' + Math.round(ratio * 100) + ' %). ' + verdict;
    }

    skillRange.addEventListener('input', function () { skills = +skillRange.value; render(); });
    fileRange.addEventListener('input', function () { files = +fileRange.value; render(); });
    toggle.addEventListener('change', function () { progressive = toggle.checked; render(); });

    body.appendChild(el('p', 'widget__hint',
      'Le contexte est un budget, pas un seau. Les skills économisent surtout quand ils sont nombreux mais rarement utiles.'));
    body.appendChild(wrap);
    body.appendChild(toggleWrap);
    body.appendChild(el('div', '', '<div style="height:.9rem"></div>'));
    body.appendChild(el('div', 'meter', ''));
    body.lastChild.appendChild(bar);
    body.appendChild(legend);
    body.appendChild(note);
    foot(body, '<span>Ordres de grandeur réalistes : un petit fichier source ≈ 1 000 à 1 500 tokens, un skill détaillé ≈ 1 500 à 2 500.</span>');
    render();
  };

  /* ---------------------------------------------------------
     4. Générateur de SKILL.md
     --------------------------------------------------------- */
  window.WIDGETS.skillbuilder = function (body) {
    var grid = el('div', 'grid-2');
    var fName = fieldInput('sbName', 'Nom du skill', 'conventions-commits', 'minuscules, chiffres et tirets ; identique au dossier');
    var fDesc = fieldInput('sbDesc', 'Description (déclencheur)', 'Règles de commit conventionnel. Utiliser dès qu\'un commit ou un changelog est demandé.');
    var fCat = fieldInput('sbCat', 'Catégorie (metadata)', 'git');
    var fBody = el('div', 'field');
    var bodyLabel = el('label', '', 'Instructions');
    bodyLabel.setAttribute('for', 'sbBody');
    var ta = document.createElement('textarea');
    ta.id = 'sbBody';
    ta.value = "## Format\ntype(scope): description à l'impératif\n\n## Types autorisés\nfeat, fix, docs, refactor, test, chore\n\n## Vérification\nLancer npm run lint:commits avant de conclure.";
    fBody.appendChild(bodyLabel); fBody.appendChild(ta);

    var out = el('pre');
    var outCode = document.createElement('code');
    out.appendChild(outCode);
    var outBox = el('div', 'code-block');
    outBox.appendChild(el('div', 'code-block__head', '<span class="code-block__title">SKILL.md</span>'));
    outBox.appendChild(out);
    var diag = el('div', 'log');

    function val(id) {
      var node = body.querySelector('#' + id);
      return node ? node.value : '';
    }

    function build() {
      var name = val('sbName').trim();
      var desc = val('sbDesc').trim();
      var cat = val('sbCat').trim() || 'divers';
      var content = val('sbBody').trim();
      var cleanName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      var problems = [];
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) || name.length > 64) {
        problems.push('Nom invalide : minuscules, chiffres et tirets simples, 64 caractères maximum. Suggestion : ' + cleanName);
      }
      if (desc.length < 30) problems.push('Description trop courte pour déclencher le skill automatiquement (vise 80 caractères utiles).');
      if (!/(utiliser|dès qu|quand|pour )/i.test(desc)) problems.push('La description ne dit pas QUAND utiliser le skill. Ajoute « Utiliser dès que… ».');
      if (content.split('\n').length > 200) problems.push('Corps volumineux : déplace le détail dans references/.');

      outCode.textContent =
        '---\n' +
        'name: ' + (name || 'nom-du-skill') + '\n' +
        'description: ' + (desc || 'Décris ce que fait le skill et quand l\'utiliser.').replace(/\n/g, ' ') + '\n' +
        'metadata:\n' +
        '  category: ' + cat + '\n' +
        '---\n\n' +
        '# ' + (name || 'Nom du skill').replace(/-/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); }) + '\n\n' +
        content + '\n';

      diag.innerHTML = problems.length
        ? problems.map(function (p) { return '<div class="log-warn">⚠ ' + esc(p) + '</div>'; }).join('')
        : '<div class="log-ok">✓ Structure valide. Dossier cible : .agents/skills/' + esc(name || 'nom-du-skill') + '/SKILL.md</div>';

      copyWrap.innerHTML = '';
      copyWrap.appendChild(copyButton(function () { return outCode.textContent; }, 'Copier le SKILL.md'));
    }

    var copyWrap = el('div', 'row');

    body.appendChild(el('p', 'widget__hint', 'Le nom doit être identique au nom du dossier. La description est le seul signal de déclenchement.'));
    grid.appendChild(fName); grid.appendChild(fDesc);
    body.appendChild(grid);
    body.appendChild(fCat);
    body.appendChild(fBody);
    body.appendChild(outBox);
    body.appendChild(el('div', '', '<div style="height:.7rem"></div>'));
    body.appendChild(diag);
    body.appendChild(el('div', '', '<div style="height:.7rem"></div>'));
    body.appendChild(copyWrap);
    body.querySelectorAll('input, textarea').forEach(function (i) {
      i.addEventListener('input', build);
    });
    foot(body, '<span>Installation globale : ~/.agents/skills/&lt;nom&gt;/SKILL.md · projet : .agents/skills/&lt;nom&gt;/SKILL.md</span>');
    build();
  };

  function fieldInput(id, label, placeholder, help) {
    var wrap = el('div', 'field');
    var l = el('label', '', label);
    l.setAttribute('for', id);
    var input = document.createElement('input');
    input.type = 'text'; input.id = id; input.placeholder = placeholder; input.value = placeholder || '';
    wrap.appendChild(l); wrap.appendChild(input);
    if (help) wrap.appendChild(el('small', '', help));
    return wrap;
  }

  /* ---------------------------------------------------------
     5. Simulateur MCP
     --------------------------------------------------------- */
  window.WIDGETS.mcpsim = function (body) {
    var steps = [
      { label: '1. Initialisation', from: 'client', text: 'Le client demande les capacités du serveur.', json: '{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "method": "initialize",\n  "params": {\n    "clientInfo": { "name": "freebuff" },\n    "protocolVersion": "2025-06-18"\n  }\n}' },
      { label: '2. Réponse du serveur', from: 'server', text: 'Il annonce ce qu\'il sait faire.', json: '{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "result": {\n    "serverInfo": { "name": "postgres-readonly" },\n    "capabilities": { "tools": {}, "resources": {} }\n  }\n}' },
      { label: '3. Liste des outils', from: 'client', text: 'Le client demande les outils disponibles.', json: '{\n  "jsonrpc": "2.0",\n  "id": 2,\n  "method": "tools/list"\n}' },
      { label: '4. Outils exposés', from: 'server', text: 'Le harnais les ajoute au contexte du modèle.', json: '{\n  "jsonrpc": "2.0",\n  "id": 2,\n  "result": {\n    "tools": [{\n      "name": "query_orders",\n      "description": "Lecture seule sur la table orders",\n      "inputSchema": {\n        "type": "object",\n        "properties": { "limit": { "type": "integer" } }\n      }\n    }]\n  }\n}' },
      { label: '5. Appel du modèle', from: 'model', text: 'Le modèle demande l\'outil : c\'est une intention, pas une exécution.', json: '{\n  "tool": "query_orders",\n  "arguments": { "limit": 5 }\n}' },
      { label: '6. Le client exécute', from: 'client', text: 'Le harnais relaie l\'appel au serveur MCP.', json: '{\n  "jsonrpc": "2.0",\n  "id": 3,\n  "method": "tools/call",\n  "params": {\n    "name": "query_orders",\n    "arguments": { "limit": 5 }\n  }\n}' },
      { label: '7. Permission refusée', from: 'host', text: 'Exemple de garde-fou : l\'outil demandé n\'est pas dans le périmètre autorisé.', json: '{\n  "jsonrpc": "2.0",\n  "id": 4,\n  "method": "tools/call",\n  "params": { "name": "delete_orders", "arguments": {} },\n  "error": {\n    "code": -32001,\n    "message": "Refusé par la politique : lecture seule"\n  }\n}' }
    ];
    var i = 0;
    var list = el('div', 'stack');
    var ctrl = el('div', 'row');
    var next = el('button', 'btn btn--sm btn--primary', 'Message suivant');
    next.type = 'button';
    var reset = el('button', 'btn btn--sm btn--ghost', 'Recommencer');
    reset.type = 'button';
    ctrl.appendChild(next); ctrl.appendChild(reset);

    function who(f) {
      return { client: 'Client (harnais)', server: 'Serveur MCP', model: 'Modèle', host: 'Permission du harnais' }[f];
    }

    function render() {
      list.innerHTML = '';
      if (i === 0) list.appendChild(el('p', 'muted', 'Aucun message échangé pour l\'instant.'));
      for (var k = 0; k < i; k++) {
        var s = steps[k];
        var card = el('div', 'callout ' + (s.from === 'host' ? 'callout--danger' : s.from === 'server' ? 'callout--tip' : ''));
        card.innerHTML = '<div class="callout__body"><div class="callout__title">' + esc(s.label) + '</div>' +
          '<p class="small">' + esc(s.text) + '</p>' +
          '<div class="code-block" style="margin-top:.4rem"><div class="code-block__head"><span class="code-block__title">' +
          esc(who(s.from)) + '</span></div><pre><code>' + esc(s.json) + '</code></pre></div></div>';
        list.appendChild(card);
      }
      next.disabled = i >= steps.length;
      next.textContent = i >= steps.length ? 'Séquence terminée ✓' : 'Message suivant';
    }

    next.addEventListener('click', function () { if (i < steps.length) i++; render(); });
    reset.addEventListener('click', function () { i = 0; render(); });

    body.appendChild(el('p', 'widget__hint',
      'Le modèle n\'a jamais accès au serveur : il produit une intention d\'appel. C\'est le harnais qui exécute — et qui peut refuser.'));
    body.appendChild(list);
    body.appendChild(el('div', '', '<div style="height:.7rem"></div>'));
    body.appendChild(ctrl);
    foot(body, '<span>JSON simplifié pour la pédagogie. Le protocole réel gère aussi notifications, annulation et ressources.</span>');
    render();
  };

  /* ---------------------------------------------------------
     6. Simulateur de hooks
     --------------------------------------------------------- */
  window.WIDGETS.hooksim = function (body) {
    var events = [
      { id: 'post-edit', label: 'Après édition de fichier', hooks: ['format', 'lint fichier'] },
      { id: 'pre-tool', label: 'Avant exécution d\'un outil', hooks: ['garde-fou chemins protégés', 'confirmation commandes destructrices'] },
      { id: 'stop', label: 'Fin de tâche', hooks: ['tests complets', 'résumé journalisé'] }
    ];
    var actions = [
      { id: 'edit-src', label: 'Modifier src/cart/total.ts', blocked: false, event: 'post-edit', detail: 'eslint --fix : 2 corrections · tsc : OK' },
      { id: 'edit-migration', label: 'Modifier db/migrations/001_init.sql', blocked: true, event: 'pre-tool', detail: 'REFUS : migration appliquée immuable (crée un nouveau fichier)' },
      { id: 'rm', label: 'Exécuter rm -rf ./src', blocked: true, event: 'pre-tool', detail: 'REFUS : commande destructive hors périmètre autorisé' },
      { id: 'done', label: 'Conclure « c\'est corrigé »', blocked: false, event: 'stop', detail: 'Tests : 42 passés · hook Stop : OK, résumé écrit dans .agents/log' }
    ];

    var selectAction = document.createElement('select');
    actions.forEach(function (a) {
      var o = document.createElement('option');
      o.value = a.id; o.textContent = a.label;
      selectAction.appendChild(o);
    });
    var run = el('button', 'btn btn--sm btn--primary', 'Lancer l\'action');
    run.type = 'button';
    var tableWrap = el('div', 'table-wrap');
    var table = el('table', '',
      '<thead><tr><th>Événement</th><th>Hooks branchés</th></tr></thead><tbody>' +
      events.map(function (e) { return '<tr><td>' + esc(e.label) + '</td><td>' + e.hooks.map(function (h) { return '<code>' + esc(h) + '</code>'; }).join(' ') + '</td></tr>'; }).join('') +
      '</tbody>');
    tableWrap.appendChild(table);
    var log = el('div', 'log');
    log.setAttribute('aria-live', 'polite');

    var field = el('div', 'field');
    var l = el('label', '', 'Action simulée');
    l.setAttribute('for', 'hsAction');
    selectAction.id = 'hsAction';
    field.appendChild(l); field.appendChild(selectAction);

    run.addEventListener('click', function () {
      var a = actions.filter(function (x) { return x.id === selectAction.value; })[0];
      var lines = [];
      lines.push('→ action : ' + a.label);
      if (a.event === 'pre-tool') lines.push('⚙ hook pre-tool → vérification des chemins autorisés');
      if (a.event === 'post-edit') lines.push('⚙ hook post-edit → eslint --fix puis tsc --noEmit');
      if (a.event === 'stop') lines.push('⚙ hook stop → suite de tests complète, puis journal');
      lines.push((a.blocked ? '✕ ' : '✓ ') + a.detail);
      if (a.blocked) lines.push('→ l\'agent reçoit l\'erreur et doit changer d\'approche. Rien n\'a été exécuté.');
      else lines.push('→ l\'agent poursuit. Le hook a fait son travail sans qu\'on le lui demande.');

      log.innerHTML = lines.map(function (t) {
        var cls = /^✕/.test(t) ? 'log-warn' : /^⚙/.test(t) ? 'log-acc' : /^✓/.test(t) ? 'log-ok' : '';
        return '<div class="' + cls + '">' + esc(t) + '</div>';
      }).join('');
    });

    body.appendChild(el('p', 'widget__hint',
      'Un hook ne demande pas au modèle d\'être sage : il exécute du code au bon moment. C\'est pour cela que c\'est fiable.'));
    body.appendChild(tableWrap);
    body.appendChild(el('div', '', '<div style="height:.9rem"></div>'));
    body.appendChild(field);
    body.appendChild(run);
    body.appendChild(el('div', '', '<div style="height:.7rem"></div>'));
    body.appendChild(log);
    foot(body, '<span>Les noms d\'événements varient selon le harnais ; le principe — un événement, un programme, un code de sortie — est universel.</span>');
    log.innerHTML = '<span class="muted">Choisis une action et lance-la.</span>';
  };

  /* ---------------------------------------------------------
     7. Docteur du prompt
     --------------------------------------------------------- */
  window.WIDGETS.promptdoctor = function (body) {
    var ta = document.createElement('textarea');
    ta.id = 'pdPrompt';
    ta.value = "Corrige le bug du panier, ça ne marche pas.";
    var f = el('div', 'field');
    var l = el('label', '', 'Ton prompt');
    l.setAttribute('for', 'pdPrompt');
    f.appendChild(l); f.appendChild(ta);

    var scoreBox = el('div', 'stat-grid');
    var diag = el('div', 'log');
    var rewrite = el('pre');
    var rewriteCode = document.createElement('code');
    rewrite.appendChild(rewriteCode);
    var rewriteBox = el('div', 'code-block');
    rewriteBox.appendChild(el('div', 'code-block__head', '<span class="code-block__title">Proposition de réécriture</span>'));
    rewriteBox.appendChild(rewrite);
    var copyWrap = el('div', 'row');

    function analyse(text) {
      var t = text.trim();
      var checks = [
        { key: 'Fichier ou zone citée', ok: /([\w./-]+\.(ts|tsx|js|jsx|py|go|rs|css|html|md|json|sql))|src\/|tests?\//i.test(t) },
        { key: 'Symptôme concret', ok: /(erreur|error|exception|échoue|echoue|cannot|undefined|log|console|sortie|stack|reproduire)/i.test(t) },
        { key: 'Verbe d\'action précis', ok: /(corrige|répare|repare|implémente|implemente|ajoute|refactorise|documente|analyse|vérifie|verifie|compare)/i.test(t) },
        { key: 'Critère vérifiable', ok: /(test|passe|build|typecheck|lint|vérifie|verifie|capture|sortie|doit)/i.test(t) },
        { key: 'Périmètre borné', ok: /(uniquement|seulement|limite|ne touche|sans modifier|dans .*uniquement|périmètre|perimetre)/i.test(t) }
      ];
      return checks;
    }

    function render() {
      var checks = analyse(ta.value);
      var score = checks.filter(function (c) { return c.ok; }).length;
      scoreBox.innerHTML =
        '<div class="stat stat--accent"><strong>' + score + '/5</strong><span>Signaux présents</span></div>' +
        '<div class="stat"><strong>' + ta.value.trim().split(/\s+/).filter(Boolean).length + '</strong><span>Mots</span></div>' +
        '<div class="stat"><strong>' + (checks[3].ok ? 'oui' : 'non') + '</strong><span>Vérifiable</span></div>';
      diag.innerHTML = checks.map(function (c) {
        return '<div class="' + (c.ok ? 'log-ok' : 'log-warn') + '">' + (c.ok ? '✓ ' : '✗ ') + esc(c.key) + '</div>';
      }).join('');

      var base = ta.value.trim() || 'Décris ta tâche';
      rewriteCode.textContent = [
        'Objectif : ' + base.replace(/\.$/, '') + '.',
        '',
        'Contexte : cite les fichiers concernés (ex. src/cart/total.ts) et les tests existants.',
        'Contrainte : ne modifie que <dossier> ; aucune dépendance ajoutée ; API publique inchangée.',
        'Preuve attendue : lance npm test (ou la commande du projet) et montre la sortie.',
        'Si une information manque, pose la question au lieu d\'inventer.'
      ].join('\n');

      copyWrap.innerHTML = '';
      copyWrap.appendChild(copyButton(function () { return rewriteCode.textContent; }, 'Copier la réécriture'));
    }

    ta.addEventListener('input', render);
    body.appendChild(el('p', 'widget__hint',
      'Un bon prompt d\'agent n\'est pas long : il est vérifiable. Les cinq signaux ci-dessous couvrent l\'essentiel.'));
    body.appendChild(f);
    body.appendChild(scoreBox);
    body.appendChild(el('div', '', '<div style="height:.8rem"></div>'));
    body.appendChild(diag);
    body.appendChild(el('div', '', '<div style="height:.8rem"></div>'));
    body.appendChild(rewriteBox);
    body.appendChild(el('div', '', '<div style="height:.7rem"></div>'));
    body.appendChild(copyWrap);
    foot(body, '<span>Un prompt parfait sur une tâche floue reste mauvais : le critère de réussite est ce qui compte le plus.</span>');
    render();
  };

  /* ---------------------------------------------------------
     8. Sélecteur de flux de travail
     --------------------------------------------------------- */
  window.WIDGETS.workflow = function (body) {
    var scenarios = [
      {
        id: 'bug', label: 'Un bug à corriger',
        surface: 'CLI ou Desktop (accès au dépôt et aux tests)',
        steps: [
          'Donner l\'erreur exacte + le fichier + ce que tu as déjà tenté.',
          'Faire explorer le chemin d\'exécution avant de proposer une cause.',
          'Exiger un test qui échoue avant le correctif.',
          'Correctif minimal, puis suite complète.',
          'Relire le diff, committer avec un message qui explique le pourquoi.'
        ]
      },
      {
        id: 'feature', label: 'Une fonctionnalité',
        surface: 'Desktop (aperçu intégré) ou CLI',
        steps: [
          'Écrire le comportement attendu en trois phrases, avec les cas limites.',
          'Faire produire un plan court et le valider.',
          'Implémenter par tranches : données, logique, UI, tests.',
          'Vérifier visuellement ET par les tests.',
          'Mettre à jour AGENTS.md si une convention nouvelle apparaît.'
        ]
      },
      {
        id: 'refactor', label: 'Un refactor',
        surface: 'CLI (diffs faciles à relire)',
        steps: [
          'Vérifier que la suite de tests est verte avant de commencer.',
          'Interdire tout changement de comportement ; les tests existants ne bougent pas.',
          'Découper en petits commits mécaniques.',
          'Lancer les tests après chaque étape.',
          'S\'arrêter si le diff dépasse ce qui est relisible d\'un coup.'
        ]
      },
      {
        id: 'audit', label: 'Un audit / une revue',
        surface: 'Cloud ou CLI, avec sous-agents en lecture seule',
        steps: [
          'Définir le périmètre et le format du rapport.',
          'Interdire explicitement toute écriture.',
          'Déléguer l\'exploration à des sous-agents pour protéger le contexte.',
          'Exiger fichier:ligne pour chaque constat.',
          'Relire les faux positifs avant de diffuser.'
        ]
      },
      {
        id: 'migration', label: 'Une migration de base',
        surface: 'Desktop/CLI, avec relecture humaine obligatoire',
        steps: [
          'Écrire à la main (ou relire ligne à ligne) le SQL.',
          'Préparer un plan de rollback AVANT d\'exécuter.',
          'Tester sur une copie de la base.',
          'Ajouter un hook interdisant la modification des migrations appliquées.',
          'Exécuter en environnement de test, puis seulement en production.'
        ]
      },
      {
        id: 'docs', label: 'De la documentation',
        surface: 'N\'importe laquelle ; un skill dédié est idéal',
        steps: [
          'Fournir le public cible et le niveau attendu.',
          'Exiger des exemples exécutables, pas seulement descriptifs.',
          'Faire vérifier chaque commande citée.',
          'Faire relire par quelqu\'un qui ne connaît pas le sujet.',
          'Stocker la structure dans un skill pour la réutiliser.'
        ]
      }
    ];

    var select = document.createElement('select');
    scenarios.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.id; o.textContent = s.label;
      select.appendChild(o);
    });
    var field = el('div', 'field');
    var l = el('label', '', 'Situation');
    l.setAttribute('for', 'wfScenario');
    select.id = 'wfScenario';
    field.appendChild(l); field.appendChild(select);

    var out = el('div');
    function render() {
      var s = scenarios.filter(function (x) { return x.id === select.value; })[0]
        || scenarios[0];
      out.innerHTML =
        '<div class="callout callout--tip"><div class="callout__body"><div class="callout__title">Surface conseillée</div><p>' + esc(s.surface) + '</p></div></div>' +
        '<div class="steps" style="margin-top:.8rem">' + s.steps.map(function (t) {
          return '<div class="step"><p>' + esc(t) + '</p></div>';
        }).join('') + '</div>';
    }
    select.addEventListener('change', render);

    body.appendChild(el('p', 'widget__hint', 'La même méthode, six situations. Ce qui change : la surface, le découpage et le niveau de preuve exigé.'));
    body.appendChild(field);
    body.appendChild(out);
    foot(body, '<span>Règle transversale : un diff que tu ne peux pas relire en cinq minutes est un diff à découper.</span>');
    render();
  };

  /* ---------------------------------------------------------
     9. Fabrique de définition d'agent
     --------------------------------------------------------- */
  window.WIDGETS.agentforge = function (body) {
    var grid = el('div', 'grid-2');
    var fId = fieldInput('afId', 'Identifiant', 'doc-writer', 'minuscules et tirets ; devient .agents/<id>.ts');
    var fName = fieldInput('afName', 'Nom affiché', 'Doc Writer');
    var fMission = el('div', 'field');
    var missionLabel = el('label', '', 'Mission (systemPrompt)');
    missionLabel.setAttribute('for', 'afMission');
    var mission = document.createElement('textarea');
    mission.id = 'afMission';
    mission.value = "Tu es un rédacteur technique spécialisé dans la documentation d'API publiques. Tu ne modifies jamais le code.";
    fMission.appendChild(missionLabel); fMission.appendChild(mission);

    var fSpawn = el('div', 'field');
    var spawnLabel = el('label', '', 'Quand déléguer à cet agent (spawnerPrompt)');
    spawnLabel.setAttribute('for', 'afSpawn');
    var spawn = document.createElement('input');
    spawn.type = 'text'; spawn.id = 'afSpawn';
    spawn.value = "À lancer quand une fonction publique existante doit être documentée ou quand la documentation d'une API est demandée.";
    fSpawn.appendChild(spawnLabel); fSpawn.appendChild(spawn);

    var tools = [
      ['read_files', true], ['code_search', true], ['str_replace', false],
      ['run_terminal_command', false], ['web_search', false], ['spawn_agents', false]
    ];
    var toolBox = el('div', 'field');
    toolBox.appendChild(el('label', '', 'Outils autorisés'));
    var toolGrid = el('div', 'row');
    var checks = [];
    tools.forEach(function (t) {
      var label = el('label', 'check-item');
      label.style.padding = '.4rem .6rem';
      var cb = document.createElement('input');
      cb.type = 'checkbox'; cb.checked = t[1]; cb.value = t[0];
      checks.push(cb);
      label.appendChild(cb);
      label.appendChild(el('span', '', '<code>' + t[0] + '</code>'));
      toolGrid.appendChild(label);
    });
    toolBox.appendChild(toolGrid);

    var mode = document.createElement('select');
    [['prompts', 'Prompts seuls (tâche linéaire)'], ['steps', 'handleSteps (séquence garantie)']].forEach(function (m) {
      var o = document.createElement('option');
      o.value = m[0]; o.textContent = m[1];
      mode.appendChild(o);
    });
    var modeField = el('div', 'field');
    var modeLabel = el('label', '', 'Mode de contrôle');
    modeLabel.setAttribute('for', 'afMode');
    mode.id = 'afMode';
    modeField.appendChild(modeLabel); modeField.appendChild(mode);

    var outCode = document.createElement('code');
    var pre = el('pre');
    pre.appendChild(outCode);
    var box = el('div', 'code-block');
    box.appendChild(el('div', 'code-block__head', '<span class="code-block__title">.agents/mon-agent.ts</span>'));
    box.appendChild(pre);
    var copyWrap = el('div', 'row');

    var warn = el('div', 'log');

    function build() {
      var read = function (sel) {
        var node = body.querySelector(sel);
        return node ? node.value : '';
      };
      var id = (read('#afId') || 'mon-agent')
        .toLowerCase().replace(/[^a-z0-9-]/g, '-');
      var name = read('#afName') || 'Mon Agent';
      var sys = read('#afMission').trim();
      var sp = read('#afSpawn').trim();
      var selected = checks.filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
      var stepMode = mode.value === 'steps';

      var writes = selected.indexOf('str_replace') >= 0 || selected.indexOf('run_terminal_command') >= 0;
      var msgs = [];
      if (selected.length === 0) msgs.push('Aucun outil : l\'agent ne pourra rien lire. Ajoute au moins read_files.');
      if (writes && /ne modifie jamais|lecture seule|sans modifier/i.test(sys)) msgs.push('Contradiction : le prompt interdit d\'écrire, mais des outils d\'écriture sont cochés.');
      if (sp.length < 30) msgs.push('spawnerPrompt trop court : l\'orchestrateur ne saura pas quand déléguer.');
      warn.innerHTML = msgs.length
        ? msgs.map(function (m) { return '<div class="log-warn">⚠ ' + esc(m) + '</div>'; }).join('')
        : '<div class="log-ok">✓ Cohérent. Pense à tester sur un cas connu et un cas piège.</div>';

      outCode.textContent =
        "import type { AgentDefinition } from './types/agent-definition'\n\n" +
        'const definition: AgentDefinition = {\n' +
        "  id: '" + id + "',\n" +
        "  displayName: '" + name.replace(/'/g, "\\'") + "',\n" +
        "  model: 'anthropic/claude-sonnet-4.5',\n\n" +
        '  toolNames: [' + selected.map(function (s) { return "'" + s + "'"; }).join(', ') + '],\n\n' +
        "  spawnerPrompt:\n    '" + sp.replace(/'/g, "\\'") + "',\n\n" +
        "  systemPrompt:\n    '" + sys.replace(/\n+/g, ' ').replace(/'/g, "\\'") + "',\n\n" +
        (stepMode
          ? "  handleSteps: function* () {\n" +
            "    // 1. Étape déterministe : récupérer les fichiers concernés\n" +
            "    const { toolResult } = yield {\n" +
            "      toolName: 'run_terminal_command',\n" +
            "      input: { command: 'git diff --name-only' },\n" +
            "    }\n\n" +
            "    const paths = String(toolResult || '').split('\\n').filter(Boolean)\n" +
            "    if (paths.length > 0) {\n" +
            "      yield { toolName: 'read_files', input: { paths } }\n" +
            "    }\n\n" +
            "    // 2. Laisser le modèle produire le résultat\n" +
            "    yield 'STEP_ALL'\n" +
            "  },\n"
          : "  instructionsPrompt: [\n" +
            "    '1. Localise le code concerné et lis-le entièrement.',\n" +
            "    '2. Repère les cas limites et les erreurs possibles.',\n" +
            "    '3. Produis uniquement le résultat demandé, au format convenu.',\n" +
            "    '4. Signale explicitement ce que tu n\\'as pas pu vérifier.',\n" +
            "  ].join('\\n'),\n") +
        '}\n\nexport default definition\n';

      copyWrap.innerHTML = '';
      copyWrap.appendChild(copyButton(function () { return outCode.textContent; }, 'Copier la définition'));
    }

    [mission, spawn].forEach(function (t) { t.addEventListener('input', build); });
    [[fId, 'afId'], [fName, 'afName']].forEach(function (pair) {
      var n = pair[0].querySelector('input');
      if (n) n.addEventListener('input', build);
    });
    checks.forEach(function (c) { c.addEventListener('change', build); });
    mode.addEventListener('change', build);
    body.appendChild(el('p', 'widget__hint',
      'Un agent = un métier, le minimum d\'outils, un déclencheur précis, une sortie vérifiable.'));
    grid.appendChild(fId); grid.appendChild(fName);
    body.appendChild(grid);
    body.appendChild(fMission);
    body.appendChild(fSpawn);
    body.appendChild(toolBox);
    body.appendChild(modeField);
    body.appendChild(box);
    body.appendChild(el('div', '', '<div style="height:.7rem"></div>'));
    body.appendChild(warn);
    body.appendChild(el('div', '', '<div style="height:.7rem"></div>'));
    body.appendChild(copyWrap);
    foot(body, '<span>Les identifiants d\'outils et de modèles dépendent de ta version : recopie ceux que /init a générés dans .agents/types/.</span>');
    build();
  };
})();
