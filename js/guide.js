/* Guide d’utilisation : contenu de la page #/guide */
window.GUIDE = {
  lede: 'Comment se servir de l’application : démarrer, suivre les modules, utiliser les ateliers, passer l’évaluation et l’examen, obtenir l’attestation, adapter le parcours. Le contenu pédagogique, lui, est dans les neuf modules.',

  sections: [
    {
      id: 'demarrer',
      icon: '▶',
      title: 'Démarrer en trois minutes',
      html:
        '<p>L’application est un site statique : aucun compte à créer, aucun serveur à installer, aucune donnée envoyée quelque part.</p>' +
        '<div class="steps">' +
        '<div class="step"><h4>Ouvrir</h4><p>En local, <code>http://localhost:3000</code> après avoir lancé le serveur (voir « Adapter le parcours »). Sinon, l’adresse où le dossier est publié.</p></div>' +
        '<div class="step"><h4>Installer, si tu veux</h4><p>Le bouton ⤓ de la barre du haut, ou le menu du navigateur → « Installer l’application ». Elle s’ouvre alors comme une application, avec le mode hors ligne. L’installation exige <code>http://localhost</code> ou HTTPS ; ouvert directement par <code>file://</code>, l’application fonctionne mais reste non installable.</p></div>' +
        '<div class="step"><h4>Régler l’affichage</h4><p>Le bouton lune/soleil bascule entre thème sombre et clair ; le choix est mémorisé sur l’appareil.</p></div>' +
        '<div class="step"><h4>Naviguer</h4><p>Tout passe par le sommaire de gauche. Sur mobile, il s’ouvre avec le bouton ☰ et se ferme par Échap ou un clic à côté.</p></div>' +
        '</div>' +
        '<p class="callout callout--tip"><span class="callout__icon" aria-hidden="true">💡</span><span class="callout__body">Chaque écran a sa propre adresse : <code>#/m/ia</code>, <code>#/atelier</code>, <code>#/evaluation</code>, <code>#/examen</code>, <code>#/guide</code>. Tu peux les mettre en favori ou les partager.</span></p>'
    },

    {
      id: 'parcours',
      icon: '◈',
      title: 'Suivre les neuf modules',
      html:
        '<p>Chaque module suit toujours la même structure : objectifs annoncés, cours, un ou deux ateliers manipulables, un exemple concret, un quiz corrigé, puis une synthèse en trois ou quatre points.</p>' +
        '<ul>' +
        '<li><strong>Les objectifs</strong> en haut disent ce que tu sauras faire à la fin. Si tu sais déjà le faire, survole le module et va au quiz.</li>' +
        '<li><strong>Les encadrés</strong> colorés ne sont pas décoratifs : un encadré violet porte l’idée-clé, un encadré vert un conseil de pratique, un encadré orange un piège.</li>' +
        '<li><strong>Le bouton « Marquer comme terminé »</strong> en bas de module alimente la progression, affichée en pourcentage dans la barre du haut et par une coche dans le sommaire.</li>' +
        '<li><strong>La navigation de bas de page</strong> enchaîne sur le module suivant ou sur les exercices.</li>' +
        '</ul>' +
        '<p>Ordre conseillé : les modules 1 à 3 pour les fondations (modèle, harnais, agent), 4 à 6 pour les briques (skills, MCP, hooks), 7 à 9 pour la pratique Freebuff. Rien n’oblige à suivre cet ordre, mais chaque module suppose les précédents.</p>' +
        '<p class="small muted">Marquer un module terminé ne vérifie rien : c’est toi qui déclares. Le quiz et l’examen, eux, mesurent.</p>'
    },

    {
      id: 'widgets',
      icon: '✦',
      title: 'Les neuf ateliers manipulables',
      html:
        '<p>Ces ateliers sont des bacs à sable : on clique, on casse, on recommence. Rien n’y est enregistré.</p>' +
        '<ul>' +
        '<li><strong>Module 1</strong> — tirage du token suivant : change la température et regarde la distribution s’aplatir ou se resserrer.</li>' +
        '<li><strong>Module 2</strong> — boucle agentique : avance pas à pas dans une tâche réelle, avec et sans harnais, pour voir où l’un bloque et où l’autre improvise.</li>' +
        '<li><strong>Module 3</strong> — choix <em>prompt / workflow / agent</em> : décris une tâche, l’atelier te dit quelle mécanique suffit.</li>' +
        '<li><strong>Module 4</strong> — générateur de <code>SKILL.md</code> et jauge de contexte : écris un nom, une description, et vois ce que ça coûte en tokens.</li>' +
        '<li><strong>Module 5</strong> — poignée de main MCP : déroule l’échange JSON entre client et serveur, message par message.</li>' +
        '<li><strong>Module 6</strong> — simulateur de hooks : choisis un événement et une action, vois si le garde-fou se déclenche.</li>' +
        '<li><strong>Module 7</strong> — docteur du prompt : colle un prompt réel, l’atelier diagnostique ce qui manque.</li>' +
        '<li><strong>Module 8</strong> — sélecteur de flux de travail : quelle surface Freebuff et quelle méthode pour quelle tâche.</li>' +
        '<li><strong>Module 9</strong> — fabrique de définition d’agent : compose un agent et exporte sa définition en TypeScript.</li>' +
        '</ul>'
    },

    {
      id: 'pratique',
      icon: '✎',
      title: 'Exercices et projets',
      html:
        '<p>La page <a href="#/atelier">Exercices</a> contient douze exercices courts. Chacun a un énoncé, un indice replié, puis une solution commentée :</p>' +
        '<ol>' +
        '<li>Essaie d’abord sans regarder l’indice.</li>' +
        '<li>Ouvre l’indice si tu bloques plus de deux minutes.</li>' +
        '<li>Compare ensuite ta réponse à la solution, même si tu penses avoir juste : la justification compte autant que le résultat.</li>' +
        '<li>Coche la case une fois l’exercice réellement fait : ces cases pèsent dans le score d’évaluation.</li>' +
        '</ol>' +
        '<p>La page <a href="#/projets">Projets</a> propose cinq réalisations plus longues, du portfolio en vibe coding au pipeline d’agents, chacune avec son livrable et ses critères d’évaluation. Commence par les projets 1 et 2 après le module 7 ; garde le capstone pour la fin.</p>'
    },

    {
      id: 'evaluation',
      icon: '★',
      title: 'Mode évaluation et attestation',
      html:
        '<p>La page <a href="#/evaluation">Évaluation</a> calcule un score global sur 100, recalculé à chaque visite à partir de quatre composantes :</p>' +
        '<div class="table-wrap"><table><thead><tr><th>Composante</th><th class="num">Poids</th></tr></thead><tbody>' +
        '<tr><td>Moyenne des quiz des neuf modules</td><td class="num">40 %</td></tr>' +
        '<tr><td>Exercices cochés (sur 12)</td><td class="num">25 %</td></tr>' +
        '<tr><td>Checklist de maîtrise (sur 22)</td><td class="num">20 %</td></tr>' +
        '<tr><td>Modules marqués terminés</td><td class="num">15 %</td></tr>' +
        '</tbody></table></div>' +
        '<p>Un quiz non commencé compte zéro, pas comme une absence neutre : c’est volontaire. La page liste aussi les prochaines actions classées par rendement, et le détail quiz module par module.</p>' +
        '<p><strong>L’attestation exige cinq conditions simultanées :</strong> score global ≥ 80 %, quiz ≥ 70 %, au moins 9 exercices sur 12, checklist ≥ 80 %, et examen final réussi à 70 %. Tant qu’une seule manque, le certificat n’est pas affiché : la page liste les cinq avec ta valeur réelle et t’indique l’examen s’il est en cause. Si une attestation t’avait été délivrée avant le renforcement des conditions, un encart explique qu’elle est suspendue, pas perdue : la date d’origine sera réutilisée telle quelle.</p>' +
        '<p>Une fois débloquée, l’attestation affiche ton nom (champ en haut de page), la date de délivrance figée au premier franchissement des conditions, une référence <code>IAF-xxxx-nn</code>, et le détail des cinq conditions avec leur seuil. Le bouton <strong>Imprimer / enregistrer en PDF</strong> n’imprime que le certificat, sur feuille blanche avec marges de 14 mm. Le bouton <strong>Copier le bilan</strong> produit un texte complet, détail par module inclus.</p>'
    },

    {
      id: 'examen',
      icon: '⏱',
      title: 'Passer l’examen final',
      html:
        '<p>La page <a href="#/examen">Examen final</a> propose une épreuve chronométrée, tirée au hasard dans une banque de 45 questions (cinq par module).</p>' +
        '<div class="steps">' +
        '<div class="step"><h4>Régler</h4><p>Choisis le périmètre (tout le parcours ou quelques modules), le nombre de questions (10, 20 ou 30 selon ce qui est disponible) et la durée (10, 20, 30 ou 45 minutes).</p></div>' +
        '<div class="step"><h4>Répondre</h4><p>La palette numérotée permet de sauter d’une question à l’autre ; elle colore les questions répondues et signale celles que tu as marquées (★). Tu peux modifier une réponse jusqu’à la remise.</p></div>' +
        '<div class="step"><h4>Surveiller le temps</h4><p>Le chronomètre démarre au lancement et survit à un rechargement : l’heure de fin est enregistrée. À zéro, la copie est remise automatiquement.</p></div>' +
        '<div class="step"><h4>Remettre</h4><p>« Terminer l’épreuve » demande confirmation et annonce le nombre de questions sans réponse, comptées fausses. Après la remise, les corrections et explications apparaissent.</p></div>' +
        '</div>' +
        '<p>Pendant l’épreuve, le cours et le sommaire sont inaccessibles : toute tentative de navigation est renvoyée vers l’épreuve. C’est le principe de l’exercice — répondre sans relire.</p>' +
        '<p>Le résultat donne le score, le seuil de 70 %, le détail par module trié du plus faible au plus fort, puis la correction question par question. Les vingt dernières tentatives sont conservées et le meilleur score s’affiche sur la page d’évaluation. Les tentatives sont illimitées : seul un score réussi compte pour l’attestation.</p>'
    },

    {
      id: 'reference',
      icon: '≡',
      title: 'Glossaire et checklist',
      html:
        '<p>Le <a href="#/glossaire">glossaire</a> regroupe 32 termes (token, harnais, MCP, divulgation progressive…), filtrables par recherche. Utilise-le comme une référence pendant la lecture, pas comme un module à apprendre par cœur.</p>' +
        '<p>La <a href="#/maitrise">checklist de maîtrise</a> liste 22 compétences formulées comme des capacités (« je sais expliquer… », « je sais faire seul… »). Coche une case quand tu peux le faire sans relire le cours, pas quand tu as compris la phrase. C’est la composante la plus rentable du score.</p>'
    },

    {
      id: 'donnees',
      icon: '◎',
      title: 'Progression, données et réinitialisation',
      html:
        '<p>Ta progression vit uniquement dans le stockage local du navigateur, sous la clé <code>ia-freebuff-progress-v1</code> : modules terminés, scores de quiz, exercices cochés, compétences validées, nom, date d’attestation, historique d’examen et thème. Aucune donnée ne part vers un serveur, aucun compte n’existe.</p>' +
        '<ul>' +
        '<li><strong>Changer d’appareil ou de navigateur</strong> repart de zéro : il n’y a pas de synchronisation.</li>' +
        '<li><strong>La navigation privée</strong> efface tout à la fermeture de la fenêtre.</li>' +
        '<li><strong>« Réinitialiser ma progression »</strong> (bas du sommaire) efface les résultats, l’historique d’examen et la date d’attestation, mais conserve le nom saisi et le thème.</li>' +
        '</ul>' +
        '<p class="callout callout--warn"><span class="callout__icon" aria-hidden="true">⚠</span><span class="callout__body">L’attestation est générée localement à partir de ces données : elle documente un parcours personnel et n’a pas de valeur diplômante.</span></p>'
    },

    {
      id: 'personnaliser',
      icon: '⚙',
      title: 'Adapter le parcours',
      html:
        '<p>Tout le contenu est en données, séparé du rendu : modifier un module ne demande pas de toucher au moteur.</p>' +
        '<div class="steps">' +
        '<div class="step"><h4>Lancer en local</h4><p><code>python3 -m http.server 3000 --bind 0.0.0.0</code> depuis le dossier du projet, puis ouvrir <code>http://localhost:3000</code>. Aucun build, aucune dépendance.</p></div>' +
        '<div class="step"><h4>Ajouter un module</h4><p>Un objet dans un fichier <code>js/content-*.js</code> : identifiant, numéro, titre, objectifs, blocs, synthèse. Les types de blocs sont <code>prose</code>, <code>callout</code>, <code>steps</code>, <code>code</code>, <code>table</code>, <code>example</code>, <code>widget</code> et <code>quiz</code>.</p></div>' +
        '<div class="step"><h4>Ajouter des questions d’examen</h4><p>Un objet dans <code>js/exam-bank.js</code> : <code>id</code> unique, <code>module</code>, <code>level</code>, <code>q</code>, <code>options</code> et l’index de la bonne réponse dans <code>answer</code>, plus une <code>explain</code>. Le tirage s’adapte automatiquement au nombre disponible.</p></div>' +
        '<div class="step"><h4>Publier une mise à jour</h4><p>Un site statique suffit : n’importe quel hébergement HTTP. Pense à incrémenter la constante <code>CACHE</code> de <code>sw.js</code> à chaque modification, sinon les visiteurs déjà venus gardent l’ancienne version en cache.</p></div>' +
        '</div>' +
        '<p class="small muted">Le détail des fichiers est dans le <code>README.md</code> du projet.</p>'
    },

    {
      id: 'enseigner',
      icon: '◆',
      title: 'Pour l’enseignant ou la formatrice',
      html:
        '<p>Le parcours se prête à quatre séances de deux heures : fondations (modules 1-3), atelier des briques (4-6), pratique Freebuff (7-9), puis évaluation et examen. Les ateliers manipulables passent bien en démonstration projetée ; les exercices, en travail individuel.</p>' +
        '<ul>' +
        '<li><strong>Distribuer le cours</strong> : le bouton d’impression du navigateur produit une version papier correcte de chaque module (les barres de navigation et le sommaire sont masqués à l’impression).</li>' +
        '<li><strong>Évaluer</strong> : score d’évaluation (pratique régulière) et examen chronométré (restitution sans support) mesurent deux choses différentes. Un score élevé sans examen réussi signale un apprenant qui a lu et coché, pas un apprenant autonome.</li>' +
        '<li><strong>Attention à l’appareil</strong> : la progression est locale. Sur un poste partagé, elle est commune à tous les apprenants ; sur des postes distincts, chaque apprenant a la sienne.</li>' +
        '</ul>'
    }
  ],

  faq: [
    {
      q: 'Ma progression a disparu, que s’est-il passé ?',
      a: '<p>La progression est stockée dans le navigateur, pas sur un serveur. Elle disparaît si tu changes d’appareil ou de navigateur, si tu navigues en privé, ou si tu effaces les données du site. Il n’existe pas de sauvegarde à importer : c’est le prix d’une application sans compte.</p>'
    },
    {
      q: 'Je ne vois pas mes dernières modifications de l’application',
      a: '<p>Le service worker sert la version en cache. Recharge une première fois pour installer la nouvelle version, puis une seconde fois pour l’afficher. En cas de doute, vide le cache du site dans les réglages du navigateur.</p>'
    },
    {
      q: 'L’attestation est verrouillée alors que tout était validé',
      a: '<p>L’examen final fait partie des conditions depuis son ajout. Si l’attestation t’avait été délivrée avant, un encart en haut du bloc de verrouillage l’explique : elle est suspendue, ta date d’origine est conservée, et il ne reste que l’examen à réussir.</p>'
    },
    {
      q: 'Le chronomètre a continué pendant que j’étais sur un autre onglet',
      a: '<p>C’est voulu : l’échéance est enregistrée au lancement, pas décomptée à l’affichage. Fermer l’onglet ne met pas l’épreuve en pause, et à l’échéance la copie est remise automatiquement.</p>'
    },
    {
      q: 'Je ne peux plus quitter la page d’examen',
      a: '<p>Le verrouillage est volontaire : pendant une épreuve, le cours et le sommaire sont inaccessibles pour empêcher la relecture. Termine la copie (bouton « Terminer l’épreuve ») pour retrouver la navigation.</p>'
    },
    {
      q: 'L’impression sort toute la page au lieu du certificat',
      a: '<p>Utilise le bouton « Imprimer / enregistrer en PDF » depuis la page Évaluation : il masque l’interface et ne laisse que l’attestation. L’impression lancée depuis le menu du navigateur, elle, imprime l’écran tel quel.</p>'
    },
    {
      q: 'Puis-je travailler hors ligne ?',
      a: '<p>Oui, après une première visite en HTTP ou HTTPS : le service worker met en cache la coquille, le style et les scripts. En ouverture directe par <code>file://</code>, tout fonctionne sauf le mode hors ligne et l’installation.</p>'
    }
  ]
};
