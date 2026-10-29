/* Contenu — Partie 1 : fondations (IA, harnais, agents) */
window.MODULES = window.MODULES || [];

window.MODULES.push({
  id: 'ia',
  no: 1,
  title: "Comprendre l'IA",
  subtitle: "Ce qu'un modèle de langage fait vraiment, et pourquoi ça change tout.",
  icon: '🧠',
  duration: '20 min',
  level: 'Débutant',
  tags: ['LLM', 'tokens', 'contexte'],
  objectives: [
    "Distinguer IA, machine learning, modèle de langage et agent.",
    "Expliquer avec tes mots ce que fait un LLM quand il « répond ».",
    "Comprendre tokens, fenêtre de contexte, température et hallucinations.",
    "Repérer une réponse plausible mais fausse, et savoir quoi faire."
  ],
  blocks: [
    {
      type: 'prose',
      title: "Trois mots qu'on confond tout le temps",
      html: `
        <p><strong>Intelligence artificielle</strong> est un terme parapluie : il désigne toute technique qui fait accomplir à une machine des tâches qu'on réservait aux humains. Le tri d'e-mails spam, la reconnaissance vocale, un moteur de recommandation sont de l'IA, et pourtant aucun ne « comprend » quoi que ce soit.</p>
        <p>Le <strong>machine learning</strong> est une des familles de l'IA : au lieu d'écrire les règles à la main, on montre des exemples et le programme ajuste ses paramètres. Un <strong>modèle de langage</strong> (LLM, <em>Large Language Model</em>) est un modèle de machine learning entraîné sur d'énormes quantités de texte, avec un objectif unique et dérisoire en apparence : <em>deviner la suite</em>.</p>
        <p>Un <strong>agent</strong>, enfin, n'est pas un modèle. C'est un programme qui utilise un modèle, en boucle, avec des outils, pour atteindre un objectif. Tu peux avoir le meilleur modèle du monde : sans agent autour, il ne fait que répondre du texte.</p>
      `
    },
    {
      type: 'callout',
      tone: 'key',
      title: "La phrase à retenir",
      html: `<p>Un LLM ne <em>sait</em> pas les choses et ne <em>cherche</em> pas la vérité : il calcule la suite la plus probable d'un texte. Toute la puissance — et tous les dangers — viennent de là.</p>`
    },
    {
      type: 'widget',
      widget: 'tokenlab',
      title: "Labo : devine le mot suivant",
      hint: "Choisis un mot, puis observe comment le modèle choisit. Change la « température » pour voir la sélection se resserrer ou se disperser."
    },
    {
      type: 'prose',
      title: "Tokens, contexte, et la mémoire qui n'existe pas",
      html: `
        <p>Un modèle ne lit pas des lettres ni des mots : il lit des <strong>tokens</strong>, des morceaux de texte (souvent 3 à 5 caractères en français). « anticonstitutionnellement » peut valoir 5 ou 6 tokens. C'est pour cela que la facturation, les limites et la vitesse se comptent en tokens, jamais en pages.</p>
        <p>La <strong>fenêtre de contexte</strong> est la quantité maximale de tokens que le modèle peut regarder <em>en une seule fois</em> : ta question, la conversation précédente, les fichiers qu'on lui a collés, les instructions du projet, les définitions d'outils. Tout cela est remis sur la table à chaque appel.</p>
        <p>Conséquence contre-intuitive : un LLM n'a <strong>aucune mémoire</strong> entre deux appels. Quand un assistant « se souvient » de ton prénom, c'est que le programme a réinséré la conversation dans le contexte. La mémoire est une fonctionnalité du harnais, pas du modèle.</p>
      `
    },
    {
      type: 'table',
      title: "Ordres de grandeur à connaître",
      head: ['Notion', 'Ce que ça veut dire', 'Pourquoi ça te concerne'],
      rows: [
        ['1 token', '≈ 3 à 4 caractères en français', 'Un fichier de 300 lignes ≈ 3 000 à 4 000 tokens.'],
        ['Fenêtre de contexte', "Tout ce que le modèle voit d'un coup", 'Au-delà, il faut résumer, découper ou filtrer.'],
        ['Température', 'Le hasard injecté dans le choix du token', '0 = répétable, élevée = créatif mais instable.'],
        ['Entraînement', 'Le modèle ajuste ses poids sur des données', 'Rare, coûteux, fait par l’éditeur du modèle.'],
        ['Inférence', "Le modèle répond à une requête", "C'est 99,9 % de ce que tu fais avec Freebuff."]
      ]
    },
    {
      type: 'prose',
      title: "Pourquoi il hallucine (et ce n'est pas un bug)",
      html: `
        <p>Une hallucination, c'est une affirmation fausse énoncée avec le même ton assuré qu'une affirmation vraie. Ce n'est pas un dysfonctionnement : c'est le comportement normal d'un système qui cherche la suite la plus plausible. Une réponse fausse mais fluide est, du point de vue du modèle, une excellente réponse.</p>
        <p>Les trois causes principales :</p>
        <ul>
          <li><strong>Le trou de connaissance.</strong> Le sujet n'était pas (ou mal) dans les données d'entraînement. Le modèle comble avec du plausible.</li>
          <li><strong>Le contexte insuffisant.</strong> On demande « corrige ce bug » sans le fichier ni le message d'erreur. Il invente une cause.</li>
          <li><strong>La formulation qui suggère la réponse.</strong> « Pourquoi cette fonction provoque-t-elle une fuite mémoire ? » présuppose la fuite. Il confirmera.</li>
        </ul>
        <p>Les parades sont toutes dans le harnais : donner les fichiers réels, exiger des outils qui vérifient (tests, <code>grep</code>, exécution), demander les sources, et relire. Une IA qui exécute du code se corrige ; une IA qui parle toute seule, non.</p>
      `
    },
    {
      type: 'callout',
      tone: 'warn',
      title: 'Le réflexe professionnel',
      html: `<p>Ne demande jamais « est-ce que c'est vrai ? » à un modèle. Demande-lui de <em>produire la preuve exécutable</em> : un test qui passe, une commande dont tu vois la sortie, un extrait de fichier que tu peux vérifier.</p>`
    },
    {
      type: 'example',
      title: "Le même besoin, deux niveaux",
      html: `
        <p><strong>Chat :</strong> « Écris-moi une fonction qui valide un email. » → du code générique, non testé, non intégré, qui ignore tes conventions.</p>
        <p><strong>Agent :</strong> « Ajoute la validation d'email dans <code>src/auth/register.ts</code>, regarde comment <code>validatePhone</code> est testé, écris les tests manquants, lance <code>npm test</code> et corrige jusqu'à ce que ça passe. » → l'agent lit le dépôt, imite tes conventions, exécute la suite de tests et itère sur les erreurs réelles.</p>
        <p>La différence n'est pas le modèle. C'est l'accès au réel : les fichiers, les commandes, la sortie d'erreur.</p>
      `
    },
    {
      type: 'quiz',
      title: 'Vérifie tes acquis',
      questions: [
        {
          q: "Que fait exactement un modèle de langage quand il répond ?",
          options: [
            "Il cherche la réponse dans une base de données de vérités.",
            "Il prédit, token après token, la suite la plus probable du texte fourni.",
            "Il raisonne comme un humain, mais plus vite."
          ],
          answer: 1,
          explain: "C'est une prédiction statistique de la suite. La qualité vient de l'immensité des données et du contexte, pas d'une base de faits consultée."
        },
        {
          q: "Tu ouvres une nouvelle conversation et l'assistant a « oublié » ton projet. Pourquoi ?",
          options: [
            "Le modèle a vidé sa mémoire pour économiser du stockage.",
            "Le modèle n'a pas de mémoire : le programme doit réinjecter le contexte à chaque appel.",
            "Il faut réentraîner le modèle sur ton projet."
          ],
          answer: 1,
          explain: "La persistance est assurée par le harnais (fichiers d'instructions comme AGENTS.md, historique, résumés), jamais par le modèle lui-même."
        },
        {
          q: "Quelle demande réduit le plus le risque d'hallucination ?",
          options: [
            "« Es-tu sûr de toi ? Réfléchis bien. »",
            "« Donne-moi une réponse détaillée et convaincante. »",
            "« Lis src/api.ts, corrige l'erreur TypeScript, puis lance npm run typecheck et montre la sortie. »"
          ],
          answer: 2,
          explain: "On ancre la réponse dans des fichiers réels et dans une vérification exécutable. La sortie de commande est une preuve, l'assurance du modèle n'en est pas une."
        }
      ]
    }
  ],
  takeaways: [
    "IA ⊃ machine learning ⊃ LLM. Un agent n'est pas un modèle : c'est un programme qui pilote un modèle.",
    "Un LLM prédit la suite ; il n'interroge pas une base de vérités.",
    "Tout ce que le modèle « sait » de toi à un instant donné est dans le contexte de cet appel.",
    "La preuve, c'est une sortie de commande ou un test qui passe — pas une phrase bien tournée."
  ]
});

