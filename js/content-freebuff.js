/* Contenu — Partie 3 : vibe coding, Freebuff, création d'agents */
window.MODULES = window.MODULES || [];

window.MODULES.push({
  id: 'vibe',
  no: 7,
  title: 'Le vibe coding',
  subtitle: "Construire à la vitesse de l'intention — sans construire de la dette.",
  icon: '🌊',
  duration: '25 min',
  level: 'Débutant',
  tags: ['méthode', 'prompt', 'revue'],
  objectives: [
    "Définir le vibe coding et sa boucle de travail.",
    "Écrire un prompt d'agent qui produit du code vérifiable.",
    "Utiliser les fichiers d'instructions (AGENTS.md) à bon escient.",
    "Reconnaître quand le vibe coding est inadapté."
  ],
  blocks: [
    {
      type: 'prose',
      title: "D'où vient le terme",
      html: `
        <p>Le <strong>vibe coding</strong> désigne une manière de programmer où l'on décrit l'intention en langage naturel et où l'on accepte de ne pas écrire chaque ligne soi-même : on guide, on observe, on corrige. Le terme a été popularisé début 2025 et il a tout de suite été mal compris — confondu avec « laisser l'IA tout faire sans regarder ».</p>
        <p>La version professionnelle est plus intéressante : <strong>tu restes l'architecte</strong>. Tu décides de la structure, tu bornes le périmètre, tu exiges des preuves, tu relis. L'agent fournit la vitesse d'exécution et l'endurance ; toi, le jugement.</p>
      `
    },
    {
      type: 'steps',
      title: 'La boucle du vibe coding responsable',
      items: [
        { title: '1. Décrire', html: '<p>Un objectif en une phrase, un critère de réussite vérifiable, un périmètre (« uniquement <code>src/cart/</code> »). Si tu ne sais pas formuler le critère, tu n\'es pas prêt à déléguer.</p>' },
        { title: '2. Faire explorer', html: '<p>« Regarde comment <code>applyDiscount</code> est implémenté et testé, puis propose un plan. » L\'exploration avant le plan évite 80 % des réécritures.</p>' },
        { title: '3. Valider le plan', html: '<p>Un plan de 5 lignes coûte 30 secondes et évite 200 lignes au mauvais endroit. Corrige le plan, pas le code.</p>' },
        { title: '4. Laisser exécuter par petits pas', html: '<p>Une intention par tour. « Ajoute la fonction + les tests » puis « branche-la dans l\'UI ». Les gros diffs sont impossibles à relire, donc impossibles à valider.</p>' },
        { title: '5. Exiger la preuve', html: '<p>Tests, typecheck, build, capture, appel réel. « Ça devrait marcher » n\'est pas une preuve.</p>' },
        { title: '6. Relire le diff et committer', html: '<p>Tu lis chaque modification avant de committer. Ce que tu ne comprends pas, tu le fais expliquer ou tu l\'annules.</p>' }
      ]
    },
    {
      type: 'widget',
      widget: 'promptdoctor',
      title: 'Docteur du prompt',
      hint: "Colle un prompt de ta façon d'écrire, et observe le diagnostic : contexte, objectif, contrainte, critère de vérification."
    },
    {
      type: 'table',
      title: 'Les cinq phrases qui changent tout',
      head: ['Au lieu de…', 'Dis…', 'Effet'],
      rows: [
        ['« Ça ne marche pas »', '« Voici l’erreur exacte, le fichier, et ce que j’ai déjà essayé. »', 'L’agent cesse de deviner'],
        ['« Fais au mieux »', '« Le critère de réussite : npm test passe et la page ne log plus d’erreur. »', 'Une fin mesurable'],
        ['« Corrige tout »', '« Limite-toi à src/api/ ; ne touche pas aux migrations. »', 'Un diff relisible'],
        ['« Tu es sûr ? »', '« Montre la sortie de la commande qui le prouve. »', 'Une preuve, pas une opinion'],
        ['« Refactorise »', '« Extrais la validation dans un module, sans changer le comportement ; les tests existants doivent passer inchangés. »', 'Un refactor vérifiable']
      ]
    },
    {
      type: 'prose',
      title: "AGENTS.md : le contrat du dépôt",
      html: `
        <p>Un fichier d'instructions à la racine du projet (souvent <code>AGENTS.md</code>, <code>CLAUDE.md</code> est aussi lu par compatibilité) est chargé à chaque session. C'est l'endroit des règles courtes et durables :</p>
        <ul>
          <li>La stack et les commandes exactes : <code>npm test</code>, <code>npm run lint</code>, <code>make dev</code>.</li>
          <li>Les conventions non évidentes : où vivent les composants, comment on nomme, quel état est géré comment.</li>
          <li>Les interdits : « ne modifie jamais <code>db/migrations</code> », « pas de nouvelle dépendance sans accord ».</li>
          <li>Les pièges connus : « le mock de paiement est dans <code>test/mocks/payment.ts</code> ».</li>
        </ul>
        <p>Un bon <code>AGENTS.md</code> fait 40 à 80 lignes. Un fichier de 600 lignes est contre-productif : il coûte à chaque tour et noie l'essentiel.</p>
      `
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Quand ne pas faire de vibe coding',
      html: `
        <ul>
          <li><strong>Sécurité et argent.</strong> Authentification, paiement, chiffrement, migrations destructrices : écris-les ou relis-les ligne à ligne, avec des tests dédiés.</li>
          <li><strong>Code que tu ne peux pas tester.</strong> Sans vérification automatique, tu accumules des bugs invisibles.</li>
          <li><strong>Dette invisible.</strong> Cinq fonctionnalités acceptées sans relecture = un dépôt que plus personne ne comprend, y compris l'IA.</li>
          <li><strong>Licences et conformité.</strong> Un agent peut recopier un extrait incompatible. C'est à toi de vérifier.</li>
        </ul>
      `
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Le test des six mois',
      html: `<p>Avant d'accepter un diff, demande-toi : « dans six mois, quelqu'un pourra-t-il modifier ce code sans moi ? » Si la réponse est non, ce n'est pas de la vitesse, c'est de la dette anticipée.</p>`
    },
    {
      type: 'quiz',
      title: 'Vérifie tes acquis',
      questions: [
        {
          q: "Quel est le critère le plus important dans un prompt d'implémentation ?",
          options: [
            "La politesse et les encouragements.",
            "Un critère de réussite vérifiable et un périmètre borné.",
            "La longueur : plus c'est long, mieux c'est."
          ],
          answer: 1,
          explain: "Sans critère vérifiable, l'agent ne peut pas savoir qu'il a fini — et toi non plus."
        },
        {
          q: "Un agent propose 400 lignes de modifications pour un bug de trois lignes. Que fais-tu ?",
          options: [
            "J'accepte : c'est sûrement une refonte nécessaire.",
            "Je demande un plan minimal et une correction limitée au fichier fautif, puis je relis le diff.",
            "Je relance avec un modèle plus cher."
          ],
          answer: 1,
          explain: "Un diff trop large est impossible à valider : c'est un signal de périmètre mal borné, pas de puissance insuffisante."
        },
        {
          q: "Que doit contenir un bon AGENTS.md ?",
          options: [
            "Toute la documentation du projet, pour être exhaustif.",
            "Les commandes, conventions et interdits essentiels, en 40 à 80 lignes.",
            "Uniquement le nom du projet."
          ],
          answer: 1,
          explain: "Court et permanent. Le détail volumineux va dans des skills, chargés à la demande."
        }
      ]
    }
  ],
  takeaways: [
    "Vibe coding = intention + délégation + vérification. Pas « sans regarder ».",
    "Explorer → plan → petits pas → preuve → relecture. Les six étapes, toujours.",
    "AGENTS.md : court, permanent, actionnable. Le volume va dans les skills.",
    "Sécurité, argent et migrations : relecture humaine obligatoire."
  ]
});

