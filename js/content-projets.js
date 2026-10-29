/* Contenu — Partie 4 : exercices, projets, glossaire, checklist de maîtrise */

window.EXERCISES = [
  {
    id: 'ex-tokens',
    module: 'ia',
    level: 'Facile',
    title: 'Estimer un budget de contexte',
    brief: "Un fichier de 240 lignes fait en moyenne 45 caractères par ligne. Estime son nombre de tokens, puis dis combien de tels fichiers tiennent dans une fenêtre de 32 000 tokens en gardant 8 000 tokens pour les instructions et la conversation.",
    criteria: "Ordre de grandeur correct, raisonnement explicite, marge de sécurité mentionnée.",
    hints: ["1 token ≈ 3 à 4 caractères en français.", "Commence par le nombre total de caractères."],
    solution: "240 × 45 ≈ 10 800 caractères. À 3,5 caractères par token : ≈ 3 100 tokens par fichier. Budget disponible : 32 000 − 8 000 = 24 000 tokens, soit ≈ 7 fichiers. En pratique, on vise 4 à 5 : les tokens réels varient, les définitions d'outils comptent aussi, et il faut de la place pour la réponse."
  },
  {
    id: 'ex-hallucination',
    module: 'ia',
    level: 'Facile',
    title: 'Déjouer une hallucination',
    brief: "L'agent affirme : « La fonction `parseConfig` de `src/config.ts` ne gère pas les variables d'environnement manquantes ; ajoute un fallback. » Écris les deux vérifications que tu fais avant d'accepter, et la reformulation de ta demande si le diagnostic est faux.",
    criteria: "Deux vérifications concrètes et une reformulation qui ancre la réponse dans les faits.",
    hints: ["Que peux-tu lire toi-même en dix secondes ?", "Comment obliger l'agent à citer ce qu'il a lu ?"],
    solution: "1) Ouvrir `src/config.ts` et vérifier si `parseConfig` gère ou non les variables absentes. 2) Chercher les usages/tests qui prouvent le comportement actuel (`code_search parseConfig`). Reformulation : « Cite les lignes exactes de `parseConfig` qui gèrent les variables manquantes. Si aucune ne le fait, propose un correctif et un test qui échoue avant / passe après. »"
  },
  {
    id: 'ex-loop',
    module: 'harnais',
    level: 'Moyen',
    title: 'Reconstruire la boucle',
    brief: "On te donne un agent qui « répond » mais n'agit jamais sur les fichiers. Liste, dans l'ordre, les cinq composants du harnais et indique lequel est probablement manquant. Justifie par un symptôme observable.",
    criteria: "Cinq composants nommés, diagnostic cohérent avec le symptôme.",
    hints: ["Le modèle peut-il écrire un fichier sans outil d'écriture ?", "Le harnais peut-il exécuter un outil non déclaré ?"],
    solution: "Boucle, outils, contexte, permissions, observabilité. Ici, le plus probable est l'absence d'outils d'écriture (ou leur non-déclaration dans le harnais) : l'agent décrit des modifications au lieu de les appliquer. Symptôme : aucune entrée « outil appelé » dans les logs, et un diff toujours vide. Deuxième piste : une permission qui refuse silencieusement l'écriture."
  },
  {
    id: 'ex-delegation',
    module: 'agents',
    level: 'Moyen',
    title: 'Écrire une délégation exploitable',
    brief: "Transforme « occupe-toi des tests du panier » en une délégation avec objectif, périmètre, contraintes et format de sortie. Puis indique ce que tu laisses volontairement à l'agent.",
    criteria: "Objectif vérifiable, périmètre explicite, contrainte de non-régression, format de sortie.",
    hints: ["Quel fichier exactement ?", "Quelle preuve attends-tu ?"],
    solution: "« Dans `src/cart/` et `tests/cart/`, augmente la couverture des fonctions de calcul de total : cas vide, remise, quantité nulle, arrondi. N'ajoute aucune dépendance, ne modifie pas la signature publique. Les tests existants doivent rester verts. Rends la liste des tests ajoutés, la sortie de `npm test`, et les cas que tu as jugés impossibles à tester sans refactor. » L'agent choisit les cas exacts et l'implémentation des tests ; tu gardes le périmètre, l'API et la validité de la preuve."
  },
  {
    id: 'ex-skill-name',
    module: 'skills',
    level: 'Facile',
    title: 'Nommer et décrire un skill',
    brief: "Corrige ces deux skills invalides ou inefficaces : (a) dossier `Deploy_Prod`, `name: Deploy_Prod`, description « déploiement » ; (b) dossier `review`, description « aide pour le code ».",
    criteria: "Nom valide et identique au dossier ; descriptions contenant quoi + quand + mots-clés.",
    hints: ["Minuscules, chiffres, tirets simples.", "La description doit contenir les mots que l'utilisateur emploiera."],
    solution: "(a) dossier `deploy-prod`, `name: deploy-prod`, description : « Procédure de déploiement en production : vérifications préalables, ordre des commandes, rollback. Utiliser dès qu'un déploiement, une mise en production ou un rollback est évoqué. » (b) description : « Checklist de revue de code : bugs, sécurité, tests, lisibilité. Utiliser dès qu'une revue, une relecture de diff ou une vérification avant merge est demandée. »"
  },
  {
    id: 'ex-skill-content',
    module: 'skills',
    level: 'Moyen',
    title: 'Découper un skill trop gros',
    brief: "Ton `SKILL.md` fait 900 lignes (conventions, procédures de migration, scripts de release, historique). Réorganise-le en respectant la divulgation progressive.",
    criteria: "SKILL.md court, références chargées à la demande, aucun contenu perdu.",
    hints: ["Que doit voir le modèle pour décider d'agir ?", "Qu'est-ce qui n'est utile qu'une fois sur dix ?"],
    solution: "SKILL.md ≤ 150 lignes : objectif, quand l'utiliser, règles impératives, liens vers `references/conventions.md`, `references/migrations.md`, `scripts/release.sh`. Chaque référence reste autonome et porte un titre clair. Supprimer l'historique (il va dans le README ou git). Le corps ne garde que ce qui change la décision ou l'action."
  },
  {
    id: 'ex-mcp',
    module: 'mcp',
    level: 'Moyen',
    title: "MCP ou pas MCP ?",
    brief: "Pour chacun de ces besoins, dis si MCP est adapté et pourquoi : (1) lire les lignes d'une table `orders` en lecture seule ; (2) connaître les conventions de nommage du projet ; (3) piloter un navigateur pour tester un formulaire ; (4) empêcher un commit sans lint.",
    criteria: "Quatre verdicts argumentés, alternatives nommées.",
    hints: ["Le harnais a-t-il déjà l'outil ?", "S'agit-il de connaissance ou d'action ?"],
    solution: "1) Oui : accès externe à une donnée, avec scope lecture seule. 2) Non : c'est un skill (ou AGENTS.md) — de la connaissance, pas une action. 3) Oui, si tu as besoin d'interaction réelle ; sinon Playwright en CLI suffit pour un test ponctuel. 4) Non : un hook de pre-commit ou un hook du harnais, car il faut une garantie déterministe."
  },
  {
    id: 'ex-hook',
    module: 'hooks',
    level: 'Moyen',
    title: 'Concevoir deux hooks',
    brief: "Écris la spécification (événement, condition, action, code de sortie, message) de deux hooks : l'un formate le TypeScript modifié, l'autre refuse toute écriture dans `db/migrations/`.",
    criteria: "Événements corrects, conditions explicites, comportement en cas d'échec, pas d'effet de bord.",
    hints: ["Avant ou après l'écriture pour un refus ?", "Comment éviter de reformater tout le dépôt ?"],
    solution: "Hook A — événement : après outil d'écriture ; condition : extension `.ts`/`.tsx` et fichier sous `src/` ; action : `eslint --fix` puis `tsc --noEmit` ; sortie 0 si succès, non nulle avec le message d'erreur pour signaler l'échec. Hook B — événement : avant outil d'écriture ; condition : chemin correspondant à `db/migrations/**` ; action : refuser avec message « migrations immuables : crée un nouveau fichier » ; code de sortie non nul. Les deux ne traitent qu'un fichier à la fois."
  },
  {
    id: 'ex-prompt',
    module: 'vibe',
    level: 'Facile',
    title: 'Réparer un prompt',
    brief: "Réécris : « l'ajout au panier bug, corrige ». Version professionnelle en une phrase, avec un critère de vérification.",
    criteria: "Symptôme observable, périmètre, preuve attendue.",
    hints: ["Quel comportement exact est faux ?", "Quelle commande prouve la correction ?"],
    solution: "« Sur la page produit, cliquer sur « Ajouter au panier » n'incrémente pas le compteur alors que le réseau renvoie 200 (voir la sortie console). Corrige dans `src/cart/` sans toucher à l'API, ajoute un test de régression, puis lance `npm test` et montre la sortie. »"
  },
  {
    id: 'ex-agents-md',
    module: 'vibe',
    level: 'Moyen',
    title: 'Écrire un AGENTS.md utile',
    brief: "Rédige un `AGENTS.md` de 10 à 15 lignes pour un projet React + Vite avec tests Vitest et migrations SQL. Il doit empêcher les erreurs les plus coûteuses.",
    criteria: "Commandes exactes, conventions non évidentes, interdits clairs, pas de blabla.",
    hints: ["Qu'est-ce qu'un nouvel agent ne peut pas deviner ?", "Quelles sont les actions irréversibles ?"],
    solution: "Contenu type : stack (React 19, Vite, Vitest, TypeScript strict) ; commandes (`npm run dev`, `npm test`, `npm run lint`, `npm run build`) ; structure (`src/features/<domaine>`, un composant par fichier, styles en CSS modules) ; tests à côté du code (`*.test.tsx`) ; interdits (« ne jamais éditer `db/migrations` déjà appliquées », « pas de dépendance sans accord », « pas de `any` ») ; pièges (« l'API mockée est dans `src/test/msw` »)."
  },
  {
    id: 'ex-freebuff-session',
    module: 'freebuff',
    level: 'Moyen',
    title: 'Piloter une session',
    brief: "Décris, en six messages maximum, la session qui permet d'ajouter un filtre de recherche à une liste de produits dans un dépôt inconnu.",
    criteria: "Exploration avant action, plan validé, pas bornés, preuve, relecture.",
    hints: ["Que fais-tu avant de demander du code ?", "Combien d'intentions par message ?"],
    solution: "1) « Lis AGENTS.md, puis explique comment la liste de produits est chargée et filtrée. Ne modifie rien. » 2) « Propose un plan en 5 étapes pour ajouter un filtre par prix max, sans changer l'API. » 3) (validation du plan) 4) « Implémente l'étape 1 et 2 uniquement, avec le test du composant. » 5) « Lance les tests et le typecheck, corrige ce qui échoue, montre la sortie. » 6) « Résume le diff et les risques restants. » Puis relecture humaine et commit."
  },
  {
    id: 'ex-agent-def',
    module: 'agentforge',
    level: 'Difficile',
    title: 'Concevoir un agent de documentation',
    brief: "Écris la définition d'un agent `doc-writer` : identifiant, outils, spawnerPrompt, systemPrompt, instructions en cinq étapes, et le format de sortie. Il documente une fonction publique sans modifier le code.",
    criteria: "Périmètre lecture seule, déclencheur précis, sortie structurée, interdiction explicite.",
    hints: ["Quels outils sont strictement nécessaires ?", "Que doit-il faire quand la fonction est incompréhensible ?"],
    solution: "Outils : `read_files`, `code_search`, `run_terminal_command` (uniquement pour lister les fichiers). Spawner : « À lancer quand une fonction publique existante doit être documentée ou quand la documentation d'une API est demandée. » Système : expert documentation, ne modifie jamais le code. Instructions : 1) localiser la fonction et son type ; 2) chercher les usages réels ; 3) relever les cas d'erreur ; 4) rédiger description, paramètres, retours, exceptions, exemple exécutable ; 5) signaler explicitement toute ambiguïté au lieu d'inventer. Sortie : bloc Markdown unique, puis liste des questions ouvertes."
  }
];