window.MODULES.push({
  id: 'harnais',
  no: 2,
  title: 'Le harnais',
  subtitle: "La pièce invisible qui transforme un modèle bavard en ouvrier fiable.",
  icon: '🛠️',
  duration: '25 min',
  level: 'Débutant',
  tags: ['harness', 'boucle', 'outils'],
  objectives: [
    "Définir un harnais (harness) et nommer ses cinq composants.",
    "Décrire la boucle agentique : objectif, contexte, modèle, outil, observation.",
    "Expliquer pourquoi un même modèle est meilleur dans un bon harnais.",
    "Reconnaître les limites d'un harnais : permissions, budget, contexte."
  ],
  blocks: [
    {
      type: 'prose',
      title: "Le moteur et la voiture",
      html: `
        <p>Le <strong>harnais</strong> (ou <em>harness</em>, parfois « échafaudage » ou « banc ») est tout le logiciel autour du modèle. Le modèle est un moteur : puissant, mais incapable de rouler, de freiner ou de voir la route tout seul. Le harnais, c'est la voiture : le châssis, les commandes, les capteurs, les ceintures.</p>
        <p>Concrètement, quand tu écris « corrige ce bug » à un agent de code, voilà ce que fait le harnais :</p>
        <ol>
          <li>Il rassemble le contexte : ton message, les instructions du projet, les fichiers pertinents, la liste des outils disponibles.</li>
          <li>Il envoie tout ça au modèle et lit sa réponse.</li>
          <li>Si la réponse contient une demande d'outil (<em>lire ce fichier</em>, <em>lancer les tests</em>), il exécute l'outil et renvoie le résultat au modèle.</li>
          <li>Il recommence jusqu'à ce que le modèle conclue, ou qu'une limite (tours, tokens, temps) soit atteinte.</li>
          <li>Il journalise, et applique les permissions : demander confirmation, refuser une commande destructrice.</li>
        </ol>
        <p>Cette répétition s'appelle la <strong>boucle agentique</strong>. C'est elle qui distingue un agent d'un chatbot.</p>
      `
    },
    {
      type: 'widget',
      widget: 'agentloop',
      title: "La boucle, étape par étape",
      hint: "Avance dans la boucle et regarde ce que le harnais transmet au modèle à chaque tour. Coupe le harnais pour voir ce qu'il reste."
    },
    {
      type: 'prose',
      title: 'Les cinq pièces du harnais',
      html: `
        <p>Les produits diffèrent, mais tous les harnais sérieux ont les mêmes organes :</p>
        <ul>
          <li><strong>La boucle.</strong> Le contrôleur qui décide quand appeler le modèle, quand exécuter un outil, quand s'arrêter.</li>
          <li><strong>Les outils.</strong> Lire/écrire des fichiers, chercher dans le code, lancer une commande, ouvrir un navigateur, appeler une API. Sans outils, pas d'action.</li>
          <li><strong>Le contexte.</strong> Ce qu'on choisit de montrer : instructions du projet (<code>AGENTS.md</code>), fichiers, historique, skills chargés à la demande. C'est le budget le plus précieux.</li>
          <li><strong>Les permissions.</strong> Ce que l'agent peut faire sans demander, ce qu'il doit demander, ce qui est interdit. Un harnais sans garde-fou est une arme chargée.</li>
          <li><strong>L'observabilité.</strong> Les logs, les diffs, la trace des outils appelés. Sans trace, pas de relecture possible — donc pas de professionnalisme.</li>
        </ul>
      `
    },
    {
      type: 'table',
      title: 'Le même modèle, deux mondes',
      head: ['Situation', 'Sans harnais (chat brut)', 'Avec un bon harnais'],
      rows: [
        ['Corriger un bug', 'Devine une cause plausible', 'Lit le fichier, reproduit, exécute les tests'],
        ['Ajouter une fonctionnalité', 'Code hors contexte, à recopier à la main', 'Respecte les conventions du dépôt et modifie les bons fichiers'],
        ['Vérifier son travail', 'Affirme que « ça devrait marcher »', 'Lance <code>npm test</code>, lit l’échec, corrige'],
        ['Tâche longue', 'Perd le fil dès la fin du message', 'Planifie, découpe, reprend, journalise'],
        ['Sécurité', 'Aucun contrôle', 'Permissions, confirmation, liste d’interdits']
      ]
    },
    {
      type: 'code',
      title: 'La boucle, en pseudo-code',
      lang: 'pseudo',
      code: `contexte = [instructions_projet, demande_utilisateur]

répéter (max 40 tours) :
    réponse = modèle(contexte, outils_disponibles)

    si réponse est "terminé" :
        sortir

    si réponse demande un outil :
        résultat = exécuter(outil, arguments)
        si outil dangereux et non autorisé :
            résultat = "refusé : confirmation requise"
        contexte.ajouter(résultat)      # l'observation
        si contexte.dépasse_budget() :
            contexte.compacter()        # résumé + faits conservés`,
      caption: "Tout agent de code ressemble à ça. La qualité vient des détails : quels outils, quel contexte, quelles limites."
    },
    {
      type: 'callout',
      tone: 'warn',
      title: 'Le harnais est le vrai différenciateur',
      html: `<p>Deux produits qui utilisent le même modèle peuvent avoir des résultats très différents. Ce qui change : la qualité du contexte injecté, la pertinence des outils, l'ergonomie des permissions, la reprise après erreur. C'est aussi pour ça qu'un « mauvais » modèle dans un excellent harnais bat souvent l'inverse.</p>`
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Ce que tu contrôles, toi',
      html: `<p>Tu ne choisis pas les poids du modèle, mais tu contrôles énormément : les instructions que tu écris, les fichiers que tu laisses accessibles, les skills que tu fournis, les vérifications que tu exiges, et le moment où tu relis le diff. Un utilisateur qui maîtrise ça obtient deux à trois fois plus d'un même agent.</p>`
    },
    {
      type: 'quiz',
      title: 'Vérifie tes acquis',
      questions: [
        {
          q: "Qu'est-ce qui distingue fondamentalement un agent d'un chatbot ?",
          options: [
            "L'agent utilise un modèle plus gros.",
            "L'agent boucle : il appelle le modèle, exécute des outils, observe le résultat et recommence.",
            "L'agent a une mémoire permanente intégrée au modèle."
          ],
          answer: 1,
          explain: "La boucle outil → observation → nouveau tour est la définition de travail d'un agent. Le modèle peut être identique."
        },
        {
          q: "Un agent affirme avoir corrigé le bug sans avoir lancé les tests. Que s'est-il probablement passé ?",
          options: [
            "Le harnais ne lui a pas donné d'outil de vérification, ou l'agent a conclu trop tôt.",
            "Le modèle est cassé et doit être réentraîné.",
            "C'est normal : un agent n'exécute jamais de commandes."
          ],
          answer: 0,
          explain: "Soit l'outil manque, soit la consigne ne l'exigeait pas explicitement. La parade est de rendre la vérification obligatoire (« lance les tests et corrige jusqu'à ce qu'ils passent »)."
        },
        {
          q: "Pourquoi les permissions font-elles partie du harnais et non du modèle ?",
          options: [
            "Parce qu'un modèle est incapable de comprendre une règle.",
            "Parce que le logiciel qui exécute l'action est le seul endroit où l'on peut réellement bloquer cette action.",
            "Parce que les permissions ralentissent le modèle."
          ],
          answer: 1,
          explain: "Une consigne dans le prompt est une suggestion. Un refus au niveau du harnais — avant exécution de la commande — est une garantie."
        }
      ]
    }
  ],
  takeaways: [
    "Le harnais = boucle + outils + contexte + permissions + observabilité.",
    "Un modèle sans harnais ne peut agir sur le monde ; un bon harnais rend le modèle utile.",
    "Les garde-fous efficaces sont dans le code du harnais, pas dans le prompt.",
    "Ta maîtrise se joue sur le contexte et les vérifications que tu exiges."
  ]
});