window.MODULES.push({
  id: 'freebuff',
  no: 8,
  title: 'Maîtriser Freebuff',
  subtitle: "Les surfaces, les fichiers qui comptent, et le flux de travail qui rend l'agent fiable.",
  icon: '⚡',
  duration: '30 min',
  level: 'Tous niveaux',
  tags: ['Freebuff', 'CLI', 'workflow'],
  objectives: [
    "Choisir la bonne surface : CLI, Desktop ou navigateur.",
    "Initialiser un projet et comprendre ce que crée /init.",
    "Piloter une session : contexte, plan, permissions, diff, vérification.",
    "Réutiliser ton savoir-faire avec skills, AGENTS.md et agents."
  ],
  blocks: [
    {
      type: 'prose',
      title: 'Trois surfaces, un même moteur',
      html: `
        <p>Freebuff est un agent de code gratuit, disponible en <strong>CLI</strong> (le terminal), en <strong>Desktop</strong> (application avec panneaux, terminal, aperçu) et dans le <strong>navigateur</strong> (Cloud, avec un espace de travail distant). Le moteur est le même : boucle agentique, outils, contexte, permissions.</p>
        <p>Ce qui change : l'ergonomie et l'environnement d'exécution. Le Cloud travaille dans une machine distante (donc pas d'accès à tes fichiers locaux, mais un environnement propre et reproductible) ; le CLI et le Desktop travaillent dans <em>ton</em> dépôt.</p>
        <p>Vérifie toujours les commandes exactes et les options disponibles avec <code>freebuff --help</code> : le produit évolue vite, et la documentation officielle reste la référence.</p>
      `
    },
    {
      type: 'widget',
      widget: 'workflow',
      title: 'Quel flux pour quelle tâche ?',
      hint: "Choisis une situation, l'outil propose la surface et la séquence adaptées."
    },
    {
      type: 'prose',
      title: 'Les quatre fichiers qui font la différence',
      html: `
        <ul>
          <li><code>AGENTS.md</code> — le contrat du dépôt : stack, commandes, conventions, interdits. Chargé à chaque session. Court.</li>
          <li><code>.agents/skills/&lt;nom&gt;/SKILL.md</code> — les savoir-faire chargés à la demande. Aussi lu depuis <code>.claude/skills/</code>.</li>
          <li><code>.agents/types/</code> + tes fichiers d'agents — créés par <code>/init</code> ; ils définissent des agents personnalisés réutilisables (module suivant).</li>
          <li><code>knowledge.md</code> — le contexte projet généré par <code>/init</code> : architecture, points d'entrée, pièges. À relire et corriger : un fichier faux est pire que pas de fichier.</li>
        </ul>
      `
    },
    {
      type: 'code',
      title: 'Démarrage propre',
      lang: 'bash',
      code: `# Installation (vérifie la commande sur le site officiel)
npm install -g freebuff

# Dans le dépôt
cd mon-projet
freebuff            # ouvre la session
/init               # génère knowledge.md et .agents/types/

# Demander une exploration AVANT toute modification
> Lis AGENTS.md et knowledge.md, puis explique comment une requête
  HTTP arrive jusqu'à la base. Ne modifie rien.

# Puis une tâche bornée, avec vérification explicite
> Dans src/api/orders.ts, ajoute la validation du champ "quantity"
  (entier > 0). Ajoute les tests dans le fichier de test voisin,
  lance npm test et corrige jusqu'à ce que tout passe.`,
      caption: "L'ordre compte : contexte → compréhension → plan → action bornée → preuve."
    },
    {
      type: 'table',
      title: 'Les commandes et gestes à connaître',
      head: ['Geste', 'À quoi ça sert', 'Quand l’utiliser'],
      rows: [
        ['<code>/init</code>', 'Initialiser le contexte et les types d’agents', 'Premier lancement sur un dépôt'],
        ['<code>/skill:&lt;nom&gt;</code>', 'Charger un skill explicitement', 'Quand le déclenchement automatique ne suffit pas'],
        ['Nouvelle session', 'Repartir d’un contexte propre', 'Changement de sujet : évite la contamination'],
        ['Plan avant action', 'Obtenir une démarche à valider', 'Toute tâche de plus de 3 fichiers'],
        ['Diff / revue', 'Lire les modifications avant de valider', 'Systématiquement'],
        ['Permissions', 'Autoriser, demander, interdire', 'Toute commande destructive ou réseau'],
        ['<code>--help</code>', 'Voir les options réelles de ta version', 'Dès qu’un doute existe']
      ]
    },
    {
      type: 'prose',
      title: 'Le protocole de session qui marche',
      html: `
        <ol>
          <li><strong>Ouvre propre.</strong> Une session par sujet. Un contexte qui traîne sur trois tâches produit des réponses contaminées.</li>
          <li><strong>Donne le contrat.</strong> « Lis <code>AGENTS.md</code>. On travaille sur la page panier. Interdiction de toucher aux migrations. »</li>
          <li><strong>Fais explorer.</strong> Demande les fichiers concernés et les tests existants avant tout code.</li>
          <li><strong>Exige un plan court.</strong> Trois à six étapes. Corrige-le maintenant, pas après.</li>
          <li><strong>Découpe.</strong> Un objectif par tour. Commit entre les étapes quand c'est possible.</li>
          <li><strong>Vérifie.</strong> Tests, typecheck, build. La sortie compte plus que la prose.</li>
          <li><strong>Relis le diff.</strong> Si tu ne comprends pas une ligne, fais-la expliquer ou retire-la.</li>
          <li><strong>Capitalise.</strong> Une convention répétée deux fois → <code>AGENTS.md</code>. Une procédure → skill. Une vérification obligatoire → hook.</li>
        </ol>
      `
    },
    {
      type: 'callout',
      tone: 'warn',
      title: 'Les trois erreurs de débutant',
      html: `
        <ul>
          <li><strong>Le prompt-fleuve.</strong> Dix exigences dans un message : l'agent en oublie trois. Découpe.</li>
          <li><strong>Accepter sans lire.</strong> Le gain de vitesse se paie plus tard, avec intérêts.</li>
          <li><strong>La session éternelle.</strong> Un contexte de 200 000 tokens où le vrai sujet est noyé. Repars propre.</li>
        </ul>
      `
    },
    {
      type: 'example',
      title: 'Avant / après, sur un vrai besoin',
      html: `
        <p><strong>Avant :</strong> « Mon app ne marche plus, répare. » → l'agent explore au hasard, propose une réécriture, tu perds une heure.</p>
        <p><strong>Après :</strong> « <code>npm run dev</code> échoue avec <code>Cannot find module './config/env'</code> (sortie ci-dessous). Le fichier <code>src/config/env.ts</code> existe. Trouve pourquoi la résolution échoue, corrige la cause, puis relance <code>npm run build</code>. Ne touche à aucun autre fichier. »</p>
        <p>Même modèle, même harnais. La différence : une erreur réelle, un fichier cité, un périmètre, une preuve.</p>
      `
    },
    {
      type: 'quiz',
      title: 'Vérifie tes acquis',
      questions: [
        {
          q: "Tu ouvres un dépôt inconnu. Quel est le premier geste utile ?",
          options: [
            "Demander une refonte complète de l'architecture.",
            "Lancer /init, lire AGENTS.md et knowledge.md, puis demander une exploration sans modification.",
            "Committer immédiatement pour avoir une sauvegarde."
          ],
          answer: 1,
          explain: "On construit le contexte avant d'agir. Le reste vient après."
        },
        {
          q: "À quoi sert un fichier AGENTS.md ?",
          options: [
            "À documenter exhaustivement tout le projet.",
            "À donner à chaque session les règles courtes et durables du dépôt : commandes, conventions, interdits.",
            "À remplacer les tests."
          ],
          answer: 1,
          explain: "C'est un contrat permanent et concis, chargé automatiquement à chaque session."
        },
        {
          q: "L'agent annonce « j'ai corrigé le bug, les tests devraient passer ». Quelle réponse est professionnelle ?",
          options: [
            "« Super, merci ! » et on commit.",
            "« Lance les tests et montre la sortie. S'il en reste un rouge, corrige jusqu'à ce que tout passe. »",
            "« Réécris tout le module par précaution. »"
          ],
          answer: 1,
          explain: "On transforme une affirmation en preuve exécutable. C'est le cœur du métier avec un agent."
        }
      ]
    }
  ],
  takeaways: [
    "CLI, Desktop, Cloud : même moteur, environnements différents. Vérifie les options avec --help.",
    "AGENTS.md à chaque session, skills à la demande, agents pour déléguer.",
    "Flux : contexte → exploration → plan → pas bornés → preuve → relecture → capitalisation.",
    "Session propre par sujet ; un prompt = une intention vérifiable."
  ]
});