window.PROJECTS = [
  {
    id: 'pr-portfolio',
    level: 'Débutant',
    duration: '2 à 3 h',
    title: 'Portfolio express en vibe coding',
    goal: "Livrer une page portfolio responsive, sans framework, en pilotant Freebuff par intentions successives.",
    brief: "Tu vas construire une page unique (hero, projets, contact) en HTML/CSS/JS. L'intérêt n'est pas la page : c'est d'apprendre à découper, vérifier et committer entre chaque étape.",
    steps: [
      "Créer le dépôt et un `AGENTS.md` minimal : stack, commandes, conventions de nommage.",
      "Demander la structure HTML sémantique uniquement, sans CSS. Relire et committer.",
      "Demander le design system CSS (variables, typographie, espacements). Vérifier en aperçu.",
      "Ajouter le responsive en une intention dédiée, puis vérifier à 375 px, 768 px et 1440 px.",
      "Ajouter une interaction JS (filtre de projets ou thème clair/sombre) avec un test manuel décrit.",
      "Passer une passe d'accessibilité : contrastes, focus visible, ordre des titres, alt des images."
    ],
    criteria: [
      "Au moins quatre commits distincts, chacun correspondant à une intention.",
      "Aucun diff accepté sans relecture (tu peux expliquer chaque bloc).",
      "Aperçu vérifié à trois largeurs, focus clavier visible partout.",
      "`AGENTS.md` contient les commandes réelles du projet."
    ],
    extensions: "Ajouter un mode impression, puis un audit Lighthouse et une correction guidée des points rouges."
  },
  {
    id: 'pr-skill',
    level: 'Intermédiaire',
    duration: '3 à 4 h',
    title: "Boîte à outils d'équipe : skills + AGENTS.md",
    goal: "Transformer les conventions implicites d'un dépôt en trois skills réutilisables et un contrat de projet.",
    brief: "Choisis un dépôt réel (le tien ou un projet open source). Ton livrable est un dossier `.agents/skills/` versionné, testé en session neuve.",
    steps: [
      "Auditer : lister les cinq règles que tu répètes le plus souvent à un agent.",
      "Écrire `AGENTS.md` (40 à 80 lignes) avec commandes, conventions, interdits, pièges.",
      "Créer trois skills : `commit`, `review`, `db-migration` (ou trois équivalents de ton domaine).",
      "Valider noms, descriptions et taille ; déplacer le volume dans `references/`.",
      "Tester chaque skill dans une session neuve, sans le nommer : vérifier le déclenchement automatique.",
      "Corriger les descriptions jusqu'à obtenir un déclenchement fiable, et documenter les résultats."
    ],
    criteria: [
      "Trois skills avec frontmatter valide et description contenant quoi + quand + mots-clés.",
      "Déclenchement automatique vérifié dans une session neuve, avec preuve (transcription).",
      "Aucun `SKILL.md` au-delà de 200 lignes.",
      "`AGENTS.md` sans duplication avec les skills."
    ],
    extensions: "Ajouter un hook de lint des fichiers modifiés et comparer le nombre d'allers-retours avant/après."
  },
  {
    id: 'pr-testfixer',
    level: 'Intermédiaire',
    duration: '4 à 6 h',
    title: "Agent « test-fixer » et son banc d'essai",
    goal: "Concevoir, écrire et évaluer un agent spécialisé qui répare des tests rouges sans jamais les affaiblir.",
    brief: "Le livrable est une définition dans `.agents/` plus un petit protocole d'évaluation sur cinq cas, dont deux pièges.",
    steps: [
      "Choisir un dépôt avec une suite de tests et provoquer volontairement trois régressions simples.",
      "Écrire `.agents/test-fixer.ts` : outils minimaux, spawnerPrompt précis, interdiction de modifier les tests.",
      "Tester sur les trois régressions connues, noter cause trouvée, diff produit, temps.",
      "Ajouter deux cas pièges : un test effectivement faux, un bug non reproductible.",
      "Vérifier que l'agent signale l'incertitude au lieu de modifier le test ou d'inventer.",
      "Ajuster les instructions, puis documenter les résultats dans un tableau."
    ],
    criteria: [
      "Définition versionnée et relue comme du code.",
      "Aucun test affaibli sur les cinq cas (assertions intactes, aucun skip).",
      "Les deux cas pièges produisent un rapport d'incertitude, pas une fausse correction.",
      "Tableau d'évaluation avec taux de réussite et temps moyen."
    ],
    extensions: "Ajouter un second agent « flaky-hunter » et comparer l'orchestration en pipeline et en orchestrateur/travailleurs."
  },
  {
    id: 'pr-mcp',
    level: 'Avancé',
    duration: '5 à 7 h',
    title: 'Tableau de bord connecté par MCP',
    goal: "Brancher un serveur MCP en lecture seule sur une source de données, l'utiliser dans une petite app, avec hook de vérification.",
    brief: "L'objectif est la chaîne complète : données externes → agent → code → vérification. Choisis une source locale (SQLite, fichiers JSON, API publique en lecture).",
    steps: [
      "Mettre en place la source de données et un serveur MCP minimal en lecture seule (ou un serveur existant).",
      "Déclarer le serveur dans la configuration de ton harnais, avec un scope minimal.",
      "Faire explorer le schéma par l'agent, sans écriture, et consigner ce qu'il découvre.",
      "Générer une page de tableau de bord statique consommant ces données.",
      "Ajouter un hook qui vérifie le build après chaque édition de fichier source.",
      "Tester une tentative d'écriture : elle doit être refusée par le scope."
    ],
    criteria: [
      "Serveur MCP accessible en lecture seule, jeton ou chemin restreint.",
      "Tentative d'écriture refusée et documentée.",
      "Aucune sortie d'outil exécutée comme instruction (test d'injection effectué).",
      "Build reproductible après suppression de `node_modules`."
    ],
    extensions: "Ajouter un second serveur MCP (tickets ou calendrier) et mesurer l'impact sur le contexte et la latence."
  },
  {
    id: 'pr-capstone',
    level: 'Avancé',
    duration: '8 à 12 h',
    title: 'Capstone : pipeline d’audit de dépôt',
    goal: "Orchestrer trois agents (explorateur, analyste sécurité, rédacteur) pour produire un rapport d'audit actionnable.",
    brief: "Le livrable est un pipeline reproductible : une commande, un rapport Markdown, des preuves, et aucune modification du dépôt audité.",
    steps: [
      "Définir les trois agents dans `.agents/` avec des périmètres disjoints et des sorties structurées.",
      "Écrire un agent orchestrateur qui lance les deux premiers en parallèle, puis le rédacteur.",
      "Interdire toute écriture dans le dépôt audité (outils en lecture seule).",
      "Faire produire un rapport : constats classés par gravité, preuve (fichier:ligne), remédiation, incertitudes.",
      "Évaluer sur deux dépôts différents : mesurer faux positifs et constats manqués.",
      "Documenter les limites : ce que le pipeline ne sait pas faire."
    ],
    criteria: [
      "Trois définitions versionnées, spawnerPrompt précis, outils minimaux.",
      "Rapport reproductible : même dépôt, même version → même squelette de constats.",
      "Chaque constat cite un fichier et une ligne vérifiables.",
      "Aucune écriture effectuée dans le dépôt audité (git status propre)."
    ],
    extensions: "Ajouter un agent « adversarial » qui tente de réfuter chaque constat avant publication."
  }
];

