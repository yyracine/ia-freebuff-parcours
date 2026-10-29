/* Banque de questions de l'examen final — 45 items, 5 par module.
   Format identique au bloc quiz : { id, module, level, q, options, answer, explain } */

window.EXAM_BANK = [
  /* ---------- Module 1 : comprendre l'IA ---------- */
  {
    id: 'ia-1', module: 'ia', level: 'Facile',
    q: "Un modèle de langage produit sa réponse en…",
    options: [
      "consultant une base de faits indexée",
      "prédisant le token suivant, un grand nombre de fois de suite",
      "exécutant un programme de raisonnement symbolique"
    ],
    answer: 1,
    explain: "La génération est une suite de prédictions conditionnées par tout le contexte. Aucune base de vérités n’est interrogée : c’est pourquoi le modèle peut être fluide et faux."
  },
  {
    id: 'ia-2', module: 'ia', level: 'Facile',
    q: "Deux sessions successives, même modèle : la seconde ignore un fichier lu dans la première. Pourquoi ?",
    options: [
      "Le modèle n’a pas de mémoire entre les appels : le contexte doit être réinjecté.",
      "Le fichier a été supprimé du disque.",
      "La température a été remise à zéro."
    ],
    answer: 0,
    explain: "Tout ce que le modèle « sait » de toi à un instant donné est dans la requête de cet appel. La persistance vient du harnais (instructions, résumés, fichiers), jamais du modèle."
  },
  {
    id: 'ia-3', module: 'ia', level: 'Moyen',
    q: "Pour extraire un tableau Markdown de façon fiable et reproductible, quel réglage privilégier ?",
    options: [
      "Une température élevée, pour explorer plusieurs formulations",
      "Une température proche de 0, pour réduire la variance",
      "Peu importe : la température ne change pas la sortie"
    ],
    answer: 1,
    explain: "Une température basse resserre la distribution sur les tokens les plus probables. Pour de l’extraction ou du refactor, on veut de la constance ; pour brainstormer, on ouvre la température."
  },
  {
    id: 'ia-4', module: 'ia', level: 'Moyen',
    q: "L’agent affirme qu’une fonction n’existe pas dans le dépôt. Meilleure première action ?",
    options: [
      "Lui demander s’il est vraiment sûr",
      "Chercher la fonction et lui montrer le résultat de la recherche",
      "Relancer une conversation depuis zéro"
    ],
    answer: 1,
    explain: "On ancre la réponse dans le réel : une recherche, un fichier, une sortie de commande. Demander de l’assurance ne produit qu’une reformulation plus convaincante."
  },
  {
    id: 'ia-5', module: 'ia', level: 'Expert',
    q: "Un fichier de 300 lignes à 50 caractères par ligne. Quelle estimation de tokens est la plus juste en français ?",
    options: ["Environ 450 tokens", "Environ 4 300 tokens", "Environ 40 000 tokens"],
    answer: 1,
    explain: "300 × 50 = 15 000 caractères, soit environ 4 300 tokens à 3,5 caractères par token. C’est l’ordre de grandeur à connaître pour budgéter un contexte."
  },

  /* ---------- Module 2 : le harnais ---------- */
  {
    id: 'harnais-1', module: 'harnais', level: 'Facile',
    q: "Quel est le rôle exact du harnais ?",
    options: [
      "Entraîner le modèle sur ton dépôt",
      "Faire tourner la boucle : appeler le modèle, exécuter les outils, réinjecter les résultats",
      "Remplacer le modèle par des règles déterministes"
    ],
    answer: 1,
    explain: "Le harnais est le programme autour du modèle : boucle, outils, contexte, permissions, observabilité. Le modèle propose, le harnais exécute et constate."
  },
  {
    id: 'harnais-2', module: 'harnais', level: 'Moyen',
    q: "L’agent propose `rm -rf ./dist` et le harnais refuse. Que vient-il de se passer ?",
    options: [
      "La couche de permissions a bloqué la commande avant exécution",
      "Le disque est plein",
      "Le modèle a oublié la commande en cours de route"
    ],
    answer: 0,
    explain: "La permission est une barrière placée entre la proposition du modèle et le système réel. C’est elle qui rend l’autonomie supportable."
  },
  {
    id: 'harnais-3', module: 'harnais', level: 'Moyen',
    q: "Une commande de test échoue. Que doit faire un bon harnais ensuite ?",
    options: [
      "S’arrêter et rendre la main à l’utilisateur",
      "Renvoyer la sortie d’erreur au modèle pour qu’il corrige et réessaie",
      "Ignorer l’échec et continuer la tâche"
    ],
    answer: 1,
    explain: "La boucle se referme sur l’observation réelle. C’est ce retour, pas la consigne, qui permet la correction."
  },
  {
    id: 'harnais-4', module: 'harnais', level: 'Moyen',
    q: "À quoi sert la trace d’une session agentique ?",
    options: [
      "À décorer la sortie du terminal",
      "À reconstituer les appels d’outils et leurs résultats pour diagnostiquer un comportement",
      "À accélérer les réponses du modèle"
    ],
    answer: 1,
    explain: "Sans trace, un agent qui se trompe est un mystère. Avec la trace, on voit quel outil a été appelé, avec quels arguments, et ce qui est revenu."
  },
  {
    id: 'harnais-5', module: 'harnais', level: 'Expert',
    q: "Un assistant répond très bien mais ne modifie jamais les fichiers. Diagnostic le plus probable ?",
    options: [
      "Le modèle est trop petit",
      "Aucun outil d’écriture n’est exposé, ou une permission le refuse",
      "La température est trop haute"
    ],
    answer: 1,
    explain: "Le modèle décrit alors qu’il ne peut pas agir : le symptôme est un diff toujours vide et aucune entrée d’outil d’écriture dans la trace. Vérifie les outils déclarés avant de changer de modèle."
  },

  /* ---------- Module 3 : les agents ---------- */
  {
    id: 'agents-1', module: 'agents', level: 'Moyen',
    q: "Quand un sous-agent est-il réellement justifié ?",
    options: [
      "Pour toute tâche : c’est toujours plus rapide",
      "Quand la sous-tâche a un périmètre clair et polluerait le contexte principal (exploration large, audit)",
      "Uniquement pour les tâches de design"
    ],
    answer: 1,
    explain: "Un sous-agent coûte un appel de plus et une synthèse. Il se rentabilise quand il isole une masse de lectures dont seul le résultat compte."
  },
  {
    id: 'agents-2', module: 'agents', level: 'Moyen',
    q: "Bénéfice principal d’un contexte isolé pour un sous-agent ?",
    options: [
      "Il coûte toujours moins cher en tokens au total",
      "Il garde le contexte principal propre : seule la synthèse revient",
      "Il contourne les permissions du harnais"
    ],
    answer: 1,
    explain: "Le gain est qualitatif : l’orchestrateur garde assez de place pour raisonner. Le coût total, lui, peut augmenter — d’où l’intérêt de périmètres courts."
  },
  {
    id: 'agents-3', module: 'agents', level: 'Moyen',
    q: "« Occupe-toi des tests » produit du travail hors sujet. Première correction ?",
    options: [
      "Augmenter la température pour explorer",
      "Préciser objectif, périmètre de fichiers, contraintes et format de sortie",
      "Changer de modèle"
    ],
    answer: 1,
    explain: "Une délégation exploitable est vérifiable : fichiers concernés, non-régression exigée, preuve attendue. Sans périmètre, l’agent choisit le sien."
  },
  {
    id: 'agents-4', module: 'agents', level: 'Expert',
    q: "Dans une définition d’agent, à quoi sert `spawnerPrompt` ?",
    options: [
      "À décrire quand et pourquoi l’orchestrateur doit déléguer à cet agent",
      "À définir la couleur du terminal",
      "À installer les dépendances du projet"
    ],
    answer: 0,
    explain: "`spawnerPrompt` est lu par l’orchestrateur : c’est le déclencheur de délégation. `systemPrompt` décrit le métier de l’agent lui-même."
  },
  {
    id: 'agents-5', module: 'agents', level: 'Expert',
    q: "Deux agents se renvoient la même tâche en boucle. Cause la plus probable ?",
    options: [
      "Les périmètres et les critères de sortie se recouvrent : aucun ne peut conclure",
      "Le modèle est en panne",
      "Le dépôt contient trop de fichiers"
    ],
    answer: 0,
    explain: "Une boucle d’agents vient presque toujours d’une frontière floue. Un critère de sortie explicite par agent, et un seul responsable du résultat final, la cassent."
  },

  /* ---------- Module 4 : les skills ---------- */
  {
    id: 'skills-1', module: 'skills', level: 'Facile',
    q: "Que charge le harnais au démarrage pour un skill ?",
    options: [
      "Le SKILL.md entier",
      "Le nom et la description seulement",
      "Tous les fichiers du dossier references/"
    ],
    answer: 1,
    explain: "C’est la divulgation progressive : le corps n’entre dans le contexte qu’au moment de l’activation. D’où l’importance d’une description précise."
  },
  {
    id: 'skills-2', module: 'skills', level: 'Facile',
    q: "Ton skill ne se déclenche jamais tout seul. Où regarder en premier ?",
    options: [
      "La description : contient-elle les mots et le moment d’usage ?",
      "Le nombre de fichiers dans scripts/",
      "La licence déclarée"
    ],
    answer: 0,
    explain: "La description est le seul signal dont dispose l’agent pour décider. Réécris-la avec les termes réels des demandes, pas avec un résumé abstrait."
  },
  {
    id: 'skills-3', module: 'skills', level: 'Facile',
    q: "Quel nom de skill est valide ?",
    options: ["deploy-prod", "Deploy_Prod", "deploy--prod"],
    answer: 0,
    explain: "Minuscules, chiffres et tirets simples, sans tiret en début ou fin, et le nom doit être identique à celui du dossier."
  },
  {
    id: 'skills-4', module: 'skills', level: 'Moyen',
    q: "Un skill destiné à toute l’équipe doit vivre…",
    options: [
      "Dans le ~/.agents/skills de chaque poste",
      "Dans .agents/skills du dépôt, versionné avec le code",
      "Dans le README du projet"
    ],
    answer: 1,
    explain: "Le dossier du projet est partagé et revu en même temps que le code. Le dossier global reste pour tes préférences personnelles."
  },
  {
    id: 'skills-5', module: 'skills', level: 'Expert',
    q: "Tu veux garantir qu’un formateur tourne après chaque édition de fichier. Bon mécanisme ?",
    options: ["Un skill", "Un hook post-edit", "Une entrée de glossaire"],
    answer: 1,
    explain: "Le skill apporte un savoir-faire à la demande ; le hook apporte une garantie déterministe. Une obligation ne se délègue pas à l’obéissance du modèle."
  },

  /* ---------- Module 5 : MCP ---------- */
  {
    id: 'mcp-1', module: 'mcp', level: 'Facile',
    q: "Dans MCP, qui expose des outils ?",
    options: [
      "Le modèle lui-même",
      "Le serveur MCP, consommé par le client du harnais",
      "Le navigateur de l’utilisateur"
    ],
    answer: 1,
    explain: "Le serveur déclare des capacités ; le client du harnais les négocie et les présente au modèle comme des outils. Le modèle ne parle jamais directement au serveur."
  },
  {
    id: 'mcp-2', module: 'mcp', level: 'Moyen',
    q: "Quelle est la différence entre tools et resources ?",
    options: [
      "tools = actions appelables ; resources = données consultables",
      "resources = actions ; tools = fichiers",
      "Aucune : ce sont deux noms pour la même chose"
    ],
    answer: 0,
    explain: "Un outil agit (créer un ticket, lancer une requête), une ressource se lit (un document, un schéma). Les prompts, eux, fournissent des modèles de requête."
  },
  {
    id: 'mcp-3', module: 'mcp', level: 'Moyen',
    q: "Tu ajoutes un serveur MCP communautaire. Que fais-tu avant ?",
    options: [
      "Rien : MCP est sandboxé par définition",
      "Vérifier l’éditeur et le code, examiner les permissions demandées, restreindre la portée",
      "Le lancer en root pour éviter les erreurs de permission"
    ],
    answer: 1,
    explain: "Un serveur MCP est un programme avec tes accès. Le moindre privilège et une source de confiance sont les deux seules vraies protections."
  },
  {
    id: 'mcp-4', module: 'mcp', level: 'Moyen',
    q: "Un serveur MCP n’apparaît pas dans la session. Première vérification ?",
    options: [
      "La configuration du serveur (commande, transport, variables) et ses logs de démarrage",
      "La taille du dépôt",
      "Le thème du terminal"
    ],
    answer: 0,
    explain: "Un serveur qui ne démarre pas ne peut rien exposer. Commande introuvable, variable manquante ou transport mal déclaré : les logs le disent en une ligne."
  },
  {
    id: 'mcp-5', module: 'mcp', level: 'Expert',
    q: "Quel est l’intérêt de MCP face à un script maison par intégration ?",
    options: [
      "Un protocole commun : un serveur sert plusieurs clients sans réécrire l’intégration",
      "C’est plus rapide à taper au clavier",
      "Cela augmente la fenêtre de contexte"
    ],
    answer: 0,
    explain: "MCP standardise la découverte et l’appel des capacités. Écrire un serveur une fois évite d’écrire N connecteurs pour N harnais."
  },

  /* ---------- Module 6 : les hooks ---------- */
  {
    id: 'hooks-1', module: 'hooks', level: 'Facile',
    q: "Un hook est…",
    options: [
      "une instruction en langage naturel adressée au modèle",
      "un programme déclenché par un événement du harnais, dont le code de sortie peut bloquer l’action",
      "un modèle spécialisé dans la vérification"
    ],
    answer: 1,
    explain: "Le hook est du code déterministe branché sur un événement (avant/après édition, avant commande). Il ne demande pas l’avis du modèle : il constate et décide."
  },
  {
    id: 'hooks-2', module: 'hooks', level: 'Moyen',
    q: "Après chaque édition, lancer eslint --fix : hook ou consigne dans AGENTS.md ?",
    options: [
      "Consigne : le modèle obéira toujours",
      "Hook : une garantie ne doit pas dépendre de l’obéissance du modèle",
      "Les deux sont strictement équivalents"
    ],
    answer: 1,
    explain: "Une consigne est une probabilité, un hook est une certitude. Tout ce qui doit être vrai à chaque fois se code."
  },
  {
    id: 'hooks-3', module: 'hooks', level: 'Moyen',
    q: "Tu veux interdire toute migration destructive. Le hook doit…",
    options: [
      "afficher un avertissement et laisser passer",
      "détecter DROP TABLE puis sortir avec un code d’erreur pour bloquer l’action",
      "envoyer un e-mail au responsable"
    ],
    answer: 1,
    explain: "Un avertissement est consultatif. Seul un code de sortie non nul transforme la règle en refus effectif."
  },
  {
    id: 'hooks-4', module: 'hooks', level: 'Moyen',
    q: "Un hook échoue avec un code non nul. Conséquence ?",
    options: [
      "Le harnais poursuit normalement",
      "L’action est considérée comme refusée : il faut lire la sortie du hook et corriger",
      "Le dépôt est réinitialisé"
    ],
    answer: 1,
    explain: "L’échec du hook est un veto. La sortie explique pourquoi : chemin interdit, lint en erreur, secret détecté. On corrige la cause, on ne contourne pas le hook."
  },
  {
    id: 'hooks-5', module: 'hooks', level: 'Expert',
    q: "Que ne doit surtout pas faire un hook ?",
    options: [
      "Vérifier un nom de fichier",
      "Prendre une décision sémantique du type « ce refactor est-il bon ? »",
      "Lancer un formateur"
    ],
    answer: 1,
    explain: "Le déterministe juge ce qui est vérifiable ; le jugement de qualité revient à la revue humaine ou au modèle. Un hook qui tente de raisonner devient imprévisible."
  },

  /* ---------- Module 7 : le vibe coding ---------- */
  {
    id: 'vibe-1', module: 'vibe', level: 'Moyen',
    q: "Quel est l’ordre correct d’une session de vibe coding ?",
    options: [
      "Coder, puis demander un plan, puis tester",
      "Cadrer la tâche et le périmètre, laisser explorer, valider le plan, exécuter, vérifier par les tests, relire le diff",
      "Relire le diff, coder, cadrer la tâche"
    ],
    answer: 1,
    explain: "La valeur vient du cadre et de la vérification. Sauter le plan produit de grands diffs difficiles à relire ; sauter les tests transforme la confiance en pari."
  },
  {
    id: 'vibe-2', module: 'vibe', level: 'Facile',
    q: "Que met-on dans AGENTS.md ?",
    options: [
      "L’historique complet du projet",
      "Les conventions durables : commandes, structure, règles et interdits",
      "Les secrets d’API"
    ],
    answer: 1,
    explain: "Ce fichier est lu à chaque session : il doit rester court et stable. Les secrets n’y ont pas leur place, ni dans aucun fichier versionné."
  },
  {
    id: 'vibe-3', module: 'vibe', level: 'Moyen',
    q: "Quel énoncé est le plus adapté à une délégation en vibe coding ?",
    options: [
      "« Refonds l’architecture du paiement »",
      "« Ajoute la validation du code postal dans le formulaire d’adresse, avec un test »",
      "« Améliore le projet »"
    ],
    answer: 1,
    explain: "Une tâche déléguée doit être vérifiable et produire un diff relisible. Les refontes transverses demandent un plan et une revue par étapes."
  },
  {
    id: 'vibe-4', module: 'vibe', level: 'Expert',
    q: "Dans quel cas faut-il éviter de déléguer largement ?",
    options: [
      "Renommer une variable locale",
      "Une migration de schéma en production, sans sauvegarde ni revue",
      "Ajouter un test unitaire"
    ],
    answer: 1,
    explain: "L’autonomie s’arrête là où l’erreur devient irréversible. Sauvegarde, environnement de test et revue explicite sont des préalables, pas des options."
  },
  {
    id: 'vibe-5', module: 'vibe', level: 'Moyen',
    q: "Que vérifie-t-on en priorité dans un diff généré ?",
    options: [
      "Le style des commentaires",
      "Les fichiers touchés hors périmètre, les suppressions et la gestion des cas d’erreur",
      "Le nombre total de lignes"
    ],
    answer: 1,
    explain: "Le danger est rarement la ligne ajoutée : c’est le fichier modifié qu’on n’attendait pas, la suppression silencieuse et l’erreur désormais ignorée."
  },

  /* ---------- Module 8 : maîtriser Freebuff ---------- */
  {
    id: 'freebuff-1', module: 'freebuff', level: 'Facile',
    q: "Où Freebuff lit-il les définitions d’agents propres au projet ?",
    options: [".agents/", "node_modules/", "public/"],
    answer: 0,
    explain: "Le dossier .agents/ du dépôt porte les agents et les skills du projet ; le dossier personnel du home porte les agents globaux."
  },
  {
    id: 'freebuff-2', module: 'freebuff', level: 'Facile',
    q: "CLI, Desktop et Cloud : quelle est la différence ?",
    options: [
      "Trois modèles différents avec des capacités inégales",
      "Le même moteur sur des surfaces différentes : terminal, application de bureau, environnement distant",
      "Desktop est payant, le CLI est gratuit"
    ],
    answer: 1,
    explain: "Les surfaces changent l’ergonomie et l’isolation (sandbox, prévisualisation), pas la logique de la boucle agentique ni les fichiers de configuration."
  },
  {
    id: 'freebuff-3', module: 'freebuff', level: 'Moyen',
    q: "Première session sur un dépôt inconnu : meilleur enchaînement ?",
    options: [
      "Lancer directement une refonte globale",
      "Faire explorer et résumer (structure, commandes, conventions), puis demander un plan",
      "Demander du code sans rien lire"
    ],
    answer: 1,
    explain: "L’exploration initiale coûte quelques minutes et évite des dizaines de modifications à côté des conventions du projet."
  },
  {
    id: 'freebuff-4', module: 'freebuff', level: 'Moyen',
    q: "La session devient lente et coûteuse. Que fais-tu ?",
    options: [
      "Continuer : le modèle finira par s’adapter",
      "Résumer l’état atteint et repartir sur une session propre avec les fichiers utiles",
      "Augmenter la température"
    ],
    answer: 1,
    explain: "Un contexte saturé dégrade la précision et augmente le coût. Un résumé écrit et une nouvelle session sont souvent plus efficaces qu’un long historique."
  },
  {
    id: 'freebuff-5', module: 'freebuff', level: 'Expert',
    q: "L’agent propose une commande destructrice. Bonne pratique ?",
    options: [
      "L’accepter : il a analysé la situation",
      "Lire la commande, vérifier la portée, refuser ou demander une variante réversible",
      "Désactiver les permissions pour aller plus vite"
    ],
    answer: 1,
    explain: "La permission n’est pas une friction à supprimer mais le garde-fou du système réel. On préfère toujours une variante réversible (copie, branche, dry-run)."
  },

  /* ---------- Module 9 : créer des agents ---------- */
  {
    id: 'agentforge-1', module: 'agentforge', level: 'Moyen',
    q: "Quel champ décide réellement des capacités d’un agent ?",
    options: ["displayName", "toolNames", "Le modèle choisi, uniquement"],
    answer: 1,
    explain: "Le nom est décoratif. Les outils déclarés déterminent ce que l’agent peut lire, écrire et exécuter — c’est là que se joue le périmètre."
  },
  {
    id: 'agentforge-2', module: 'agentforge', level: 'Facile',
    q: "Quelle règle appliquer à la liste d’outils d’un agent ?",
    options: [
      "Tout cocher pour ne jamais être bloqué",
      "Le strict minimum nécessaire à son métier",
      "Aucun outil, pour la sécurité"
    ],
    answer: 1,
    explain: "Chaque outil accordé est une surface d’erreur et de risque. Un agent de revue n’a pas besoin d’écrire ; un agent de test n’a pas besoin de déployer."
  },
  {
    id: 'agentforge-3', module: 'agentforge', level: 'Expert',
    q: "À quoi sert `handleSteps` dans une définition d’agent ?",
    options: [
      "À écrire les étapes déterministes (récupérer un diff, lister des fichiers) avant de laisser le modèle conclure",
      "À styliser la sortie dans le terminal",
      "À installer les dépendances du projet"
    ],
    answer: 0,
    explain: "`handleSteps` est un générateur : tu contrôles la séquence, tu appelles des outils toi-même, puis tu rends la main au modèle. Idéal pour un préambule fiable."
  },
  {
    id: 'agentforge-4', module: 'agentforge', level: 'Moyen',
    q: "Quelle formulation décrit le mieux `systemPrompt` ?",
    options: [
      "Quand l’orchestrateur doit déléguer à cet agent",
      "Le métier de l’agent, ses règles et son format de sortie",
      "Les permissions du dépôt"
    ],
    answer: 1,
    explain: "`systemPrompt` définit le rôle et la sortie attendue. Le déclencheur de délégation appartient à `spawnerPrompt`."
  },
  {
    id: 'agentforge-5', module: 'agentforge', level: 'Expert',
    q: "Comment valider un nouvel agent avant de l’utiliser au quotidien ?",
    options: [
      "Le lancer une fois sur un cas facile",
      "Le tester sur un cas connu et sur un cas piège, puis vérifier le format et les refus",
      "Compter le nombre de lignes de sa définition"
    ],
    answer: 1,
    explain: "Un agent se juge sur les cas limites : hors périmètre, information absente, demande risquée. Un agent qui refuse proprement vaut mieux qu’un agent qui invente."
  }
];