window.MODULES.push({
  id: 'agentforge',
  no: 9,
  title: 'Créer des agents',
  subtitle: "Passer de « je prompte » à « je conçois des collaborateurs ».",
  icon: '🧩',
  duration: '35 min',
  level: 'Avancé',
  tags: ['AgentDefinition', 'orchestration', 'tools'],
  objectives: [
    "Écrire une définition d'agent complète dans .agents/.",
    "Choisir les outils et les agents délégables avec parcimonie.",
    "Savoir quand utiliser des prompts seuls ou du contrôle programmatique.",
    "Tester, versionner et faire évoluer un agent."
  ],
  blocks: [
    {
      type: 'prose',
      title: "Un agent est un fichier, pas un mystère",
      html: `
        <p>Dans Freebuff/Codebuff, un agent personnalisé est une définition TypeScript rangée dans le dossier <code>.agents/</code>. <code>/init</code> crée <code>.agents/types/</code> avec les types, et tu ajoutes tes fichiers, par exemple <code>.agents/test-fixer.ts</code>.</p>
        <p>Une définition déclare : un <strong>identifiant</strong>, un <strong>nom affiché</strong> et un <strong>modèle</strong> ; les <strong>outils</strong> autorisés ; les agents qu'il peut <strong>lancer</strong> ; le <strong>prompt de délégation</strong> qui explique aux autres agents <em>quand</em> l'appeler ; son <strong>prompt système</strong> (identité) et ses <strong>instructions</strong> (procédure).</p>
        <p>Trois principes de conception : un agent = un métier ; le moins d'outils possible ; une sortie au format défini. Un agent qui peut tout faire est un agent que personne ne sait quand appeler.</p>
      `
    },
    {
      type: 'code',
      title: 'Un agent « réparateur de tests », prompts seuls',
      lang: 'typescript',
      code: `import type { AgentDefinition } from './types/agent-definition'

const definition: AgentDefinition = {
  id: 'test-fixer',
  displayName: 'Test Fixer',
  model: 'anthropic/claude-sonnet-4.5',

  // Le strict nécessaire : lire, chercher, exécuter, modifier.
  toolNames: ['read_files', 'code_search', 'run_terminal_command', 'str_replace'],

  spawnerPrompt:
    "À lancer quand une suite de tests échoue et que la cause est probablement " +
    "dans le code de production. Ne pas lancer pour écrire de nouveaux tests.",

  systemPrompt:
    "Tu es un ingénieur spécialisé dans la réparation de tests rouges. " +
    "Tu ne changes jamais un test pour le faire passer : tu corriges le code. " +
    "Si le test est faux, tu le signales au lieu de le modifier.",

  instructionsPrompt: \`Procède ainsi :
1. Lance la commande de test donnée et lis l'échec complet.
2. Remonte à la cause dans le code de production.
3. Applique la correction la plus petite possible.
4. Relance uniquement le test concerné, puis la suite complète.
5. Rends : cause racine, diff appliqué, sortie finale des tests.

Interdits : modifier les fichiers de test, ajouter une dépendance,
désactiver une assertion, utiliser --force ou skip.\`,
}

export default definition`,
      caption: "Le champ spawnerPrompt est décisif : c'est lui qui décide si l'orchestrateur pensera à ton agent. Écris-le comme un critère, pas comme un slogan."
    },
    {
      type: 'prose',
      title: 'Quand ajouter du contrôle programmatique',
      html: `
        <p>Pour une tâche linéaire, les prompts suffisent. Quand l'ordre des opérations doit être <em>garanti</em> — récupérer le diff, lister les fichiers, lire, puis seulement laisser le modèle conclure — une définition peut inclure une fonction génératrice qui pilote les étapes. C'est le même principe que les hooks : transformer une espérance en séquence déterministe.</p>
      `
    },
    {
      type: 'code',
      title: 'Contrôle des étapes (handleSteps)',
      lang: 'typescript',
      code: `import type { AgentDefinition } from './types/agent-definition'

const definition: AgentDefinition = {
  id: 'review-changed',
  displayName: 'Review Changed Files',
  model: 'anthropic/claude-sonnet-4.5',
  toolNames: ['read_files', 'run_terminal_command', 'code_search'],
  spawnerPrompt: 'À lancer pour relire les modifications non commitées du dépôt.',
  systemPrompt: 'Tu es un relecteur exigeant mais constructif.',

  handleSteps: function* () {
    // 1. Récupérer les fichiers modifiés (déterministe)
    const { toolResult: changed } = yield {
      toolName: 'run_terminal_command',
      input: { command: 'git diff HEAD --name-only' },
    }

    // 2. Les lire (déterministe)
    const paths = String(changed || '').split('\\n').filter(Boolean)
    if (paths.length > 0) {
      yield { toolName: 'read_files', input: { paths } }
    }

    // 3. Laisser le modèle produire la revue
    yield 'STEP_ALL'
  },
}

export default definition`,
      caption: "yield <appel d'outil> exécute l'outil et renvoie le résultat ; yield 'STEP_ALL' laisse le modèle travailler ; return termine. La mécanique exacte est décrite dans les types générés par /init."
    },
    {
      type: 'widget',
      widget: 'agentforge',
      title: 'Fabrique : génère ta définition',
      hint: "Décris ton agent, choisis ses outils et son mode de délégation : l'outil produit un squelette de fichier .agents/ prêt à adapter."
    },
    {
      type: 'table',
      title: 'Erreurs de conception fréquentes',
      head: ['Symptôme', 'Cause probable', 'Correction'],
      rows: [
        ['L’agent n’est jamais appelé', 'spawnerPrompt trop vague', 'Décrire la situation déclenchante, pas la personnalité'],
        ['L’agent fait tout, mal', 'Trop d’outils, périmètre flou', 'Réduire toolNames, borner le périmètre, exiger un format de sortie'],
        ['Résultats différents à chaque fois', 'Instructions non vérifiables', 'Ajouter commandes et critères explicites'],
        ['Coût et lenteur', 'Trop de sous-agents ou modèle surdimensionné', 'Un agent, un métier ; modèle adapté à la tâche'],
        ['L’agent casse des choses', 'Outils d’écriture + autonomie sans garde-fou', 'Retirer l’écriture, ou passer par hook/permission']
      ]
    },
    {
      type: 'steps',
      title: 'Mettre un agent en production, sans drame',
      items: [
        { title: '1. Écrire', html: '<p>Une définition, un métier, des instructions numérotées, un format de sortie.</p>' },
        { title: '2. Tester sur un cas connu', html: '<p>Un bug dont tu connais la cause. Si l\'agent trouve autre chose, ses instructions sont trop ouvertes.</p>' },
        { title: '3. Tester sur un cas piégeux', html: '<p>Un cas où la « solution évidente » est fausse. Vérifie qu\'il signale son incertitude au lieu d\'inventer.</p>' },
        { title: '4. Versionner', html: '<p>La définition vit dans le dépôt : elle se relit en revue de code comme n\'importe quel script.</p>' },
        { title: '5. Observer', html: '<p>Surveille les déclenchements : trop souvent = spawnerPrompt trop large ; jamais = trop étroit.</p>' }
      ]
    },
    {
      type: 'callout',
      tone: 'key',
      title: 'Le critère de qualité d’un agent',
      html: `<p>Un bon agent est <strong>ennuyeux</strong> : il fait toujours la même chose, de la même façon, avec une sortie prévisible, et il dit « je ne sais pas » quand il ne sait pas. Si ton agent te surprend, ce n'est pas de la magie, c'est un bug de conception.</p>`
    },
    {
      type: 'quiz',
      title: 'Vérifie tes acquis',
      questions: [
        {
          q: "Où vit la définition d'un agent personnalisé dans un projet Freebuff ?",
          options: [
            "Dans le prompt système du modèle.",
            "Dans un fichier TypeScript du dossier .agents/, avec les types générés par /init.",
            "Dans package.json."
          ],
          answer: 1,
          explain: "C'est un fichier versionnable, relu en revue de code, comme le reste du projet."
        },
        {
          q: "Quel champ décide si l'orchestrateur pensera à ton agent ?",
          options: ['displayName', 'spawnerPrompt', 'model'],
          answer: 1,
          explain: "spawnerPrompt décrit la situation où l'agent doit être lancé. C'est le critère de délégation."
        },
        {
          q: "Ton agent de revue modifie le code pour « corriger » ce qu'il voit. Quel est le problème ?",
          options: [
            "Aucun, c'est plus efficace.",
            "Un relecteur doit rester en lecture seule : sinon il n'y a plus de séparation entre proposition et validation.",
            "Il faudrait lui donner encore plus d'outils."
          ],
          answer: 1,
          explain: "Séparer celui qui produit et celui qui valide est un principe de base. Un relecteur qui écrit détruit la confiance dans la revue."
        }
      ]
    }
  ],
  takeaways: [
    "Un agent = fichier .agents/<id>.ts : id, modèle, outils, spawnerPrompt, prompts.",
    "Un métier par agent, le minimum d'outils, une sortie au format défini.",
    "handleSteps pour garantir une séquence, prompts seuls pour le reste.",
    "Tester sur un cas connu et un cas piégeux avant de faire confiance."
  ]
});