window.MODULES.push({
  id: 'agents',
  no: 3,
  title: 'Les agents',
  subtitle: "Autonomie, sous-agents et orchestration : qui fait quoi, et avec quel contexte.",
  icon: '🤖',
  duration: '25 min',
  level: 'Intermédiaire',
  tags: ['agents', 'sous-agents', 'orchestration'],
  objectives: [
    "Définir un agent par son objectif, ses outils, son autonomie et ses limites.",
    "Choisir entre un simple prompt, un workflow ou un agent.",
    "Comprendre l'intérêt des sous-agents : isolation de contexte et parallélisme.",
    "Éviter les pièges : prolifération, boucles, coûts, responsabilité diluée."
  ],
  blocks: [
    {
      type: 'prose',
      title: "Un agent, c'est une délégation avec des outils",
      html: `
        <p>Un agent se définit par quatre choses : un <strong>objectif</strong> (« fais passer la CI »), des <strong>outils</strong> (fichiers, terminal, recherche), une <strong>autonomie</strong> (il enchaîne plusieurs actions sans toi) et des <strong>limites</strong> (temps, tokens, permissions).</p>
        <p>Cette définition est volontairement large, parce que le mot « agent » est devenu un argument marketing. Un produit qui te propose trois boutons n'est pas un agent. Un programme qui lit, décide, agit et vérifie en boucle, oui.</p>
        <p>Dès que tu as plusieurs agents, il faut une <strong>orchestration</strong> : qui planifie, qui exécute, qui vérifie, et surtout <em>qui voit quel contexte</em>.</p>
      `
    },
    {
      type: 'steps',
      title: "Le cycle d'un agent bien conçu",
      items: [
        { title: '1. Cadrer', html: '<p>Reformuler l\'objectif en critère vérifiable : « les tests passent », « la page se charge sans erreur console ». Sans critère, il n\'y a pas de fin.</p>' },
        { title: '2. Reconnaître', html: '<p>Explorer avant d\'agir : lister les fichiers, lire les conventions, chercher des implémentations similaires. C\'est l\'étape que les débutants sautent.</p>' },
        { title: '3. Planifier', html: '<p>Découper en étapes courtes, annoncer le plan, identifier les risques (migration, suppression, dépendance).</p>' },
        { title: '4. Agir', html: '<p>Modifier le moins de choses possible, par petites touches. Chaque action doit être réversible ou relue.</p>' },
        { title: '5. Vérifier', html: '<p>Exécuter la preuve : tests, typecheck, build, capture d\'écran, appel réel. Comparer au critère de l\'étape 1.</p>' },
        { title: '6. Rendre compte', html: '<p>Résumer ce qui a changé, ce qui reste incertain, et ce que l\'humain doit relire. Un agent qui ne dit pas ses doutes est dangereux.</p>' }
      ]
    },
    {
      type: 'table',
      title: 'Prompt, workflow ou agent ?',
      head: ['Tu veux…', 'Le bon outil', 'Pourquoi'],
      rows: [
        ['Réécrire un paragraphe', 'Un prompt', 'Une entrée, une sortie. Aucune action sur le monde.'],
        ['Renommer une variable dans 12 fichiers', 'Un workflow (script + agent)', 'Le parcours est connu ; l\'agent sert seulement à traiter les cas ambigus.'],
        ['Trouver pourquoi la CI échoue', 'Un agent', 'Il faut explorer, hypothèse, test, correction — un chemin inconnu à l\'avance.'],
        ['Auditer 6 modules en parallèle', 'Un orchestrateur + sous-agents', 'Chaque sous-agent a son propre contexte, et ils travaillent en même temps.']
      ]
    },
    {
      type: 'prose',
      title: 'Les sous-agents : la vraie raison technique',
      html: `
        <p>Un sous-agent est un agent lancé par un autre agent. Le bénéfice principal n'est pas « plus d'intelligence », c'est <strong>l'isolation du contexte</strong>.</p>
        <p>Si un agent unique doit lire 80 fichiers pour répondre, son contexte se remplit de détails inutiles. Les informations importantes se noient. Un sous-agent peut lire ces 80 fichiers, puis ne renvoyer que dix lignes de synthèse. Le contexte principal reste propre, et dix explorations peuvent tourner en parallèle.</p>
        <p>Trois motifs d'orchestration reviennent sans cesse :</p>
        <ul>
          <li><strong>Orchestrateur / travailleurs</strong> — un agent planifie et délègue, les autres exécutent. Le plus courant.</li>
          <li><strong>Pipeline</strong> — chaque étape passe son résultat à la suivante (analyse → implémentation → revue).</li>
          <li><strong>Jury</strong> — plusieurs agents indépendants proposent, un troisième compare et tranche. Coûteux, utile sur les décisions à fort impact.</li>
        </ul>
      `
    },
    {
      type: 'example',
      title: 'Une délégation bien écrite',
      html: `
        <p><strong>Mauvais :</strong> « Va voir le code de paiement. » — objectif flou, périmètre infini, sortie inutilisable.</p>
        <p><strong>Bon :</strong> « Dans <code>src/payments/</code>, trouve tous les appels à <code>chargeCard</code> qui ne gèrent pas le cas <code>declined</code>. Rends une liste : fichier, ligne, code fautif, correctif proposé. Ne modifie aucun fichier. »</p>
        <p>Un sous-agent reçoit un objectif, un périmètre, un format de sortie et une interdiction d'agir. C'est ce qui rend son résultat exploitable et son exécution sûre.</p>
      `
    },
    {
      type: 'callout',
      tone: 'danger',
      title: "Les quatre pièges de l'autonomie",
      html: `
        <ul>
          <li><strong>La prolifération.</strong> Dix agents lancés pour un bug de trois lignes. Le coût explose et la relecture devient impossible.</li>
          <li><strong>La boucle infinie.</strong> Deux agents qui se renvoient la balle, ou un agent qui « réessaie » sans changer d'approche. Il faut une limite de tours.</li>
          <li><strong>La responsabilité diluée.</strong> Personne n'a relu le diff final. Le nom sur le commit reste le tien.</li>
          <li><strong>Le contexte contaminé.</strong> Un sous-agent reçoit un résumé faux et propage l'erreur avec assurance.</li>
        </ul>
      `
    },
    {
      type: 'callout',
      tone: 'key',
      title: 'La règle des trois questions',
      html: `<p>Avant de lancer un agent, réponds : <strong>quel est le critère de réussite vérifiable ?</strong> <strong>quel est le périmètre autorisé ?</strong> <strong>qui relit le résultat ?</strong> Si l'une des trois réponses manque, tu ne fais pas de l'ingénierie, tu fais de la loterie.</p>`
    },
    {
      type: 'quiz',
      title: 'Vérifie tes acquis',
      questions: [
        {
          q: "Quel est le principal bénéfice technique d'un sous-agent ?",
          options: [
            "Il utilise un modèle plus puissant.",
            "Il isole une grande quantité de contexte et ne renvoie qu'une synthèse au parent.",
            "Il contourne les permissions du harnais."
          ],
          answer: 1,
          explain: "L'isolation de contexte (et le parallélisme) est la raison d'être des sous-agents. C'est de l'architecture de contexte, pas de la magie."
        },
        {
          q: "« Renomme getUser en fetchUser dans tout le dépôt ». Prompt, workflow ou agent ?",
          options: [
            "Un agent autonome, c'est plus élégant.",
            "Un workflow : la transformation est mécanique, un script suffit ; l'agent n'est utile que pour arbitrer les cas ambigus.",
            "Un jury de trois agents."
          ],
          answer: 1,
          explain: "Quand le chemin est connu et mécanique, un script est plus rapide, gratuit et prévisible. Réserve l'agent à l'inconnu."
        },
        {
          q: "Quelle consigne de délégation est la plus professionnelle ?",
          options: [
            "« Améliore le module de paiement. »",
            "« Corrige tous les bugs du projet. »",
            "« Liste les appels non protégés à chargeCard dans src/payments/, avec fichier, ligne et correctif. Ne modifie rien. »"
          ],
          answer: 2,
          explain: "Périmètre borné, format de sortie défini, action interdite : le résultat est vérifiable et sans risque."
        }
      ]
    }
  ],
  takeaways: [
    "Un agent = objectif + outils + autonomie + limites. Sans critère de réussite, ce n'est pas un agent, c'est une conversation.",
    "Le sous-agent sert d'abord à protéger le contexte principal et à paralléliser.",
    "Workflow pour le connu, agent pour l'inconnu, jury pour les décisions coûteuses.",
    "Tu restes responsable du diff : autonomie de l'agent ≠ abandon de la relecture."
  ]
});