window.GLOSSARY = [
  { term: 'Agent', def: "Programme qui utilise un modèle en boucle, avec des outils, pour atteindre un objectif vérifiable.", tag: 'fondamental' },
  { term: 'AGENTS.md', def: "Fichier d'instructions à la racine d'un projet, chargé à chaque session : commandes, conventions, interdits.", tag: 'Freebuff' },
  { term: 'Boucle agentique', def: "Cycle objectif → contexte → modèle → outil → observation, répété jusqu'à la fin ou une limite.", tag: 'fondamental' },
  { term: 'Contexte (fenêtre)', def: "Quantité maximale de tokens que le modèle peut prendre en compte en un appel. Budget à gérer.", tag: 'LLM' },
  { term: 'Divulgation progressive', def: "Charger d'abord les métadonnées, puis le contenu détaillé seulement quand la tâche le demande.", tag: 'skills' },
  { term: 'Hallucination', def: "Affirmation fausse énoncée avec assurance, produite par la recherche de plausibilité du modèle.", tag: 'LLM' },
  { term: 'Harnais (harness)', def: "Logiciel autour du modèle : boucle, outils, contexte, permissions, observabilité.", tag: 'fondamental' },
  { term: 'Hook', def: "Programme exécuté automatiquement à un événement du cycle de vie (avant/après outil, fin de tâche).", tag: 'hooks' },
  { term: 'Inférence', def: "Fait de faire tourner un modèle déjà entraîné pour produire une réponse.", tag: 'LLM' },
  { term: 'Injection de prompt', def: "Instruction malveillante cachée dans une donnée lue (fichier, page, sortie d'outil) que le modèle pourrait suivre.", tag: 'sécurité' },
  { term: 'JSON-RPC', def: "Format d'appel distant en JSON utilisé par MCP pour échanger requêtes et réponses.", tag: 'MCP' },
  { term: 'LLM', def: "Grand modèle de langage entraîné à prédire la suite d'un texte ; il génère des tokens.", tag: 'LLM' },
  { term: 'MCP', def: "Model Context Protocol : standard ouvert pour exposer des outils, ressources et prompts à un agent.", tag: 'MCP' },
  { term: 'Mémoire', def: "Persistance d'informations entre sessions, assurée par le harnais (fichiers, historique), pas par le modèle.", tag: 'fondamental' },
  { term: 'Orchestrateur', def: "Agent qui planifie et délègue à des sous-agents, puis assemble et vérifie leurs résultats.", tag: 'agents' },
  { term: 'Permission', def: "Règle du harnais définissant ce qu'un agent peut exécuter sans demander, avec accord, ou jamais.", tag: 'sécurité' },
  { term: 'Prompt système', def: "Instructions permanentes définissant l'identité et les règles d'un agent.", tag: 'agents' },
  { term: 'Prompt', def: "Message fourni au modèle : objectif, contexte, contraintes, format attendu.", tag: 'fondamental' },
  { term: 'RAG', def: "Recherche de documents pertinents puis injection dans le contexte, pour répondre sur des données externes.", tag: 'LLM' },
  { term: 'Skill', def: "Dossier avec un SKILL.md (name + description) chargé à la demande pour apporter un savoir-faire.", tag: 'skills' },
  { term: 'SKILL.md', def: "Fichier principal d'un skill : frontmatter YAML puis instructions Markdown.", tag: 'skills' },
  { term: 'Sous-agent', def: "Agent lancé par un autre agent, avec son propre contexte, souvent en parallèle, pour isoler et accélérer.", tag: 'agents' },
  { term: 'spawnerPrompt', def: "Description du moment où un agent doit être lancé par un autre. C'est le critère de délégation.", tag: 'agents' },
  { term: 'Température', def: "Paramètre de hasard dans le choix des tokens : bas = déterministe, haut = varié.", tag: 'LLM' },
  { term: 'Token', def: "Unité de texte traitée par le modèle : environ 3 à 4 caractères en français.", tag: 'LLM' },
  { term: 'Tool use', def: "Capacité du modèle à demander l'exécution d'une fonction (lire, écrire, exécuter) avec des arguments structurés.", tag: 'harnais' },
  { term: 'Vibe coding', def: "Développer en décrivant l'intention et en pilotant un agent, tout en gardant la validation humaine.", tag: 'méthode' },
  { term: 'Workflow', def: "Enchaînement déterministe d'étapes connues, éventuellement avec un agent par étape.", tag: 'agents' },
  { term: 'AgentDefinition', def: "Structure TypeScript décrivant un agent Freebuff/Codebuff : id, modèle, outils, prompts, étapes.", tag: 'Freebuff' },
  { term: 'handleSteps', def: "Fonction génératrice d'une définition d'agent qui garantit une séquence d'outils avant de laisser le modèle conclure.", tag: 'agents' },
  { term: 'knowledge.md', def: "Fichier de contexte projet généré par /init : architecture, points d'entrée, pièges.", tag: 'Freebuff' },
  { term: 'Diff', def: "Ensemble des modifications proposées ou appliquées ; l'unité de relecture humaine.", tag: 'méthode' }
];

