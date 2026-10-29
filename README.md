# IA &amp; Freebuff — parcours interactif

Application web statique (HTML/CSS/JS, sans dépendance, installable en PWA) pour apprendre l'IA, les agents et Freebuff, puis pratiquer le vibe coding.

## Lancer

```bash
python3 -m http.server 3000 --bind 0.0.0.0
```

Puis ouvrir <http://localhost:3000>. Aucun build, aucun `npm install`.

> Le service worker (mode hors ligne / installation PWA) nécessite `http://localhost` ou HTTPS. En ouverture directe par `file://`, l'application fonctionne mais la PWA reste inactive.

## Contenu

| Partie | Modules |
| --- | --- |
| Fondations | 1. Comprendre l'IA · 2. Le harnais · 3. Les agents |
| Atelier | 4. Les skills · 5. MCP · 6. Les hooks |
| Pratique Freebuff | 7. Le vibe coding · 8. Maîtriser Freebuff · 9. Créer des agents |
| Annexes | 12 exercices corrigés · 5 projets · glossaire (32 termes) · checklist de maîtrise · mode évaluation · examen final |

## Mode évaluation

`#/evaluation` calcule un score global pondéré : quiz 40 %, exercices 25 %, checklist de maîtrise 20 %, modules terminés 15 %. Un quiz non commencé compte 0. La page affiche le détail par module, les prochaines actions classées par rendement, et débloque une **attestation imprimable** (bouton « Imprimer / enregistrer en PDF », qui n'imprime que le certificat) dès que **cinq conditions cumulatives** sont atteintes : score ≥ 80 %, quiz ≥ 70 %, au moins 9 exercices sur 12, checklist ≥ 80 %, et **examen final réussi à 70 %**. L'examen est donc obligatoire pour l'attestation, mais reste hors du score pondéré. Tant qu'une condition manque, la page liste les cinq avec leur valeur réelle et un bouton mène à l'examen. L'attestation détaille les **cinq conditions avec leur valeur réelle et leur seuil** (score global, quiz, exercices, checklist, examen), et non un seul score global. Une attestation délivrée avant le renforcement des conditions reste mémorisée dans `learner.awardedAt` mais est **suspendue** : le bloc de verrouillage affiche alors un encart expliquant la situation, la date d'origine et le fait qu'elle sera réutilisée telle quelle, plutôt qu'une régression silencieuse. La date de délivrance est figée au premier franchissement des conditions (`learner.awardedAt`) et la référence `IAF-xxxx-nn` est dérivée du nom, du score et de la date.

## Examen final

`#/examen` propose une épreuve chronométrée indépendante du score global. La banque `js/exam-bank.js` contient 45 questions (5 par module) ; chaque épreuve en tire un sous-ensemble au hasard, filtré par le périmètre choisi (tout le parcours ou une sélection de modules).

Le chronomètre démarre au lancement et l'heure de fin est enregistrée dans la session : recharger la page ne remet pas le compte à zéro, et l'échéance atteinte remet la copie automatiquement. Pendant l'épreuve, aucune correction ni explication n'est rendue, et le routeur renvoie toute tentative de navigation vers `#/examen` — le cours reste inaccessible jusqu'à la remise ou l'abandon. Seul « Terminer l'épreuve » (avec confirmation du nombre de questions sans réponse) ferme l'épreuve.

À la remise : score, seuil de réussite à 70 %, détail par module trié du plus faible au plus fort, correction question par question avec la réponse choisie, la bonne réponse et l'explication, puis un relevé copiable. Les 20 dernières tentatives sont conservées (`state.exam.history`), le meilleur score s'affiche sur la page d'évaluation et sur l'attestation. L'examen ne pèse volontairement pas dans le score pondéré, mais une réussite (≥ 70 %) est une **condition obligatoire** de l'attestation : les tentatives sont illimitées et seul le meilleur score compte.

## Guide d'utilisation

`#/guide` (lien « Guide d'utilisation » dans le sommaire, section Aide) explique l'application elle-même : démarrage et installation PWA, structure d'un module, rôle des neuf ateliers, exercices et projets, score d'évaluation, conditions et impression de l'attestation, déroulé de l'examen, stockage local, façon d'ajouter un module ou des questions, et usage en formation. Le contenu vit dans `js/guide.js` (`sections` + `faq`), rendu par `renderGuide` dans `js/app.js`.

## Architecture

```
index.html              coquille (header, sidebar, conteneur de vues)
css/styles.css          design system (thème sombre/clair, responsive, impression)
js/content-*.js         contenu pédagogique en données (MODULES, EXERCISES, PROJECTS…)
js/widgets.js           9 widgets interactifs
js/guide.js             contenu du guide d'utilisation
js/exam-bank.js         banque de 45 questions d'examen
js/exam.js              moteur d'examen (tirage, chrono, correction, historique)
js/app.js               routeur par hash, rendu, progression, quiz, PWA
manifest.webmanifest    métadonnées d'installation
sw.js                   cache de la coquille pour le hors ligne
icons/                  icônes SVG (normale + maskable)
```

### Ajouter un module

Ajouter un objet dans n'importe quel fichier `js/content-*.js` :

```js
window.MODULES.push({
  id: 'mon-module', no: 10, title: '…', subtitle: '…', icon: '🧪',
  duration: '15 min', level: 'Débutant', tags: ['…'],
  objectives: ['…'],
  blocks: [
    { type: 'prose', title: '…', html: '<p>…</p>' },
    { type: 'callout', tone: 'key', title: '…', html: '<p>…</p>' },
    { type: 'widget', widget: 'tokenlab', title: '…', hint: '…' },
    { type: 'quiz', questions: [{ q: '…', options: ['…'], answer: 0, explain: '…' }] }
  ],
  takeaways: ['…']
});
```

Types de blocs disponibles : `prose`, `callout`, `steps`, `code`, `table`, `example`, `widget`, `quiz`.

## Progression

Stockée dans `localStorage` sous `ia-freebuff-progress-v1` : modules terminés, scores de quiz, exercices cochés, compétences validées, nom de l'apprenant, date d'attestation, thème. Aucune donnée n'est envoyée à un serveur. Le bouton « Réinitialiser ma progression » de la barre latérale efface les résultats et la date d'attestation, en conservant le nom saisi.

## Précisions sur le contenu

Les commandes et chemins Freebuff sont donnés à titre pédagogique et peuvent évoluer : la référence reste `freebuff --help` et la documentation officielle. Les définitions d'agents suivent la structure `AgentDefinition` du dossier `.agents/`, dont les types sont générés par `/init`.
