# Déployer le site NEXUS PLAY (GitHub + Vercel)

Le site est statique (HTML / CSS / JS) : aucun build, aucune dépendance.

## Pourquoi l'exe ne va pas dans le dépôt Git

Un `.exe` de 82 Mo dans le dépôt est lourd à cloner et GitHub prévient à partir de 50 Mo.
La bonne pratique est de le publier comme **asset d'une Release GitHub** (limite : 2 Go par fichier).
Le site pointe alors vers ce fichier. Le zip du projet n'est pas publié du tout.

## 1. Créer le dépôt GitHub

1. Sur github.com : **New repository** → nom `nexus-play` (ou autre) → visibilité **Public** (nécessaire pour télécharger sans compte).
2. Uploadez **uniquement** ces fichiers :
   - `index.html`
   - `styles.css`
   - `script.js`
   - `DEPLOIEMENT.md` (facultatif)

   N'uploadez ni le zip, ni l'exe.

## 2. Publier l'exe en Release

1. Dans le dépôt : **Releases** → **Draft a new release**.
2. **Choose a tag** : tapez `v1.0.0` → **Create new tag**.
3. **Release title** : `NEXUS PLAY v1.0.0`.
4. Glissez `NEXUS-PLAY-Setup.exe` dans la zone **Attach binaries**.
5. **Publish release**.

Le site télécharge l'exe via cette URL (déjà configurée dans `index.html`) :

```
https://github.com/lyonzonziad-boop/nexus-play/releases/download/v1.0.0/NEXUS-PLAY-Setup.exe
```

Le nom du fichier attaché à la Release doit être exactement `NEXUS-PLAY-Setup.exe`, sinon le lien renverra une erreur 404.

## 3. Vérifier le lien

Ouvrez l'URL ci-dessus dans un navigateur : le téléchargement doit démarrer immédiatement.
Si ce n'est pas le cas, vérifiez le nom du fichier et le tag `v1.0.0` dans la Release.

Pour une future version, publiez une nouvelle Release (par exemple `v1.1.0`) puis mettez à jour le numéro de version dans `index.html`
(les liens contiennent `v1.0.0` à trois endroits, à remplacer ensemble).

## 4. Connecter le dépôt à Vercel

1. Allez sur vercel.com, connectez-vous avec GitHub.
2. **Add New… → Project** → sélectionnez le dépôt `nexus-play` → **Import**.
3. **Framework Preset** : laissez sur **Other** (aucun build nécessaire).
4. **Deploy**.

Vercel vous donne une URL du type `nexus-play.vercel.app`. Chaque `git push` sur la branche principale redéploie le site automatiquement.

Pour une adresse personnalisée : **Settings → Domains** dans Vercel.

## 5. Vérifications rapides

- Le bouton **Télécharger** lance bien le téléchargement de `NEXUS-PLAY-Setup.exe`.
- Les boutons **PayPal** ouvrent `https://www.paypal.com/paypalme/NatanBoncompain543` dans un nouvel onglet.
- Le viseur apparaît sur ordinateur (pas sur mobile), et le bouton **⌖ Viseur** en bas à gauche ouvre le panneau de réglages.

## Personnaliser

- **Couleurs** : variables en haut de `styles.css` (`--cyan`, `--violet`, `--bg`).
- **Viseur par défaut** : objet `PRESETS.classic` dans `script.js`.
- **Textes** : tout est dans `index.html`, en français.
- **Nouvelle version** : publiez une nouvelle Release avec le même nom de fichier, et mettez à jour le texte « v1.0.0 » et la taille si elle change.