window.MASTERY = [
  {
    group: 'Concepts',
    items: [
      "J'explique la différence entre un modèle et un agent sans hésiter.",
      "Je sais estimer approximativement le coût en tokens d'un fichier.",
      "Je nomme les cinq composants d'un harnais.",
      "Je repère une hallucination et je demande une preuve exécutable.",
      "Je distingue skill, MCP, hook et permission par leur rôle."
    ]
  },
  {
    group: 'Freebuff',
    items: [
      "J'initialise un dépôt inconnu et je corrige le knowledge.md généré.",
      "J'écris un AGENTS.md court et utile.",
      "Je gère mes sessions : une par sujet, contexte propre.",
      "Je fais explorer puis planifier avant toute modification.",
      "Je relis chaque diff et je refuse ce que je ne comprends pas.",
      "Je capitalise : conventions répétées → AGENTS.md, procédures → skills."
    ]
  },
  {
    group: 'Vibe coding',
    items: [
      "Chaque demande contient un critère de réussite vérifiable.",
      "Je borne le périmètre des fichiers à modifier.",
      "Je découpe en petits diffs et je committe entre les étapes.",
      "J'exige une sortie de commande comme preuve, jamais une assurance.",
      "Je sais dire non à un refactor non demandé."
    ]
  },
  {
    group: 'Agents et écosystème',
    items: [
      "J'écris un SKILL.md valide et je vérifie son déclenchement en session neuve.",
      "Je sais quand un serveur MCP est utile — et quand il ne l'est pas.",
      "J'évalue la sécurité d'un serveur MCP avant de l'installer.",
      "J'écris un hook rapide, idempotent, avec un vrai code de sortie.",
      "Je conçois une AgentDefinition avec un spawnerPrompt précis.",
      "Je teste un agent sur un cas connu et un cas piège avant de lui faire confiance."
    ]
  }
];
